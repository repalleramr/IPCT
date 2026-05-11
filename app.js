// --- MI6 MASTER ENGINE ---
let bets = [], fancyBets = [];
let manualStats = { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [], last9History: [] };
let team1Name = "Target A", team2Name = "Target B";
let editingIndex = -1;

// 1. STORAGE WRAPPER
let isStorageSafe = false; let memoryStorage = {};
try { localStorage.setItem('test', '1'); localStorage.removeItem('test'); isStorageSafe = true; } catch (e) { isStorageSafe = false; }
function safeSet(k, v) { if (isStorageSafe) localStorage.setItem(k, v); else memoryStorage[k] = v; }
function safeGet(k) { return isStorageSafe ? localStorage.getItem(k) : memoryStorage[k]; }

// 2. TABS & MATCH MGMT
const iplMatches = ["May 11: Punjab Kings vs Delhi Capitals", "May 12: Gujarat Titans vs Sunrisers Hyderabad", "May 13: Mumbai Indians vs Royal Challengers"];

function switchTab(id) {
    document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-' + id).classList.add('active');
    document.getElementById(id + 'Tab').classList.add('active');
}

function loadSelectedMatch() {
    const val = document.getElementById('matchSelect').value;
    if (val) {
        const teams = val.split(': ')[1].split(' vs ');
        team1Name = teams[0].trim(); team2Name = teams[1].trim();
        updateDropdowns(); calculateTable();
    }
}

// 3. MANUAL SCORE & ORACLE ENGINE
function recordBall(result) {
    const res = result.toString().toUpperCase();
    let ballRun = 0, isLegal = true;
    if (res === 'W') { manualStats.wickets++; } 
    else if (res === 'WD' || res === 'NB') { manualStats.runs += 1; ballRun = 1; isLegal = false; } 
    else { ballRun = parseInt(res) || 0; manualStats.runs += ballRun; }

    if (isLegal) {
        manualStats.totalBalls++;
        manualStats.last9History.push(ballRun);
        if (manualStats.last9History.length > 9) manualStats.last9History.shift();
    }
    manualStats.ballHistory.push(res);
    if (manualStats.ballHistory.length > 6) manualStats.ballHistory.shift();
    updateManualDisplay();
}

function updateManualDisplay() {
    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    if (!scoreBox) return;

    const overDisplay = `${Math.floor(manualStats.totalBalls / 6)}.${manualStats.totalBalls % 6}`;
    const last9Total = manualStats.last9History.reduce((a, b) => a + b, 0);
    const last9RR = manualStats.last9History.length > 0 ? (last9Total / manualStats.last9History.length) * 6 : 0;

    const getProj = (t) => {
        const rem = t - (manualStats.totalBalls / 6);
        return rem > 0 ? Math.floor(manualStats.runs + (rem * last9RR)) : "Done";
    };

    scoreBox.innerHTML = `
        <div style="font-size: 2rem; font-weight: bold;">${manualStats.runs}/${manualStats.wickets} <span class="neutral" style="font-size:1rem;">(${overDisplay})</span></div>
        <div class="radar-box"><div class="ball-history">
            ${manualStats.ballHistory.map(b => `<div class="ball-marker ${b=='4'?'ball-four':b=='6'?'ball-six':b=='W'?'ball-wicket':'ball-dot'}">${b}</div>`).join('')}
        </div></div>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top:10px;">
            ${[0,1,2,3,'W',4,6,'WD','NB','CLR'].map(k => `<button onclick="${k=='CLR'?'resetManual()':`recordBall('${k}')`}" style="padding:15px 0; background:#222; color:white; border:1px solid #444; border-radius:4px; font-weight:bold;">${k}</button>`).join('')}
        </div>
    `;

    if (aiBox) {
        aiBox.innerHTML = `
            <div style="color: #e1bee7; font-size: 0.8rem; margin-bottom: 10px;">MOMENTUM PROJECTION (RR: ${last9RR.toFixed(2)})</div>
            <div class="proj-grid">
                <div class="proj-card"><span class="proj-label">6 Over</span><span class="proj-val">${getProj(6)}</span></div>
                <div class="proj-card"><span class="proj-label">10 Over</span><span class="proj-val">${getProj(10)}</span></div>
                <div class="proj-card"><span class="proj-label">15 Over</span><span class="proj-val">${getProj(15)}</span></div>
                <div class="proj-card"><span class="proj-label">20 Over</span><span class="proj-val">${getProj(20)}</span></div>
            </div>
        `;
    }
}

function resetManual() { if(confirm("Reset Score?")) { manualStats = { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [], last9History: [] }; updateManualDisplay(); } }

// 4. LEDGER LOGIC (BETS)
function addBet() {
    const team = document.getElementById('entryTeam').value, action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value), stake = parseFloat(document.getElementById('entryStake').value);
    if (!team || isNaN(rate) || isNaN(stake)) return alert("Missing Intel");
    
    let favPL = (action === 'Play') ? stake * (rate/100) : -(stake * (rate/100));
    let oppPL = (action === 'Play') ? -stake : stake;

    if (editingIndex !== -1) { bets[editingIndex] = { team, action, rate, stake, favPL, oppPL }; editingIndex = -1; } 
    else { bets.push({ team, action, rate, stake, favPL, oppPL }); }
    
    document.getElementById('entryRate').value = ''; document.getElementById('entryStake').value = '';
    calculateTable();
}

function calculateTable() {
    const tbody = document.getElementById('betTableBody');
    const winner = document.getElementById('finalWinner').value;
    tbody.innerHTML = ''; let total = 0;
    
    bets.forEach((b, i) => {
        let pl = winner ? (winner === b.team ? b.favPL : b.oppPL) : 0;
        total += pl;
        tbody.innerHTML += `<tr><td>${i+1}</td><td>${b.team}</td><td>${b.action}</td><td>${b.rate}</td><td>${b.stake}</td><td class="positive">${b.favPL.toFixed(0)}</td><td class="negative">${b.oppPL.toFixed(0)}</td><td>${pl.toFixed(0)}</td><td><button onclick="deleteBet(${i})" class="btn-danger">X</button></td></tr>`;
    });
    document.getElementById('totalNetProfit').innerText = total.toFixed(2);
    saveState();
}

function deleteBet(i) { bets.splice(i,1); calculateTable(); }
function saveState() { safeSet('mi6_data', JSON.stringify({ bets, fancyBets, manualStats })); }

function updateDropdowns() {
    const e = document.getElementById('entryTeam'), w = document.getElementById('finalWinner');
    [e,w].forEach(s => s.innerHTML = `<option value="${team1Name}">${team1Name}</option><option value="${team2Name}">${team2Name}</option>`);
}

document.addEventListener("DOMContentLoaded", () => {
    const ms = document.getElementById('matchSelect');
    iplMatches.forEach(m => ms.innerHTML += `<option value="${m}">${m}</option>`);
    loadSelectedMatch();
});
