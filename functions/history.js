const fetch = require("cross-fetch")
async function history() {
    let url = "https://poolexplorer.xyz/history"
    let historyFetch = await fetch(url)
    historyFetch = await historyFetch.json()
    let recentDrawIndex = historyFetch.length - 1 
    
    let sevenDayClaimable = 0
    let sevenDayDropped = 0
    let sevenDayWinners = 0
let uniquePoolers = []   
 for ( x = recentDrawIndex -  6;x <= recentDrawIndex;x++){
    let drawData = await grabDraw(x+1)
    drawData.forEach(pooler=>{
    if(uniquePoolers.indexOf(pooler.a) === -1) {
    uniquePoolers.push(pooler.a);
   
}
})
    console.log(historyFetch[x])
    sevenDayClaimable += parseInt(historyFetch[x].c)
    sevenDayDropped += parseInt(historyFetch[x].d)
    sevenDayWinners += historyFetch[x].w
}
   let thirtyDayClaimable = 0
   let thirtyDayDropped = 0
let thirtyDayWinners = 0
for ( x = recentDrawIndex -  29;x <= recentDrawIndex;x++){
    thirtyDayClaimable += parseInt(historyFetch[x].c)
   thirtyDayDropped += parseInt(historyFetch[x].d)
    thirtyDayWinners += historyFetch[x].w
}
let returnData = {
recentDrawId: recentDrawIndex + 1,
recentDrawClaimable: parseInt(historyFetch[recentDrawIndex].c),
recentDrawDropped: parseInt(historyFetch[recentDrawIndex].d),
recentDrawWinners: historyFetch[recentDrawIndex].w,
sevenDayClaimable : sevenDayClaimable / 7,
sevenDayDropped : sevenDayDropped / 7,
sevenDayWinners : sevenDayWinners / 7,
sevenDayUnique: uniquePoolers.length,
thirtyDayClaimable : thirtyDayClaimable / 30,
thirtyDayDropped : thirtyDayDropped / 30,
thirtyDayWinners : thirtyDayWinners / 30
}
console.log(returnData)
return returnData;
}
module.exports.History = history
history() 

async function grabDraw(drawId) {
let url = "https://poolexplorer.xyz/draw"+drawId
let fetchUrl = await fetch(url)
fetchUrl = await fetchUrl.json()
return fetchUrl
}
