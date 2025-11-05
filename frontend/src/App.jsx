import React, { useState, useEffect } from "react";
import TagPicker from "./pages/TagPicker";
import VideoRec from "./pages/VideoRec";
import youRandIcon from "../public/youRandIcon.svg"
import './App.css'

function App() {
  const [page, setPage] = useState("tags"); // "tags" or "video"
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSingleTagSearch, setIsSingleTagSearch] = useState(true);

  //First time welcome state
  const [firstRun, setFirstRun] = useState(false);

  useEffect(() => {
    //Check if this is user's first open of popup
    chrome.storage.local.get("firstRunDone", (res) => {
      if (!res.firstRunDone) {
        setFirstRun(true);
        chrome.storage.local.set({ firstRunDone: true});
      }
    });
  }, []);

  // Called from TagPicker when user is ready
  const handleNext = (tags, isSingleTagSearch) => {
    setSelectedTags(tags);
    setIsSingleTagSearch(isSingleTagSearch);
    setPage("video");
  };

  // Called from VideoView if user goes back
  const handleBack = () => {
    setPage("tags");
  };

  return (
    <div className="popup-container">
      {/* Show welcome card if needed */}
      {firstRun ? (
        <div class="welcome-card">
            <header>
              <img src={youRandIcon} className="youRand_Icon_img" alt="youRand Icon"/>
            </header>
            <h1 class="welcome-header">Welcome to YouRand!</h1>
            <p class="welcome-text"> Thanks for installing <strong>YouRand</strong>! 
            YouRand uses public YouTube video data and a random unique ID stored in your browser to recommend videos similar to the ones you save. <br /><br />
            None of your personal information is ever collected or shared. If you are interested in learning more, check out our <a href="https://github.com/EliReed2/YouRand?tab=readme-ov-file#privacy-policy">Privacy Policy!</a>
            </p>
            <button class="continue-button" onClick={() => setFirstRun(false)}>Get Started</button>
        </div>
      ) : (
        <>
        {page === "tags" ? (
          <TagPicker onNext={handleNext} />
        ) : (
          <VideoRec tags={selectedTags} isSingleTagSearch={isSingleTagSearch} onBack={handleBack} />
        )}
      </>
      )}
    </div>
  );
}

export default App;
