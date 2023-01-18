const {GeckoPrice} = require("./geckoFetch")
const {TvlActive} = require("./tvlActive")


const rewardsPerWeek = 20000 
async function opAPR () {


let opTVL = await TvlActive()
opTVL = parseInt(opTVL.optimism)
console.log(opTVL)
let opPrice = await GeckoPrice("optimism")

let yield = rewardsPerWeek * parseFloat(opPrice) * 52

console.log(yield," / ",opTVL)

yield = yield / opTVL
console.log("yield ",yield)
let apr = yield * 100
console.log(apr)
return apr.toFixed(2)
}
module.exports.OpAPR = opAPR
