import YoutubeSaveButton from './components/YoutubeSaveButton';
import YoutubeDeleteButton from './components/YoutubeDeleteButton';

const { createButton: createSaveButton } = YoutubeSaveButton();
const { createButton: createSavedButton } = YoutubeDeleteButton();

function getVideoId() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('v') || null;
  } catch (err) {
    return null;
  }
}

function checkVideoStatus(videoId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'CHECK_VIDEO_STATUS', video_id: videoId }, (resp) => {
      if (resp?.ok) resolve(resp.video_status);
      else resolve(null);
    });
  });
}

function removeExistingButtons() {
  document.querySelectorAll('.my-save-button, .my-delete-button').forEach(btn => btn.remove());
}

function isFullScreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
}

async function addSaveButton() {
  const videoId = getVideoId();
  if (!videoId) return;

  if (isFullScreen()) {
    removeExistingButtons();
    return;
  }

  removeExistingButtons();

  const status = await checkVideoStatus(videoId);
  const button = status?.video_saved ? createSavedButton() : createSaveButton();
  if (!button) return;

  button.dataset.videoId = videoId;
  document.body.appendChild(button);
  button.style.bottom = '20px';
  button.style.right = '20px';
}

window.addEventListener('videoSaved', addSaveButton);
window.addEventListener('videoDeleted', addSaveButton);
document.addEventListener('fullscreenchange', addSaveButton);
document.addEventListener('webkitfullscreenchange', addSaveButton);
document.addEventListener('mozfullscreenchange', addSaveButton);

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(addSaveButton, 1000);
  }
}).observe(document, { subtree: true, childList: true });

setTimeout(addSaveButton, 1000);
