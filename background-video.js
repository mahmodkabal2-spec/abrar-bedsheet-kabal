// Dual-Buffer Hero Video Playlist & Fallback Handler with Robust Error Prevention
document.addEventListener('DOMContentLoaded', () => {
  // Video playlist sources - ensure video files exist in your root or adjust path if in a subfolder (e.g., 'videos/bed.mp4')
  const playlist = [
    'bed.mp4',
    'bed2.mp4',
    'bed3.mp4',
    'bed4.mp4',
    'bed5.mp4',
    'bed6.mp4'
  ];

  // 1. DUAL VIDEO SETUP (Used on index.html for seamless cross-fading)
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    let currentIndex = 0;
    let activeVideo = videoA;
    let inactiveVideo = videoB;
    let transitionInProgress = false;

    async function transitionToNextVideo() {
      // Prevent overlapping triggers if multiple end events fire
      if (transitionInProgress) return;
      transitionInProgress = true;

      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSrc = playlist[nextIndex];

      // Prepare hidden inactive video buffer
      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

      // Reliable ready handler with a 3-second timeout fallback (prevents stall on slow connections)
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

        // Fallback timeout in case the browser delays buffering events
        setTimeout(cleanup, 3000);
      });

      await loadPromise;

      try {
        // Attempt playback on pre-buffered hidden video
        await inactiveVideo.play();

        // Cross-fade: opacity CSS transition handles the smooth fade
        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');

        // Swap active and inactive references
        const temp = activeVideo;
        activeVideo = inactiveVideo;
        inactiveVideo = temp;

        currentIndex = nextIndex;
      } catch (error) {
        // Handles autoplay restrictions, Low Power Mode, or missing 404 video files
        console.warn('Playback skipped or video file missing:', nextSrc, error);
        currentIndex = nextIndex;
      } finally {
        transitionInProgress = false;
        attachEndedListener(activeVideo);
      }
    }

    function attachEndedListener(videoElement) {
      // Clear previous listener to prevent event duplication
      videoElement.onended = null;
      videoElement.onended = () => {
        transitionToNextVideo();
      };
    }

    // Initialize first video listener
    attachEndedListener(videoA);
    return;
  }

  // 2. SINGLE VIDEO FALLBACK (Used on standalone pages like login.html)
  const singleVideo = document.getElementById('siteBackgroundVideo');
  if (singleVideo) {
    let singleIndex = 0;
    singleVideo.addEventListener('ended', () => {
      singleIndex = (singleIndex + 1) % playlist.length;
      singleVideo.src = playlist[singleIndex];
      singleVideo.load();
      singleVideo.play().catch((err) => {
        console.warn('Single video playback error:', err);
      });
    });
  }
});