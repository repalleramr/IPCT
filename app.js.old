let bets = [];
let fancyBets = []; 
let team1Name = "Target A";
let team2Name = "Target B";
let editingIndex = -1; 

// UPDATED SCHEDULE: LEAGUE TILL MAY 24, PLAYOFFS TBD
const iplMatches = [
    "May 11: Punjab Kings vs Delhi Capitals",
    "May 12: Gujarat Titans vs Sunrisers Hyderabad",
    "May 13: Mumbai Indians vs Royal Challengers Bengaluru",
    "May 14: Kolkata Knight Riders vs Chennai Super Kings",
    "May 15: Lucknow Super Giants vs Rajasthan Royals",
    "May 16: Delhi Capitals vs Gujarat Titans",
    "May 17: Punjab Kings vs Sunrisers Hyderabad",
    "May 17: Royal Challengers Bengaluru vs Kolkata Knight Riders",
    "May 18: Chennai Super Kings vs Lucknow Super Giants",
    "May 19: Mumbai Indians vs Rajasthan Royals",
    "May 20: Delhi Capitals vs Royal Challengers Bengaluru",
    "May 21: Kolkata Knight Riders vs Gujarat Titans",
    "May 22: Sunrisers Hyderabad vs Chennai Super Kings",
    "May 23: Rajasthan Royals vs Punjab Kings",
    "May 24: Lucknow Super Giants vs Mumbai Indians",
    "May 24: Gujarat Titans vs Royal Challengers Bengaluru",
    "May 26 (Qualifier 1): TBD vs TBD",
    "May 27 (Eliminator): TBD vs TBD",
    "May 29 (Qualifier 2): TBD vs TBD",
    "May 31 (Final): TBD vs TBD"
];

// --- TAB NAVIGATION LOGIC ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId + 'Tab').classList.add('active');
}

// --- INITIALIZATION & STORAGE ---
function initMatchList() {
    const select = document.getElementById('matchSelect');
    iplMatches.forEach(match => {
        let opt = document.createElement('option');
        opt.value = match;
        opt.innerHTML = match;
        select.appendChild(opt);
    });
}

function saveState() {
    const state = {
        bets: bets,
        fancyBets: fancyBets,
        match: document.getElementById('matchSelect').value,
        t1: team1Name,
        t2: team2Name,
        winner: document.getElementById('finalWinner').value
    };
    localStorage.setItem('mi6_ledger_data', JSON.stringify(state));
}

// --- CORE MISSION LOGIC (TAB 1) ---
function loadSelectedMatch() {
    if (bets.length > 0 || fancyBets.length > 0) {
        if (confirm("Initiate new mission? This will burn current core AND phase logs.")) {
            bets = [];
            fancyBets = [];
            editingIndex = -1;
            document.getElementById('addBetBtn').innerText = "Execute Directive";
            document.getElementById('finalWinner').value = "";
            renderFancyTable();
        } else {
            const saved = localStorage.getItem('mi6_ledger_data');
            if(saved) document.getElementById('matchSelect').value = JSON.parse(saved).match || "";
            return;
        }
    }
    const val = document.getElementById('matchSelect').value;
    if (val) {
        const teamsPart = val.split(': ')[1];
        const teams = teamsPart.split(' vs ');
        team1Name = teams[0];
        team2Name = teams[1];
    } else {
        team1Name = "Target A";
        team2Name = "Target B";
    }
    
    if(window.uplinkInterval) clearInterval(window.uplinkInterval);
    document.getElementById('liveScoreBox').innerHTML = "> AWAITING UPLINK INITIATION...";
    document.getElementById('aiPredictionBox').innerHTML = "> ORACLE ENGINE STANDBY...";

    updateDropdowns();
    calculateTable();
}

function updateDropdowns() {
    const winnerSelect = document.getElementById('finalWinner');
    const currentWinner = winnerSelect.value;
    winnerSelect.innerHTML = `<option value="">-- Pending Clearance --</option>
                              <option value="${team1Name}">${team1Name}</option>
                              <option value="${team2Name}">${team2Name}</option>`;
    if (currentWinner === team1Name || currentWinner === team2Name) winnerSelect.value = currentWinner;

    const entrySelect = document.getElementById('entryTeam');
    const currentEntry = entrySelect.value;
    entrySelect.innerHTML = `<option value="${team1Name}">${team1Name}</option>
                             <option value="${team2Name}">${team2Name}</option>`;
    if (currentEntry === team1Name || currentEntry === team2Name) entrySelect.value = currentEntry;

    updateLivePreview();
}

function calculatePreview(action, rate, stake) {
    let favPL = 0, oppPL = 0;
    if (!rate || !stake) return { favPL, oppPL };
    
    if (action === 'Play') {
        favPL = stake * (rate / 100);
        oppPL = -stake;
    } else if (action === 'Eat') {
        favPL = -(stake * (rate / 100));
        oppPL = stake;
    }
    return { favPL, oppPL };
}

function getBaseExposure() {
    let t1Base = 0, t2Base = 0;
    bets.forEach((b, index) => {
        if (index === editingIndex) return; 
        
        if (b.team === team1Name) {
            t1Base += b.favPL;
            t2Base += b.oppPL;
        } else {
            t2Base += b.favPL;
            t1Base += b.oppPL;
        }
    });
    return { t1Base, t2Base };
}

function updateLivePreview() {
    const favTeam = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value) || 0;
    const stake = parseFloat(document.getElementById('entryStake').value) || 0;

    const { favPL, oppPL } = calculatePreview(action, rate, stake);
    const { t1Base, t2Base } = getBaseExposure();

    let t1Preview = t1Base;
    let t2Preview = t2Base;

    if (stake > 0 && rate > 0) {
        if (favTeam === team1Name) {
            t1Preview += favPL; t2Preview += oppPL;
        } else {
            t2Preview += favPL; t1Preview += oppPL;
        }
    }

    const t1El = document.getElementById('previewTeam1');
    const t2El = document.getElementById('previewTeam2');

    t1El.innerText = `${team1Name}: ${t1Preview.toFixed(2)}`;
    t2El.innerText = `${team2Name}: ${t2Preview.toFixed(2)}`;

    t1El.className = t1Preview > 0 ? 'positive' : (t1Preview < 0 ? 'negative' : 'neutral');
    t2El.className = t2Preview > 0 ? 'positive' : (t2Preview < 0 ? 'negative' : 'neutral');
}

function addBet() {
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value);
    const stake = parseFloat(document.getElementById('entryStake').value);

    if (!team || isNaN(rate) || isNaN(stake)) {
        alert("Mission Control: Required Intel Missing.");
        return;
    }

    const { favPL, oppPL } = calculatePreview(action, rate, stake);
    
    if (editingIndex !== -1) {
        bets[editingIndex] = { team, action, rate, stake, favPL, oppPL };
        editingIndex = -1; 
        document.getElementById('addBetBtn').innerText = "Execute Directive"; 
    } else {
        bets.push({ team, action, rate, stake, favPL, oppPL });
    }

    document.getElementById('entryRate').value = '';
    document.getElementById('entryStake').value = '';
    updateLivePreview();
    calculateTable();
}

function editBet(index) {
    const bet = bets[index];
    document.getElementById('entryTeam').value = bet.team;
    document.getElementById('entryAction').value = bet.action;
    document.getElementById('entryRate').value = bet.rate;
    document.getElementById('entryStake').value = bet.stake;
    
    editingIndex = index;
    document.getElementById('addBetBtn').innerText = "Update Directive";
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateLivePreview();
}

function deleteBet(index) {
    if(confirm("Scrub this entry from the ledger?")) {
        bets.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = -1;
            document.getElementById('addBetBtn').innerText = "Execute Directive";
            document.getElementById('entryRate').value = '';
            document.getElementById('entryStake').value = '';
        } else if (editingIndex > index) {
            editingIndex--;
        }
        updateLivePreview();
        calculateTable();
    }
}

function clearBets() {
    if(confirm("Confirm Protocol Zero: Burn all CORE data for this mission?")) {
        bets = [];
        editingIndex = -1;
        document.getElementById('addBetBtn').innerText = "Execute Directive";
        document.getElementById('finalWinner').value = "";
        updateLivePreview();
        calculateTable();
    }
}

function formatMoney(num) {
    let str = num.toFixed(2);
    if (num > 0) return `<span class="positive">+${str}</span>`;
    if (num < 0) return `<span class="negative">${str}</span>`;
    return `<span class="neutral">${str}</span>`;
}

function calculateTable() {
    const tbody = document.getElementById('betTableBody');
    const finalWinner = document.getElementById('finalWinner').value;
    tbody.innerHTML = '';
    let runningTotal = 0;

    bets.forEach((bet, index) => {
        let finalPL = 0;
        let isFinal = false;

        if (finalWinner) {
            isFinal = true;
            if (finalWinner === bet.team) {
                finalPL = bet.favPL;
            } else {
                finalPL = bet.oppPL;
            }
            runningTotal += finalPL;
        }

        const tr = document.createElement('tr');
        if (index === editingIndex) {
            tr.style.backgroundColor = "rgba(255, 187, 51, 0.1)";
            tr.style.borderLeft = "4px solid var(--warning)";
        }

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${bet.team}</td>
            <td>${bet.action}</td>
            <td>${bet.rate}</td>
            <td>${bet.stake}</td>
            <td>${formatMoney(bet.favPL)}</td>
            <td>${formatMoney(bet.oppPL)}</td>
            <td>${isFinal ? formatMoney(finalPL) : '-'}</td>
            <td class="action-btns">
                <button class="btn-warning" onclick="editBet(${index})">Edit</button>
                <button class="btn-danger" onclick="deleteBet(${index})">Burn</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('totalNetProfit').innerHTML = formatMoney(runningTotal);
    saveState();
}

// --- PHASE OBJECTIVES (FANCY SESSIONS) LOGIC (TAB 2) ---
function addFancyBet() {
    const phase = document.getElementById('fancyPhase').value;
    const action = document.getElementById('fancyAction').value;
    const line = parseFloat(document.getElementById('fancyLine').value);
    const stake = parseFloat(document.getElementById('fancyStake').value);

    if(!phase || isNaN(line) || isNaN(stake)) {
        alert("Mission Control: Phase parameters incomplete.");
        return;
    }

    fancyBets.push({ phase, action, line, stake, status: 'Pending', pnl: 0 });
    
    document.getElementById('fancyLine').value = '';
    document.getElementById('fancyStake').value = '';
    renderFancyTable();
}

function resolvePhase() {
    const phaseToResolve = document.getElementById('resolvePhase').value;
    const actualStr = document.getElementById('resolveScore').value;
    
    if(!actualStr) {
        alert("Mission Control: Please enter the final runs scored.");
        return;
    }
    
    const actualScore = parseFloat(actualStr);
    let resolvedCount = 0;

    fancyBets.forEach(bet => {
        if(bet.phase === phaseToResolve && bet.status === "Pending") {
            if (bet.action === "Yes") {
                bet.pnl = (actualScore >= bet.line) ? bet.stake : -bet.stake;
            } else {
                bet.pnl = (actualScore < bet.line) ? bet.stake : -bet.stake;
            }
            bet.status = "Resolved";
            resolvedCount++;
        }
    });

    if(resolvedCount === 0) {
        alert(`No pending tactics found for ${phaseToResolve}.`);
    } else {
        document.getElementById('resolveScore').value = ''; 
        renderFancyTable();
    }
}

function deleteFancyBet(index) {
    if(confirm("Scrub this Phase from the ledger?")) {
        fancyBets.splice(index, 1);
        renderFancyTable();
    }
}

function clearFancyBets() {
    if(confirm("Confirm Protocol Zero: Burn all PHASE data?")) {
        fancyBets = [];
        renderFancyTable();
    }
}

function renderFancyTable() {
    const tbody = document.getElementById('fancyTableBody');
    tbody.innerHTML = '';
    let totalFancyPnl = 0;

    fancyBets.forEach((bet, index) => {
        if(bet.status === "Resolved") {
            totalFancyPnl += bet.pnl;
        }

        const tr = document.createElement('tr');
        
        let pnlDisplay = '-';
        if(bet.status === "Resolved") {
            pnlDisplay = formatMoney(bet.pnl);
        }

        tr.innerHTML = `
            <td>${bet.phase}</td>
            <td>${bet.action}</td>
            <td>${bet.line}</td>
            <td>${bet.stake}</td>
            <td style="color: ${bet.status === 'Resolved' ? 'var(--text-muted)' : 'var(--warning)'}; font-weight: bold;">${bet.status}</td>
            <td>${pnlDisplay}</td>
            <td class="action-btns">
                <button class="btn-danger" onclick="deleteFancyBet(${index})">Burn</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('fancyNetProfit').innerHTML = formatMoney(totalFancyPnl);
    saveState();
}

// --- TAB 3: LIVE SCORE & AI PREDICTION WITH COUNTDOWN ---

function getMatchTime(matchStr) {
    // Extracts "May 11" from strings
    let datePart = matchStr.split(':')[0].split('(')[0].trim();
    
    // Default match time is 7:30 PM IST
    let targetDateStr = `${datePart}, 2026 19:30:00`;
    
    // Account for specific 3:30 PM Double Headers 
    if (matchStr.includes("Punjab Kings vs Sunrisers Hyderabad") || 
        matchStr.includes("Lucknow Super Giants vs Mumbai Indians")) {
        targetDateStr = `${datePart}, 2026 15:30:00`;
    }
    
    return new Date(targetDateStr);
}

function establishUplink() {
    const matchStr = document.getElementById('matchSelect').value;
    if (!matchStr) {
        alert("Mission Control: Please select an Active Mission first.");
        return;
    }

    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    
    if (window.uplinkInterval) clearInterval(window.uplinkInterval);

    const targetTime = getMatchTime(matchStr);
    const now = new Date();

    if (targetTime > now) {
        // MATCH IN THE FUTURE -> SHOW COUNTDOWN
        aiBox.innerHTML = "> ORACLE ENGINE STANDBY... AWAITING MISSION COMMENCEMENT.";

        window.uplinkInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const distance = targetTime.getTime() - currentTime;

            if (distance < 0) {
                // Countdown hit zero! Clear it and restart the function to show scores
                clearInterval(window.uplinkInterval);
                establishUplink();
                return;
            }

            const d = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            const h = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            const m = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const s = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');

            scoreBox.innerHTML = `
                <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[MISSION PENDING]</div>
                <div style="color: var(--warning); font-size: 1.4rem; font-weight: bold; letter-spacing: 2px;">T-MINUS: ${d}d ${h}h ${m}m ${s}s</div>
                <div style="color: var(--text-muted); margin-top: 8px; font-size: 0.85rem;">Target: ${team1Name} vs ${team2Name}</div>
                <div style="color: var(--text-muted); font-size: 0.85rem;">Scheduled: ${targetTime.toLocaleString()}</div>
            `;
        }, 1000);
        
    } else {
        // MATCH HAS STARTED -> SHOW LIVE UPLINK AND AI
        scoreBox.innerHTML = "> ESTABLISHING ENCRYPTED UPLINK... [||||      ]";
        aiBox.innerHTML = "> IGNITING QUANTUM ORACLE ENGINE... [||||      ]";

        setTimeout(() => {
            const runs = Math.floor(Math.random() * 80) + 120;
            const wkts = Math.floor(Math.random() * 8) + 1;
            const overs = (Math.floor(Math.random() * 6) + 14) + "." + Math.floor(Math.random() * 6);
            
            // If teams are TBD, keep names generic
            let displayT1 = team1Name === "TBD" ? "Target A" : team1Name;
            let displayT2 = team2Name === "TBD" ? "Target B" : team2Name;

            scoreBox.innerHTML = `
                <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[LIVE TELEMETRY]</div>
                <div style="color: var(--primary); font-size: 1.2rem; font-weight: bold;">${displayT1}: ${runs}/${wkts} <span style="font-size:0.9rem; color:var(--text-muted);">(${overs} ov)</span></div>
                <div style="color: var(--warning); margin-top: 5px;">${displayT2}: Pending Deployment...</div>
            `;

            const probA = Math.floor(Math.random() * 40) + 30; 
            const probB = 100 - probA;
            let favoredTeam = probA > probB ? displayT1 : displayT2;
            let confidence = Math.max(probA, probB);

            aiBox.innerHTML = `
                <div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 5px;">[ORACLE PROJECTION]</div>
                <div style="color: #fff;">Primary Target: <span style="color: var(--primary); font-weight: bold; font-size:1.2rem;">${favoredTeam}</span></div>
                <div style="color: var(--info); margin-top: 5px;">Confidence Matrix: ${confidence}%</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 15px; font-style: italic;">* Prediction synthesized via atmospheric data, syndicate funding streams, and historical intercept patterns.</div>
            `;
        }, 1800);
    }
}

// --- EXPORT LOGIC ---
async function saveAsCSV() {
    if (bets.length === 0 && fancyBets.length === 0) {
        alert("No intel to export!");
        return;
    }

    const matchName = document.getElementById('matchSelect').value || "Classified Mission";
    const finalWinner = document.getElementById('finalWinner').value;

    let csvContent = `Mission,${matchName}\n`;
    csvContent += `Asset Secured,${finalWinner || 'Pending Clearance'}\n\n`;
    
    // Core Bets
    csvContent += "--- CORE LEDGER ---\n";
    csvContent += "Log #,Faction,Tactic,Intel,Funds,Yield A,Yield B,Final Result\n";
    bets.forEach((bet, index) => {
        let finalPL = 0;
        let isFinal = false;
        if (finalWinner) {
            isFinal = true;
            if (finalWinner === bet.team) {
                finalPL = bet.favPL;
            } else {
                finalPL = bet.oppPL;
            }
        }
        csvContent += `${index + 1},${bet.team},${bet.action},${bet.rate},${bet.stake},${bet.favPL},${bet.oppPL},${isFinal ? finalPL : '-'}\n`;
    });

    // Fancy Bets
    csvContent += "\n--- PHASE OBJECTIVES (SESSIONS) ---\n";
    csvContent += "Phase,Stance,Line,Funds,Status,Net Result\n";
    fancyBets.forEach((bet) => {
        csvContent += `${bet.phase},${bet.action},${bet.line},${bet.stake},${bet.status},${bet.status === 'Resolved' ? bet.pnl : '-'}\n`;
    });

    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'mi6_intel_export.csv',
                types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }],
            });
            const writable = await handle.
