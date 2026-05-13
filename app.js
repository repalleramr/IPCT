// IPCT CLASSIFIED LEDGER
let bets = []; let fancyBets = [];
let team1Name = "Target A"; let team2Name = "Target B";
let liveMatchEngine = null;

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

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-' + tabId).classList.add('active');
    document.getElementById(tabId + 'Tab').classList.add('active');
}

function initMatchList() {
    const select = document.getElementById('matchSelect');
    if (!select) return;
    select.innerHTML = "";
    iplMatches.forEach(m => { let o = document.createElement('option'); o.value = m; o.innerHTML = m; select.appendChild(o); });
}

function loadSelectedMatch() {
    const val = document.getElementById('matchSelect').value;
    const teamsPart = val.split(': ')[1];
    const teams = teamsPart.split(' vs ');
    team1Name = teams[0].trim(); team2Name = teams[1].trim();
    updateDropdowns();
}

function updateDropdowns() {
    const w = document.getElementById('finalWinner');
    w.innerHTML = `<option value="">-- Pending --</option><option value="${team1Name}">${team1Name}</option><option value="${team2Name}">${team2Name}</option>`;
    const e = document.getElementById('entryTeam');
    e.innerHTML = `<option value="${team1Name}">${team1Name}</option><option value="${team2Name}">${team2Name}</option>`;
}

function addBet() {
    const team = document.getElementById('entryTeam').value;
    const action = document.getElementById('entryAction').value;
    const rate = parseFloat(document.getElementById('entryRate').value);
    const stake = parseFloat(document.getElementById('entryStake').value);
    if (isNaN(rate) || isNaN(stake)) return;
    let favPL = (action === 'Play') ? stake * (rate / 100) : -(stake * (rate / 100));
    let oppPL = (action === 'Play') ? -stake : stake;
    bets.push({ team, action, rate, stake, favPL, oppPL });
    calculateTable();
}

function calculateTable() {
    const tbody = document.getElementById('betTableBody');
    const winner = document.getElementById('finalWinner').value;
    tbody.innerHTML = ''; let total = 0;
    bets.forEach((b, i) => {
        let pnl = (winner === b.team) ? b.favPL : b.oppPL;
        if (winner) total += pnl;
        tbody.innerHTML += `<tr><td>${i+1}</td><td>${b.team}</td><td>${b.action}</td><td>${b.rate}</td><td>${b.stake}</td><td>${b.favPL.toFixed(0)}</td><td>${b.oppPL.toFixed(0)}</td><td>${winner ? pnl.toFixed(0) : '-'}</td><td><button onclick="bets.splice(${i},1);calculateTable()" style="background:var(--danger);color:#fff;border:none;padding:2px 6px;border-radius:3px;">X</button></td></tr>`;
    });
    document.getElementById('totalNetProfit').innerText = total.toFixed(2);
}

async function establishUplink() {
    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    const val = document.getElementById('matchSelect').value;
    const teamString = val.split(': ')[1].trim();

    scoreBox.innerHTML = "> INITIATING SATELLITE HANDSHAKE...";
    aiBox.innerHTML = "> ORACLE ENGINE PURGING CACHE...";

    try {
        const url = `https://ipct-v.vercel.app/api/live?teams=${encodeURIComponent(teamString)}&nocache=${Date.now()}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            const info = data.match_info;
            
            // Build Ball History with dynamic colors
            let ballsHtml = `<div style="display:flex; gap:5px; margin-top:10px;">`;
            info.last_balls.forEach(b => {
                let color = "#444";
                if(b === 'W') color = "#ff4444";
                if(b === '4') color = "#00ffcc";
                if(b === '6') color = "#8a2be2";
                ballsHtml += `<span style="background:${color}; padding:2px 8px; border-radius:3px; font-weight:bold; color:#fff;">${b}</span>`;
            });
            ballsHtml += `</div>`;

            scoreBox.innerHTML = `
                <div style="color:var(--primary); font-weight:bold; margin-bottom:5px;">[${info.title}]</div>
                <div style="font-size:1.4rem;">${info.live_score}</div>
                <div style="color:var(--warning); margin-top:5px;">${info.status}</div>
                <div style="font-size:0.8rem; margin-top:5px;">BOWLER: ${info.bowler}</div>
                ${ballsHtml}
            `;
            aiBox.innerHTML = `> ${info.prediction}`;
        } else {
            scoreBox.innerHTML = `> UPLINK ERROR: ${data.error}`;
        }
    } catch (e) {
        scoreBox.innerHTML = `> CONNECTION TIMEOUT.`;
    }
}

initMatchList();
loadSelectedMatch();
