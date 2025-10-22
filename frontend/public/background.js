const UID_KEY = 'uid';
const BACKEND_URL = 'http://127.0.0.1:8000/api/fetchVideoInfo/'; 

function generateUid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `uid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([UID_KEY], (res) => {
    if (!res || !res[UID_KEY]) {
      const uid = generateUid();
      chrome.storage.local.set({ [UID_KEY]: uid }, () => {
        console.log('Generated extension UID:', uid);
      });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) {
    sendResponse({ ok: false, err: 'no type' });
    return;
  }

  if (msg.type === 'GET_UID') {
    chrome.storage.local.get([UID_KEY], (res) => {
      sendResponse({ ok: true, uid: res ? res[UID_KEY] : null });
    });
    return true;
  }

  if (msg.type === 'FETCH_VIDEO_INFO') {
    const videoId = msg.video_id;
    if (!videoId) {
      sendResponse({ ok: false, err: 'missing video_id' });
      return;
    }

    // optional: include uid in payload
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId, uid })
      })
        .then(async (r) => {
          const json = await r.json().catch(() => null);
          if (!r.ok) throw { status: r.status, body: json };
          sendResponse({ ok: true });
        })
        .catch((err) => {
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
    });

    return true; // keep message channel open for async response
  }

  // other message types...
});