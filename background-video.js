// Automated Pexels Video Fetcher & Dual-Buffer Hero Player
document.addEventListener('DOMContentLoaded', () => {
  const PEXELS_API_KEY = 'so8Mg4TKSYCt9cOPmZOYY9yvrZlZetwTtD0IaR4wNqX9kM1tXOq1AvKD'; 
  const SEARCH_TERMS = ['bedsheet', 'bed sheets', 'bedding set', 'duvet cover', 'fitted sheet',
     'pillowcase', 'comforter', 'quilt', 'linen bedding', 'cotton sheets', 'silk sheets',
      'soft fabric texture', 'white linen fabric', 'fabric close up', 'cozy bedroom', 'luxury bedroom',
       'minimalist bedroom', 'bedroom morning light', 'making the bed', 'clean bedroom interior',
        'hotel room bed', 'pillow luxury', 'fluffy pillows', 'pillow fight', 'pillow close up',
         'winter bedding cozy', 'summer bed sheets', 'rainy day bedroom', 'sunlight bedroom window',
          '5 star hotel bed', 'resort bedroom', 'interior design bedroom', 'home decor bedroom'
        ];

  // Primary reliable local videos first
  let playlist = [
    'bed.mp4',
    'bed2.mp4',
    'bed3.mp4',
    'bed4.mp4',
    'bed5.mp4',
    'bed6.mp4',
    'bed7.mp4'
  ];

  // 1. AUTOMATIC PEXELS VIDEO SEARCH (Appends fresh online videos to local ones)
  async function fetchPexelsVideos() {
    if (!PEXELS_API_KEY) return;

    try {
      const randomQuery = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(randomQuery)}&per_page=6&orientation=landscape`,
        {
          headers: { Authorization: PEXELS_API_KEY }
        }
      );

      if (!response.ok) throw new Error(`Pexels API error ${response.status}`);

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const fetchedUrls = [];
        data.videos.forEach((video) => {
          const mp4File =
            video.video_files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4') ||
            video.video_files.find((f) => f.file_type === 'video/mp4');

          if (mp4File) {
            fetchedUrls.push(mp4File.link);
          }
        });

        if (fetchedUrls.length > 0) {
          // Combine local files with online videos
          playlist = [...playlist, ...fetchedUrls];
        }
      }
    } catch (error) {
      console.warn('Using local fallback playlist:', error);
    }
  }

  // 2. DUAL-VIDEO HERO CROSS-FADE LOGIC
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    let currentIndex = 0;
    let activeVideo = videoA;
    let inactiveVideo = videoB;
    let transitionInProgress = false;

    // Immediately start playing local bed.mp4
    videoA.src = playlist[0];
    videoA.play().catch(() => {});

    async function initHeroPlayer() {
      await fetchPexelsVideos();
      attachEndedListener(activeVideo);
    }

    async function transitionToNextVideo() {
      if (transitionInProgress) return;
      transitionInProgress = true;

      currentIndex = (currentIndex + 1) % playlist.length;
      const nextSrc = playlist[currentIndex];

      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

      const loadPromise = new Promise((resolve) => {
        let resolved = false;
        const cleanup = () => {
          if (resolved) return;
          resolved = true;
          inactiveVideo.removeEventListener('canplay', onReady);
          inactiveVideo.removeEventListener('error', onError);
          resolve(true);
        };

        const onReady = () => cleanup();
        const onError = () => {
          // Fall back to bed.mp4 if online video fails CORS/hotlinking check
          inactiveVideo.src = 'bed.mp4';
          cleanup();
        };

        inactiveVideo.addEventListener('canplay', onReady, { once: true });
        inactiveVideo.addEventListener('error', onError, { once: true });

        setTimeout(onError, 3500); // 3.5s timeout safety net
      });

      await loadPromise;

      try {
        await inactiveVideo.play();

        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');

        const temp = activeVideo;
        activeVideo = inactiveVideo;
        inactiveVideo = temp;
      } catch (error) {
        console.warn('Video switch error, reverting to local:', error);
        activeVideo.src = 'bed.mp4';
        activeVideo.play().catch(() => {});
      } finally {
        transitionInProgress = false;
        attachEndedListener(activeVideo);
      }
    }

    function attachEndedListener(videoElement) {
      videoElement.onended = null;
      videoElement.onended = () => {
        transitionToNextVideo();
      };
    }

    initHeroPlayer();
  }
});