const quickPicksContainer = document.getElementById('quickPicks');
const recommendedContainer = document.getElementById('recommendedVideos');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('mainPlayBtn');
const playerImg = document.getElementById('playerImg');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const progressBarBg = document.getElementById('progressBarBg');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const searchInput = document.getElementById('searchInput');

let currentTracks = [];
let currentTrackIndex = -1;
let isPlaying = false;

// Format time in minutes:seconds
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Fetch tracks from Free JioSaavn API wrapper (returns full songs)
async function fetchTracks(query = 'pop') {
    try {
        quickPicksContainer.innerHTML = '<div style="padding: 20px;">Loading tracks...</div>';
        
        const response = await fetch(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Extract tracks flexibly depending on API response shape
        let tracksList = [];
        if (data && data.data && Array.isArray(data.data.results)) {
            tracksList = data.data.results;
        } else if (Array.isArray(data)) {
            tracksList = data;
        } else if (data && Array.isArray(data.data)) {
            tracksList = data.data;
        } else if (data && Array.isArray(data.results)) {
            tracksList = data.results;
        }
        
        // Map elements into a consistent format because APIs return varying structures
        currentTracks = tracksList.map(item => {
            let trackUrl = item.url;
            // Get highest quality download url if it's an array for this specific API
            if (item.downloadUrl && Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
                trackUrl = item.downloadUrl[item.downloadUrl.length - 1].link;
            }
            
            let trackImage = item.image;
            // Get highest resolution image if it's an array
            if (item.image && Array.isArray(item.image) && item.image.length > 0) {
                trackImage = item.image[item.image.length - 1].link;
            } else if (typeof item.image === 'string') {
                trackImage = item.image;
            }
            
            return {
                title: item.title || item.name || 'Unknown Title',
                artist: item.artists || item.primaryArtists || item.subtitle || 'Unknown Artist',
                image: trackImage || 'https://via.placeholder.com/300',
                url: trackUrl,
                duration: item.duration || 0
            };
        });
        
        // Filter out tracks without valid audio URLs
        currentTracks = currentTracks.filter(track => track.url); 
        
        if (currentTracks.length === 0) {
            quickPicksContainer.innerHTML = '<div style="padding: 20px;">No tracks found.</div>';
            recommendedContainer.innerHTML = '';
            return;
        }
        
        renderQuickPicks(currentTracks.slice(0, 8));
        renderRecommended(currentTracks.slice(8, 12));
        
        if(currentTracks.length > 0) {
            updateBackgroundGradient(currentTracks[0].image);
        }
    } catch (error) {
        console.error('Error fetching tracks:', error);
        quickPicksContainer.innerHTML = '<div style="padding: 20px; color: #ff4444;">Failed to load tracks.</div>';
    }
}

// Generate background based on simple logic
function updateBackgroundGradient(url) {
    if (!url) return;
    const hue = Math.floor(Math.random() * 360);
    const contentArea = document.querySelector('.content-area');
    contentArea.style.background = `linear-gradient(to bottom, hsl(${hue}, 40%, 15%) 0%, var(--bg-color) 400px)`;
}

// Decode HTML entities (some APIs return HTML encoded strings)
function decodeHTML(text) {
    if (!text) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
}

// Render Quick Picks
function renderQuickPicks(tracks) {
    quickPicksContainer.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const imgUrl = track.image;
        const title = decodeHTML(track.title);
        const artist = decodeHTML(track.artist);
        
        const trackEl = document.createElement('div');
        trackEl.className = 'song-item';
        trackEl.innerHTML = `
            <div class="song-img-container">
                <img src="${imgUrl}" alt="Cover" class="song-img">
                <div class="song-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="song-info">
                <h4 class="song-title">${title}</h4>
                <p class="song-artist">${artist}</p>
            </div>
            <div class="song-duration">${formatTime(parseInt(track.duration || 0))}</div>
        `;
        
        trackEl.addEventListener('click', () => playTrack(index));
        quickPicksContainer.appendChild(trackEl);
    });
}

// Render Recommended section
function renderRecommended(tracks) {
    recommendedContainer.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const imgUrl = track.image;
        const actualIndex = 8 + index; 
        const title = decodeHTML(track.title);
        const artist = decodeHTML(track.artist);
        
        const cardEl = document.createElement('div');
        cardEl.className = 'video-card';
        cardEl.innerHTML = `
            <div class="video-thumb-container">
                <img src="${imgUrl}" alt="Thumbnail" class="video-thumb">
                <div class="video-play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <h4 class="video-title">${title}</h4>
            <p class="video-artist">${artist}</p>
        `;
        
        cardEl.addEventListener('click', () => playTrack(actualIndex));
        recommendedContainer.appendChild(cardEl);
    });
}

// Play Track
function playTrack(index) {
    if (index < 0 || index >= currentTracks.length) return;
    
    currentTrackIndex = index;
    const track = currentTracks[index];
    
    audioPlayer.src = track.url;
    audioPlayer.load(); // Ensure the new source is loaded
    
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayPauseBtn();
        }).catch(error => {
            console.error("Playback was prevented or failed:", error);
            isPlaying = false;
            updatePlayPauseBtn();
        });
    } else {
        isPlaying = true;
        updatePlayPauseBtn();
    }
    
    playerImg.src = track.image;
    playerTitle.textContent = decodeHTML(track.title);
    playerArtist.textContent = decodeHTML(track.artist);
    
    updateBackgroundGradient(track.image);
}

// Toggle Play/Pause
function togglePlayPause() {
    if (!audioPlayer.src) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseBtn();
    } else {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayPauseBtn();
            }).catch(error => {
                console.error("Play failed:", error);
                isPlaying = false;
                updatePlayPauseBtn();
            });
        }
    }
}

function updatePlayPauseBtn() {
    if (isPlaying) {
        playPauseBtn.classList.remove('fa-play');
        playPauseBtn.classList.add('fa-pause');
    } else {
        playPauseBtn.classList.remove('fa-pause');
        playPauseBtn.classList.add('fa-play');
    }
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);

audioPlayer.addEventListener('error', () => {
    console.error("Native Audio Player Error:", audioPlayer.error);
    playerTitle.textContent = "Error: Cannot load audio";
    isPlaying = false;
    updatePlayPauseBtn();
});

audioPlayer.addEventListener('timeupdate', () => {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration || 0;
    
    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(duration);
    
    if (duration > 0) {
        const progressPercent = (current / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }
});

// Click on progress bar to seek
progressBarBg.addEventListener('click', (e) => {
    if (!audioPlayer.src || !audioPlayer.duration) return;
    
    const width = progressBarBg.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    audioPlayer.currentTime = (clickX / width) * duration;
});

// Auto-play next track
audioPlayer.addEventListener('ended', () => {
    if (currentTrackIndex < currentTracks.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        isPlaying = false;
        updatePlayPauseBtn();
        progress.style.width = '0%';
        currentTimeEl.textContent = '0:00';
    }
});

// Categories 
document.querySelectorAll('.categories button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.categories button.active').classList.remove('active');
        btn.classList.add('active');
        fetchTracks(btn.textContent + ' music');
    });
});

// Search functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        fetchTracks(searchInput.value.trim());
        // Simple search feedback for categories filter
        document.querySelector('.categories button.active')?.classList.remove('active');
    }
});

// Next / Prev controls
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentTrackIndex < currentTracks.length - 1) {
        playTrack(currentTrackIndex + 1);
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else if (currentTrackIndex === 0) {
        audioPlayer.currentTime = 0;
    }
});

// Play All button
document.querySelector('.play-all-btn').addEventListener('click', () => {
    if (currentTracks.length > 0) {
        playTrack(0);
    }
});

// Heart toggle
document.querySelector('.heart-icon').addEventListener('click', function() {
    this.classList.toggle('far');
    this.classList.toggle('fas');
    this.classList.toggle('active');
});

// Initial load
fetchTracks('top tracks');
