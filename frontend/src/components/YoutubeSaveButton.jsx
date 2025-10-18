// ...existing code...
export default function YoutubeSaveButton() {
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
      // your save logic
      console.log('Save clicked');
    };

    return saveBtn; // <--- important
  };

  return { createButton };
}
// ...existing code...