export default function YoutubeSaveButton() {
  
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

    saveBtn.onclick = () => {
      console.log('Save clicked');
      handleSaveClick();
    };

    return saveBtn;
  };

  //Function to handle click of button by passing the video id to util function
  const handleSaveClick = () => {
    //Get video id
    const videoId = getVideoId();
    console.log('Video ID:', videoId);
  }

  return { createButton };
}