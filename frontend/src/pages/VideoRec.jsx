import { useState } from 'react'
import { FaChevronLeft, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './VideoRec.css'

function App() {
  return (
    <>
    <div class="container">
        <div class="header">
            <FaChevronLeft size={20} color="white" />
            <div class="header-title">Animal Crossing ASMR | Relax, Chill</div>
        </div>

        <div class="video-wrapper">
            <div class="thumbnail">
                <img src="https://i.ytimg.com/vi/LV_k1mIxJ0k/mqdefault.jpg" alt="Autumn Library"/>
                <div class="thumbnail-overlay">
                    <button class="play-btn">▶</button>
                </div>
                <div class="video-title">Animal Crossing ASMR | Relax, Chill</div>
            </div>
        </div>

        <div class="channel-info">
            <div class="channel-left">
                <div class="channel-avatar">🍂</div>
                <div class="channel-details">
                    <div class="channel-name">Solace Crossing</div>
                    <div class="channel-subs">54.3K subscribers</div>
                </div>
            </div>
            <div class="views">271K views</div>
        </div>

        <div class="divider"></div>

        <div class="tag-section">
            <div class="tag-label">Your tag:</div>
            <div class="tag-value">Ambient Music</div>
            <div class="button-group">
                <button class="nav-btn" title="Previous suggestion">
                  <FaArrowLeft size={16} color="white" />
                </button>
                <button class="select-btn">Select</button>
                <button class="nav-btn" title="Next suggestion">
                  <FaArrowRight size={16} color="white" />
                </button>
            </div>
        </div>
    </div>
    </>
  )
}

export default App
