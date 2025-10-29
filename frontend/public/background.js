const UID_KEY = 'uid';
const BACKEND_URL = 'http://127.0.0.1:8000/api'; 

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

  if (msg.type === 'SEND_VIDEO_INFO') {
    const videoId = msg.video_id;
    if (!videoId) {
      sendResponse({ ok: false, err: 'missing video_id' });
      return;
    }

    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      fetch(BACKEND_URL + '/fetchVideoInfo/', {
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

  if (msg.type === 'FETCH_VIDEO_INFO') {
    //prompt server to send a selected video with it's info dictionary
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      fetch(BACKEND_URL + '/sendVideoInfo/?uid=' + uid, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(async (r) => {
          const json = await r.json().catch(() => null);
          if (!r.ok) throw { status: r.status, body: json };
          sendResponse({ ok: true, videoInfo: json });
        })
        .catch((err) => {
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
    });

    return true;
  }

  if (msg.type === 'GET_USER_TAGS') {
    //Get uid to access user tags
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      //Call backend to get user tags
      fetch(BACKEND_URL + '/getUserTags/?uid=' + uid, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(async (r) => {
          const json = await r.json().catch(() => null);
          if (!r.ok) throw { status: r.status, body: json };
          sendResponse({ ok: true, userTags: json.user_tags });
        })
        .catch((err) => {
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
    });

    return true;
  }

  if (msg.type === 'GET_VIDEO_RECOMMENDATION') {
    //Get tags from message
    const tags = msg.tags || [];
    //Get uid to access user tags
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      //Call backend to get video recommendations
      fetch(BACKEND_URL + '/getVideoRecommendation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, tags })
      })
        .then(async (r) => {
          const json = await r.json().catch(() => null);
          //Throw error if response not ok
          if (!r.ok) throw { status: r.status, body: json };
          //Otherwise send list of video recommendation back to frontend
          sendResponse({ ok: true, videoRecommendation: json });
        })
        .catch((err) => {
          //Catch any overall fetch errors
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
    });

    return true;
  }

  //Message to send video id to backend and see if this video already exists in user database
  if (msg.type === "CHECK_VIDEO_STATUS") {
    //Get video id from message
    const video_id = msg.video_id;
    //Exist with an error if no video id given
    if (!video_id) {
      sendResponse({ ok: false, err: 'missing video_id' });
      return;
    }

    //Pull uid for storage
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      //Send request
      console.log(`Sending request with video id ${video_id} from user ${uid}`);
      fetch(BACKEND_URL + '/checkVideoStatus/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, video_id })
      })
      .then(async (r) => {
          const json = await r.json().catch(() => null);
          //Throw error if response not ok
          if (!r.ok) throw { status: r.status, body: json };
          //Otherwise send video status back to frontend
          sendResponse({ ok: true, video_status: json });
        })
        .catch((err) => {
          //Catch any overall fetch errors
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
      });
      return true;
    }

    //Request to delete a video with the specified id from database
    if (msg.type === "DELETE_SAVED_VIDEO") {
      //Get video id from message
    const video_id = msg.video_id;
    //Exist with an error if no video id given
    if (!video_id) {
      sendResponse({ ok: false, err: 'missing video_id' });
      return;
    }

    //Pull uid for storage
    chrome.storage.local.get([UID_KEY], (res) => {
      const uid = res ? res[UID_KEY] : null;

      //If uid is null request cannot work
      if (!uid) {
        sendResponse({ ok: false, err: 'missing uid' });
        return;
      }

      //Send request
      console.log(`Sending delete video request with video id ${video_id} from user ${uid}`);
      fetch(BACKEND_URL + '/deleteSavedVideo/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, video_id })
      })
      .then(async (r) => {
          const json = await r.json().catch(() => null);
          //Throw error if response not ok
          if (!r.ok) throw { status: r.status, body: json };
          //Otherwise send video status back to frontend
          sendResponse({ ok: true, message: json });
        })
        .catch((err) => {
          //Catch any overall fetch errors
          console.error('fetch error', err);
          sendResponse({ ok: false, err: String(err) });
        });
      });
      return true;
    }
});
