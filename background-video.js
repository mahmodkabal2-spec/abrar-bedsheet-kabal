// Automated Pexels Video Fetcher & Dual-Buffer Hero Player
document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. PEXELS API CONFIGURATION
  // Get a free API key at https://www.pexels.com/api/
  // Paste your key below to search and pull fresh videos automatically!
  // ----------------------------------------------------
  const PEXELS_API_KEY = 'so8Mg4TKSYCt9cOPmZOYY9yvrZlZetwTtD0IaR4wNqX9kM1tXOq1AvKD'; 
  const SEARCH_TERMS = ['bedsheet', 'cozy bedroom', 'bed sheets', 'linen bedding'];

  // Fallback playlist if offline or before API key is added
  let playlist = [
    'https://assets.mixkit.co/videos/preview/mixkit-cozy-bedroom-with-made-bed-41584-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-hands-adjusting-sheets-on-a-bed-41582-large.mp4',
    'bed.mp4',
    'bed2.mp4'
  ];

  // ----------------------------------------------------
  // 2. AUTOMATIC PEXELS VIDEO SEARCH FUNCTION
  // ----------------------------------------------------
  async function fetchPexelsVideos() {
    if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
      console.log('Pexels API Key not set. Using built-in video playlist.');
      return;
    }

    try {
      // Pick a random search term
      const randomQuery = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
      console.log(`Searching Pexels automatically for: "${randomQuery}"...`);

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(randomQuery)}&per_page=12&orientation=landscape`,
        {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        }
      );

      if (!response.ok) throw new Error(`Pexels API HTTP error ${response.status}`);

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const fetchedUrls = [];

        data.videos.forEach((video) => {
          // Find HD or suitable MP4 file quality
          const mp4File =
            video.video_files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4') ||
            video.video_files.find((f) => f.file_type === 'video/mp4');

          if (mp4File) {
            fetchedUrls.push(mp4File.link);
          }
        });

        if (fetchedUrls.length > 0) {
          playlist = fetchedUrls;
          console.log(`Successfully auto-loaded ${playlist.length} bedding videos from Pexels!`);
        }
      }
    } catch (error) {
      console.warn('Could not auto-fetch videos from Pexels, using fallback playlist:', error);
    }
  }

  // ----------------------------------------------------
  // 3. DUAL-VIDEO HERO CROSS-FADE LOGIC
  // ----------------------------------------------------
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    let currentIndex = 0;
    let activeVideo = videoA;
    let inactiveVideo = videoB;
    let transitionInProgress = false;

    async function initHeroPlayer() {
      // Try to auto-fetch fresh Pexels videos first
      await fetchPexelsVideos();

      // Ensure initial video is set
      if (playlist.length > 0) {
        videoA.src = playlist[0];
      }

      attachEndedListener(activeVideo);
    }

    async function transitionToNextVideo() {
      if (transitionInProgress) return;
      transitionInProgress = true;

      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSrc = playlist[nextIndex];

      // Prepare hidden inactive video buffer
      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

      // Ready handler with timeout fallback for slow network connections
      const loadPromise = new Promise((resolve) => {
        let resolved = false;
        const cleanup = () => {
          if (resolved) return;
          resolved = true;
          inactiveVideo.removeEventListener('canplay', onReady);
          inactiveVideo.removeEventListener('loadeddata', onReady);
          resolve();
        };

        const onReady = () => cleanup();
        inactiveVideo.addEventListener('canplay', onReady, { once: true });
        inactiveVideo.addEventListener('loadeddata', onReady, { once: true });

        // 4-second network timeout fallback
        setTimeout(cleanup, 4000);
      });

      await loadPromise;

      try {
        await inactiveVideo.play();

        // Perform smooth 1.2s cross-fade
        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');

        // Swap active and inactive references
        const temp = activeVideo;
        activeVideo = inactiveVideo;
        inactiveVideo = temp;

        currentIndex = nextIndex;
      } catch (error) {
        console.warn('Playback skipped for video:', nextSrc, error);
        currentIndex = nextIndex;
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