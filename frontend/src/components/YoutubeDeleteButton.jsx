
export default function YoutubeSaveButton() {
  
  //Helper function to send a message to background script
  function sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (resp) => {
        resolve(resp);
      });
    });
  }

  //Helper function to retrieve and return a URL search parameter
  const getVideoId = () => {
    try {
      const url = new URL(window.location.href);
      //Pull "v" parameter from URL
      const vidId = url.searchParams.get('v');
      return vidId ? vidId : "Not Found";
    } catch (error) {
      console.log('Error retrieving video ID:', error);
      return 'Not Found';
    }
  }

  const createButton = () => {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'my-save-button';
    saveBtn.style.cssText = `
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
    saveBtn.setAttribute('aria-label', 'Save video');

    const saveIconPath = 'Remove-Video.svg';
    const img = document.createElement('img');
    img.src = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL(saveIconPath)
      : saveIconPath;
    img.alt = 'Save Video';
    img.style.cssText = `
      display: block;
      pointer-events: none;
      cursor: pointer;
      height: 60px;
    `;
    img.decoding = 'async';

    saveBtn.appendChild(img);

    saveBtn.addEventListener('click', handleSaveClick);

    return saveBtn;
  };

  //Function to handle click of button by passing the video id to util function
  const handleSaveClick = async () => {
    //Get video id
    const videoId = getVideoId();
    if (videoId === 'Not Found') {
      console.error('Cannot save video: Video ID not found');
      return;
    }
    //Send message to background script
    const resp = await sendToBackground({ type: 'SEND_VIDEO_INFO', video_id: videoId });
    if (resp?.ok) {
      console.log('All good!');
      // do whatever with resp.data
    } else {
      console.error('background fetch failed', resp?.err);
    }
  };

  return { createButton };
}