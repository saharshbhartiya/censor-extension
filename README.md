Content Moderation System

A Chrome Extension to dynamically censor offensive or unwanted words from web pages using customizable blur, replacement, or removal methods. Supports user-defined words and real-time DOM monitoring.


##  Features
- Toggle censorship on/off
- Choose from 3 censoring styles:
  - Blur text
  - Replace with `***`
  - Remove entirely
- Add your own custom words (comma-separated)
- Works on most dynamic and static content
- Minimal UI via popup and options page


##  How It Works
- Loads word patterns from a local `words.json` file
- Allows extra user-defined terms through the settings
- Uses `MutationObserver` to catch DOM changes in real time
- Injects a blur style when needed
- Skips safe/contextual words using a secondary filter


## 📁 Project Structure

censor-extension/
├── manifest.json
├── inject.js
├── words.json 
├── src/
├    ├── options/
├    ├    ├── options.html
├    ├    ├── options.js
├    ├    └──  options.css
├    ├── popup/
├    ├    ├── popup.html
├    ├    ├── popup.js
├    ├    └──  popup.css
├    ├── content.css
├    └── content.js
└──icons/

##  Development & Testing

1. Clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load Unpacked** and select this project folder
5. Make changes and refresh the extension

##   To-Do / Improvements

- Image content detection (future)
- Per-site settings
- Import/export custom word lists

##   License


MIT License - See [LICENSE] for more information.


**Thanks.**

Feel free to contribute or suggest improvements!
