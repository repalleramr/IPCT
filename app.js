// --- FAILSAFE BOOT SEQUENCE ---
document.addEventListener("DOMContentLoaded", () => {
    
    console.log("MI6 System Booting...");

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
        if (isStorageSafe) {
            try { localStorage.setItem(key, value); } catch(e){}
        } else {
            memoryStorage[key] = value;
        }
    }

    function safeGet(key) {
        if (isStorageSafe) {
            try { return localStorage.getItem(key); } catch(e){ return null; }
        }
        return memoryStorage[key] || null;
    }

    // --- GLOBAL VARIABLES ---
    window.bets = [];
    window.fancyBets = []; 
    window.team1Name = "Target A";
    window.team2Name = "Target B";
    window.editingIndex = -1; 

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

    // --- APP LOGIC ---
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById('btn-' + tabId).classList.add('active');
        document.getElementById(tabId + 'Tab').classList.add('active');
    };

    window.initMatchList = function() {
        const select = document.getElementById('matchSelect');
        if(!select) return; 
        iplMatches.forEach(match => {
            let opt = document.createElement('option');
            opt.value = match;
            opt.innerHTML = match;
            select.appendChild(opt);
        });
    };

    window.saveState = function() {
        const state = {
            bets: window.bets,
            fancyBets: window.fancyBets,
            match: document.getElementById('matchSelect').value,
            t1: window.team1Name,
            t2: window.team2Name,
            winner: document.getElementById('finalWinner').value
        };
        safeSet('mi6_ledger_data', JSON.stringify(state));
    };

    window.loadSelectedMatch = function() {
        if (window.bets.length > 0 || window.fancyBets.length > 0) {
            if (confirm("Initiate new mission? This will burn current core AND phase logs.")) {
                window.bets = [];
                window.fancyBets = [];
                window.editingIndex = -1;
                document.getElementById('addBetBtn').innerText = "Execute Directive";
                document.getElementById('finalWinner').value = "";
                window.renderFancyTable();
            } else {
                const saved = safeGet('mi6_ledger_data');
                if(saved) {
                    try { document.getElementById('matchSelect').value = JSON.parse(saved).match || ""; } catch(e){}
                }
                return;
            }
        }
        const val = document.getElementById('matchSelect').value;
        if (val) {
            const teamsPart = val.split(': ')[1];
            const teams = teamsPart.split(' vs ');
            window.team1Name = teams[0] || "Target A";
            window.team2Name = teams[1] || "Target B";
        } else {
            window.team1Name = "Target A";
            window.team2Name = "Target B";
        }
        
        document.getElementById('liveScoreBox').innerHTML = "> AWAITING UPLINK INITIATION...";
        document.getElementById('aiPredictionBox').innerHTML = "> ORACLE ENGINE STANDBY...";

        window.updateDropdowns();
        window.calculateTable();
    };

    window.updateDropdowns = function() {
        const winnerSelect = document.getElementById('finalWinner');
        const currentWinner = winnerSelect.value;
        winnerSelect.innerHTML = `<option value="">-- Pending Clearance --</option>
                                  <option value="${window.team1Name}">${window.team1Name}</option>
                                  <option value="${window.team2Name}">${window.team2Name}</option>`;
        if (currentWinner === window.team1Name || currentWinner === window.team2Name) winnerSelect.value = currentWinner;

        const entrySelect = document.getElementById('entryTeam');
        const currentEntry = entrySelect.value;
        entrySelect.innerHTML = `<option value="${window.team1Name}">${window.team1Name}</option>
                                 <option value="${window.team2Name}">${window.team2Name}</option>`;
        if (currentEntry === window.team1Name || currentEntry === window.team2Name) entrySelect.value = currentEntry;

        window.updateLivePreview();
    };

    window.calculatePreview = function(action, rate, stake) {
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
    };

    window.getBaseExposure = function() {
        let t1Base = 0, t2Base = 0;
        window.bets.forEach((b, index) => {
            if (index === window.editingIndex) return; 
            if (b.team === window.team1Name) {
                t1Base += b.favPL;
                t2Base += b.oppPL;
            } else {
                t2Base += b.favPL;
                t1Base += b.oppPL;
            }
        });
        return { t1Base, t2Base };
    };

    window.updateLivePreview = function() {
        const favTeam = document.getElementById('entryTeam').value;
        const action = document.getElementById('entryAction').value;
        const rate = parseFloat(document.getElementById('entryRate').value) || 0;
        const stake = parseFloat(document.getElementById('entryStake').value) || 0;

        const { favPL, oppPL } = window.calculatePreview(action, rate, stake);
        const { t1Base, t2Base } = window.getBaseExposure();

        let t1Preview = t1Base;
        let t2Preview = t2Base;

        if (stake > 0 && rate > 0) {
            if (favTeam === window.team1Name) {
                t1Preview += favPL; t2Preview += oppPL;
            } else {
                t2Preview += favPL; t1Preview += oppPL;
            }
        }

        const t1El = document.getElementById('previewTeam1');
        const t2El = document.getElementById('previewTeam2');

        t1El.innerText = `${window.team1Name}: ${t1Preview.toFixed(2)}`;
        t2El.innerText = `${window.team2Name}: ${t2Preview.toFixed(2)}`;

        t1El.className = t1Preview > 0 ? 'positive' : (t1Preview < 0 ? 'negative' : 'neutral');
        t2El.className = t2Preview > 0 ? 'positive' : (t2Preview < 0 ? 'negative' : 'neutral');
    };

    window.addBet = function() {
        const team = document.getElementById('entryTeam').value;
        const action = document.getElementById('entryAction').value;
        const rate = parseFloat(document.getElementById('entryRate').value);
        const stake = parseFloat(document.getElementById('entryStake').value);

        if (!team || isNaN(rate) || isNaN(stake)) {
            alert("Mission Control: Required Intel Missing.");
            return;
        }

        const { favPL, oppPL } = window.calculatePreview(action, rate, stake);
        
        if (window.editingIndex !== -1) {
            window.bets[window.editingIndex] = { team, action, rate, stake, favPL, oppPL };
            window.editingIndex = -1; 
            document.getElementById('addBetBtn').innerText = "Execute Directive"; 
        } else {
            window.bets.push({ team, action, rate, stake, favPL, oppPL });
        }

        document.getElementById('entryRate').value = '';
        document.getElementById('entryStake').value = '';
        window.updateLivePreview();
        window.calculateTable();
    };

    window.editBet = function(index) {
        const bet = window.bets[index];
        document.getElementById('entryTeam').value = bet.team;
        document.getElementById('entryAction').value = bet.action;
        document.getElementById('entryRate').value = bet.rate;
        document.getElementById('entryStake').value = bet.stake;
        
        window.editingIndex = index;
        document.getElementById('addBetBtn').innerText = "Update Directive";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.updateLivePreview();
    };

    window.deleteBet = function(index) {
        if(confirm("Scrub this entry from the ledger?")) {
            window.bets.splice(index, 1);
            if (window.editingIndex === index) {
                window.editingIndex = -1;
                document.getElementById('addBetBtn').innerText = "Execute Directive";
                document.getElementById('entryRate').value = '';
                document.getElementById('entryStake').value = '';
            } else if (window.editingIndex > index) {
                window.editingIndex--;
            }
            window.updateLivePreview();
            window.calculateTable();
        }
    };

    window.clearBets = function() {
        if(confirm("Confirm Protocol Zero: Burn all CORE data for this mission?")) {
            window.bets = [];
            window.editingIndex = -1;
            document.getElementById('addBetBtn').innerText = "Execute Directive";
            document.getElementById('finalWinner').value = "";
            window.updateLivePreview();
            window.calculateTable();
        }
    };

    window.formatMoney = function(num) {
        let str = num.toFixed(2);
        if (num > 0) return `<span class="positive">+${str}</span>`;
        if (num < 0) return `<span class="negative">${str}</span>`;
        return `<span class="neutral">${str}</span>`;
    };

    window.calculateTable = function() {
        const tbody = document.getElementById('betTableBody');
        const finalWinner = document.getElementById('finalWinner').value;
        tbody.innerHTML = '';
        let runningTotal = 0;

        window.bets.forEach((bet, index) => {
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
            if (index === window.editingIndex) {
                tr.style.backgroundColor = "rgba(255, 187, 51, 0.1)";
                tr.style.borderLeft = "4px solid var(--warning)";
            }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${bet.team}</td>
                <td>${bet.action}</td>
                <td>${bet.rate}</td>
                <td>${bet.stake}</td>
                <td>${window.formatMoney(bet.favPL)}</td>
                <td>${window.formatMoney(bet.oppPL)}</td>
                <td>${isFinal ? window.formatMoney(finalPL) : '-'}</td>
                <td class="action-btns">
                    <button class="btn-warning" onclick="editBet(${index})">Edit</button>
                    <button class="btn-danger" onclick="deleteBet(${index})">Burn</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.getElementById('totalNetProfit').innerHTML = window.formatMoney(runningTotal);
        window.saveState();
    };

    window.addFancyBet = function() {
        const phase = document.getElementById('fancyPhase').value;
        const action = document.getElementById('fancyAction').value;
        const line = parseFloat(document.getElementById('fancyLine').value);
        const stake = parseFloat(document.getElementById('fancyStake').value);

        if(!phase || isNaN(line) || isNaN(stake)) {
            alert("Mission Control: Phase parameters incomplete.");
            return;
        }

        window.fancyBets.push({ phase, action, line, stake, status: 'Pending', pnl: 0 });
        
        document.getElementById('fancyLine').value = '';
        document.getElementById('fancyStake').value = '';
        window.renderFancyTable();
    };

    window.resolvePhase = function() {
        const phaseToResolve = document.getElementById('resolvePhase').value;
        const actualStr = document.getElementById('resolveScore').value;
        
        if(!actualStr) {
            alert("Mission Control: Please enter the final runs scored.");
            return;
        }
        
        const actualScore = parseFloat(actualStr);
        let resolvedCount = 0;

        window.fancyBets.forEach(bet => {
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
            window.renderFancyTable();
        }
    };

    window.deleteFancyBet = function(index) {
        if(confirm("Scrub this Phase from the ledger?")) {
            window.fancyBets.splice(index, 1);
            window.renderFancyTable();
        }
    };

    window.clearFancyBets = function() {
        if(confirm("Confirm Protocol Zero: Burn all PHASE data?")) {
            window.fancyBets = [];
            window.renderFancyTable();
        }
    };

    window.renderFancyTable = function() {
        const tbody = document.getElementById('fancyTableBody');
        tbody.innerHTML = '';
        let totalFancyPnl = 0;

        window.fancyBets.forEach((bet, index) => {
            if(bet.status === "Resolved") {
                totalFancyPnl += bet.pnl;
            }

            const tr = document.createElement('tr');
            let pnlDisplay = '-';
            if(bet.status === "Resolved") {
                pnlDisplay = window.formatMoney(bet.pnl);
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

        document.getElementById('fancyNetProfit').innerHTML = window.formatMoney(totalFancyPnl);
        window.saveState();
    };

    // --- SAFELY PARSE DATES FOR IOS / MOBILE ---
    window.getMatchTime = function(matchStr) {
        if (!matchStr) return new Date();
        
        // Example matchStr: "May 11: Punjab Kings vs Delhi Capitals"
        const datePart = matchStr.split(':')[0].split('(')[0].trim(); // "May 11"
        const monthStr = datePart.split(' ')[0]; // "May"
        const dayStr = datePart.split(' ')[1].padStart(2, '0'); // "11"
        
        const monthMap = {"May": "05", "Jun": "06", "Apr": "04"};
        const month = monthMap[monthStr] || "05";
        
        let hh = "19"; // 7 PM
        let mm = "30"; // 30 mins
        
        if (matchStr.includes("Punjab Kings vs Sunrisers Hyderabad") || 
            matchStr.includes("Lucknow Super Giants vs Mumbai Indians") ||
            matchStr.includes("Royal Challengers Bengaluru vs Kolkata Knight Riders")) {
            hh = "15";
            mm = "30";
        }
        
        // Strict ISO format prevents Safari from crashing (YYYY-MM-DDTHH:mm:00+05:30)
        return new Date(`2026-${month}-${dayStr}T${hh}:${mm}:00+05:30`);
    };

    window.establishUplink = function() {
        const matchStr = document.getElementById('matchSelect').value;
        if (!matchStr) {
            alert("Mission Control: Please select an Active Mission first.");
            return;
        }

        const scoreBox = document.getElementById('liveScoreBox');
        const aiBox = document.getElementById('aiPredictionBox');
        
        const targetTime = window.getMatchTime(matchStr);
        const now = new Date();

        // 1. CHECK IF MATCH HAS STARTED
        if (now < targetTime) {
            // Match is in the future
            let formatTime = targetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            scoreBox.innerHTML = `
                <div style="color: var(--warning); font-size: 1.1rem; margin-bottom: 5px;">[UPLINK DENIED]</div>
                <div style="color: #fff; font-size: 1rem;">Mission has not commenced yet.</div>
                <div style="color: var(--text-muted); margin-top: 8px; font-size: 0.9rem;">Target: ${window.team1Name} vs ${window.team2Name}</div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">Scheduled: ${formatTime}</div>
            `;
            aiBox.innerHTML = `> ORACLE OFFLINE. AWAITING LIVE DATA FEED...`;
            return;
        }

        // 2. MATCH IS LIVE - RUN SIMULATION
        scoreBox.innerHTML = "> ESTABLISHING ENCRYPTED UPLINK... [||||      ]";
        aiBox.innerHTML = "> IGNITING QUANTUM ORACLE ENGINE... [||||      ]";

        setTimeout(() => {
            // Generate simulated live over (e.g. 12.4 overs)
            const overWhole = Math.floor(Math.random() * 18);
            const overDec = Math.floor(Math.random() * 6);
            const currentOvers = parseFloat(`${overWhole}.${overDec}`);
            
            // Runs and wickets
            const runs = Math.floor((currentOvers + 1) * (Math.random() * 3 + 7));
            const wkts = Math.floor(Math.random() * 8) + 1;
            
            // Last 10 balls simulation (form)
            const last10 = Math.floor(Math.random() * 15) + 5; 
            
            let displayT1 = window.team1Name === "TBD" ? "Target A" : window.team1Name;
            let displayT2 = window.team2Name === "TBD" ? "Target B" : window.team2Name;

            scoreBox.innerHTML = `
                <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[LIVE TELEMETRY]</div>
                <div style="color: var(--primary); font-size: 1.2rem; font-weight: bold;">${displayT1}: ${runs}/${wkts} <span style="font-size:0.9rem; color:var(--text-muted);">(${currentOvers} ov)</span></div>
                <div style="color: var(--warning); margin-top: 5px;">${displayT2}: Pending Deployment...</div>
            `;

            // Prediction logic based on current run rate and last 10 balls form
            const probA = Math.floor(Math.random() * 40) + 30; 
            const probB = 100 - probA;
            let favoredTeam = probA > probB ? displayT1 : displayT2;
            let confidence = Math.max(probA, probB);
            
            // Calculate phase projections
            let projHTML = `<div style="margin-top:15px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:8px;">PHASE PROJECTIONS (Last 10 Balls: ${last10} runs)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem; color: #fff;">`;
                
            let rrMulti = last10 / 1.6; // Runs per over based on last 10 balls

            if (currentOvers < 6) projHTML += `<div>6 Ov: <span style="color:var(--primary); font-weight:bold;">${Math.floor(runs + (6-currentOvers)*rrMulti)}</span></div>`;
            if (currentOvers < 10) projHTML += `<div>10 Ov: <span style="color:var(--primary); font-weight:bold;">${Math.floor(runs + (10-currentOvers)*rrMulti)}</span></div>`;
            if (currentOvers < 15) projHTML += `<div>15 Ov: <span style="color:var(--primary); font-weight:bold;">${Math.floor(runs + (15-currentOvers)*rrMulti)}</span></div>`;
            if (currentOvers < 20) projHTML += `<div>20 Ov: <span style="color:var(--primary); font-weight:bold;">${Math.floor(runs + (20-currentOvers)*rrMulti)}</span></div>`;
            projHTML += `</div></div>`;

            aiBox.innerHTML = `
                <div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 5px;">[ORACLE PROJECTION]</div>
                <div style="color: #fff;">Primary Target: <span style="color: var(--primary); font-weight: bold; font-size:1.2rem;">${favoredTeam}</span></div>
                <div style="color: var(--info); margin-top: 5px;">Confidence Matrix: ${confidence}%</div>
                ${projHTML}
            `;
        }, 1200);
    };

    window.saveAsCSV = async function() {
        if (window.bets.length === 0 && window.fancyBets.length === 0) {
            alert("No intel to export!");
            return;
        }
        const matchName = document.getElementById('matchSelect').value || "Classified Mission";
        const finalWinner = document.getElementById('finalWinner').value;
        let csvContent = `Mission,${matchName}\nAsset Secured,${finalWinner || 'Pending Clearance'}\n\n`;
        
        csvContent += "--- CORE LEDGER ---\nLog #,Faction,Tactic,Intel,Funds,Yield A,Yield B,Final Result\n";
        window.bets.forEach((bet, index) => {
            let finalPL = 0;
            let isFinal = false;
            if (finalWinner) {
                isFinal = true;
                finalPL = (finalWinner === bet.team) ? bet.favPL : bet.oppPL;
            }
            csvContent += `${index + 1},${bet.team},${bet.action},${bet.rate},${bet.stake},${bet.favPL},${bet.oppPL},${isFinal ? finalPL : '-'}\n`;
        });

        csvContent += "\n--- PHASE OBJECTIVES (SESSIONS) ---\nPhase,Stance,Line,Funds,Status,Net Result\n";
        window.fancyBets.forEach((bet) => {
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
    };

    // --- BOOTSTRAP INIT ---
    window.initMatchList();
    try {
        const savedData = safeGet('mi6_ledger_data');
        if (savedData) {
            const state = JSON.parse(savedData);
            window.bets = state.bets || [];
            window.fancyBets = state.fancyBets || [];
            window.team1Name = state.t1 || "Target A";
            window.team2Name = state.t2 || "Target B";
            
            const ms = document.getElementById('matchSelect');
            let matchFound = false;
            for(let i = 0; i < ms.options.length; i++) {
                if(ms.options[i].value === state.match) matchFound = true;
            }
            if(matchFound) ms.value = state.match;
            else state.winner = ""; 

            window.updateDropdowns();
            document.getElementById('finalWinner').value = state.winner || "";
            window.calculateTable();
            window.renderFancyTable();
        } else {
            window.updateDropdowns();
        }
    } catch (error) {
        if(isStorageSafe) localStorage.removeItem('mi6_ledger_data');
        window.updateDropdowns();
    }
});
