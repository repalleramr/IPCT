// MI6 System Booting...
let bets = [];
let fancyBets = [];

let team1Name = "Target A";
let team2Name = "Target B";

let editingIndex = -1;
let liveMatchEngine = null;

const iplMatches = [

    "May 11 (7:30 PM): Punjab Kings vs Delhi Capitals",

    "May 12 (7:30 PM): Gujarat Titans vs Sunrisers Hyderabad",

    "May 13 (7:30 PM): Royal Challengers Bengaluru vs Kolkata Knight Riders",

    "May 14 (7:30 PM): Punjab Kings vs Mumbai Indians",

    "May 15 (7:30 PM): Lucknow Super Giants vs Chennai Super Kings"
];

/* =========================================
   LOCAL STORAGE
   ========================================= */

function saveData() {

    localStorage.setItem(
        'ipct_bets',
        JSON.stringify(bets)
    );

    localStorage.setItem(
        'ipct_fancy',
        JSON.stringify(fancyBets)
    );
}

function loadData() {

    const savedBets =
        localStorage.getItem(
            'ipct_bets'
        );

    const savedFancy =
        localStorage.getItem(
            'ipct_fancy'
        );

    if (savedBets) {

        bets =
            JSON.parse(savedBets);
    }

    if (savedFancy) {

        fancyBets =
            JSON.parse(savedFancy);
    }
}

/* =========================================
   TAB SWITCH
   ========================================= */

function switchTab(tabId) {

    document
        .querySelectorAll('.tab-btn')
        .forEach(btn =>
            btn.classList.remove('active')
        );

    document
        .querySelectorAll('.tab-content')
        .forEach(c =>
            c.classList.remove('active')
        );

    document
        .getElementById(
            'btn-' + tabId
        )
        .classList.add('active');

    document
        .getElementById(
            tabId + 'Tab'
        )
        .classList.add('active');
}

/* =========================================
   MATCH LIST
   ========================================= */

function initMatchList() {

    const select =
        document.getElementById(
            'matchSelect'
        );

    iplMatches.forEach(m => {

        let o =
            document.createElement(
                'option'
            );

        o.value = m;

        o.innerHTML = m;

        select.appendChild(o);
    });
}

/* =========================================
   LOAD MATCH
   ========================================= */

function loadSelectedMatch() {

    const val =
        document.getElementById(
            'matchSelect'
        ).value;

    const teamsPart =
        val.split(': ')[1];

    const teams =
        teamsPart.split(' vs ');

    team1Name =
        teams[0].trim();

    team2Name =
        teams[1].trim();

    updateDropdowns();
}

/* =========================================
   UPDATE DROPDOWNS
   ========================================= */

function updateDropdowns() {

    const w =
        document.getElementById(
            'finalWinner'
        );

    w.innerHTML =
`
<option value="">
-- Pending --
</option>

<option value="${team1Name}">
${team1Name}
</option>

<option value="${team2Name}">
${team2Name}
</option>
`;

    const e =
        document.getElementById(
            'entryTeam'
        );

    e.innerHTML =
`
<option value="${team1Name}">
${team1Name}
</option>

<option value="${team2Name}">
${team2Name}
</option>
`;
}

/* =========================================
   ADD BET
   ========================================= */

function addBet() {

    const team =
        document.getElementById(
            'entryTeam'
        ).value;

    const action =
        document.getElementById(
            'entryAction'
        ).value;

    const rate =
        parseFloat(

            document.getElementById(
                'entryRate'
            ).value
        );

    const stake =
        parseFloat(

            document.getElementById(
                'entryStake'
            ).value
        );

    if (
        isNaN(rate) ||
        isNaN(stake)
    ) return;

    let favPL =
        (action === 'Play')
        ? stake * (rate / 100)
        : -(stake * (rate / 100));

    let oppPL =
        (action === 'Play')
        ? -stake
        : stake;

    bets.push({

        team,
        action,
        rate,
        stake,
        favPL,
        oppPL
    });

    saveData();

    calculateTable();
}

/* =========================================
   CALCULATE TABLE
   ========================================= */

function calculateTable() {

    const tbody =
        document.getElementById(
            'betTableBody'
        );

    const winner =
        document.getElementById(
            'finalWinner'
        ).value;

    tbody.innerHTML = '';

    let total = 0;

    bets.forEach((b, i) => {

        let pnl =
            (winner === b.team)
            ? b.favPL
            : b.oppPL;

        if (winner)
            total += pnl;

        tbody.innerHTML +=
`
<tr>

<td>${i+1}</td>

<td>${b.team}</td>

<td>${b.action}</td>

<td>${b.rate}</td>

<td>${b.stake}</td>

<td>${b.favPL.toFixed(0)}</td>

<td>${b.oppPL.toFixed(0)}</td>

<td>
${winner ? pnl.toFixed(0) : '-'}
</td>

<td>

<button
onclick="bets.splice(${i},1);saveData();calculateTable()">

X

</button>

</td>

</tr>
`;
    });

    document.getElementById(
        'totalNetProfit'
    ).innerText =
        total.toFixed(2);
}

/* =========================================
   LIVE SATELLITE ENGINE
   ========================================= */

async function establishUplink() {

    const scoreBox =
        document.getElementById(
            'liveScoreBox'
        );

    const aiBox =
        document.getElementById(
            'aiPredictionBox'
        );

    const val =
        document.getElementById(
            'matchSelect'
        ).value;

    const teamString =
        val.split(': ')[1].trim();

    scoreBox.innerHTML =
        "> PINGING VERCEL SATELLITE...";

    aiBox.innerHTML =
        "> BYPASSING CACHE...";

    try {

        const url =
`https://ipct-v.vercel.app/api/live?teams=${encodeURIComponent(teamString)}&cache=${Date.now()}`;

        const res =
            await fetch(url);

        const data =
            await res.json();

        if (
            data.success &&
            data.match_info
        ) {

            const info =
                data.match_info;

            scoreBox.innerHTML =
`

<b>
[${info.title || 'IPL LIVE INTEL'}]
</b>

<br><br>

<b>STATUS:</b>
<br>
${info.status || 'Unavailable'}

<br><br>

<b>SCORE:</b>
<br>
${info.live_score || 'Awaiting Play'}

<br><br>

<b>OVERS:</b>
<br>
${info.overs || '-'}

<br><br>

<b>BATSMAN:</b>
<br>
${info.striker || 'Unavailable'}

<br><br>

<b>NON-STRIKER:</b>
<br>
${info.non_striker || 'Unavailable'}

<br><br>

<b>BOWLER:</b>
<br>
${info.bowler || 'Unavailable'}

<br><br>

<b>TOSS:</b>
<br>
${info.toss || 'Pending'}

<br><br>

<b>RESULT:</b>
<br>
${info.result || 'Match In Progress'}

<br><br>

<b>VENUE:</b>
<br>
${info.venue || 'Unavailable'}

<br><br>

<b>SOURCE:</b>
<br>
${info.source || 'Unknown'}

`;

            aiBox.innerHTML =
`

> ${info.prediction || 'Balanced'}

<br><br>

MATCH STATE:
<br>

${info.match_state || 'Unknown'}

<br><br>

LAST BALL:
<br>

${info.last_ball || '-'}

<br><br>

LAST OVER:
<br>

${info.last_over && info.last_over.length
? info.last_over.join(' ')
: '-'}

`;
        }
        else {

            scoreBox.innerHTML =
`
> SATELLITE ERROR:
${data.error || 'Unknown Error'}
`;

            aiBox.innerHTML =
                '> ORACLE OFFLINE';
        }

    }
    catch (e) {

        scoreBox.innerHTML =
            '> UPLINK FAILED: Check Internet.';

        aiBox.innerHTML =
            '> NETWORK FAILURE';
    }
}

/* =========================================
   INIT
   ========================================= */

loadData();

initMatchList();

loadSelectedMatch();

calculateTable();
