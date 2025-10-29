import YoutubeSaveButton from './components/YoutubeSaveButton';
import YoutubeDeleteButton from './components/YoutubeDeleteButton';

const { createButton: createSaveButton } = YoutubeSaveButton();
const { createButton: createSavedButton } = YoutubeDeleteButton();

// Helper to get video ID
function getVideoId() {
  try {
    const url = new URL(window.location.href);
    const vidId = url.searchParams.get('v');
    return vidId ? vidId : null;
  } catch (error) {
    console.log('Error retrieving video ID:', error);
    return null;
  }
}

// Helper to check video status
function checkVideoStatus(videoId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'CHECK_VIDEO_STATUS', video_id: videoId },
      (response) => {
        console.log('Video status response:', response);
        if (response?.ok) {
          resolve(response.video_status);
        } else {
          console.error('Error checking video status:', response?.err);
          resolve(null);
        }
      }
    );
  });
}

// Remove existing buttons
function removeExistingButtons() {
  const existingButtons = document.querySelectorAll('.my-save-button, .my-saved-button');
  existingButtons.forEach(btn => btn.remove());
}

async function addSaveButton() {
  // Get video ID
  const videoId = getVideoId();
  if (!videoId) {
    console.log('No video ID found');
    return false;
  }

  // Check if button already exists for this video
  const existingButton = document.querySelector('.my-save-button, .my-saved-button');
  if (existingButton) {
    // Check if we're still on the same video
    const currentVideoId = existingButton.dataset.videoId;
    if (currentVideoId === videoId) {
      return false; // Same video, don't recreate button
    } else {
      // Different video, remove old button
      removeExistingButtons();
    }
  }

  observer.disconnect();

  // Check if video is saved
  const status = await checkVideoStatus(videoId);
  
  let button;
  if (status?.video_saved) {
    console.log('Video is saved - loading saved button');
    button = createSavedButton();
  } else {
    console.log('Video not saved - loading save button');
    button = createSaveButton();
  }

  if (button) {
    // Store video ID on button to track which video it's for
    button.dataset.videoId = videoId;
    document.body.appendChild(button);
    console.log('Button added as floating');
  }

  setTimeout(() => observer.observe(document.body, { childList: true, subtree: true }), 300);
  return true;
}

// Listen for video saved event to refresh button
window.addEventListener('videoSaved', () => {
  console.log('Video saved event received, refreshing button...');
  removeExistingButtons();
  setTimeout(addSaveButton, 500);
});

// Detect URL changes for YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, refreshing button...');
    
    // Remove old button and add new one for the new video
    removeExistingButtons();
    setTimeout(addSaveButton, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Initialize
setTimeout(addSaveButton, 1000);

let mutationTimer = null;
const observer = new MutationObserver(() => {
  if (mutationTimer) clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    addSaveButton();
  }, 150);
});

observer.observe(document.body, { childList: true, subtree: true });