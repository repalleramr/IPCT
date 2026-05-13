// ==========================================
// IPCT CLASSIFIED LEDGER - CORE SYSTEM LOGIC
// ==========================================

let bets = [];
let fancyBets = [];
let currentTeam1 = "Team A";
let currentTeam2 = "Team B";

// The precise match schedule from your matrix
const matchSchedule = [
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
    "May 22 (7:30 PM): Sunrisers Hyderabad vs Royal Challengers Bengaluru"
];

// --- INITIALIZATION & MEMORY RESTORE ---
window.onload = () => {
    const select = document.getElementById('matchSelect');
    matchSchedule.forEach(match => {
        let opt = document.createElement('option');
        opt.value = match;
        opt.innerText = match;
        select.appendChild(opt);
    });

    // 1. RESTORE SAVED MATCH 
    const savedMatch = localStorage.getItem('ipct_match');
    if (savedMatch && matchSchedule.includes(savedMatch)) {
        select.value = savedMatch;
    } else {
        select.value = "May 13 (7:30 PM): Royal Challengers Bengaluru vs Kolkata Knight Riders";
    }

    setupMatchDropdowns();

    // 2. RESTORE SAVED LEDGER ENTRIES
    const savedBets = localStorage.getItem('ipct_bets');
    if (savedBets) bets = JSON.parse(savedBets);
    
    const savedFancy = localStorage.getItem('ipct_fancy');
    if (savedFancy) fancyBets = JSON.parse(savedFancy);

    // 3. RESTORE SAVED FINAL WINNER
    const savedWinner = localStorage.getItem('ipct_winner');
    if (savedWinner) document.getElementById('finalWinner').value = savedWinner;

    // 4. ATTACH INSTANT CALCULATION LISTENERS
    document.getElementById('finalWinner').addEventListener('change', () => {
        saveSystemMemory();
        calculateTable(); 
    });

    document.getElementById('matchSelect').addEventListener('change', () => {
        bets = []; fancyBets = [];
        localStorage.removeItem('ipct_bets');
        localStorage.removeItem('ipct_fancy');
        localStorage.removeItem('ipct_winner');
        setupMatchDropdowns();
        saveSystemMemory();
        updateCoreUI();
        updateFancyUI();
    });

    // 5. ATTACH LIVE TYPING SENSORS FOR INSTANT EXPOSURE PREVIEW
    document.getElementById('entryRate').addEventListener('input', updateLivePreview);
    document.getElementById('entryStake').addEventListener('input', updateLivePreview);
    document.getElementById('entryTeam').addEventListener('change', updateLivePreview);
    document.getElementById('entryAction').addEventListener('change', updateLivePreview);

    // Render the restored data
    updateCoreUI();
    updateFancyUI();
};

// --- SYSTEM MEMORY CORE ---
function saveSystemMemory() {
    localStorage.setItem('ipct_match', document.getElementById('matchSelect').value);
    localStorage.setItem('ipct_bets', JSON.stringify(bets));
    localStorage.setItem('ipct_fancy', JSON.stringify(fancyBets));
    localStorage.setItem('ipct_winner', document.getElementById('finalWinner').value);
}

// --- NAVIGATION ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId + 'Tab').classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// --- MISSION SETUP ---
function setupMatchDropdowns() {
    const matchText = document.getElementById('matchSelect').value;
    let teamsPart = matchText;
    if (matchText.includes('): ')) {
        teamsPart = matchText.split('): ')[1];
    }
    const teams = teamsPart.split(' vs ');
    currentTeam1 = teams[0] ? teams[0].trim() : "Team A";
    currentTeam2 = teams[1] ? teams[1].trim() : "Team B";

    const entryTeam = document.getElementById('entryTeam');
    const finalWinner = document.getElementById('finalWinner');
    
    entryTeam.innerHTML = `<option value="${currentTeam1}">${currentTeam1}</option><option value="${currentTeam2}">${currentTeam2}</option>`;
    
    finalWinner.innerHTML = `
        <option value="Pending">-- Mission Pending --</option>
        <option value="${currentTeam1}">${currentTeam1} Secured</option>
        <option value="${currentTeam2}">${currentTeam2} Secured</option>
    `;
}

// --- CORE MISSION MATH ---
function addBet() {
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value; 
    const rate = parseFloat(document.getElementById('entryRate').value);
    const stake = parseFloat(document.getElementById('entryStake').value);

    if (!rate || !stake || rate <= 0 || stake <= 0) {
        alert("Classified Error: Invalid Intel or Funds.");
        return;
    }

    let winAmt = 0; let lossAmt = 0;
    if (action === "Play") {
        winAmt = stake * (rate / 100);
        lossAmt = -stake;
    } else {
        winAmt = stake;
        lossAmt = -(stake * (rate / 100));
    }

    bets.push({ id: bets.length + 1, team, action, rate, stake, winAmt, lossAmt });
    document.getElementById('entryRate').value = '';
    document.getElementById('entryStake').value = '';
    saveSystemMemory();
    updateCoreUI();
}

function updateCoreUI() {
    const tbody = document.getElementById('betTableBody');
    tbody.innerHTML = '';

    bets.forEach((bet, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="color:${bet.team === currentTeam1 ? 'var(--primary)' : 'var(--warning)'}">${bet.team.substring(0,3).toUpperCase()}</td>
            <td>${bet.action === 'Play' ? 'ADD' : 'DIVERT'}</td>
            <td>${bet.rate}</td>
            <td>${bet.stake.toFixed(0)}</td>
            <td class="profit">+${bet.winAmt.toFixed(2)}</td>
            <td class="loss">${bet.lossAmt.toFixed(2)}</td>
            <td>-</td>
            <td><button onclick="deleteBet(${index})" style="background:var(--danger);color:#fff;border:none;padding:2px 6px;border-radius:3px;font-size:0.7rem;">X</button></td>
        `;
        tbody.appendChild(tr);
    });

    calculateTable();
    updateLivePreview(); // Run the live preview to update the exposure boxes
}

function deleteBet(index) {
    bets.splice(index, 1);
    saveSystemMemory();
    updateCoreUI();
}

// --- THE INSTANT TYPING PREVIEW CALCULATOR ---
function updateLivePreview() {
    let t1Net = 0; let t2Net = 0;
    
    // 1. Calculate confirmed bets
    bets.forEach((bet) => {
        if (bet.team === currentTeam1) { t1Net += bet.winAmt; t2Net += bet.lossAmt; } 
        else { t2Net += bet.winAmt; t1Net += bet.lossAmt; }
    });

    // 2. Add the hypothetical bet currently being typed in the inputs
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value) || 0;
    const stake = parseFloat(document.getElementById('entryStake').value) || 0;

    if (rate > 0 && stake > 0) {
        let winAmt = 0; let lossAmt = 0;
        if (action === "Play") {
            winAmt = stake * (rate / 100);
            lossAmt = -stake;
        } else {
            winAmt = stake;
            lossAmt = -(stake * (rate / 100));
        }

        if (team === currentTeam1) { t1Net += winAmt; t2Net += lossAmt; } 
        else { t2Net += winAmt; t1Net += lossAmt; }
    }

    // 3. Instantly update the UI boxes
    const p1 = document.getElementById('previewTeam1');
    const p2 = document.getElementById('previewTeam2');
    p1.innerText = `${currentTeam1.substring(0,3).toUpperCase()}: ${t1Net > 0 ? '+' : ''}${t1Net.toFixed(2)}`;
    p1.className = t1Net >= 0 ? 'profit' : 'loss';
    p2.innerText = `${currentTeam2.substring(0,3).toUpperCase()}: ${t2Net > 0 ? '+' : ''}${t2Net.toFixed(2)}`;
    p2.className = t2Net >= 0 ? 'profit' : 'loss';
}

function calculateTable() {
    const winner = document.getElementById('finalWinner').value;
    const totalBox = document.getElementById('totalNetProfit');
    const tbody = document.getElementById('betTableBody');

    if (winner === "Pending") {
        totalBox.innerText = "0.00"; totalBox.className = "neutral";
        for(let i=0; i<tbody.rows.length; i++) {
            if(tbody.rows[i].cells[7]) {
                tbody.rows[i].cells[7].innerText = "-"; 
                tbody.rows[i].cells[7].className = "";
            }
        }
        return;
    }

    let t1Net = 0; let t2Net = 0;
    bets.forEach((bet, index) => {
        let isWinner = (bet.team === winner && bet.action === "Play") || (bet.team !== winner && bet.action === "Eat");
        let resultAmt = isWinner ? bet.winAmt : bet.lossAmt;
        if (bet.team === currentTeam1) { t1Net += bet.winAmt; t2Net += bet.lossAmt; } 
        else { t2Net += bet.winAmt; t1Net += bet.lossAmt; }
        
        if(tbody.rows[index] && tbody.rows[index].cells[7]) {
            tbody.rows[index].cells[7].innerText = (resultAmt > 0 ? "+" : "") + resultAmt.toFixed(2);
            tbody.rows[index].cells[7].className = resultAmt > 0 ? "profit" : "loss";
        }
    });

    let finalNet = (winner === currentTeam1) ? t1Net : t2Net;
    totalBox.innerText = (finalNet > 0 ? "+" : "") + finalNet.toFixed(2);
    totalBox.className = finalNet > 0 ? "profit" : "loss";
}

// --- FANCY PHASE MATH ---
function addFancyBet() {
    const phase = document.getElementById('fancyPhase').value;
    const action = document.getElementById('fancyAction').value;
    const line = parseFloat(document.getElementById('fancyLine').value);
    const stake = parseFloat(document.getElementById('fancyStake').value);

    if (!line || !stake) return alert("Enter Threshold and Funds.");
    fancyBets.push({ id: fancyBets.length, phase, action, line, stake, result: null, net: 0 });
    document.getElementById('fancyLine').value = ''; document.getElementById('fancyStake').value = '';
    saveSystemMemory();
    updateFancyUI();
}

function resolvePhase() {
    const targetPhase = document.getElementById('resolvePhase').value;
    const actualScore = parseFloat(document.getElementById('resolveScore').value);

    if (isNaN(actualScore)) return alert("Enter Actual Runs Scored.");
    fancyBets.forEach(bet => {
        if (bet.phase === targetPhase && bet.result === null) {
            if (bet.action === "Yes") bet.result = (actualScore >= bet.line) ? "Won" : "Lost";
            else bet.result = (actualScore < bet.line) ? "Won" : "Lost";
            bet.net = (bet.result === "Won") ? bet.stake : -bet.stake;
        }
    });
    document.getElementById('resolveScore').value = '';
    saveSystemMemory();
    updateFancyUI();
}

function deleteFancyBet(index) {
    fancyBets.splice(index, 1);
    saveSystemMemory();
    updateFancyUI();
}

function updateFancyUI() {
    const tbody = document.getElementById('fancyTableBody');
    tbody.innerHTML = '';
    let totalFancy = 0;

    fancyBets.forEach((bet, index) => {
        totalFancy += bet.net;
        let tr = document.createElement('tr');
        let statusColor = bet.result === "Won" ? "profit" : (bet.result === "Lost" ? "loss" : "neutral");
        tr.innerHTML = `
            <td>${bet.phase}</td>
            <td style="color:${bet.action === 'Yes' ? 'var(--primary)' : 'var(--danger)'}">${bet.action.toUpperCase()}</td>
            <td>${bet.line}</td><td>${bet.stake}</td>
            <td class="${statusColor}">${bet.result || "PENDING"}</td>
            <td class="${statusColor}">${bet.net > 0 ? '+' : ''}${bet.net.toFixed(2)}</td>
            <td><button onclick="deleteFancyBet(${index})" style="background:var(--danger);color:#fff;border:none;padding:2px 6px;border-radius:3px;font-size:0.7rem;">X</button></td>
        `;
        tbody.appendChild(tr);
    });
    const netBox = document.getElementById('fancyNetProfit');
    netBox.innerText = (totalFancy > 0 ? "+" : "") + totalFancy.toFixed(2);
    netBox.className = totalFancy > 0 ? "profit" : (totalFancy < 0 ? "loss" : "neutral");
}

// ==========================================
// BULLETPROOF SATELLITE UPLINK ENGINE
// ==========================================

async function establishUplink() {
    const aiBox = document.getElementById('aiPredictionBox');
    const scoreBox = document.getElementById('liveScoreBox');
    const lastBallsBox = document.getElementById('lastBallsBox');

    try {
        aiBox.innerHTML = "> DIAGNOSTIC OVERRIDE...";
        scoreBox.innerHTML = "> COMPILING TARGET...";
        lastBallsBox.innerHTML = "";

        const matchSelect = document.getElementById('matchSelect');
        if (!matchSelect || matchSelect.selectedIndex === -1) {
            throw new Error("UI ERROR: Cannot read dropdown selection.");
        }
        const selectedText = matchSelect.options[matchSelect.selectedIndex].text;
        let teamsOnly = selectedText;
        if (selectedText.includes('): ')) {
            teamsOnly = selectedText.split('): ')[1].trim(); 
        }

        const vercelURL = `https://ipct-v.vercel.app/api/live?teams=${encodeURIComponent(teamsOnly)}&t=${Date.now()}`;
        
        aiBox.innerHTML = `> LOCATING: ${teamsOnly}`;
        scoreBox.innerHTML = "> INITIATING FETCH...";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(vercelURL, { 
            cache: 'no-store',
            signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`VERCEL HTTP REJECT: ${response.status}`);
        }

        const rawText = await response.text(); 
        
        try {
            const data = JSON.parse(rawText);

            if (data.success) {
                const info = data.match_info;
                scoreBox.innerHTML = `
                    <div style="color: var(--primary); font-weight: bold; margin-bottom: 5px; font-size:0.85rem;">[${info.title}]</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${info.live_score}</div>
                    <div style="color: var(--warning); font-size: 0.9rem; margin-top: 5px;">${info.status}</div>
                    <div style="color: var(--info); font-size: 0.95rem; margin-top: 5px; font-weight: bold;">BOWLER: ${info.bowler}</div>
                `;
                aiBox.innerHTML = `> ${info.prediction}`;

                lastBallsBox.innerHTML = "";
                info.last_balls.forEach(ball => {
                    let span = document.createElement('span');
                    span.className = 'ball';
                    span.innerText = ball;
                    if (ball === 'W') span.classList.add('w');
                    else if (ball === '4') span.classList.add('four');
                    else if (ball === '6') span.classList.add('six');
                    lastBallsBox.appendChild(span);
                });
            } else {
                aiBox.innerHTML = "> SATELLITE REJECTED.";
                scoreBox.innerHTML = `> ERROR: ${data.error || "Bad Matrix Data"}`;
            }
        } catch (jsonErr) {
            scoreBox.innerHTML = `> VERCEL HTML CRASH`;
            aiBox.innerHTML = `> Raw: ${rawText.substring(0, 60)}...`;
        }

    } catch (err) {
        if (err.name === 'AbortError') {
            scoreBox.innerHTML = `> CONNECTION TIMED OUT (8s)`;
            aiBox.innerHTML = `> YOUR PHONE/NETWORK BLOCKED VERCEL`;
        } else {
            scoreBox.innerHTML = `> SYSTEM HALT`;
            aiBox.innerHTML = `> ${err.message}`;
        }
    }
}
