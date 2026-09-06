// Dual-Buffer Hero Video Playlist & Single-Video Fallback Handler
document.addEventListener('DOMContentLoaded', () => {
  // Video sequence list - adjust filenames or add paths like 'videos/bed.mp4' if inside a subfolder
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

    function transitionToNextVideo() {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSrc = playlist[nextIndex];

      // Load next video silently into the hidden video tag
      inactiveVideo.src = nextSrc;
      inactiveVideo.load();

      const handleCanPlay = () => {
        inactiveVideo.removeEventListener('canplaythrough', handleCanPlay);

        // Play hidden video in background
        inactiveVideo.play().then(() => {
          // Cross-fade opacity smoothly
          inactiveVideo.classList.add('active');
          activeVideo.classList.remove('active');

          // Swap active/inactive references
          const temp = activeVideo;
          activeVideo = inactiveVideo;
          inactiveVideo = temp;

          currentIndex = nextIndex;

          // Attach listener to wait for the new video to end
          attachEndedListener(activeVideo);
        }).catch(err => {
          console.warn('Playback error, skipping to next track:', err);
          currentIndex = nextIndex;
          transitionToNextVideo();
        });
      };

      inactiveVideo.addEventListener('canplaythrough', handleCanPlay);
    }

    function attachEndedListener(videoElement) {
      videoElement.onended = () => {
        transitionToNextVideo();
      };
    }

    // Initialize end listener on primary video
    attachEndedListener(videoA);
    return;
  }

  // 2. SINGLE VIDEO FALLBACK (Used on login.html background video)
  const singleVideo = document.getElementById('siteBackgroundVideo');
  if (singleVideo) {
    let singleIndex = 0;

    singleVideo.addEventListener('ended', () => {
      singleIndex = (singleIndex + 1) % playlist.length;
      singleVideo.src = playlist[singleIndex];
      singleVideo.load();
      singleVideo.play().catch(() => {});
    });
  }
});