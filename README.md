# MyMusic - YouTube Music Clone

A fully functional web-based music streaming player built with HTML, CSS, and Vanilla JavaScript, designed to replicate the premium, dark-mode aesthetic of YouTube Music.

live https://amitx-dev.github.io/MyMusic/

## Features
- **Full Song Playback:** Integrates with a JioSaavn API wrapper to stream actual full-length audio tracks.
- **Premium UI/UX:** Styled with glassmorphism effects, a responsive dark theme, and interactive category pills to perfectly mimic the real YouTube Music platform.
- **Dynamic Backgrounds:** The background ambient gradient subtly changes based on the cover art of the currently playing track.
- **Search Functionality:** A working search bar allows you to query specific active songs and artists natively.
- **Complete Audio Controls:** A persistent bottom player featuring Play/Pause, Next/Previous controls, a clickable seek bar for scrub playback, and dynamic live progress updates. 

## Technology Stack
- **HTML5** & **CSS3** (CSS Variables, Flexbox, Grid)
- **Vanilla JavaScript** (Audio API, Fetch API, Async/Await)
- FontAwesome Icons

## How to Run Locally
1. Clone this repository or download the source code files.
2. Open `index.html` in any modern web browser.
*(Note: Requires an active internet connection to fetch the external music metadata and audio streams).*

## Detailed Features & Logic

### 1. JioSaavn API Integration & Parsing
**Logic:** 
The application fetches live music data using an unofficial JioSaavn API wrapper (`jiosaavn-api-privatecvc2.vercel.app`). 
- When a user searches for a song or selects a category, an async `fetch()` request is sent to the endpoint.
- Since API responses can vary (sometimes returning arrays directly, sometimes wrapping them in `data.results`), the JSON parser is built to flexibly traverse the data tree to locate the tracks.
- The data mapping function specifically extracts the **highest quality download link** (usually the last element in the `downloadUrl` array) and **highest resolution cover art** from the raw response data to ensure premium playback quality.

### 2. Robust Audio Player
**Logic:** 
Powered by the native HTML5 `<audio>` API, but fully controlled through a custom JavaScript interface.
- **Promise Handling:** When setting `audioPlayer.src`, the `audioPlayer.load()` method is called first to flush the buffer. Then `audioPlayer.play()` is invoked which returns a JavaScript `Promise`. This prevents the player from throwing silent DOM exceptions if the browser interrupts playback (for example, missing audio traces or autoplay policies).
- **Time Formatting:** A custom `formatTime(seconds)` function uses `Math.floor()` to divide seconds into clean `Minutes:Seconds` strings, dynamically reflecting progress during the `timeupdate` event.
- **Seeking:** Clicking anywhere on the progress bar calculates the click's X-coordinate (`e.offsetX`) relative to the total width of the bar, calculates the percentage, and applies it to `audioPlayer.currentTime`.

### 3. Dynamic Ambient Backgrounds
**Logic:**
To mimic YouTube Music's dynamic aesthetic, the background naturally adapts when a track plays.
- Every time a new track is loaded, a random hue value between 0 and 360 is generated using `Math.floor(Math.random() * 360)`.
- This hue is injected into an HSL string to generate a CSS `linear-gradient`, blending from the colored hue down to the base dark surface color. This gives the illusion of ambient lighting cast by the album art.

### 4. Interactive Categories & Search
**Logic:** 
- The horizontal category pills (Relax, Workout, Focus, etc.) attach string queries to the master `fetchTracks()` function.
- Pressing `Enter` inside the Search input listens for the `keypress` event, trims any whitespace, and triggers the same API route natively without requiring page reloads.

### 5. Auto-Play & Queue Management
**Logic:** 
- An internal array `currentTracks` holds the active session's queue.
- The `currentTrackIndex` pointer keeps mathematical track of what is playing.
- Built-in Next and Previous buttons adjust the index pointer bounds (preventing negative indexes or out-of-range errors).
- The `ended` event listener on the `<audio>` tag automatically increments the index and plays the next song automatically when the current track finishes.
