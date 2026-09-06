// Automated Pexels Video Fetcher & Dual-Buffer Hero Player + Site Background Controller
document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. PEXELS API CONFIGURATION
  // Get a free API key at https://www.pexels.com/api/
  // Paste your key below to search and pull fresh videos automatically!
  // ----------------------------------------------------
  const PEXELS_API_KEY = 'so8Mg4TKSYCt9cOPmZOYY9yvrZlZetwTtD0IaR4wNqX9kM1tXOq1AvKD'; 
const SEARCH_TERMS = ['bedsheet', 'bed sheets', 'bedding set', 'duvet cover', 'fitted sheet', 
  'pillowcase', 'comforter', 'quilt', 'linen bedding', 'cotton sheets', 'silk sheets',
   'soft fabric texture', 'white linen fabric', 'fabric close up', 'cozy bedroom',
    'luxury bedroom', 'minimalist bedroom', 'bedroom morning light', 'making the bed', 'clean bedroom interior', 'hotel room bed', 'pillow luxury', 'fluffy pillows', 'pillow fight', 'pillow close up', 'winter bedding cozy', 'summer bed sheets', 'rainy day bedroom', 'sunlight bedroom window', '5 star hotel bed', 'resort bedroom', 'interior design bedroom', 'home decor bedroom'];
  // Fallback playlists for Hero and Full-Site background
  let heroPlaylist = [
    'https://assets.mixkit.co/videos/preview/mixkit-cozy-bedroom-with-made-bed-41584-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-hands-adjusting-sheets-on-a-bed-41582-large.mp4',
    'bed.mp4',
    'bed2.mp4',
    'bed3.mp4'
  ];

  let bgPlaylist = [
    'https://assets.mixkit.co/videos/preview/mixkit-curtains-moving-with-the-wind-in-a-room-41585-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-cozy-bedroom-with-made-bed-41584-large.mp4',
    'bed4.mp4',
    'bed5.mp4'
  ];

  // ----------------------------------------------------
  // 2. AUTOMATIC PEXELS VIDEO SEARCH FUNCTION
  // ----------------------------------------------------
  async function fetchPexelsVideos() {
    if (!PEXELS_API_KEY || PEXELS_API_KEY === 'so8Mg4TKSYCt9cOPmZOYY9yvrZlZetwTtD0IaR4wNqX9kM1tXOq1AvKD') {
      console.log('Pexels API Key not set. Running with built-in atmospheric video playlists.');
      return;
    }

    try {
      const randomQuery = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
      console.log(`Searching Pexels automatically for background videos: "${randomQuery}"...`);

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(randomQuery)}&per_page=16&orientation=landscape`,
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
          const mp4File =
            video.video_files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4') ||
            video.video_files.find((f) => f.file_type === 'video/mp4');

          if (mp4File) {
            fetchedUrls.push(mp4File.link);
          }
        });

        if (fetchedUrls.length > 0) {
          heroPlaylist = fetchedUrls;
          bgPlaylist = [...fetchedUrls].reverse(); // Reverse for subtle variation
          console.log(`Successfully loaded ${heroPlaylist.length} videos from Pexels!`);
        }
      }
    } catch (error) {
      console.warn('Could not auto-fetch videos from Pexels, using fallback playlist:', error);
    }
  }

  // ----------------------------------------------------
  // 3. FULL-SITE ATMOSPHERIC BACKGROUND VIDEO CONTROLLER
  // ----------------------------------------------------
  const siteBgVideo = document.getElementById('siteBgVideo');
  if (siteBgVideo) {
    let bgIndex = 0;

    function cycleSiteBackground() {
      bgIndex = (bgIndex + 1) % bgPlaylist.length;
      siteBgVideo.classList.add('is-transitioning');

      setTimeout(() => {
        siteBgVideo.src = bgPlaylist[bgIndex];
        siteBgVideo.load();
        siteBgVideo.play().catch(() => {});
        siteBgVideo.classList.remove('is-transitioning');
      }, 700);
    }

    siteBgVideo.onended = cycleSiteBackground;
  }

  // ----------------------------------------------------
  // 4. DUAL-VIDEO HERO CROSS-FADE LOGIC
  // ----------------------------------------------------
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    let currentIndex = 0;
    let activeVideo = videoA;
    let inactiveVideo = videoB;
    let transitionInProgress = false;

    async function initHeroPlayer() {
      await fetchPexelsVideos();

      if (heroPlaylist.length > 0) {
        videoA.src = heroPlaylist[0];
      }
      if (siteBgVideo && bgPlaylist.length > 0) {
        siteBgVideo.src = bgPlaylist[0];
      }

      attachEndedListener(activeVideo);
    }

    async function transitionToNextVideo() {
      if (transitionInProgress) return;
      transitionInProgress = true;

      const nextIndex = (currentIndex + 1) % heroPlaylist.length;
      const nextSrc = heroPlaylist[nextIndex];

      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

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

        setTimeout(cleanup, 4000);
      });

      await loadPromise;

      try {
        await inactiveVideo.play();

        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');

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

  // ----------------------------------------------------
  // 5. COZY SOUNDSCAPE AUDIO TOGGLE CONTROLLER
  // ----------------------------------------------------
  const soundToggle = document.getElementById('ambientSoundToggle');
  const ambientAudio = document.getElementById('ambientAudio');

  if (soundToggle && ambientAudio) {
    soundToggle.addEventListener('click', () => {
      if (ambientAudio.paused) {
        ambientAudio.play().then(() => {
          soundToggle.classList.add('is-playing');
          soundToggle.setAttribute('aria-label', 'Mute ambient sound');
          soundToggle.title = 'Mute cozy ambient sound';
        }).catch(err => console.log('Audio autoplay prevented by browser:', err));
      } else {
        ambientAudio.pause();
        soundToggle.classList.remove('is-playing');
        soundToggle.setAttribute('aria-label', 'Play ambient sound');
        soundToggle.title = 'Play cozy ambient sound';
      }
    });
  }
});