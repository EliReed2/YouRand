# **YouRand Youtube Extension**

**Summary:** 

YouRand is a Chrome extension that lets you discover random YouTube videos tailored to your interests.
While watching a video, YouRand adds a “Save Video” button directly to the YouTube interface. Clicking it saves information about the current video, allowing YouRand to learn what topics you enjoy. You can then generate a completely random video based on your saved interests and tags which gives you something new to watch every time.

**Purpose:**

YouRand was created to solve a simple frustration: opening YouTube and seeing recommendations that don’t match what you’re actually in the mood for.
With YouRand, you can take control of your discovery experience and choose specific topics you like, and let the extension serve you a truly random video you haven’t seen before. It’s a fun and personalized way to explore YouTube beyond the algorithm.

**Tech Stack:**

Frontend: Chrome Extension (React, Vite, TypeScript)

Backend: Django hosted on Railway

YouTube Data API v3 for fetching video info

# Privacy Policy

**Effective Date:** November 2, 2025

YouRand is a Chrome extension that generates random YouTube video recommendations based on your saved YouTube video's tags.

---

## 1. Information We Collect

- **Unique ID (UID):** A random identifier created and stored locally in your browser to keep track of your saved videos.  
- **YouTube Video IDs:** The extension saves the IDs of videos you mark as “saved” to help recommend similar videos.  
- **Video Meta-Data:** The extension retrieves and saves YouTube video meta-data like tags, thumbnail, and other public information to display your recommended videos.  

No personally identifiable information (PII) is collected, stored, or transmitted.

---

## 2. How We Use Information

The collected data is used solely to:

- Recommend videos similar to your saved ones.  
- Improve your in-extension experience.  

All data is initially processed in your browser, but some information is securely stored on our servers to provide personalized recommendations.  
Specifically, we store:
- A randomly generated **unique ID (UID)** to identify your extension session.
- **YouTube video IDs** that you have liked or saved.
- **Metadata** (such as tags) associated with those videos, used to find similar recommendations.

This data is stored on a secure server hosted by **Railway** and is used solely to generate and manage your video recommendations.  
We do **not** collect personally identifiable information (PII), and no data is shared with third parties or used for advertising or analytics.

---

## 3. YouTube Data API

YouRand uses the **YouTube Data API** to access public metadata about videos (e.g., tags).  
We comply with the **Google API Services User Data Policy**, including the **Limited Use requirements**:

- User data is only used for the core functionality of generating recommendations.  
- No data is shared with third parties or used for advertising or analytics.  

---

## 4. Data Security

YouRand only stores and transmits non-personal, publicly available data — such as video IDs, tags, and a randomly generated unique ID (UID).  
This information is sent to our server (hosted on Railway) to generate video recommendations.  

Because no personally identifiable or sensitive information is collected, encryption is not used for these transmissions.  
However, all communications with our server occur over standard HTTPS connections provided by the hosting platform.  

We do not sell, share, or use any collected data for advertising or analytics purposes.

---

## 5. Contact

For questions or concerns, please contact me at: **[elireed1414@gmail.com]**
