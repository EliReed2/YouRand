import React, { useState } from "react";
import TagPicker from "./pages/TagPicker";
import VideoRec from "./pages/VideoRec";

function App() {
  const [page, setPage] = useState("tags"); // "tags" or "video"
  const [selectedTags, setSelectedTags] = useState([]);

  // Called from TagPicker when user is ready
  const handleNext = (tags) => {
    setSelectedTags(tags);
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
        <VideoRec tags={selectedTags} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
