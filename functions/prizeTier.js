const {CONTRACTS} = require("../constants/contracts.js")
const {ADDRESS} = require("../constants/address.js")
const { Usdc } = require("./usdc.js")
const { TierPrizes } = require("../constants/tierPrizes")

async function prizeTier(chain) {
try{
let chainName = ""
if(chain === 1){
chainName = "ETHEREUM"}
if(chain === 3) {
chainName = "POLYGON"}
if(chain === 4){
chainName = "AVALANCHE"}
if(chain === 6) {
chainName = "OPTIMISM"}

    let newestDrawId = await CONTRACTS.PRIZETIER[chainName].getNewestDrawId()
    newestDrawId = parseInt(newestDrawId)
    console.log(newestDrawId)
    let getPrizeTier = await CONTRACTS.PRIZETIER[chainName].getPrizeTier(newestDrawId)
    console.log(getPrizeTier)
    let dpr = getPrizeTier[5] / 1e9
    console.log("dpr",dpr)
    let totalPrize = getPrizeTier[6] / 1e6
    console.log(totalPrize)
    let tierPercentages = getPrizeTier[7]
    let tierPrizes = []
	let index = 0
    tierPercentages.forEach(percentage =>{
let tierPrize = (percentage / 1e9 /  TierPrizes[index]) * totalPrize
        if(tierPrize < 1 ) {tierPrize = tierPrize.toFixed(2)}else{
        tierPrize = tierPrize.toFixed(0)}
        tierPrizes.push(tierPrize)
index+=1
    })
    console.log(tierPrizes)
    console.log("return",{dpr: dpr, totalPrize: totalPrize,tierPrizes:tierPrizes})
    return {dpr: dpr, totalPrize: totalPrize,tierPrizes:tierPrizes}
}catch(error){console.log(error)}
}
module.exports.PrizeTier = prizeTier
