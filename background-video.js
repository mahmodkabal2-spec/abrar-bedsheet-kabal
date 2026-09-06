// Automated Pexels Video Fetcher & Dual-Buffer Hero Player
document.addEventListener('DOMContentLoaded', () => {
  const PEXELS_API_KEY = 'so8Mg4TKSYCt9cOPmZOYY9yvrZlZetwTtD0IaR4wNqX9kM1tXOq1AvKD'; 
  const SEARCH_TERMS = ['bedsheet', 'bed sheets', 'bedding set', 'duvet cover', 'fitted sheet',
     'pillowcase', 'comforter', 'quilt', 'linen bedding', 'cotton sheets', 'silk sheets', 'soft fabric texture',
      'white linen fabric', 'fabric close up', 'cozy bedroom', 'luxury bedroom', 'minimalist bedroom',
       'bedroom morning light', 'making the bed', 'clean bedroom interior', 'hotel room bed', 'pillow luxury',
        'fluffy pillows', 'pillow fight', 'pillow close up', 'winter bedding cozy', 'summer bed sheets',
         'rainy day bedroom', 'sunlight bedroom window', '5 star hotel bed', 'resort bedroom',
          'interior design bedroom', 'home decor bedroom'];

  // Backup local videos (used when offline or if online videos fail)
  const localVideos = [
    'bed.mp4',
    'bed2.mp4',
    'bed3.mp4',
    'bed4.mp4',
    'bed5.mp4',
    'bed6.mp4',
    'bed7.mp4'
  ];

  let onlineVideos = [];
  let localIndex = 0;
  let onlineIndex = 0;

  // 1. FETCH ONLINE VIDEOS FROM PEXELS
  async function fetchPexelsVideos() {
    if (!PEXELS_API_KEY || !navigator.onLine) return;

    try {
      const randomQuery = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(randomQuery)}&per_page=10&orientation=landscape`,
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
          onlineVideos = fetchedUrls;
          console.log(`Loaded ${onlineVideos.length} online videos from Pexels.`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch Pexels videos. Offline mode active:', error);
    }
  }

  // 2. DUAL-VIDEO PLAYER LOGIC
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    let activeVideo = videoA;
    let inactiveVideo = videoB;
    let transitionInProgress = false;

    // Rule 1: FIRST video is ALWAYS bed.mp4
    videoA.src = 'bed.mp4';
    videoA.play().catch(() => {});

    async function initHeroPlayer() {
      // Fetch online videos in background while bed.mp4 is playing
      await fetchPexelsVideos();
      attachEndedListener(activeVideo);
    }

    async function transitionToNextVideo() {
      if (transitionInProgress) return;
      transitionInProgress = true;

      let nextSrc = '';
      let isTryingOnline = false;

      // Rule 2: If online and Pexels videos exist, play online videos
      if (navigator.onLine && onlineVideos.length > 0) {
        nextSrc = onlineVideos[onlineIndex];
        onlineIndex = (onlineIndex + 1) % onlineVideos.length;
        isTryingOnline = true;
      } else {
        // Rule 3: If offline, cycle through local videos (bed2.mp4 - bed7.mp4)
        localIndex = (localIndex + 1) % localVideos.length;
        nextSrc = localVideos[localIndex];
      }

      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

      const loadPromise = new Promise((resolve) => {
        let resolved = false;

        const cleanup = (success) => {
          if (resolved) return;
          resolved = true;
          inactiveVideo.removeEventListener('canplay', onReady);
          inactiveVideo.removeEventListener('error', onError);
          resolve(success);
        };

        const onReady = () => cleanup(true);
        const onError = () => cleanup(false);

        inactiveVideo.addEventListener('canplay', onReady, { once: true });
        inactiveVideo.addEventListener('error', onError, { once: true });

        // 3.5s network timeout
        setTimeout(() => cleanup(false), 3500);
      });

      let success = await loadPromise;

      // Fallback: If online video failed to load, load local offline video
      if (!success && isTryingOnline) {
        console.warn('Online video failed or blocked. Switching to local offline video.');
        localIndex = (localIndex + 1) % localVideos.length;
        inactiveVideo.src = localVideos[localIndex];
        inactiveVideo.load();
      }

      try {
        await inactiveVideo.play();

        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');

        const temp = activeVideo;
        activeVideo = inactiveVideo;
        inactiveVideo = temp;
      } catch (error) {
        console.warn('Playback error, reverting to local bed.mp4:', error);
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