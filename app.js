console.log("MI6 System Booting on Android Chrome...");

// --- SAFE STORAGE WRAPPER ---
let isStorageSafe = false;
let memoryStorage = {};

try {
    localStorage.setItem('__test_ping__', '1');
    localStorage.removeItem('__test_ping__');
    isStorageSafe = true;
} catch (error) {
    isStorageSafe = false;
    console.log("Incognito Mode: Using temporary RAM.");
}

function safeSet(key, value) {
    if (isStorageSafe) { try { localStorage.setItem(key, value); } catch(e){} } 
    else { memoryStorage[key] = value; }
}

function safeGet(key) {
    if (isStorageSafe) { try { return localStorage.getItem(key); } catch(e){ return null; } }
    return memoryStorage[key] || null;
}

let bets = [];
let fancyBets = []; 
let team1Name = "Target A";
let team2Name = "Target B";
let uplinkInterval = null;

// --- IPL FIXTURES ---
const iplMatches = [
    "May 11 (7:30 PM): Punjab Kings vs Delhi Capitals",
    "May 12 (7:30 PM): Gujarat Titans vs Sunrisers Hyderabad",
    "May 13 (7:30 PM): Royal Challengers Bengaluru vs Kolkata Knight Riders",
    "May 14 (7:30 PM): Punjab Kings vs Mumbai Indians",
    "May 15 (7:30 PM): Lucknow Super Giants vs Chennai Super Kings",
    "May 16 (7:30 PM): Kolkata Knight Riders vs Gujarat Titans",
    "May 17 (3:30 PM): Punjab Kings vs Royal Challengers Bengaluru",
    "May 17 (7:30 PM): Delhi Capitals vs Rajasthan Royals",
    "May 18 (7:30 PM): Chennai Super Kings vs Sunrisers Hyderabad",
    "May 19 (7:30 PM): Rajasthan Royals vs Lucknow Super Giants",
    "May 20 (7:30 PM): Kolkata Knight Riders vs Mumbai Indians",
    "May 21 (7:30 PM): Gujarat Titans vs Chennai Super Kings",
    "May 22 (7:30 PM): Sunrisers Hyderabad vs Royal Challengers Bengaluru",
    "May 23 (7:30 PM): Lucknow Super Giants vs Punjab Kings",
    "May 24 (3:30 PM): Mumbai Indians vs Rajasthan Royals",
    "May 24 (7:30 PM): Kolkata Knight Riders vs Delhi Capitals",
    "May 26 (7:30 PM) [Qualifier 1]: TBD vs TBD",
    "May 27 (7:30 PM) [Eliminator]: TBD vs TBD",
    "May 29 (7:30 PM) [Qualifier 2]: TBD vs TBD",
    "May 31 (7:30 PM) [Final]: TBD vs TBD"
];

// --- UI HELPERS ---
function initMatchList() {
    const select = document.getElementById('matchSelect');
    if(!select) return; 
    select.innerHTML = '<option value="">-- Select Active Mission --</option>';
    iplMatches.forEach(match => {
        let opt = document.createElement('option');
        opt.value = match;
        opt.textContent = match;
        select.appendChild(opt);
    });
}

function loadSelectedMatch() {
    const val = document.getElementById('matchSelect').value;
    if(!val) return;

    const teamsPart = val.split(': ')[1];
    const teams = teamsPart.split(' vs ');
    team1Name = teams[0] ? teams[0].trim() : "Target A";
    team2Name = teams[1] ? teams[1].trim() : "Target B";

    if(uplinkInterval) clearInterval(uplinkInterval);

    document.getElementById('liveScoreBox').innerHTML = "> Establishing uplink...";
    document.getElementById('aiPredictionBox').innerHTML = "> Oracle engine warming...";

    safeSet('mi6_ledger_data', JSON.stringify({ match: val, t1: team1Name, t2: team2Name }));
    startLiveUplink(val);
}

// --- LIVE FETCH ---
function startLiveUplink(matchString) {
    if(!matchString) return;
    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');

    async function fetchLive() {
        try {
            const resp = await fetch(`https://YOUR-VERCEL-APP.vercel.app/api/live?teams=${encodeURIComponent(matchString)}`);
            const data = await resp.json();
            if(data && data.match_info) {
                scoreBox.innerHTML = data.match_info.live_score || "No Score";
                aiBox.innerHTML = data.match_info.prediction || "No Prediction";
                renderBalls(data.match_info.last_balls || []);
            }
        } catch (err) {
            scoreBox.innerHTML = "Error uplink...";
            aiBox.innerHTML = "Oracle offline...";
        }
    }

    fetchLive();
    uplinkInterval = setInterval(fetchLive, 20000);
}

// --- BALL RENDERING ---
function renderBalls(balls) {
    const ballsBox = document.getElementById('lastBallsBox');
    if(!ballsBox) return;
    ballsBox.innerHTML = "";
    balls.forEach(b => {
        let circle = document.createElement('span');
        circle.classList.add('ball-circle');
        if(b === 'W') circle.style.backgroundColor = 'red';
        else if(b === '4' || b === '6') circle.style.backgroundColor = 'green';
        else circle.style.backgroundColor = 'darkgrey';
        circle.textContent = b;
        ballsBox.appendChild(circle);
    });
}

// --- WEB RADAR ---
function initBrowserRadar() {
    const radarInput = document.getElementById('radarUrlInput');
    const radarBtn = document.getElementById('radarLoadBtn');
    const radarBox = document.getElementById('radarFrameBox');
    if(radarBtn && radarInput && radarBox) {
        radarBtn.onclick = () => {
            const url = radarInput.value.trim();
            if(url) radarBox.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`;
        };
    }
}

// --- BOOTSTRAP ---
function initializeApp() {
    initMatchList();
    initBrowserRadar();

    const saved = safeGet('mi6_ledger_data');
    if(saved) {
        try {
            const state = JSON.parse(saved);
            if(state.match) {
                const ms = document.getElementById('matchSelect');
                if(ms) ms.value = state.match;
                team1Name = state.t1 || "Target A";
                team2Name = state.t2 || "Target B";
                startLiveUplink(state.match); // auto‑resume uplink after reload
            }
        } catch(e){}
    }

    const ms = document.getElementById('matchSelect');
    if(ms) ms.onchange = loadSelectedMatch;

    const establishBtn = document.getElementById('establishLinkBtn');
    if(establishBtn) establishBtn.onclick = loadSelectedMatch;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
