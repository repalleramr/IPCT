// --- UPDATE YOUR establishUplink() PING LOGIC ---
async function pingSatellite() {
    try {
        const targetUrl = `${UPLINK_API}?teams=${encodeURIComponent(selectedTeams)}`;
        const response = await fetch(targetUrl);
        const json = await response.json();

        if (json.success) {
            const data = json.match_info;
            
            // Generate Cricbuzz-Style Ball Circles
            let ballHTML = '';
            if (data.last_balls && data.last_balls.length > 0) {
                ballHTML = '<div style="display:flex; gap:6px; margin:15px 0; overflow-x:auto; padding-bottom:5px;">';
                data.last_balls.forEach(ball => {
                    let bg = "#222"; 
                    if(ball === 'W') bg = "#f44336";
                    else if(['4','6'].includes(ball)) bg = "#00e676";
                    ballHTML += `<span style="min-width:30px; height:30px; border-radius:50%; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:bold; color:#fff; border:1px solid #444;">${ball}</span>`;
                });
                ballHTML += '</div>';
            }

            document.getElementById('liveScoreBox').innerHTML = `
                <div style="color: #888; font-size: 0.85rem; margin-bottom: 8px;">[${data.title}]</div>
                <div style="color: #00e676; font-size: 1.5rem; font-weight: bold;">${data.live_score}</div>
                <div style="color: #ff9800; font-size: 0.9rem; margin-top: 5px;">${data.status}</div>
                ${ballHTML}
                <div style="color: #33b5e5; font-size: 1rem; font-weight:bold; margin-top:10px;">BOWLER: ${data.bowler}</div>
            `;

            document.getElementById('aiPredictionBox').innerHTML = `
                <div style="color: #e1bee7; font-size: 1.1rem; margin-bottom: 8px; font-weight:bold; text-transform:uppercase;">IPCT Oracle (10-Ball Momentum)</div>
                <div style="color: #fff; font-size: 0.95rem; padding: 12px; background: rgba(225,190,231,0.08); border-left: 4px solid #e1bee7; border-radius: 4px;">
                    > ${data.prediction}
                </div>
            `;
        }
    } catch (err) { console.error("Telemetry Sync Error", err); }
}

// --- FULL-SCREEN WEB RADAR BROWSER ROOM ---
function initBrowserRadar() {
    const tab = document.getElementById('browserTab');
    if(!tab) return;
    
    // Style for full-screen fixed position
    tab.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2000; display:flex; flex-direction:column; padding-top:50px;">
            <div style="background: #111; padding: 10px; display:flex; gap:8px; border-bottom:1px solid #333;">
                <input type="text" id="radarUrlInput" value="https://crex.live/" style="flex:1; background:#000; border:1px solid #444; color:#00e676; padding:10px; border-radius:4px; font-size:14px;">
                <button onclick="document.getElementById('radarFrame').src = document.getElementById('radarUrlInput').value" style="background:#00e676; color:#000; border:none; padding:10px 18px; font-weight:bold; border-radius:4px;">ENGAGE</button>
            </div>
            <iframe id="radarFrame" src="https://crex.live/" style="flex:1; width:100%; border:none; background:#fff;"></iframe>
        </div>
    `;
}
