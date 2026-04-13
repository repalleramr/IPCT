const SCHEDULE = [{"match_no": 1, "date": "28/03/26", "day": "Sat", "time": "7:30 PM", "home": "Sunrisers Hyderabad", "away": "Royal Challengers Bengaluru", "venue": "Bengaluru", "title": "M1: Sunrisers Hyderabad vs Royal Challengers Bengaluru"}, {"match_no": 2, "date": "29/03/26", "day": "Sun", "time": "7:30 PM", "home": "Kolkata Knight Riders", "away": "Mumbai Indians", "venue": "Mumbai", "title": "M2: Kolkata Knight Riders vs Mumbai Indians"}, {"match_no": 3, "date": "30/03/26", "day": "Mon", "time": "7:30 PM", "home": "Chennai Super Kings", "away": "Rajasthan Royals", "venue": "Guwahati", "title": "M3: Chennai Super Kings vs Rajasthan Royals"}, {"match_no": 4, "date": "31/03/26", "day": "Tue", "time": "7:30 PM", "home": "Gujarat Titans", "away": "Punjab Kings", "venue": "New Chandigarh", "title": "M4: Gujarat Titans vs Punjab Kings"}, {"match_no": 5, "date": "01/04/26", "day": "Wed", "time": "7:30 PM", "home": "Delhi Capitals", "away": "Lucknow Super Giants", "venue": "Lucknow", "title": "M5: Delhi Capitals vs Lucknow Super Giants"}, {"match_no": 6, "date": "02/04/26", "day": "Thu", "time": "7:30 PM", "home": "Sunrisers Hyderabad", "away": "Kolkata Knight Riders", "venue": "Kolkata", "title": "M6: Sunrisers Hyderabad vs Kolkata Knight Riders"}, {"match_no": 7, "date": "03/04/26", "day": "Fri", "time": "7:30 PM", "home": "Punjab Kings", "away": "Chennai Super Kings", "venue": "Chennai", "title": "M7: Punjab Kings vs Chennai Super Kings"}, {"match_no": 8, "date": "04/04/26", "day": "Sat", "time": "3:30 PM", "home": "Mumbai Indians", "away": "Delhi Capitals", "venue": "Delhi", "title": "M8: Mumbai Indians vs Delhi Capitals"}, {"match_no": 9, "date": "04/04/26", "day": "Sat", "time": "7:30 PM", "home": "Rajasthan Royals", "away": "Gujarat Titans", "venue": "Ahmedabad", "title": "M9: Rajasthan Royals vs Gujarat Titans"}, {"match_no": 10, "date": "05/04/26", "day": "Sun", "time": "3:30 PM", "home": "Lucknow Super Giants", "away": "Sunrisers Hyderabad", "venue": "Hyderabad", "title": "M10: Lucknow Super Giants vs Sunrisers Hyderabad"}, {"match_no": 11, "date": "05/04/26", "day": "Sun", "time": "7:30 PM", "home": "Chennai Super Kings", "away": "Royal Challengers Bengaluru", "venue": "Bengaluru", "title": "M11: Chennai Super Kings vs Royal Challengers Bengaluru"}, {"match_no": 12, "date": "06/04/26", "day": "Mon", "time": "7:30 PM", "home": "Punjab Kings", "away": "Kolkata Knight Riders", "venue": "Kolkata", "title": "M12: Punjab Kings vs Kolkata Knight Riders"}, {"match_no": 13, "date": "07/04/26", "day": "Tue", "time": "7:30 PM", "home": "Mumbai Indians", "away": "Rajasthan Royals", "venue": "Guwahati", "title": "M13: Mumbai Indians vs Rajasthan Royals"}, {"match_no": 14, "date": "08/04/26", "day": "Wed", "time": "7:30 PM", "home": "Gujarat Titans", "away": "Delhi Capitals", "venue": "Delhi", "title": "M14: Gujarat Titans vs Delhi Capitals"}, {"match_no": 15, "date": "09/04/26", "day": "Thu", "time": "7:30 PM", "home": "Lucknow Super Giants", "away": "Kolkata Knight Riders", "venue": "Lucknow", "title": "M15: Lucknow Super Giants vs Kolkata Knight Riders"}, {"match_no": 16, "date": "10/04/26", "day": "Fri", "time": "7:30 PM", "home": "Punjab Kings", "away": "Sunrisers Hyderabad", "venue": "Hyderabad", "title": "M16: Punjab Kings vs Sunrisers Hyderabad"}, {"match_no": 17, "date": "11/04/26", "day": "Sat", "time": "7:30 PM", "home": "Mumbai Indians", "away": "Royal Challengers Bengaluru", "venue": "Mumbai", "title": "M17: Mumbai Indians vs Royal Challengers Bengaluru"}, {"match_no": 18, "date": "12/04/26", "day": "Sun", "time": "7:30 PM", "home": "Delhi Capitals", "away": "Chennai Super Kings", "venue": "Delhi", "title": "M18: Delhi Capitals vs Chennai Super Kings"}, {"match_no": 19, "date": "13/04/26", "day": "Mon", "time": "7:30 PM", "home": "Gujarat Titans", "away": "Lucknow Super Giants", "venue": "Ahmedabad", "title": "M19: Gujarat Titans vs Lucknow Super Giants"}, {"match_no": 20, "date": "14/04/26", "day": "Tue", "time": "7:30 PM", "home": "Royal Challengers Bengaluru", "away": "Mumbai Indians", "venue": "Bengaluru", "title": "M20: Royal Challengers Bengaluru vs Mumbai Indians"}];
const TEAMS = ["Chennai Super Kings", "Delhi Capitals", "Gujarat Titans", "Kolkata Knight Riders", "Lucknow Super Giants", "Mumbai Indians", "Punjab Kings", "Rajasthan Royals", "Royal Challengers Bengaluru", "Sunrisers Hyderabad"];
const SEED_BETS = [{"id": 1, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 72, "stake": 20000, "preview1": -14400.0, "preview2": 20000.0, "resultText": "Favorite Won", "finalPL": -14400.0, "runningTotal": -14400.0}, {"id": 2, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Play", "rating": 83, "stake": 20000, "preview1": 16600.0, "preview2": -20000.0, "resultText": "Favorite Won", "finalPL": 16600.0, "runningTotal": 2200.0}, {"id": 3, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 37, "stake": 100000, "preview1": -37000.0, "preview2": 100000.0, "resultText": "Favorite Won", "finalPL": -37000.0, "runningTotal": -34800.0}, {"id": 4, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Play", "rating": 48, "stake": 100000, "preview1": 48000.0, "preview2": -100000.0, "resultText": "Favorite Won", "finalPL": 48000.0, "runningTotal": 13200.0}, {"id": 5, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 60, "stake": 50000, "preview1": -30000.0, "preview2": 50000.0, "resultText": "Favorite Won", "finalPL": -30000.0, "runningTotal": -16800.0}, {"id": 6, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Delhi Capitals", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 49, "stake": 20000, "preview1": -9800.0, "preview2": 20000.0, "resultText": "Favorite Lost", "finalPL": 20000.0, "runningTotal": 3200.0}, {"id": 7, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 37, "stake": 100000, "preview1": -37000.0, "preview2": 100000.0, "resultText": "Favorite Won", "finalPL": -37000.0, "runningTotal": -33800.0}, {"id": 8, "matchTitle": "M18: Delhi Capitals vs Chennai Super Kings", "favoriteTeam": "Chennai Super Kings", "finalWinner": "Chennai Super Kings", "action": "Eat", "rating": 16, "stake": 100000, "preview1": -16000.0, "preview2": 100000.0, "resultText": "Favorite Won", "finalPL": -16000.0, "runningTotal": -49800.0}];
const KEY = "ipct_final_state_v2";

let state = loadState();
let editIndex = -1;
const form = {};

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    selectedMatch: SCHEDULE[17].title,
    finalWinner: "Chennai Super Kings",
    bets: SEED_BETS
  };
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function currentMatch() {
  return SCHEDULE.find(m => m.title === state.selectedMatch) || SCHEDULE[0];
}

function matchTeams(title) {
  const m = SCHEDULE.find(x => x.title === title);
  return m ? [m.home, m.away] : [];
}

function calc(action, rating, stake) {
  rating = Number(rating || 0);
  stake = Number(stake || 0);
  if (!rating || !stake) return { preview1: 0, preview2: 0 };
  if (String(action).toLowerCase() === "play") {
    return { preview1: +(stake * rating / 100).toFixed(2), preview2: +(-stake).toFixed(2) };
  }
  return { preview1: +(-stake * rating / 100).toFixed(2), preview2: +stake.toFixed(2) };
}

function resultText(favoriteTeam, finalWinner) {
  if (!favoriteTeam || !finalWinner) return "";
  return favoriteTeam === finalWinner ? "Favorite Won" : "Favorite Lost";
}

function rowNet(b) {
  const rt = resultText(b.favoriteTeam, b.finalWinner);
  return rt === "Favorite Won" ? Number(b.preview1 || 0) : rt === "Favorite Lost" ? Number(b.preview2 || 0) : 0;
}

function format(n) {
  return Number(n || 0).toFixed(2);
}

function showTab(id) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tabbtn').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

function populateMatchOptions() {
  form.match.innerHTML = SCHEDULE.map(m => `<option value="${m.title}">${m.title}</option>`).join('');
  form.match.value = state.selectedMatch;
  populateTeamOptions();
}

function populateTeamOptions() {
  const opts = matchTeams(state.selectedMatch);
  const html = opts.map(t => `<option value="${t}">${t}</option>`).join('');
  form.favoriteTeam.innerHTML = html;
  form.finalWinner.innerHTML = html;
  if (!opts.includes(state.finalWinner)) state.finalWinner = opts[0] || "";
  form.finalWinner.value = state.finalWinner;
  if (!opts.includes(form.favoriteTeam.value)) form.favoriteTeam.value = opts[0] || "";
  if (!form.favoriteTeam.value) form.favoriteTeam.value = opts[0] || "";
}

function setMatch(matchTitle) {
  state.selectedMatch = matchTitle;
  const opts = matchTeams(matchTitle);
  if (!opts.includes(state.finalWinner)) state.finalWinner = opts[0] || "";
  saveState();
  form.match.value = matchTitle;
  populateTeamOptions();
  refreshMatchInfo();
  updatePreview();
  render();
}

function refreshMatchInfo() {
  const m = currentMatch();
  document.getElementById("matchInfo").innerHTML =
    `<div><b>${m.title}</b></div>
     <div>${m.date} • ${m.day} • ${m.time}</div>
     <div>${m.home} vs ${m.away}</div>
     <div>${m.venue}</div>`;
}

function updatePreview() {
  const p = calc(form.action.value, form.rating.value, form.stake.value);
  document.getElementById("preview1").innerText = format(p.preview1);
  document.getElementById("preview2").innerText = format(p.preview2);
  const rt = resultText(form.favoriteTeam.value, form.finalWinner.value);
  document.getElementById("resultText").innerText = rt || "Pending";
  document.getElementById("finalPLPreview").innerText = format(rt === "Favorite Won" ? p.preview1 : rt === "Favorite Lost" ? p.preview2 : 0);
}

function clearForm() {
  editIndex = -1;
  form.action.value = "Eat";
  form.rating.value = "";
  form.stake.value = "";
  populateTeamOptions();
  document.getElementById("saveBtn").innerText = "Add Entry";
  updatePreview();
}

function saveEntry() {
  const matchTitle = form.match.value;
  const favoriteTeam = form.favoriteTeam.value;
  const finalWinner = form.finalWinner.value;
  const action = form.action.value;
  const rating = Number(form.rating.value);
  const stake = Number(form.stake.value);

  if (!matchTitle || !favoriteTeam || !finalWinner || !action || !rating || !stake) {
    alert("Please fill all fields.");
    return;
  }

  const p = calc(action, rating, stake);
  const row = {
    id: Date.now(),
    matchTitle,
    favoriteTeam,
    finalWinner,
    action,
    rating,
    stake,
    preview1: p.preview1,
    preview2: p.preview2
  };

  if (editIndex >= 0) state.bets[editIndex] = row;
  else state.bets.push(row);

  saveState();
  clearForm();
  render();
}

function editRow(i) {
  const b = state.bets[i];
  editIndex = i;
  setMatch(b.matchTitle);
  form.favoriteTeam.value = b.favoriteTeam;
  form.finalWinner.value = b.finalWinner;
  form.action.value = b.action;
  form.rating.value = b.rating;
  form.stake.value = b.stake;
  document.getElementById("saveBtn").innerText = "Update Entry";
  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteRow(i) {
  if (!confirm("Delete this entry?")) return;
  state.bets.splice(i, 1);
  saveState();
  render();
}

function exportCSV() {
  const rows = [["matchTitle","favoriteTeam","finalWinner","action","rating","stake","preview1","preview2","result","finalPL"]];
  state.bets.forEach(b => {
    const rt = resultText(b.favoriteTeam, b.finalWinner);
    rows.push([b.matchTitle, b.favoriteTeam, b.finalWinner, b.action, b.rating, b.stake, b.preview1, b.preview2, rt, rowNet(b)]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "IPCT_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function renderSchedule() {
  const q = document.getElementById("matchSearch").value.trim().toLowerCase();
  const body = document.getElementById("scheduleBody");
  body.innerHTML = SCHEDULE.filter(m => !q || m.title.toLowerCase().includes(q) || m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q)).map(m => `
    <tr onclick="setMatch('${m.title.replaceAll("'", "\'")}')" style="cursor:pointer">
      <td>${m.match_no}</td>
      <td>${m.date}</td>
      <td>${m.time}</td>
      <td>${m.home}</td>
      <td>${m.away}</td>
      <td>${m.venue}</td>
      <td>${m.title}</td>
    </tr>
  `).join('');
}

function renderBets() {
  const filter = document.getElementById("filter").value.trim().toLowerCase();
  const body = document.getElementById("betsBody");
  let total = 0;
  let wins = 0, losses = 0, pending = 0;
  const rows = [];

  state.bets.forEach((b, i) => {
    const rt = resultText(b.favoriteTeam, b.finalWinner);
    const net = rt === "Favorite Won" ? Number(b.preview1) : rt === "Favorite Lost" ? Number(b.preview2) : 0;
    total += net;
    if (rt === "Favorite Won") wins++;
    else if (rt === "Favorite Lost") losses++;
    else pending++;
    rows.push({ ...b, rt, net, total, index: i + 1 });
  });

  body.innerHTML = rows.filter(r => !filter || [r.matchTitle, r.favoriteTeam, r.finalWinner, r.action].join(" ").toLowerCase().includes(filter))
    .map(r => `
      <tr>
        <td>${r.index}</td>
        <td>${r.matchTitle}</td>
        <td>${r.favoriteTeam}</td>
        <td>${r.finalWinner}</td>
        <td><span class="chip ${r.action.toLowerCase()}">${r.action}</span></td>
        <td>${r.rating}</td>
        <td>${Number(r.stake).toLocaleString()}</td>
        <td>${format(r.preview1)}</td>
        <td>${format(r.preview2)}</td>
        <td><span class="chip ${r.rt === 'Favorite Won' ? 'win' : r.rt === 'Favorite Lost' ? 'loss' : 'pending'}">${r.rt || 'Pending'}</span></td>
        <td>${format(r.net)}</td>
        <td>${format(r.total)}</td>
        <td>
          <button class="tiny" onclick="editRow(${r.index - 1})">Edit</button>
          <button class="tiny danger" onclick="deleteRow(${r.index - 1})">Del</button>
        </td>
      </tr>
    `).join('');

  document.getElementById("grandTotal").innerText = format(total);
  document.getElementById("reportNet").innerText = format(total);
  document.getElementById("entriesCount").innerText = state.bets.length;
  document.getElementById("winCount").innerText = wins;
  document.getElementById("lossCount").innerText = losses;
  document.getElementById("pendingCount").innerText = pending;
}

function render() {
  refreshMatchInfo();
  updatePreview();
  renderBets();
  renderSchedule();
  saveState();
}

window.addEventListener("DOMContentLoaded", () => {
  form.match = document.getElementById("match");
  form.favoriteTeam = document.getElementById("favoriteTeam");
  form.finalWinner = document.getElementById("finalWinner");
  form.action = document.getElementById("action");
  form.rating = document.getElementById("rating");
  form.stake = document.getElementById("stake");

  populateMatchOptions();
  refreshMatchInfo();
  updatePreview();
  renderSchedule();
  renderBets();

  form.match.addEventListener("change", e => {
    state.selectedMatch = e.target.value;
    const opts = matchTeams(state.selectedMatch);
    if (!opts.includes(state.finalWinner)) state.finalWinner = opts[0] || "";
    if (!opts.includes(form.favoriteTeam.value)) form.favoriteTeam.value = opts[0] || "";
    populateTeamOptions();
    refreshMatchInfo();
    updatePreview();
    saveState();
  });

  ["favoriteTeam", "finalWinner", "action", "rating", "stake"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      if (id === "finalWinner") state.finalWinner = form.finalWinner.value;
      updatePreview();
      renderBets();
      saveState();
    });
    document.getElementById(id).addEventListener("change", () => {
      if (id === "finalWinner") state.finalWinner = form.finalWinner.value;
      updatePreview();
      renderBets();
      saveState();
    });
  });

  document.getElementById("filter").addEventListener("input", renderBets);
  document.getElementById("matchSearch").addEventListener("input", renderSchedule);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
});

function resetAll() {
  if (!confirm("Reset all saved data?")) return;
  localStorage.removeItem(KEY);
  location.reload();
}
