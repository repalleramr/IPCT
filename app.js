const matches = [{"name": "MI vs CSK", "date": "2026-03-22", "teams": ["MI", "CSK"]}, {"name": "RCB vs KKR", "date": "2026-03-23", "teams": ["RCB", "KKR"]}, {"name": "GT vs RR", "date": "2026-03-24", "teams": ["GT", "RR"]}, {"name": "LSG vs PBKS", "date": "2026-03-25", "teams": ["LSG", "PBKS"]}, {"name": "DC vs SRH", "date": "2026-03-26", "teams": ["DC", "SRH"]}, {"name": "MI vs RCB", "date": "2026-03-27", "teams": ["MI", "RCB"]}, {"name": "CSK vs GT", "date": "2026-03-28", "teams": ["CSK", "GT"]}, {"name": "KKR vs RR", "date": "2026-03-29", "teams": ["KKR", "RR"]}];

const match = document.getElementById("match");

matches.forEach((m,i)=>{match.innerHTML+=`<option value="${i}">${m.name}</option>`});

function loadMatch(){
 let m = matches[match.value];
 document.getElementById("date").value = m.date;

 let w=document.getElementById("winner");
 w.innerHTML="<option>Winner</option>";
 m.teams.forEach(t=>w.innerHTML+=`<option>${t}</option>`);

 document.querySelectorAll(".fav").forEach(f=>{
  f.innerHTML="";
  m.teams.forEach(t=>f.innerHTML+=`<option>${t}</option>`);
 });

 calc();
}

match.onchange=loadMatch;

function addRow(){
 let tr=document.createElement("tr");
 tr.innerHTML=`
 <td><select class="fav"></select></td>
 <td><select class="action"><option>Play</option><option>Eat</option></select></td>
 <td><input type="number" class="rating"></td>
 <td><input type="number" class="stake"></td>
 <td class="win">0</td>
 <td class="lose">0</td>
 <td class="final">0</td>`;
 document.getElementById("rows").appendChild(tr);

 loadMatch();

 tr.querySelectorAll("input,select").forEach(el=>el.oninput=calc);
}

function calc(){
 let total=0;
 let winner=document.getElementById("winner").value;

 document.querySelectorAll("#rows tr").forEach(r=>{
  let fav=r.querySelector(".fav").value;
  let action=r.querySelector(".action").value;
  let rating=+r.querySelector(".rating").value||0;
  let stake=+r.querySelector(".stake").value||0;

  let win= action==="Play"? stake*rating/100 : stake;
  let lose= action==="Play"? -stake : -(stake*rating/100);

  r.querySelector(".win").innerText=win;
  r.querySelector(".lose").innerText=lose;

  let final=0;
  if(winner){
    if(fav===winner) final=(action==="Play")?win:lose;
    else final=(action==="Play")?lose:win;
  }

  r.querySelector(".final").innerText=final;
  total+=final;
 });

 document.getElementById("total").innerText=total;
 localStorage.setItem("ipct_v2",document.body.innerHTML);
}

window.onload=()=>{
 let d=localStorage.getItem("ipct_v2");
 if(d) document.body.innerHTML=d;
 loadMatch();
 addRow();
};
