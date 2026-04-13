function calc(){
let type=document.getElementById("type").value;
let odds=parseFloat(document.getElementById("odds").value);
let stake=parseFloat(document.getElementById("stake").value);

let profit, liability;

if(type==="BACK"){
profit=(odds-1)*stake;
liability=stake;
}else{
profit=stake;
liability=(odds-1)*stake;
}

document.getElementById("result").innerText =
"Profit: "+profit+" | Liability: "+liability;
}
