// --- UPDATE THIS SECTION IN YOUR establishUplink FUNCTION ---
async function pingSatellite() {
    try {
        const targetUrl = `${UPLINK_API}?teams=${encodeURIComponent(selectedTeams)}`;
        const response = await fetch(targetUrl);
        const json = await response.json();

        if (json.success) {
            const data = json.match_info;
            
            // Build the "Ball History" UI (Circles)
            let ballHTML = '';
            if (data.last_balls && data.last_balls.length > 0) {
                ballHTML = '<div style="display:flex; gap:5px; margin:10px 0; overflow-x:auto; padding-bottom:5px;">';
                data.last_balls.forEach(ball => {
                    let color = "#333";
                    if(ball === 'W') color = "#f44336";
                    else if(ball === '4' || ball === '6') color = "#00e676";
                    ballHTML += `<span style="min-width:28px; height:28px; border-radius:50%; background:${color}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold; color:#fff; border:1px solid #555;">${ball}</span>`;
                });
                ballHTML += '</div>';
            }

            document.getElementById('liveScoreBox').innerHTML = `
                <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 5px;">[${data.title}]</div>
                <div style="color: #00e676; font-size: 1.4rem; font-weight: bold; line-height:1.2;">${data.score}</div>
                <div style="color: #ff9800; font-size: 0.85rem; margin-top:5px;">${data.status}</div>
                ${ballHTML}
                <div style="color: #33b5e5; font-size: 0.9rem; font-weight:bold;">BOWLER: ${data.bowler}</div>
            `;

            document.getElementById('aiPredictionBox').innerHTML = `
                <div style="color: #e1bee7; font-size: 1rem; margin-bottom: 5px; font-weight:bold;">MI6 ORACLE PREDICTION</div>
                <div style="color: #fff; font-size: 0.9rem; padding: 10px; background: rgba(225,190,231,0.1); border-left: 3px solid #e1bee7;">
                    > ${data.prediction}
                </div>
            `;
        }
    } catch (err) { console.error("Telemetry Interrupted", err); }
}

// --- FULL-SCREEN WEB RADAR (BROWSER ROOM) ---
function initBrowserRadar() {
    const tab = document.getElementById('browserTab');
    if(tab) {
        tab.innerHTML = `
            <div style="position: fixed; top: 50px; left: 0; width: 100%; height: calc(100% - 50px); background: #000; z-index: 1000; display:flex; flex-direction:column;">
                <div style="background: #111; padding: 8px; display:flex; gap:5px; border-bottom:1px solid #333;">
                    <input type="text" id="radarUrlInput" value="https://crex.live/" style="flex:1; background:#000; border:1px solid #444; color:#00e676; padding:8px; border-radius:4px;">
                    <button onclick="document.getElementById('radarFrame').src = document.getElementById('radarUrlInput').value" style="background:#00e676; color:#000; border:none; padding:8px 15px; font-weight:bold; border-radius:4px;">LOAD</button>
                </div>
                <iframe id="radarFrame" src="https://crex.live/" style="flex:1; width:100%; border:none;"></iframe>
            </div>
        `;
    }
}
