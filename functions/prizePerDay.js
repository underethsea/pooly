const { CONTRACTS } = require("../constants/contracts.js")
async function prizePerDay(chain) {
    try {
        if (chain === 3) {
            let newestDrawId = await CONTRACTS.PRIZETIER.POLYGON.getNewestDrawId();
            let prizeTier = await CONTRACTS.PRIZETIER.POLYGON.getPrizeTier(newestDrawId);
            let prizePerDayNow = parseFloat(prizeTier[5]) / 1e6;
            return prizePerDayNow;
        }
        else if (chain === 4) {
            let newestDrawId = await CONTRACTS.PRIZETIER.AVALANCHE.getNewestDrawId();
            let prizeTier = await CONTRACTS.PRIZETIER.AVALANCHE.getPrizeTier(newestDrawId);
            let prizePerDayNow = parseFloat(prizeTier[5]) / 1e6;
            return prizePerDayNow;
        }
        else if (chain === 6) {
            let newestDrawId = await CONTRACTS.PRIZETIER.OPTIMISM.getNewestDrawId();
            let prizeTier = await CONTRACTS.PRIZETIER.OPTIMISM.getPrizeTier(newestDrawId);
            let prizePerDayNow = parseFloat(prizeTier[5]) / 1e6;
            return prizePerDayNow;
        } else {
            let newestDrawId = await CONTRACTS.PRIZETIER.ETHEREUM.getNewestDrawId();
            let prizeTier = await CONTRACTS.PRIZETIER.ETHEREUM.getPrizeTier(newestDrawId);
            let prizePerDayNow = parseFloat(prizeTier[5]) / 1e6;
            return prizePerDayNow;
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports.PrizePerDay = prizePerDay
