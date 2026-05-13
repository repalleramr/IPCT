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
let team1Name = "Target A";
let team2Name = "Target B";
let editingIndex = -1; 
let liveMatchEngine = null;

// CORRECTED OFFICIAL IPL 2026 SCHEDULE
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

// --- APP LOGIC ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('btn-' + tabId).classList.add('active');
    document.getElementById(tabId + 'Tab').classList.add('active');
}

function initMatchList() {
    const select = document.getElementById('matchSelect');
    if(!select) return; 
    select.innerHTML = '';
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
        match: document.getElementById('matchSelect').value,
        t1: team1Name,
        t2: team2Name,
        winner: document.getElementById('finalWinner').value
    };
    safeSet('mi6_ledger_data', JSON.stringify(state));
}

function loadSelectedMatch() {
    if (bets.length > 0) {
        if (confirm("Initiate new mission? This will burn current core logs.")) {
            bets = []; editingIndex = -1;
            document.getElementById('addBetBtn').innerText = "EXECUTE DIRECTIVE";
            document.getElementById('finalWinner').value = "";
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
    
    if(liveMatchEngine) clearInterval(liveMatchEngine);
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
    const favTeam = document.getElementById('entryTeam').value;
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

    t1El.innerText = `${team1Name}: ${t1Preview.toFixed(2)}`;
    t2El.innerText = `${team2Name}: ${t2Preview.toFixed(2)}`;
    t1El.className = `exposure-team ${t1Preview > 0 ? 'positive' : (t1Preview < 0 ? 'negative' : 'neutral')}`;
    t2El.className = `exposure-team ${t2Preview > 0 ? 'positive' : (t2Preview < 0 ? 'negative' : 'neutral')}`;
}

// Event Listeners for Live Preview
document.getElementById('entryRate').addEventListener('input', updateLivePreview);
document.getElementById('entryStake').addEventListener('input', updateLivePreview);
document.getElementById('entryTeam').addEventListener('change', updateLivePreview);
document.getElementById('entryAction').addEventListener('change', updateLivePreview);

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
        document.getElementById('addBetBtn').innerText = "EXECUTE DIRECTIVE"; 
    } else { bets.push({ team, action, rate, stake, favPL, oppPL }); }

    document.getElementById('entryRate').value = '';
    document.getElementById('entryStake').value = '';
    updateLivePreview();
    calculateTable();
}

function deleteBet(index) {
    if(confirm("Scrub this entry from the ledger?")) {
        bets.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = -1;
            document.getElementById('addBetBtn').innerText = "EXECUTE DIRECTIVE";
        } else if (editingIndex > index) { editingIndex--; }
        updateLivePreview();
        calculateTable();
    }
}

function clearBets() {
    if(confirm("Confirm Protocol Zero: Burn all CORE data?")) {
        bets = []; editingIndex = -1;
        document.getElementById('addBetBtn').innerText = "EXECUTE DIRECTIVE";
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
    const finalWinner = document.getElementById('finalWinner').value;
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
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${bet.team.substring(0,3)}</td>
            <td style="color:${bet.action==='Play'?'#00e676':'#ff4d4d'}">${bet.action}</td>
            <td>${bet.rate}</td>
            <td>${bet.stake}</td>
            <td>${formatMoney(bet.favPL)}</td>
            <td>${formatMoney(bet.oppPL)}</td>
            <td>${isFinal ? formatMoney(finalPL) : '-'}</td>
            <td><button onclick="deleteBet(${index})" style="background:var(--danger);color:#fff;border:none;padding:4px;border-radius:3px;">X</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('totalNetProfit').innerHTML = formatMoney(runningTotal);
    saveState();
}

// ==========================================
// VERCEL SATELLITE ENGINE
// ==========================================
async function pingVercelSatellite() {
    const aiBox = document.getElementById('aiPredictionBox');
    const scoreBox = document.getElementById('liveScoreBox');
    const matchSelect = document.getElementById('matchSelect');

    try {
        if (!matchSelect || matchSelect.selectedIndex === -1) {
            throw new Error("UI ERROR: Cannot read mission target.");
        }
        
        const selectedText = matchSelect.options[matchSelect.selectedIndex].text;
        let teamsOnly = selectedText;
        if (selectedText.includes('): ')) {
            teamsOnly = selectedText.split('): ')[1].trim(); 
        }

        const vercelURL = `https://ipct-v.vercel.app/api/live?teams=${encodeURIComponent(teamsOnly)}&t=${Date.now()}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(vercelURL, { 
            cache: 'no-store',
            signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`VERCEL BLOCKED: ${response.status}`);
        
        const rawText = await response.text(); 
        const data = JSON.parse(rawText);

        if (data.success) {
            const info = data.match_info;
            
            let radarHTML = `<div style="margin-top:15px;"><div style="font-size:0.85rem; color:#8b92a5; margin-bottom:6px;">[BALL HISTORY]</div><div style="display:flex; gap:6px; flex-wrap:wrap;">`;
            
            info.last_balls.forEach(ball => {
                let bg = '#333'; let color = '#fff';
                if (ball === 'W') { bg = '#ff4d4d'; } 
                else if (ball === '4') { bg = '#17a2b8'; } 
                else if (ball === '6') { bg = '#b366ff'; } 
                
                radarHTML += `<span style="background:${bg}; color:${color}; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:0.9rem;">${ball}</span>`;
            });
            radarHTML += `</div></div>`;

            scoreBox.innerHTML = `
                <div style="color: #00e676; font-weight: bold; margin-bottom: 5px; font-size:0.85rem;">[${info.title}]</div>
                <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${info.live_score}</div>
                <div style="color: #ffbb33; font-size: 0.9rem; margin-top: 5px;">${info.status}</div>
                <div style="color: #66d9ff; font-size: 0.95rem; margin-top: 5px; font-weight: bold;">BOWLER: ${info.bowler}</div>
                ${radarHTML}
            `;
            aiBox.innerHTML = `> ${info.prediction}`;

        } else {
            aiBox.innerHTML = "> SATELLITE REJECTED.";
            scoreBox.innerHTML = `> ERROR: ${data.error || "Bad Matrix Data"}`;
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            scoreBox.innerHTML = `> CONNECTION TIMED OUT (8s)`;
            aiBox.innerHTML = `> YOUR PHONE CACHE/NETWORK BLOCKED VERCEL`;
        } else {
            scoreBox.innerHTML = `> SYSTEM HALT`;
            aiBox.innerHTML = `> ${err.message}`;
        }
    }
}

function establishUplink() {
    document.getElementById('aiPredictionBox').innerHTML = "> BYPASSING CACHE...";
    document.getElementById('liveScoreBox').innerHTML = "> PINGING VERCEL SATELLITE...";
    
    if (liveMatchEngine) clearInterval(liveMatchEngine);
    pingVercelSatellite();
    liveMatchEngine = setInterval(pingVercelSatellite, 20000); 
}

// --- BOOTSTRAP INIT ---
initMatchList();
try {
    const savedData = safeGet('mi6_ledger_data');
    if (savedData) {
        const state = JSON.parse(savedData);
        bets = state.bets || [];
        team1Name = state.t1 || "Target A"; team2Name = state.t2 || "Target B";
        const ms = document.getElementById('matchSelect');
        let matchFound = false;
        for(let i=0; i<ms.options.length; i++) if(ms.options[i].value === state.match) matchFound = true;
        if(matchFound) ms.value = state.match; else state.winner = ""; 
        updateDropdowns();
        document.getElementById('finalWinner').value = state.winner || "";
        calculateTable(); 
    } else { updateDropdowns(); }
} catch (error) { if(isStorageSafe) localStorage.removeItem('mi6_ledger_data'); updateDropdowns(); }
