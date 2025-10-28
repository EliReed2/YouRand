import { FaChevronLeft, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './VideoRec.css'
import { useEffect, useState } from 'react'
export default function VideoRec({ onBack, tags}) {
    //State to store when user wants a new video recommendation
    const [newRec, setNewRec] = useState(false);

    //State to store the video recommendation info
    const [currentRecommendation, setCurrentRecommendation] = useState(null);

    //State to store previous recommendations for potential back button use
    const [allRecommendations, setAllRecommendations] = useState([]);

    //State to store current index of recommendation being shown
    const [currentRecIndex, setCurrentRecIndex] = useState(0);

    //State to store if the page is currently loading
    const [isLoading, setIsLoading] = useState(true);

    //Use effect state to prompt backend for video based on user tags
    useEffect(() => {
        console.log('Fetching video recommendation for tags:', tags);
        //Set isLoading to display loading wheel while pulling from api
        setIsLoading(true);
        chrome.runtime.sendMessage({ type: 'GET_VIDEO_RECOMMENDATION', tags }, (response) => {
            //Set isLoading to false when api returns
            setIsLoading(false);
            if (response.ok) {
                // Handle successful response
                console.log('Video recommendations:', response.videoRecommendation);
                const newVideo = response.videoRecommendation.video_details;
                setCurrentRecommendation(newVideo);
            
                // Add to history if it's a new recommendation (not navigating back/forward)
                if (currentRecIndex === allRecommendations.length) {
                setAllRecommendations([...allRecommendations, newVideo]);
                }
            } else {
                console.error('Error fetching video recommendations:', response.err);
            }
        });
    }, [newRec]);

  return (
    <>
    <div className="container">
        <div className="header">
            <FaChevronLeft size={20} color="white" onClick={onBack} style={{cursor: "pointer"}} />
            <div className="header-title">{currentRecommendation?.video_title}</div>
        </div>
        {/* Load loading wheel if page is waiting on API, just load video info if not */}
        { isLoading ? (
            <div className="loading_container">
                <div className="spinner"></div>
                <p className="loading_text">Finding your video...</p>
            </div>
        ) : (
            <>
            <div className="video-wrapper">
                <div className="thumbnail">
                    <img src={currentRecommendation?.thumbnail} onClick={() => window.open(currentRecommendation?.video_link, "_blank")} alt="Video Thumbnail"/>
                </div>
            </div>

            <div className="channel-info">
                <div className="channel-left">
                    <img className="channel-thumbnail-img" src={currentRecommendation?.channel_thumbnail} alt="Channel Thumbnail"/>
                    <div className="channel-details">
                        <div className="channel-name">{currentRecommendation?.channel_title}</div>
                        <div className="channel-subs">{currentRecommendation?.channel_subs} subscribers</div>
                    </div>
                </div>
                <div className="views">{currentRecommendation?.views} views</div>
            </div>

            <div className="divider"></div>

            <div className="tag-section">
                <div className="tag-label">Your tag:</div>
                <div className="tag-value">{currentRecommendation?.tag}</div>
                <div className="button-group">
                {currentRecIndex > 0 && (
                    <button className="nav-btn" title="Previous suggestion" onClick={() => {
                        setCurrentRecIndex(currentRecIndex - 1);
                        setCurrentRecommendation(allRecommendations[currentRecIndex - 1]);
                    }}>
                    <FaArrowLeft size={16} color="white" />
                    </button>
                )}
                    <button className="select-btn" onClick={() => window.open(currentRecommendation?.video_link, "_blank")}>Select</button>
                    <button className="nav-btn" onClick={() => {
                        if (currentRecIndex + 1 < allRecommendations.length) {
                            //Show next recommendation from history
                            setCurrentRecIndex(currentRecIndex + 1);
                            setCurrentRecommendation(allRecommendations[currentRecIndex + 1]);
                        } else {
                            // Prompt for new recommendation
                            setCurrentRecIndex(currentRecIndex + 1);
                            setNewRec(!newRec);
                        }
                    }} title="Next suggestion">
                    <FaArrowRight size={16} color="white" />
                    </button>
                </div>
            </div>
            </>
        )}
    </div>
    </>
  )
}
