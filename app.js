console.log("MI6 System Booting...");

// --- GLOBAL STATE ---
let uplinkInterval = null;
let team1Name = "Target A", team2Name = "Target B";

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

// --- TAB SWITCHING ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-' + tabId).classList.add('active');
  document.getElementById(tabId + 'Tab').classList.add('active');
}

// --- MATCH LIST INIT ---
function initMatchList() {
  const sel = document.getElementById('matchSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Select Active Mission --</option>';
  iplMatches.forEach(m => {
    let opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
}

// --- LOAD SELECTED MATCH ---
function loadSelectedMatch() {
  const val = document.getElementById('matchSelect').value;
  if (!val) return;

  const teamsPart = val.split(': ')[1];
  const teams = teamsPart.split(' vs ');
  team1Name = teams[0] ? teams[0].trim() : "Target A";
  team2Name = teams[1] ? teams[1].trim() : "Target B";

  if (uplinkInterval) clearInterval(uplinkInterval);

  document.getElementById('liveScoreBox').innerHTML = "> Establishing uplink...";
  document.getElementById('aiPredictionBox').innerHTML = "> Oracle engine warming...";

  startLiveUplink(val);
}

// --- BUTTON HANDLER ---
function establishUplink() {
  loadSelectedMatch();
}

// --- LIVE FETCH LOOP ---
function startLiveUplink(matchString) {
  if (!matchString) return;
  const scoreBox = document.getElementById('liveScoreBox');
  const aiBox = document.getElementById('aiPredictionBox');

  async function fetchLive() {
    try {
      const resp = await fetch(`https://YOUR-VERCEL-APP.vercel.app/api/live?teams=${encodeURIComponent(matchString)}`);
      const data = await resp.json();
      if (data && data.match_info) {
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
  uplinkInterval = setInterval(fetchLive, 20000); // refresh every 20s
}

// --- BALL RENDERING ---
function renderBalls(balls) {
  const box = document.getElementById('lastBallsBox');
  if (!box) return;
  box.innerHTML = "";
  balls.forEach(b => {
    let marker = document.createElement('div');
    marker.classList.add('ball-marker', 'ball-anim');
    if (b === 'W') marker.classList.add('ball-wicket');
    else if (b === '4') marker.classList.add('ball-four');
    else if (b === '6') marker.classList.add('ball-six');
    else marker.classList.add('ball-dot');
    marker.textContent = b;
    box.appendChild(marker);
  });
}

// --- WEB RADAR ---
function initBrowserRadar() {
  const inp = document.getElementById('radarUrlInput');
  const btn = document.getElementById('radarLoadBtn');
  const box = document.getElementById('radarFrameBox');
  if (btn && inp && box) {
    btn.onclick = () => {
      const url = inp.value.trim();
      if (url) {
        box.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`;
      }
    };
  }
}

// --- BOOTSTRAP ---
function initializeApp() {
  initMatchList();
  initBrowserRadar();

  const ms = document.getElementById('matchSelect');
  if (ms) ms.onchange = loadSelectedMatch;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
