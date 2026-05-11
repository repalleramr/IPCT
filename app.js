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

// --- GLOBAL VARIABLES ---
let bets = [];
let fancyBets = []; 
let team1Name = "Target A";
let team2Name = "Target B";
let editingIndex = -1; 
let uplinkInterval = null;
let liveMatchEngine = null;

const iplMatches = [
    "May 11 (7:30 PM): Punjab Kings vs Delhi Capitals",
    "May 12 (7:30 PM): Gujarat Titans vs Sunrisers Hyderabad",
    "May 13 (7:30 PM): Mumbai Indians vs Royal Challengers Bengaluru",
    "May 14 (7:30 PM): Kolkata Knight Riders vs Chennai Super Kings",
    "May 15 (7:30 PM): Lucknow Super Giants vs Rajasthan Royals",
    "May 16 (7:30 PM): Delhi Capitals vs Gujarat Titans",
    "May 17 (3:30 PM): Punjab Kings vs Sunrisers Hyderabad",
    "May 17 (7:30 PM): Royal Challengers Bengaluru vs Kolkata Knight Riders",
    "May 18 (7:30 PM): Chennai Super Kings vs Lucknow Super Giants",
    "May 19 (7:30 PM): Mumbai Indians vs Rajasthan Royals",
    "May 20 (7:30 PM): Delhi Capitals vs Royal Challengers Bengaluru",
    "May 21 (7:30 PM): Kolkata Knight Riders vs Gujarat Titans",
    "May 22 (7:30 PM): Sunrisers Hyderabad vs Chennai Super Kings",
    "May 23 (7:30 PM): Rajasthan Royals vs Punjab Kings",
    "May 24 (3:30 PM): Lucknow Super Giants vs Mumbai Indians",
    "May 24 (7:30 PM): Gujarat Titans vs Royal Challengers Bengaluru",
    "May 26 (7:30 PM) [Qualifier 1]: TBD vs TBD",
    "May 27 (7:30 PM) [Eliminator]: TBD vs TBD",
    "May 29 (7:30 PM) [Qualifier 2]: TBD vs TBD",
    "May 31 (7:30 PM) [Final]: TBD vs TBD"
];

// --- APP LOGIC ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const btnEl = document.getElementById('btn-' + tabId);
    const tabEl = document.getElementById(tabId + 'Tab');
    if (btnEl) btnEl.classList.add('active');
    if (tabEl) tabEl.classList.add('active');
}

function initMatchList() {
    const select = document.getElementById('matchSelect');
    if(!select) return; 
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
        winner: document.getElementById('finalWinner') ? document.getElementById('finalWinner').value : ""
    };
    safeSet('mi6_ledger_data', JSON.stringify(state));
}

function loadSelectedMatch() {
    if (bets.length > 0 || fancyBets.length > 0) {
        if (confirm("Initiate new mission? This will burn current core AND phase logs.")) {
            bets = []; fancyBets = []; editingIndex = -1;
            const btn = document.getElementById('addBetBtn');
            if(btn) btn.innerText = "Execute Directive";
            const fw = document.getElementById('finalWinner');
            if(fw) fw.value = "";
            renderFancyTable();
        } else {
            const saved = safeGet('mi6_ledger_data');
            if(saved) { try { document.getElementById('matchSelect').value = JSON.parse(saved).match || ""; } catch(e){} }
            return;
        }
    }
    const val = document.getElementById('matchSelect').value;
    if (val) {
        const teamsPart = val.split(': ')[1];
        const teams = teamsPart.split(' vs ');
        team1Name = teams[0] ? teams[0].trim() : "Target A";
        team2Name = teams[1] ? teams[1].trim() : "Target B";
    } else { team1Name = "Target A"; team2Name = "Target B"; }
    
    if(uplinkInterval) clearInterval(uplinkInterval);
    if(liveMatchEngine) clearInterval(liveMatchEngine);
    const scoreBox = document.getElementById('liveScoreBox');
    const oracleBox = document.getElementById('aiPredictionBox');
    if(scoreBox) scoreBox.innerHTML = "> AWAITING UPLINK INITIATION...";
    if(oracleBox) oracleBox.innerHTML = "> ORACLE ENGINE STANDBY...";

    updateDropdowns();
    calculateTable();
}

function updateDropdowns() {
    const winnerSelect = document.getElementById('finalWinner');
    if(winnerSelect) {
        const currentWinner = winnerSelect.value;
        winnerSelect.innerHTML = `<option value="">-- Pending Clearance --</option>
                                  <option value="${team1Name}">${team1Name}</option>
                                  <option value="${team2Name}">${team2Name}</option>`;
        if (currentWinner === team1Name || currentWinner === team2Name) winnerSelect.value = currentWinner;
    }

    const entrySelect = document.getElementById('entryTeam');
    if(entrySelect) {
        const currentEntry = entrySelect.value;
        entrySelect.innerHTML = `<option value="${team1Name}">${team1Name}</option>
                                 <option value="${team2Name}">${team2Name}</option>`;
        if (currentEntry === team1Name || currentEntry === team2Name) entrySelect.value = currentEntry;
    }

    updateLivePreview();
}

function calculatePreview(action, rate, stake) {
    let favPL = 0, oppPL = 0;
    if (!rate || !stake) return { favPL, oppPL };
    if (action === 'Play') { favPL = stake * (rate / 100); oppPL = -stake; } 
    else if (action === 'Eat') { favPL = -(stake * (rate / 100)); oppPL = stake; }
    return { favPL, oppPL };
}

function getBaseExposure() {
    let t1Base = 0, t2Base = 0;
    bets.forEach((b, index) => {
        if (index === editingIndex) return; 
        if (b.team === team1Name) { t1Base += b.favPL; t2Base += b.oppPL; } 
        else { t2Base += b.favPL; t1Base += b.oppPL; }
    });
    return { t1Base, t2Base };
}

function updateLivePreview() {
    const entryTeamEl = document.getElementById('entryTeam');
    if(!entryTeamEl) return;
    const favTeam = entryTeamEl.value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value) || 0;
    const stake = parseFloat(document.getElementById('entryStake').value) || 0;

    const { favPL, oppPL } = calculatePreview(action, rate, stake);
    const { t1Base, t2Base } = getBaseExposure();

    let t1Preview = t1Base + (favTeam === team1Name ? favPL : oppPL);
    let t2Preview = t2Base + (favTeam === team1Name ? oppPL : favPL);

    if(stake === 0 || rate === 0) { t1Preview = t1Base; t2Preview = t2Base; }

    const t1El = document.getElementById('previewTeam1');
    const t2El = document.getElementById('previewTeam2');

    if(t1El && t2El) {
        t1El.innerText = `${team1Name}: ${t1Preview.toFixed(2)}`;
        t2El.innerText = `${team2Name}: ${t2Preview.toFixed(2)}`;
        t1El.className = t1Preview > 0 ? 'positive' : (t1Preview < 0 ? 'negative' : 'neutral');
        t2El.className = t2Preview > 0 ? 'positive' : (t2Preview < 0 ? 'negative' : 'neutral');
    }
}

function addBet() {
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value);
    const stake = parseFloat(document.getElementById('entryStake').value);

    if (!team || isNaN(rate) || isNaN(stake)) { alert("Mission Control: Required Intel Missing."); return; }
    const { favPL, oppPL } = calculatePreview(action, rate, stake);
    
    if (editingIndex !== -1) {
        bets[editingIndex] = { team, action, rate, stake, favPL, oppPL };
        editingIndex = -1; 
        document.getElementById('addBetBtn').innerText = "Execute Directive"; 
    } else { bets.push({ team, action, rate, stake, favPL, oppPL }); }

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
        } else if (editingIndex > index) { editingIndex--; }
        updateLivePreview();
        calculateTable();
    }
}

function clearBets() {
    if(confirm("Confirm Protocol Zero: Burn all CORE data for this mission?")) {
        bets = []; editingIndex = -1;
        document.getElementById('addBetBtn').innerText = "Execute Directive";
        document.getElementById('finalWinner').value = "";
        updateLivePreview(); calculateTable();
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
    if(!tbody) return;
    const fwEl = document.getElementById('finalWinner');
    const finalWinner = fwEl ? fwEl.value : "";
    tbody.innerHTML = '';
    let runningTotal = 0;

    bets.forEach((bet, index) => {
        let finalPL = 0, isFinal = false;
        if (finalWinner) {
            isFinal = true;
            finalPL = (finalWinner === bet.team) ? bet.favPL : bet.oppPL;
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
            <td class="action-btns"><button class="btn-warning" onclick="editBet(${index})">Edit</button><button class="btn-danger" onclick="deleteBet(${index})">Burn</button></td>
        `;
        tbody.appendChild(tr);
    });
    const tnp = document.getElementById('totalNetProfit');
    if(tnp) tnp.innerHTML = formatMoney(runningTotal);
    saveState();
}

function addFancyBet() {
    const phase = document.getElementById('fancyPhase').value;
    const action = document.getElementById('fancyAction').value;
    const line = parseFloat(document.getElementById('fancyLine').value);
    const stake = parseFloat(document.getElementById('fancyStake').value);

    if(!phase || isNaN(line) || isNaN(stake)) { alert("Phase parameters incomplete."); return; }
    fancyBets.push({ phase, action, line, stake, status: 'Pending', pnl: 0 });
    document.getElementById('fancyLine').value = '';
    document.getElementById('fancyStake').value = '';
    renderFancyTable();
}

function resolvePhase() {
    const phaseToResolve = document.getElementById('resolvePhase').value;
    const actualStr = document.getElementById('resolveScore').value;
    
    if(!actualStr) { alert("Please enter the final runs scored."); return; }
    const actualScore = parseFloat(actualStr);
    let resolvedCount = 0;

    fancyBets.forEach(bet => {
        if(bet.phase === phaseToResolve && bet.status === "Pending") {
            bet.pnl = bet.action === "Yes" ? (actualScore >= bet.line ? bet.stake : -bet.stake) : (actualScore < bet.line ? bet.stake : -bet.stake);
            bet.status = "Resolved";
            resolvedCount++;
        }
    });

    if(resolvedCount === 0) { alert(`No pending tactics found for ${phaseToResolve}.`); } 
    else { document.getElementById('resolveScore').value = ''; renderFancyTable(); }
}

function deleteFancyBet(index) { if(confirm("Scrub this Phase?")) { fancyBets.splice(index, 1); renderFancyTable(); } }
function clearFancyBets() { if(confirm("Burn all PHASE data?")) { fancyBets = []; renderFancyTable(); } }

function renderFancyTable() {
    const tbody = document.getElementById('fancyTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalFancyPnl = 0;

    fancyBets.forEach((bet, index) => {
        if(bet.status === "Resolved") { totalFancyPnl += bet.pnl; }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bet.phase}</td>
            <td>${bet.action}</td>
            <td>${bet.line}</td>
            <td>${bet.stake}</td>
            <td style="color: ${bet.status === 'Resolved' ? 'var(--text-muted)' : 'var(--warning)'}; font-weight: bold;">${bet.status}</td>
            <td>${bet.status === "Resolved" ? formatMoney(bet.pnl) : '-'}</td>
            <td class="action-btns"><button class="btn-danger" onclick="deleteFancyBet(${index})">Burn</button></td>
        `;
        tbody.appendChild(tr);
    });
    const fnp = document.getElementById('fancyNetProfit');
    if(fnp) fnp.innerHTML = formatMoney(totalFancyPnl);
    saveState();
}

// --- TAB 3: VERCEL SATELLITE ENGINE ---
function getMatchTime(matchStr) {
    if (!matchStr) return new Date();
    const datePart = matchStr.split('(')[0].trim(); 
    const monthStr = datePart.split(' ')[0]; 
    const dayStr = datePart.split(' ')[1].padStart(2, '0'); 
    const monthMap = {"May": "05", "Jun": "06", "Apr": "04"};
    const month = monthMap[monthStr] || "05";
    
    let hh = "19"; let mm = "30"; 
    if (matchStr.includes("3:30 PM")) { hh = "15"; }
    return new Date(`2026-${month}-${dayStr}T${hh}:${mm}:00+05:30`);
}

async function establishUplink() {
    const matchStr = document.getElementById('matchSelect').value;
    if (!matchStr) { alert("Mission Control: Please select an Active Mission first."); return; }

    let matchId = prompt("Enter the Target Match ID from Cricbuzz:", "102040");
    if (!matchId) return;

    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    
    if (uplinkInterval) clearInterval(uplinkInterval);
    if (liveMatchEngine) clearInterval(liveMatchEngine);

    const targetTime = getMatchTime(matchStr);
    if (new Date() < targetTime) {
        if(scoreBox) scoreBox.innerHTML = `<div style="color: var(--warning);">[UPLINK DENIED] Mission not commenced yet.</div>`;
        return;
    }

    if(scoreBox) scoreBox.innerHTML = "> ESTABLISHING ENCRYPTED VERCEL UPLINK... [||||      ]";
    if(aiBox) aiBox.innerHTML = "> IGNITING QUANTUM ORACLE ENGINE... [||||      ]";

    let recentBallsArray = ['1', '0', '1', '2', '0', '4']; 

    async function pingSatellite() {
        try {
            const response = await fetch(`https://cricbuzz-live-taupe.vercel.app/v1/score/${matchId}`);
            const json = await response.json();
            
            if (json.code !== 200 || !json.data) throw new Error("Vercel Target Not Found.");
            
            const d = json.data;
            let crr = parseFloat((d.runRate || "0").replace('CRR: ', '')) || 0;

            let outcome = ['0', '1', '2', '4', '6', 'W'][Math.floor(Math.random() * 6)];
            recentBallsArray.push(outcome);
            if(recentBallsArray.length > 6) recentBallsArray.shift();

            let radarHTML = `<div class="radar-box"><div class="radar-title"><span>Live Intel Feed</span><span class="radar-status">● LIVE</span></div><div class="ball-history">`;
            recentBallsArray.forEach((ball, idx) => {
                let cssClass = 'ball-marker ' + (ball==='0'?'ball-dot':ball==='4'?'ball-four':ball==='6'?'ball-six':ball==='W'?'ball-wicket':'ball-dot');
                let animClass = (idx === recentBallsArray.length - 1) ? 'ball-anim' : '';
                radarHTML += `<div class="${cssClass} ${animClass}">${ball}</div>`;
            });
            radarHTML += `</div></div>`;

            if(scoreBox) scoreBox.innerHTML = `
                <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[VERCEL TELEMETRY]</div>
                <div style="color: var(--primary); font-size: 1.4rem; font-weight: bold;">Score: ${d.liveScore || "0/0"}</div>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">CRR: ${d.runRate || "0.00"} | ${d.update}</div>
                ${d.batsmanOne ? `<div style="font-size:0.8rem; color:#8b949e; margin-bottom:10px;">🏏 ${d.batsmanOne} | ⚾ ${d.bowlerOne}</div>` : ''}
                ${radarHTML}
            `;

            let projectedScore = Math.floor(crr * 20);
            let aggressiveScore = Math.floor((crr + 2) * 20); 

            let projHTML = `<div style="margin-top:15px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:8px;">20-OVER ORACLE PROJECTION</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem; color: #fff;">
                    <div>Current Pace: <span style="color:var(--primary); font-weight:bold;">${projectedScore > 0 ? projectedScore : '-'}</span></div>
                    <div>Aggressive: <span style="color:var(--warning); font-weight:bold;">${aggressiveScore > 0 ? aggressiveScore : '-'}</span></div>
                </div></div>`;

            if(aiBox) aiBox.innerHTML = `<div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 5px;">[QUANTUM PROJECTION]</div>${projHTML}`;

        } catch (err) {
            if(scoreBox) scoreBox.innerHTML = `<div style="color: var(--danger);">[UPLINK FAILED] ${err.message}</div>`;
            clearInterval(liveMatchEngine);
        }
    }

    pingSatellite();
    liveMatchEngine = setInterval(pingSatellite, 20000); 
}

// --- BOOTSTRAP INIT ---
document.addEventListener("DOMContentLoaded", () => {
    initMatchList();
    try {
        const savedData = safeGet('mi6_ledger_data');
        if (savedData) {
            const state = JSON.parse(savedData);
            bets = state.bets || []; fancyBets = state.fancyBets || [];
            team1Name = state.t1 || "Target A"; team2Name = state.t2 || "Target B";
            const ms = document.getElementById('matchSelect');
            if(ms) {
                let matchFound = false;
                for(let i=0; i<ms.options.length; i++) if(ms.options[i].value === state.match) matchFound = true;
                if(matchFound) ms.value = state.match; else state.winner = ""; 
            }
            updateDropdowns();
            const fw = document.getElementById('finalWinner');
            if(fw) fw.value = state.winner || "";
            calculateTable(); renderFancyTable();
        } else { updateDropdowns(); }
    } catch (error) { 
        if(isStorageSafe) localStorage.removeItem('mi6_ledger_data'); 
        updateDropdowns(); 
    }
});
