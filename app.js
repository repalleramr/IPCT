// --- MI6 SAT-UPLINK CONFIGURATION ---
const UPLINK_API = 'https://ipct-v.vercel.app/api/live';

async function establishUplink() {
    const matchStr = document.getElementById('matchSelect').value;
    if (!matchStr) { alert("Mission Control: Please select an Active Mission first."); return; }

    const scoreBox = document.getElementById('liveScoreBox');
    const aiBox = document.getElementById('aiPredictionBox');
    
    if (uplinkInterval) clearInterval(uplinkInterval);
    if (liveMatchEngine) clearInterval(liveMatchEngine);

    scoreBox.innerHTML = "> INITIATING HANDSHAKE...<br>> BYPASSING FIREWALLS...<br>> DECRYPTING SAT-FEED...";
    aiBox.innerHTML = "> ANALYZING MATCH VECTORS...";

    // This replaces your manual RapidAPI ping with the automated Vercel Scraper
    async function pingSatellite() {
        try {
            const response = await fetch(UPLINK_API);
            const json = await response.json();

            if (json.success) {
                const data = json.match_info;
                const rawScore = data.live_score;

                // 1. Cleaning the string: Extracting "GT 35/2 (6.2)" from the Cricbuzz Title
                const scoreParts = rawScore.split('|');
                const cleanScore = scoreParts[1] ? scoreParts[1].trim() : "Toss/Delayed";
                
                // 2. Extracting Batsmen details (the text inside parentheses)
                const batsmenMatch = rawScore.match(/\(([^)]+)\)/g);
                const currentBatsmen = batsmenMatch ? batsmenMatch[0] : "(Positioning Assets...)";

                // 3. Update Telemetry UI
                scoreBox.innerHTML = `
                    <div style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">[LIVE TELEMETRY]</div>
                    <div style="color: var(--primary); font-size: 1.5rem; font-weight: bold;">${cleanScore}</div>
                    <div style="color: #ff9800; font-size: 0.85rem; margin-top:5px;">STATUS: ${data.status}</div>
                    <div style="font-size: 0.7rem; color: #444; margin-top: 10px;">SYNC: ${new Date().toLocaleTimeString()}</div>
                `;

                // 4. Update Oracle (AI) UI
                generateQuantumOracle(cleanScore, currentBatsmen);

            } else {
                scoreBox.innerHTML = "> ERROR: ENCRYPTION KEY MISMATCH (Data Empty)";
            }
        } catch (error) {
            scoreBox.innerHTML = "> ERROR: UPLINK INTERCEPTED (Check Vercel Status)";
        }
    }

    pingSatellite();
    liveMatchEngine = setInterval(pingSatellite, 30000); // 30-second refresh cycle
}

function generateQuantumOracle(score, batsmen) {
    const aiBox = document.getElementById('aiPredictionBox');
    
    // Quick Logic: Extracting runs to provide MI6 Tactic
    const runs = parseInt(score.match(/\d+/) || 0);
    let tactic = "STAY LOW: Market currently stabilizing.";
    
    if (runs > 180) tactic = "HIGH ALERT: Target Secured. Switch to Defensive Stance.";
    else if (runs > 100) tactic = "NEUTRAL VECTOR: Volatility detected. Watch Overs.";
    else if (runs < 60) tactic = "SABOTAGE RECOMMENDED: Low yield. Implement 'Eat' Tactic.";

    aiBox.innerHTML = `
        <div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 5px;">[ORACLE PROJECTION]</div>
        <div style="color: #fff; font-size: 0.9rem;">> ACTIVE ASSETS: ${batsmen}</div>
        <div style="color: #9c27b0; font-weight: bold; margin-top: 10px;">> TACTIC: ${tactic}</div>
    `;
}
