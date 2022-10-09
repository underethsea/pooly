const fetch = require("cross-fetch")
async function weekly(chain) {
if(chain === undefined ){chain = undefined}  
else if (chain == "1" || chain.startsWith("eth")) { chain = "1" }
    else if (chain == "3" || chain.startsWith("poly")) { chain = "3" }
    else if (chain == "4" || chain.startsWith("ava")) { chain = "4" }
    else if (chain === "6" || chain.startsWith("op")) { chain = "6" }
   else {chain = undefined}
console.log("chain",chain)
    let url = "https://poolexplorer.xyz/history"
    let [pPlayers,aPlayers,ePlayers,oPlayers] = await Promise.all([fetch("https://poolexplorer.xyz/players137"),fetch("https://poolexplorer.xyz/players43114"),fetch("https://poolexplorer.xyz/players1"),fetch("https://poolexplorer.xyz/players10")])
pPlayers = await pPlayers.json()
aPlayers = await aPlayers.json()
ePlayers = await ePlayers.json()
oPlayers = await oPlayers.json()

let totalPlayers = pPlayers.data.items.length + aPlayers.data.items.length + ePlayers.data.items.length + oPlayers.data.items.length    
if(chain === "1") {totalPlayers = ePlayers.data.items.length}
if(chain === "3") {totalPlayers = pPlayers.data.items.length}
if(chain === "4") {totalPlayers = aPlayers.data.items.length}
if(chain === "6") {totalPlayers = oPlayers.data.items.length}
 
if(chain === undefined){
let historyFetch = await fetch(url)
    historyFetch = await historyFetch.json()
    let recentDrawIndex = historyFetch.length - 1 
    
    let sevenDayClaimable = 0
    let sevenDayUnique = 0
    let luckiestRatio = 0
    let luckyPooler = {draw: 0,balance: 0,win: 0}
let uniquePoolers = []   
let sevenDaysOfDraws = [] 

for ( x = recentDrawIndex -  6;x <= recentDrawIndex;x++){
     let draw = x+1
     let url = "https://poolexplorer.xyz/draw" + draw
     let drawFetch = await fetch(url)
     drawFetch = await drawFetch.json()
     Array.prototype.push.apply(sevenDaysOfDraws,drawFetch)
}

sevenDaysOfDraws.forEach(pooler=>{
    if(uniquePoolers.indexOf(pooler.a) === -1) {
        uniquePoolers.push(pooler.a);      
    }
    sevenDayClaimable += parseFloat(pooler.w)
    luckyRatio = parseFloat(pooler.w) /  pooler.g  
    if(luckyRatio > luckiestRatio) {
        luckiestRatio = luckyRatio;
        luckyPooler = {draw:x,balance:pooler.g,win:pooler.w}
    }
})
console.log("unique 7day winners: ",uniquePoolers.length)
console.log("seven day claimable ",sevenDayClaimable)
console.log("luckiest",luckyPooler)
return {winners:sevenDaysOfDraws.length,unique:uniquePoolers.length,sum:sevenDayClaimable,luckyPooler:luckyPooler,totalPoolers: totalPlayers }
}else {
let recentData = await fetch("https://poolexplorer.xyz/recent")
recentData = await recentData.json()
let recentDrawIndex = recentData.id

let sevenDayClaimable = 0
    let sevenDayUnique = 0
    let luckiestRatio = 0
    let luckyPooler = {draw: 0,balance: 0,win: 0}
let uniquePoolers = []   
let sevenDaysOfDraws = [] 


for ( x = recentDrawIndex -  55;x <= recentDrawIndex;x++){
     let url = "https://poolexplorer.xyz/draw" + x
     let drawFetch = await fetch(url)
     drawFetch = await drawFetch.json()
     let drawFiltered = drawFetch.filter(entry => entry.n === chain)
     Array.prototype.push.apply(sevenDaysOfDraws,drawFiltered)
}
console.log(sevenDaysOfDraws.length," weekly filtered for chain")

sevenDaysOfDraws.forEach(pooler=>{
    if(uniquePoolers.indexOf(pooler.a) === -1) {
        uniquePoolers.push(pooler.a);      
    }
    sevenDayClaimable += parseFloat(pooler.w)
    luckyRatio = parseFloat(pooler.w) /  pooler.g  
    if(luckyRatio > luckiestRatio) {
        luckiestRatio = luckyRatio;
        luckyPooler = {draw:x,balance:pooler.g,win:pooler.w}
    }
})
console.log("unique 7day winners: ",uniquePoolers.length)
console.log("seven day claimable ",sevenDayClaimable)
console.log("luckiest",luckyPooler)
return {winners:sevenDaysOfDraws.length,unique:uniquePoolers.length,sum:sevenDayClaimable,luckyPooler:luckyPooler,totalPoolers: totalPlayers }

}
}
weekly("6")
module.exports.Weekly = weekly
