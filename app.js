let bets = [];

function updateTeamNames() {
    const t1 = document.getElementById('team1').value || 'Team 1';
    const t2 = document.getElementById('team2').value || 'Team 2';

    // Update Winner Dropdown
    const winnerSelect = document.getElementById('finalWinner');
    const currentWinner = winnerSelect.value;
    winnerSelect.innerHTML = `<option value="">-- Select Winner Later --</option>
                              <option value="${t1}">${t1}</option>
                              <option value="${t2}">${t2}</option>`;
    if (currentWinner === t1 || currentWinner === t2) winnerSelect.value = currentWinner;

    // Update Entry Dropdown
    const entrySelect = document.getElementById('entryTeam');
    const currentEntry = entrySelect.value;
    entrySelect.innerHTML = `<option value="${t1}">${t1}</option>
                             <option value="${t2}">${t2}</option>`;
    if (currentEntry === t1 || currentEntry === t2) entrySelect.value = currentEntry;

    updateLivePreview();
}

function calculatePreview(action, rate, stake) {
    let favPL = 0;
    let oppPL = 0;
    
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

function updateLivePreview() {
    const t1 = document.getElementById('team1').value || 'Team 1';
    const t2 = document.getElementById('team2').value || 'Team 2';
    const favTeam = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value) || 0;
    const stake = parseFloat(document.getElementById('entryStake').value) || 0;

    const { favPL, oppPL } = calculatePreview(action, rate, stake);

    let t1Preview = 0, t2Preview = 0;
    if (favTeam === t1) {
        t1Preview = favPL; t2Preview = oppPL;
    } else {
        t2Preview = favPL; t1Preview = oppPL;
    }

    const t1El = document.getElementById('previewTeam1');
    const t2El = document.getElementById('previewTeam2');

    t1El.innerText = `${t1}: ${t1Preview.toFixed(2)}`;
    t2El.innerText = `${t2}: ${t2Preview.toFixed(2)}`;

    t1El.className = t1Preview > 0 ? 'positive' : (t1Preview < 0 ? 'negative' : 'neutral');
    t2El.className = t2Preview > 0 ? 'positive' : (t2Preview < 0 ? 'negative' : 'neutral');
}

function addBet() {
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value);
    const stake = parseFloat(document.getElementById('entryStake').value);

    if (!team || isNaN(rate) || isNaN(stake)) {
        alert("Please fill in Team, Rate, and Stake");
        return;
    }

    const { favPL, oppPL } = calculatePreview(action, rate, stake);

    bets.push({
        id: bets.length + 1,
        team, action, rate, stake, favPL, oppPL
    });

    // Clear inputs
    document.getElementById('entryRate').value = '';
    document.getElementById('entryStake').value = '';
    updateLivePreview();
    calculateTable();
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

    bets.forEach(bet => {
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
            <td>${bet.id}</td>
            <td>${bet.team}</td>
            <td>${bet.action}</td>
            <td>${bet.rate}</td>
            <td>${bet.stake}</td>
            <td>${formatMoney(bet.favPL)}</td>
            <td>${formatMoney(bet.oppPL)}</td>
            <td>${isFinal ? formatMoney(finalPL) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalNetProfit').innerHTML = formatMoney(runningTotal);
}// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully!'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}


// Initialize
updateTeamNames();
