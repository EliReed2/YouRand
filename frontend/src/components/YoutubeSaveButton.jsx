
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
    saveBtn.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--size-m my-save-button';
    saveBtn.style.marginLeft = '8px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.setAttribute('aria-label', 'Save video');

    const saveIconPath = 'SmallAddVideoIcon.svg';
    const img = document.createElement('img');
    img.src = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL(saveIconPath)
      : saveIconPath;
    img.alt = '';
    img.style.width = '6rem';
    img.style.height = '3.8rem';
    img.style.marginRight = '6px';
    img.style.verticalAlign = 'middle';
    img.decoding = 'async';
    img.style.pointerEvents = 'none';

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
    const resp = await sendToBackground({ type: 'FETCH_VIDEO_INFO', video_id: videoId });
    if (resp?.ok) {
      console.log('All good!');
      // do whatever with resp.data
    } else {
      console.error('background fetch failed', resp?.err);
    }
  };

  return { createButton };
}