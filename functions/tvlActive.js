const { CONTRACTS } = require("../constants/contracts.js")
const { Usdc } = require("./usdc.js")
async function tvlActive() {
    let timeNow = parseInt(Date.now() / 1000);
    let [polygonGetTotalSupply, avalancheGetTotalSupply, ethereumGetTotalSupply, optimismGetTotalSupply] =
        await Promise.all([
            CONTRACTS.TICKET.POLYGON.getTotalSupplyAt(timeNow),
            CONTRACTS.TICKET.AVALANCHE.getTotalSupplyAt(timeNow),
            CONTRACTS.TICKET.ETHEREUM.getTotalSupplyAt(timeNow),
            CONTRACTS.TICKET.OPTIMISM.getTotalSupplyAt(timeNow)
        ]);
    console.log(polygonGetTotalSupply, avalancheGetTotalSupply, "eth", ethereumGetTotalSupply)
    let tvlActiveTotal =
        Usdc(polygonGetTotalSupply) +
        Usdc(avalancheGetTotalSupply) +
        Usdc(ethereumGetTotalSupply) +
        Usdc(optimismGetTotalSupply)
    let tvlActiveReturn = {
        total: tvlActiveTotal,
        polygon: Usdc(polygonGetTotalSupply),
        avalanche: Usdc(avalancheGetTotalSupply),
        ethereum: Usdc(ethereumGetTotalSupply),
        optimism: Usdc(optimismGetTotalSupply)
    };
    return tvlActiveReturn;
}
module.exports.TvlActive = tvlActive

