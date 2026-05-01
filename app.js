let bets = [];
let fancyBets = []; // Array to hold Phase/Session bets
let team1Name = "Target A";
let team2Name = "Target B";
let editingIndex = -1; 

const iplMatches = [
    "Mission 1: Royal Challengers Bengaluru vs Sunrisers Hyderabad", "Mission 2: Mumbai Indians vs Kolkata Knight Riders",
    "Mission 3: Rajasthan Royals vs Chennai Super Kings", "Mission 4: Punjab Kings vs Gujarat Titans",
    "Mission 5: Lucknow Super Giants vs Delhi Capitals", "Mission 6: Kolkata Knight Riders vs Sunrisers Hyderabad",
    "Mission 7: Chennai Super Kings vs Punjab Kings", "Mission 8: Delhi Capitals vs Mumbai Indians",
    "Mission 9: Gujarat Titans vs Rajasthan Royals", "Mission 10: Sunrisers Hyderabad vs Lucknow Super Giants",
    "Mission 11: Royal Challengers Bengaluru vs Chennai Super Kings", "Mission 12: Kolkata Knight Riders vs Punjab Kings",
    "Mission 13: Rajasthan Royals vs Mumbai Indians", "Mission 14: Delhi Capitals vs Gujarat Titans",
    "Mission 15: Kolkata Knight Riders vs Lucknow Super Giants", "Mission 16: Rajasthan Royals vs Royal Challengers Bengaluru",
    "Mission 17: Punjab Kings vs Sunrisers Hyderabad", "Mission 18: Chennai Super Kings vs Delhi Capitals",
    "Mission 19: Lucknow Super Giants vs Gujarat Titans", "Mission 20: Mumbai Indians vs Royal Challengers Bengaluru",
    "Mission 21: Sunrisers Hyderabad vs Rajasthan Royals", "Mission 22: Chennai Super Kings vs Kolkata Knight Riders",
    "Mission 23: Royal Challengers Bengaluru vs Lucknow Super Giants", "Mission 24: Mumbai Indians vs Punjab Kings",
    "Mission 25: Gujarat Titans vs Kolkata Knight Riders", "Mission 26: Royal Challengers Bengaluru vs Delhi Capitals",
    "Mission 27: Sunrisers Hyderabad vs Chennai Super Kings", "Mission 28: Kolkata Knight Riders vs Rajasthan Royals",
    "Mission 29: Punjab Kings vs Lucknow Super Giants", "Mission 30: Gujarat Titans vs Mumbai Indians",
    "Mission 31: Sunrisers Hyderabad vs Delhi Capitals", "Mission 32: Lucknow Super Giants vs Rajasthan Royals",
    "Mission 33: Mumbai Indians vs Chennai Super Kings", "Mission 34: Royal Challengers Bengaluru vs Gujarat Titans",
    "Mission 35: Delhi Capitals vs Punjab Kings", "Mission 36: Rajasthan Royals vs Sunrisers Hyderabad",
    "Mission 37: Gujarat Titans vs Chennai Super Kings", "Mission 38: Lucknow Super Giants vs Kolkata Knight Riders",
    "Mission 39: Delhi Capitals vs Royal Challengers Bengaluru", "Mission 40: Punjab Kings vs Rajasthan Royals",
    "Mission 41: Mumbai Indians vs Sunrisers Hyderabad", "Mission 42: Gujarat Titans vs Royal Challengers Bengaluru",
    "Mission 43: Rajasthan Royals vs Delhi Capitals", "Mission 44: Chennai Super Kings vs Mumbai Indians",
    "Mission 45: Sunrisers Hyderabad vs Kolkata Knight Riders", "Mission 46: Gujarat Titans vs Punjab Kings",
    "Mission 47: Mumbai Indians vs Lucknow Super Giants", "Mission 48: Delhi Capitals vs Chennai Super Kings",
    "Mission 49: Sunrisers Hyderabad vs Punjab Kings", "Mission 50: Lucknow Super Giants vs Royal Challengers Bengaluru",
    "Mission 51: Delhi Capitals vs Kolkata Knight Riders", "Mission 52: Rajasthan Royals vs Gujarat Titans",
    "Mission 53: Chennai Super Kings vs Lucknow Super Giants", "Mission 54: Royal Challengers Bengaluru vs Mumbai Indians",
    "Mission 55: Punjab Kings vs Delhi Capitals", "Mission 56: Gujarat Titans vs Sunrisers Hyderabad"
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

    // Default status is 'Pending'. Pnl is 0 until settled.
    fancyBets.push({ phase, action, line, stake, status: 'Pending', pnl: 0 });
    
    document.getElementById('fancyLine').value = '';
    document.getElementById('fancyStake').value = '';
    renderFancyTable();
}

function settleFancyBet(index) {
    const bet = fancyBets[index];
    const actualStr = prompt(`Enter ACTUAL runs scored for ${bet.phase} (Target Line was ${bet.line}):`);
    
    if(actualStr === null || actualStr.trim() === '') return; // User cancelled
    
    const actualScore = parseFloat(actualStr);
    if(isNaN(actualScore)) { 
        alert("Invalid Intel: Must be a number."); 
        return; 
    }

    // 1:1 payout logic
    // Action 'No' (Under): Win if Actual < Line. Lose if Actual >= Line.
    // Action 'Yes' (Over): Win if Actual >= Line. Lose if Actual < Line.
    
    if (bet.action === "Yes") {
        bet.pnl = (actualScore >= bet.line) ? bet.stake : -bet.stake;
    } else {
        bet.pnl = (actualScore < bet.line) ? bet.stake : -bet.stake;
    }
    
    bet.status = "Resolved";
    renderFancyTable();
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

        let actionHtml = '';
        if(bet.status === "Pending") {
            actionHtml = `<button class="btn-success" onclick="settleFancyBet(${index})">Resolve</button>
                          <button class="btn-danger" style="margin-top: 5px;" onclick="deleteFancyBet(${index})">Burn</button>`;
        } else {
            actionHtml = `<button class="btn-danger" onclick="deleteFancyBet(${index})">Burn</button>`;
        }

        tr.innerHTML = `
            <td>${bet.phase}</td>
            <td>${bet.action}</td>
            <td>${bet.line}</td>
            <td>${bet.stake}</td>
            <td style="color: ${bet.status === 'Resolved' ? 'var(--text-muted)' : 'var(--warning)'}; font-weight: bold;">${bet.status}</td>
            <td>${pnlDisplay}</td>
            <td class="action-btns" style="flex-direction: column;">${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('fancyNetProfit').innerHTML = formatMoney(totalFancyPnl);
    saveState();
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
            const writable = await handle.createWritable();
            await writable.write(csvContent);
            await writable.close();
        } else {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "mi6_intel_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        console.log("Export aborted.", err);
    }
}

// --- BOOTSTRAP ---
initMatchList();
const savedData = localStorage.getItem('mi6_ledger_data');
if (savedData) {
    const state = JSON.parse(savedData);
    bets = state.bets || [];
    fancyBets = state.fancyBets || [];
    team1Name = state.t1 || "Target A";
    team2Name = state.t2 || "Target B";
    document.getElementById('matchSelect').value = state.match || "";
    updateDropdowns();
    document.getElementById('finalWinner').value = state.winner || "";
    calculateTable();
    renderFancyTable();
} else {
    updateDropdowns();
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
    });
}
