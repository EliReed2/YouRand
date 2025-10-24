import { useState } from 'react'
import { FaChevronLeft, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './VideoRec.css'

export default function TagPicker({ onNext }) {
    // State to store selected tags
    const [tags, setTags] = useState([]);

  return (
    <>
    <div class="container">
        <header>
            <h1>YouRand Extension</h1>
        </header>
        <div className='tag_header_text'>
            <h2>Select Your Tags </h2>
        </div>
        <div className="tag_list_header">
            <h3>Your Top 10 Tags:</h3>
        </div>
        <div class="tag_list">
            
    </div>
    </>
  )
}

