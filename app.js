// --- TAB 3: VERCEL SATELLITE ENGINE UPGRADE ---
async function establishUplink() {
    const matchStr = document.getElementById('matchSelect').value;
    if (!matchStr) { alert("Mission Control: Please select an Active Mission first."); return; }

    // No RapidAPI key needed anymore! We use your private Vercel Mirror.
    let matchId = prompt("Enter the Target Match ID from Cricbuzz:", "102040");
    if (!matchId) return;

    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    
    if (uplinkInterval) clearInterval(uplinkInterval);
    if (liveMatchEngine) clearInterval(liveMatchEngine);

    const targetTime = getMatchTime(matchStr);
    if (new Date() < targetTime) {
        scoreBox.innerHTML = `<div style="color: var(--warning);">[UPLINK DENIED] Mission not commenced yet.</div>`;
        return;
    }

    scoreBox.innerHTML = "> ESTABLISHING ENCRYPTED VERCEL UPLINK... [||||      ]";
    aiBox.innerHTML = "> IGNITING QUANTUM ORACLE ENGINE... [||||      ]";

    let recentBallsArray = ['1', '0', '1', '2', '0', '4']; 

    async function pingSatellite() {
        try {
            // Pointing directly to your newly built Vercel Mirror
            const response = await fetch(`https://cricbuzz-live-taupe.vercel.app/v1/score/${matchId}`);
            const json = await response.json();
            
            if (json.code !== 200 || !json.data) throw new Error("Vercel Target Not Found.");
            
            const d = json.data;
            let scoreText = d.liveScore || "0/0";
            let crr = parseFloat((d.runRate || "0").replace('CRR: ', '')) || 0;

            // Visual Radar (Simulated flow to keep your UI aesthetic)
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

            scoreBox.innerHTML = `
                <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[VERCEL TELEMETRY]</div>
                <div style="color: var(--primary); font-size: 1.4rem; font-weight: bold;">Score: ${d.liveScore || "0/0"}</div>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">CRR: ${d.runRate || "0.00"} | ${d.update}</div>
                ${d.batsmanOne ? `<div style="font-size:0.8rem; color:#8b949e; margin-bottom:10px;">🏏 ${d.batsmanOne} | ⚾ ${d.bowlerOne}</div>` : ''}
                ${radarHTML}
            `;

            // Oracle Projections utilizing Vercel's real-time CRR calculation
            let projectedScore = Math.floor(crr * 20);
            let aggressiveScore = Math.floor((crr + 2) * 20); // If they accelerate

            let projHTML = `<div style="margin-top:15px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:8px;">20-OVER ORACLE PROJECTION</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem; color: #fff;">
                    <div>Current Pace: <span style="color:var(--primary); font-weight:bold;">${projectedScore > 0 ? projectedScore : '-'}</span></div>
                    <div>Aggressive: <span style="color:var(--warning); font-weight:bold;">${aggressiveScore > 0 ? aggressiveScore : '-'}</span></div>
                </div></div>`;

            aiBox.innerHTML = `<div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 5px;">[QUANTUM PROJECTION]</div>${projHTML}`;

        } catch (err) {
            scoreBox.innerHTML = `<div style="color: var(--danger);">[UPLINK FAILED] ${err.message}</div>`;
            clearInterval(liveMatchEngine);
        }
    }

    pingSatellite();
    liveMatchEngine = setInterval(pingSatellite, 20000); 
}
