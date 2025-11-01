import React, { useState } from "react";
import TagPicker from "./pages/TagPicker";
import VideoRec from "./pages/VideoRec";

function App() {
  const [page, setPage] = useState("tags"); // "tags" or "video"
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSingleTagSearch, setIsSingleTagSearch] = useState(true);

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
      {page === "tags" ? (
        <TagPicker onNext={handleNext} />
      ) : (
        <VideoRec tags={selectedTags} isSingleTagSearch={isSingleTagSearch} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
