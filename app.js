console.log("MI6 System Booting...");

// --- SAFE STORAGE WRAPPER ---
let isStorageSafe = false;
let memoryStorage = {};
try {
    localStorage.setItem('__test_ping__','1');
    localStorage.removeItem('__test_ping__');
    isStorageSafe = true;
} catch(e){ isStorageSafe=false; }
function safeSet(k,v){ if(isStorageSafe){try{localStorage.setItem(k,v);}catch(e){}} else memoryStorage[k]=v; }
function safeGet(k){ if(isStorageSafe){try{return localStorage.getItem(k);}catch(e){return null;}} return memoryStorage[k]||null; }

// --- GLOBAL STATE ---
let bets = [];
let fancyBets = [];
let editingIndex = -1;
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

// --- CORE MISSION (bets table) ---
function addBet() {
  const team = document.getElementById('entryTeam').value;
  const action = document.getElementById('entryAction').value;
  const rate = parseFloat(document.getElementById('entryRate').value);
  const stake = parseFloat(document.getElementById('entryStake').value);
  if(!team || !action || isNaN(rate) || isNaN(stake)) return;

  if(editingIndex >= 0) {
    bets[editingIndex] = {team, action, rate, stake};
    editingIndex = -1;
    document.getElementById('addBetBtn').innerText = "Execute Directive";
  } else {
    bets.push({team, action, rate, stake});
  }
  calculateTable();
  saveState();
}

function calculateTable() {
  const tbody = document.getElementById('betTableBody');
  if(!tbody) return;
  tbody.innerHTML = "";
  let total = 0;
  bets.forEach((b,i)=>{
    const win = (b.stake * b.rate/100).toFixed(2);
    const loss = (-b.stake).toFixed(2);
    total += parseFloat(win);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${b.team}</td><td>${b.action}</td><td>${b.rate}</td><td>${b.stake}</td><td>${win}</td><td>${loss}</td><td>-</td><td>-</td>`;
    tbody.appendChild(tr);
  });
  const net = document.getElementById('totalNetProfit');
  if(net) net.textContent = total.toFixed(2);
}

// --- PHASE GOALS (fancy bets) ---
function addFancyBet() {
  const phase = document.getElementById('fancyPhase').value;
  const action = document.getElementById('fancyAction').value;
  const line = parseFloat(document.getElementById('fancyLine').value);
  const stake = parseFloat(document.getElementById('fancyStake').value);
  if(!phase || !action || isNaN(line) || isNaN(stake)) return;
  fancyBets.push({phase, action, line, stake, status:"Pending"});
  renderFancyTable();
  saveState();
}

function renderFancyTable() {
  const tbody = document.getElementById('fancyTableBody');
  if(!tbody) return;
  tbody.innerHTML = "";
  let total = 0;
  fancyBets.forEach((f,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${f.phase}</td><td>${f.action}</td><td>${f.line}</td><td>${f.stake}</td><td>${f.status}</td><td>-</td><td>-</td>`;
    tbody.appendChild(tr);
    if(f.status==="Win") total += f.stake;
    if(f.status==="Loss") total -= f.stake;
  });
  const net = document.getElementById('fancyNetProfit');
  if(net) net.textContent = total.toFixed(2);
}

// --- SAVE/LOAD STATE ---
function saveState() {
  const state = {
    bets, fancyBets,
    match: document.getElementById('matchSelect').value,
    t1: team1Name, t2: team2Name,
    winner: document.getElementById('finalWinner').value
  };
  safeSet('mi6_ledger_data', JSON.stringify(state));
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
function establishUplink() { loadSelectedMatch(); }

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
  uplinkInterval = setInterval(fetchLive, 20000);
}

// --- BALL RENDERING ---
function renderBalls(balls) {
  const box = document.getElementById('lastBallsBox');
  if (!box) return;
  box.innerHTML = "";
  balls.forEach(b => {
    let marker = document.createElement('div');
    marker.classList.add('ball-marker','ball-
