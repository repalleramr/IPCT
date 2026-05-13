// --- MI6 MASTER ENGINE: FULL INTEGRATION ---
let bets = [], fancyBets = [];
let manualStats = { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [], last9History: [], actionLog: [] };
let team1Name = "Target A", team2Name = "Target B";
let editingIndex = -1;

// 1. STORAGE WRAPPER
let isStorageSafe = false; let memoryStorage = {};
try { localStorage.setItem('mi6_ping', '1'); localStorage.removeItem('mi6_ping'); isStorageSafe = true; } catch (e) { isStorageSafe = false; }
function safeSet(k, v) { if (isStorageSafe) localStorage.setItem(k, v); else memoryStorage[k] = v; }
function safeGet(k) { return isStorageSafe ? localStorage.getItem(k) : memoryStorage[k]; }

// 2. TABS & MATCH MGMT
const iplMatches = [
    "May 13: Mumbai Indians vs Royal Challengers",
    "May 14: KKR vs Chennai Super Kings",
    "May 15: LSG vs Rajasthan Royals"
];

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

// 3. UPGRADED MANUAL SCORE ENGINE
function recordBall(result) {
    const res = result.toString().toUpperCase();
    let ballRun = 0, isLegal = true, type = 'normal';

    if (res === 'W') {
        type = 'wicket'; manualStats.wickets++;
    } else if (res === 'WD' || res === 'NB') {
        type = 'extra'; isLegal = false;
        let extraPlus = parseInt(prompt(`Extra runs on this ${res}? (Enter 0 if none)`, "0")) || 0;
        ballRun = 1 + extraPlus; manualStats.runs += ballRun;
    } else {
        ballRun = parseInt(res) || 0; manualStats.runs += ballRun;
    }

    if (isLegal) {
        manualStats.totalBalls++;
        manualStats.last9History.push(ballRun);
        if (manualStats.last9History.length > 9) manualStats.last9History.shift();
    }

    manualStats.actionLog.push({ res, ballRun, isLegal, type });
    manualStats.ballHistory.push((res === 'WD' && ballRun > 1) ? `W+${ballRun-1}` : res);
    if (manualStats.ballHistory.length > 6) manualStats.ballHistory.shift();
    
    updateManualDisplay();
    saveState();
}

function undoLast() {
    if (manualStats.actionLog.length === 0) return;
    const last = manualStats.actionLog.pop();
    manualStats.runs -= last.ballRun;
    if (last.type === 'wicket') manualStats.wickets--;
    if (last.isLegal) { manualStats.totalBalls--; manualStats.last9History.pop(); }
    
    manualStats.ballHistory = manualStats.actionLog.slice(-6).map(a => 
        (a.res === 'WD' && a.ballRun > 1) ? `W+${a.ballRun-1}` : a.res
    );
    updateManualDisplay();
    saveState();
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
        <div style="font-size: 2.2rem; font-weight: bold; color: var(--primary);">${manualStats.runs}/${manualStats.wickets} <span class="neutral" style="font-size:1.2rem;">(${overDisplay})</span></div>
        <div class="radar-box"><div class="ball-history">
            ${manualStats.ballHistory.map(b => `<div class="ball-marker ${b.includes('W') && !b.includes('+')?'ball-wicket':b=='4'?'ball-four':b=='6'?'ball-six':'ball-dot'}">${b}</div>`).join('')}
        </div></div>
        <div class="manual-grid">
            ${[0,1,2,3,4,6].map(k => `<button class="m-btn" onclick="recordBall(${k})">${k}</button>`).join('')}
            <button class="m-btn wicket" onclick="recordBall('W')">WKT</button>
            <button class="m-btn extra" onclick="recordBall('WD')">WD+</button>
            <button class="m-btn extra" onclick="recordBall('NB')">NB+</button>
            <button class="m-btn undo" onclick="undoLast()">⌫</button>
        </div>
        <button onclick="resetManual()" style="margin-top:10px; background:none; border:none; color:var(--text-muted); font-size:0.8rem; width:100%;">PROTOCOL ZERO (RESET)</button>
    `;

    if (aiBox) {
        aiBox.innerHTML = `
            <div style="color: #e1bee7; font-size: 0.8rem; margin-bottom: 10px; display:flex; justify-content:space-between;"><span>9-BALL MOMENTUM</span><span>RR: ${last9RR.toFixed(2)}</span></div>
            <div class="proj-grid">
                <div class="proj-card"><span class="proj-label">6 Over</span><span class="proj-val">${getProj(6)}</span></div>
                <div class="proj-card"><span class="proj-label">10 Over</span><span class="proj-val">${getProj(10)}</span></div>
                <div class="proj-card"><span class="proj-label">15 Over</span><span class="proj-val">${getProj(15)}</span></div>
                <div class="proj-card"><span class="proj-label">20 Over</span><span class="proj-val">${getProj(20)}</span></div>
            </div>
        `;
    }
}

function resetManual() { if(confirm("Reset Field Intel?")) { manualStats = { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [], last9History: [], actionLog: [] }; updateManualDisplay(); saveState(); } }

// 4. LEDGER LOGIC (BETS)
function addBet() {
    const team = document.getElementById('entryTeam').value, action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value), stake = parseFloat(document.getElementById('entryStake').value);
    if (!team || isNaN(rate) || isNaN(stake)) return alert("Missing Intel");
    
    let favPL = (action === 'Play') ? stake * (rate/100) : -(stake * (rate/100));
    let oppPL = (action === 'Play') ? -stake : stake;

    if (editingIndex !== -1) { bets[editingIndex] = { team, action, rate, stake, favPL, oppPL }; editingIndex = -1; document.getElementById('addBetBtn').innerText="EXECUTE DIRECTIVE"; } 
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
    document.getElementById('totalNetProfit').innerHTML = `<span class="${total >= 0 ? 'positive' : 'negative'}">${total.toFixed(2)}</span>`;
    saveState();
}

function deleteBet(i) { if(confirm("Scrub bet?")) { bets.splice(i,1); calculateTable(); } }

// 5. FANCY MATRIX LOGIC
function addFancyBet() {
    const phase = document.getElementById('fancyPhase').value, side = document.getElementById('fancyAction').value;
    const line = parseFloat(document.getElementById('fancyLine').value), stake = parseFloat(document.getElementById('fancyStake').value);
    if(!phase || isNaN(line) || isNaN(stake)) return alert("Phase parameters incomplete");
    fancyBets.push({ phase, side, line, stake, status: 'Pending', pnl: 0 });
    renderFancyTable();
}

function resolvePhase() {
    const phase = document.getElementById('resolvePhase').value, score = parseFloat(document.getElementById('resolveScore').value);
    if(!phase || isNaN(score)) return alert("Provide phase and score");
    fancyBets.forEach(b => {
        if(b.phase === phase && b.status === "Pending") {
            b.pnl = b.side === "Yes" ? (score >= b.line ? b.stake : -b.stake) : (score < b.line ? b.stake : -b.stake);
            b.status = "Resolved";
        }
    });
    renderFancyTable();
}

function renderFancyTable() {
    const tbody = document.getElementById('fancyTableBody');
    tbody.innerHTML = ''; let total = 0;
    fancyBets.forEach((b, i) => {
        if(b.status === "Resolved") total += b.pnl;
        tbody.innerHTML += `<tr><td>${b.phase}</td><td>${b.side}</td><td>${b.line}</td><td>${b.stake}</td><td style="color:${b.status=='Pending'?'var(--warning)':'var(--text-muted)'}">${b.status}</td><td>${b.status=='Resolved'?b.pnl:'-'}</td><td><button onclick="fancyBets.splice(${i},1);renderFancyTable();" class="btn-danger">X</button></td></tr>`;
    });
    document.getElementById('fancyNetProfit').innerText = total.toFixed(2);
    saveState();
}

// 6. INITIALIZATION
function saveState() { safeSet('mi6_data_v2', JSON.stringify({ bets, fancyBets, manualStats })); }
function updateDropdowns() {
    const e = document.getElementById('entryTeam'), w = document.getElementById('finalWinner');
    [e,w].forEach(s => s.innerHTML = `<option value="${team1Name}">${team1Name}</option><option value="${team2Name}">${team2Name}</option>`);
}

document.addEventListener("DOMContentLoaded", () => {
    const ms = document.getElementById('matchSelect');
    iplMatches.forEach(m => ms.innerHTML += `<option value="${m}">${m}</option>`);
    
    const saved = safeGet('mi6_data_v2');
    if(saved) {
        const data = JSON.parse(saved);
        bets = data.bets || []; fancyBets = data.fancyBets || []; manualStats = data.manualStats || manualStats;
    }
    loadSelectedMatch();
    updateManualDisplay();
});
