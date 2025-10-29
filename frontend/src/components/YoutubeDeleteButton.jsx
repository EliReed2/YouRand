export default function YoutubeDeleteButton() {
  
  function sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (resp) => {
        resolve(resp);
      });
    });
  }

  const getVideoId = () => {
    try {
      const url = new URL(window.location.href);
      const vidId = url.searchParams.get('v');
      return vidId ? vidId : "Not Found";
    } catch (error) {
      console.log('Error retrieving video ID:', error);
      return 'Not Found';
    }
  }

  const createButton = () => {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'my-delete-button';
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: block;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    deleteBtn.setAttribute('aria-label', 'Delete video');

    const saveIconPath = 'Remove-Video.svg';
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(saveIconPath);
    img.alt = 'Delete video';
    img.style.cssText = `
      display: block;
      pointer-events: none;
      height: 60px;
    `;
    img.decoding = 'async';

    deleteBtn.appendChild(img);
    
    // Store reference to button for removal later
    const handleDeleteClick = async () => {
      const videoId = getVideoId();
      if (videoId === 'Not Found') {
        console.error('Cannot delete video: Video ID not found');
        return;
      }
      
      const resp = await sendToBackground({ type: 'DELETE_SAVED_VIDEO', video_id: videoId });
      if (resp?.ok) {
        console.log('Video deleted successfully!');
        
        // Remove this button directly
        deleteBtn.remove();
        
        // Dispatch custom event to trigger button refresh
        window.dispatchEvent(new CustomEvent('videoDeleted'));
        
      } else {
        console.error('background fetch failed', resp?.err);
      }
    };
    
    deleteBtn.addEventListener('click', handleDeleteClick);

    return deleteBtn;
  };

  return { createButton };
}