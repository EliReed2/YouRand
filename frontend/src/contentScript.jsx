import YoutubeSaveButton from './components/YoutubeSaveButton';

const { createButton } = YoutubeSaveButton();

function addSaveButton() {
  const buttonsContainer = document.querySelector('#top-level-buttons-computed');
  if (!buttonsContainer || document.querySelector('.my-save-button')) return false;

  // temporarily stop observing to avoid triggering mutations from our own insert
  observer.disconnect();

  const saveBtn = createButton();
  if (saveBtn) buttonsContainer.appendChild(saveBtn);

  // small delay before observing again to let YouTube finish internal DOM updates
  setTimeout(() => observer.observe(document.body, { childList: true, subtree: true }), 250);
  return true;
}

// initial attempt
addSaveButton();

// debounce observer to avoid running addSaveButton on every tiny DOM change
let mutationTimer = null;
const observer = new MutationObserver(() => {
  if (mutationTimer) clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    addSaveButton();
  }, 150);
});

observer.observe(document.body, { childList: true, subtree: true });