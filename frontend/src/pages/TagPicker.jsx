import { useState, useEffect } from 'react'
import { FaUndo } from 'react-icons/fa'
import youRandIcon from '../../public/youRandIcon.svg'
import './TagPicker.css'

export default function TagPicker({ onNext }) {
    // State to store selected tags
    const [tags, setTags] = useState([]);
    //State to store top ten tags
    const [topTags, setTopTags] = useState([]);
    //State to store selected tags
    const [selectedTags, setSelectedTags] = useState([]);
    //State to store how many 'other' tags to load at a time
    const [otherTagsToShow, setOtherTagsToShow] = useState(6);

    //Use effect to fetch tags on component mount
    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'GET_USER_TAGS' }, (response) => {
            if (response.ok) {
                setTags(response.userTags);
                //Get top 10 (presorted by backend) tags to set topTags field
                setTopTags(response.userTags.slice(0, 10));
                //Slice tags to remove top 10 now that they are stored separately
                setTags(response.userTags.slice(10));
            }
            else {
                console.error('Error fetching user tags:', response.err);
            }
        });
    }, []);

    //Set visible tags to show more when user clicks 'show more'
    const visibleTags = tags.slice(0, otherTagsToShow);
  return (
    <>
    <div class="container">
        <header>
            <img src={youRandIcon} className="youRand_Icon_img" alt="youRand Icon"/>
            <h1>YouRand Extension</h1>
        </header>
        <div className='top_tag_header_text'>
            <h2>Select Your Tags </h2>
        </div>
        <div className="top_tag_list_header">
            <h3>Your Top 10 Tags:</h3>
        </div>
        {topTags.length > 0 ? (
            <div className="top_tag_list">
                {topTags.map((tag, index) => (
                    <button key={index} className={selectedTags.includes(tag) ? `selected_tag_item` : `unselected_tag_item`} onClick={() => selectedTags.includes(tag) ? setSelectedTags((prev) => prev.filter(t => t !== tag)) : setSelectedTags((prev) => [...prev, tag])}>
                        {tag}
                    </button>
                ))}
            </div>
        ) : (
            <p className="no_tags_text">No tags saved! Save some videos and they're tags will appear here.</p>
        )}
        <div className="other_tag_list_header">
            <h4>Your Other Tags:</h4>
        </div>
        {visibleTags.length > 0 ? (
            <>
            <div className="other_tag_list">
                {visibleTags.map((tag) => (
                    <button key={tag} className={selectedTags.includes(tag) ? `selected_tag_item` : `unselected_tag_item`} onClick={() => selectedTags.includes(tag) ? setSelectedTags((prev) => prev.filter(t => t !== tag)) : setSelectedTags((prev) => [...prev, tag])}>
                        {tag}
                    </button>
                ))}
            </div>

            {/* Button to load more of the other tags */}
            {otherTagsToShow < tags.length && (
                <div className="load_more" onClick={() => setOtherTagsToShow(prev => prev + 6)}>
                    <button className="load_more_btn">...</button>
                </div>
            )}
            </>
        ) : (
            <p className="no_tags_text">No other tags! Save more videos and your extra tags will appear here.</p>
        )}
        <div className="button_group">
            <FaUndo className="reset_tags_btn" size={32} onClick={() => setSelectedTags([])} />
            <button className="next_btn" onClick={() => onNext(selectedTags)}>{selectedTags.length > 0 ? `Search with ${selectedTags.length} tags!` : `Pick for me!`}</button>
        </div>
    </div>
    </>
  )
}

