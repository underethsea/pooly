const fetch = require("cross-fetch")
const {ChainToId} = require("./chainToId")
async function poolers(chainId) {
     console.log(chainId)
    let chain = ChainToId(chainId)
    let url = "https://poolexplorer.xyz/players" + chain
    let poolersFetch = await fetch(url)
    poolersFetch = await poolersFetch.json()
    // let recentDrawIndex = historyFetch.length - 1 
    
    // let sevenDayClaimable = 0
    // let sevenDayDropped = 0
    // let sevenDayWinners = 0
    let under1000 = poolersFetch.data.items.filter(dataset => (dataset.balance) / 1e6 < 1000)
    let under5000 = poolersFetch.data.items.filter(dataset => (dataset.balance) / 1e6 < 5000 && (dataset.balance) / 1e6 >= 1000)
    let under25000 =  poolersFetch.data.items.filter(dataset => (dataset.balance) / 1e6 < 25000 && (dataset.balance) / 1e6 >= 5000)
    let under100000 =  poolersFetch.data.items.filter(dataset => (dataset.balance) / 1e6 < 100000 && (dataset.balance) / 1e6 >= 25000)
    let over100000 = poolersFetch.data.items.filter(dataset => (dataset.balance) / 1e6 >= 100000)

let under1000Sum = under1000.reduce(function (acc, obj) { return acc + parseInt(obj.balance); }, 0);
under1000Sum = under1000Sum / 1e6
let under5000Sum  = under5000.reduce(function (acc, obj) { return acc + parseInt(obj.balance); }, 0);
under5000Sum = under5000Sum / 1e6

let under25000Sum  = under25000.reduce(function (acc, obj) { return acc + parseInt(obj.balance); }, 0);
under25000Sum = under25000Sum / 1e6

let under100000Sum  = under100000.reduce(function (acc, obj) { return acc + parseInt(obj.balance); }, 0);
under100000Sum = under100000Sum / 1e6
let over100000Sum  = over100000.reduce(function (acc, obj) { return acc + parseInt(obj.balance); }, 0);
over100000Sum = over100000Sum / 1e6

let total =  under1000Sum + under5000Sum + under25000Sum + under100000Sum + over100000Sum
let under1000Percentage = under1000Sum / total * 100
let under5000Percentage = under5000Sum / total * 100
let under25000Percentage = under25000Sum / total * 100
let under100000Percentage = under100000Sum / total * 100
let over100000Percentage = over100000Sum / total * 100


console.log("under 1k ",under1000.length," sum ",under1000Sum.toFixed(0)," ",under1000Percentage.toFixed(2),"%")
console.log("under 5k ",under5000.length," sum ",under5000Sum.toFixed(0)," ",under5000Percentage.toFixed(2),"%")
console.log("under 25k ",under25000.length," sum ",under25000Sum.toFixed(0)," ",under25000Percentage.toFixed(2),"%")
console.log("under 100k ",under100000.length," sum ",under100000Sum.toFixed(0)," ",under100000Percentage.toFixed(2),"%")
console.log("over 100k ",over100000.length," sum ",over100000Sum.toFixed(0)," ",over100000Percentage.toFixed(2),"%")
let totalPoolers =  under1000.length + under5000.length+under25000.length+under100000.length+over100000.length
return {
under1000: {count: under1000.length, countRatio: (under1000.length / totalPoolers * 100).toFixed(0),sum: under1000Sum.toFixed(0), percentage: under1000Percentage.toFixed(2)},
under5000: {count: under5000.length,  countRatio: (under5000.length / totalPoolers * 100).toFixed(0),sum: under5000Sum.toFixed(0), percentage: under5000Percentage.toFixed(2)},
under25000: {count: under25000.length,  countRatio: (under25000.length / totalPoolers * 100).toFixed(0),sum: under25000Sum.toFixed(0), percentage: under25000Percentage.toFixed(2)},
under100000: {count: under100000.length,  countRatio: (under100000.length / totalPoolers * 100).toFixed(0),sum: under100000Sum.toFixed(0), percentage: under100000Percentage.toFixed(2)},
over100000: {count: over100000.length,  countRatio: (over100000.length / totalPoolers * 100).toFixed(0),sum: over100000Sum.toFixed(0), percentage: over100000Percentage.toFixed(2)},

}
// console.log("under 1k ",under1000.length)

}
poolers(10) 
module.exports.Poolers = poolers;