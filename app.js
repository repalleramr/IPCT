let bets = [];
let team1Name = "Team 1";
let team2Name = "Team 2";

const iplMatches = [
    "M1: Royal Challengers Bengaluru vs Sunrisers Hyderabad", "M2: Mumbai Indians vs Kolkata Knight Riders",
    "M3: Rajasthan Royals vs Chennai Super Kings", "M4: Punjab Kings vs Gujarat Titans",
    "M5: Lucknow Super Giants vs Delhi Capitals", "M6: Kolkata Knight Riders vs Sunrisers Hyderabad",
    "M7: Chennai Super Kings vs Punjab Kings", "M8: Delhi Capitals vs Mumbai Indians",
    "M9: Gujarat Titans vs Rajasthan Royals", "M10: Sunrisers Hyderabad vs Lucknow Super Giants",
    "M11: Royal Challengers Bengaluru vs Chennai Super Kings", "M12: Kolkata Knight Riders vs Punjab Kings",
    "M13: Rajasthan Royals vs Mumbai Indians", "M14: Delhi Capitals vs Gujarat Titans",
    "M15: Kolkata Knight Riders vs Lucknow Super Giants", "M16: Rajasthan Royals vs Royal Challengers Bengaluru",
    "M17: Punjab Kings vs Sunrisers Hyderabad", "M18: Chennai Super Kings vs Delhi Capitals",
    "M19: Lucknow Super Giants vs Gujarat Titans", "M20: Mumbai Indians vs Royal Challengers Bengaluru",
    "M21: Sunrisers Hyderabad vs Rajasthan Royals", "M22: Chennai Super Kings vs Kolkata Knight Riders",
    "M23: Royal Challengers Bengaluru vs Lucknow Super Giants", "M24: Mumbai Indians vs Punjab Kings",
    "M25: Gujarat Titans vs Kolkata Knight Riders", "M26: Royal Challengers Bengaluru vs Delhi Capitals",
    "M27: Sunrisers Hyderabad vs Chennai Super Kings", "M28: Kolkata Knight Riders vs Rajasthan Royals",
    "M29: Punjab Kings vs Lucknow Super Giants", "M30: Gujarat Titans vs Mumbai Indians",
    "M31: Sunrisers Hyderabad vs Delhi Capitals", "M32: Lucknow Super Giants vs Rajasthan Royals",
    "M33: Mumbai Indians vs Chennai Super Kings", "M34: Royal Challengers Bengaluru vs Gujarat Titans",
    "M35: Delhi Capitals vs Punjab Kings", "M36: Rajasthan Royals vs Sunrisers Hyderabad",
    "M37: Gujarat Titans vs Chennai Super Kings", "M38: Lucknow Super Giants vs Kolkata Knight Riders",
    "M39: Delhi Capitals vs Royal Challengers Bengaluru", "M40: Punjab Kings vs Rajasthan Royals",
    "M41: Mumbai Indians vs Sunrisers Hyderabad", "M42: Gujarat Titans vs Royal Challengers Bengaluru",
    "M43: Rajasthan Royals vs Delhi Capitals", "M44: Chennai Super Kings vs Mumbai Indians",
    "M45: Sunrisers Hyderabad vs Kolkata Knight Riders", "M46: Gujarat Titans vs Punjab Kings",
    "M47: Mumbai Indians vs Lucknow Super Giants", "M48: Delhi Capitals vs Chennai Super Kings",
    "M49: Sunrisers Hyderabad vs Punjab Kings", "M50: Lucknow Super Giants vs Royal Challengers Bengaluru",
    "M51: Delhi Capitals vs Kolkata Knight Riders", "M52: Rajasthan Royals vs Gujarat Titans",
    "M53: Chennai Super Kings vs Lucknow Super Giants", "M54: Royal Challengers Bengaluru vs Mumbai Indians",
    "M55: Punjab Kings vs Delhi Capitals", "M56: Gujarat Titans vs Sunrisers Hyderabad"
];

function initMatchList() {
    const select = document.getElementById('matchSelect');
    iplMatches.forEach(match => {
        let opt = document.createElement('option');
        opt.value = match;
        opt.innerHTML = match;
        select.appendChild(opt);
    });
}

function loadSelectedMatch() {
    if (bets.length > 0) {
        if (confirm("You are selecting a new match. Do you want to clear your existing bets?")) {
            bets = [];
            document.getElementById('finalWinner').value = "";
        }
    }
    const val = document.getElementById('matchSelect').value;
    if (val) {
        const teamsPart = val.split(': ')[1];
        const teams = teamsPart.split(' vs ');
        team1Name = teams[0];
        team2Name = teams[1];
    } else {
        team1Name = "Team 1";
        team2Name = "Team 2";
    }
    updateDropdowns();
    calculateTable();
}

function updateDropdowns() {
    const winnerSelect = document.getElementById('finalWinner');
    const currentWinner = winnerSelect.value;
    winnerSelect.innerHTML = `<option value="">-- Select Winner Later --</option>
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
    bets.forEach(b => {
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
        alert("Please fill in Rate and Stake");
        return;
    }

    const { favPL, oppPL } = calculatePreview(action, rate, stake);
    bets.push({ team, action, rate, stake, favPL, oppPL });

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
    
    bets.splice(index, 1);
    updateLivePreview();
    calculateTable();
}

function deleteBet(index) {
    if(confirm("Delete this bet?")) {
        bets.splice(index, 1);
        updateLivePreview();
        calculateTable();
    }
}

function clearBets() {
    if(confirm("Are you sure you want to clear all bets and start a fresh match?")) {
        bets = [];
        document.getElementById('finalWinner').value = "";
        updateLivePreview();
        calculateTable();
    }
}

// --- NEW FILE PICKER CSV EXPORT FEATURE ---
async function saveAsCSV() {
    if (bets.length === 0) {
        alert("No bets to export!");
        return;
    }

    const matchName = document.getElementById('matchSelect').value || "Custom Match";
    const finalWinner = document.getElementById('finalWinner').value;

    let csvContent = `Match,${matchName}\n`;
    csvContent += `Final Winner,${finalWinner || 'Not Selected'}\n\n`;
    csvContent += "Bet #,Team,Action,Rate,Stake,P/L (Fav Wins),P/L (Fav Loses),Final P/L\n";

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

    try {
        // Use modern File System Access API (Prompts user to choose exact folder/file name)
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'tracker_export.csv',
                types: [{
                    description: 'CSV File',
                    accept: { 'text/csv': ['.csv'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(csvContent);
            await writable.close();
            alert("File saved successfully!");
        } else {
            // Fallback for older browsers / some mobile devices
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "tracker_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        console.log("Save cancelled or failed:", err);
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
                <button class="btn-danger" onclick="deleteBet(${index})">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('totalNetProfit').innerHTML = formatMoney(runningTotal);
}

initMatchList();
updateDropdowns();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
    });
}
