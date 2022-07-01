const { CONTRACTS } = require("../constants/contracts.js")

async function tvlActive() {
    let timeNow = parseInt(Date.now() / 1000);
    let [polygonGetTotalSupply, avalancheGetTotalSupply, ethereumGetTotalSupply] =
        await Promise.all([
            CONTRACTS.TICKET.POLYGON.getTotalSupplyAt(timeNow),
            CONTRACTS.TICKET.AVALANCHE.getTotalSupplyAt(timeNow),
            CONTRACTS.TICKET.ETHEREUM.getTotalSupplyAt(timeNow),
        ]);
    console.log(polygonGetTotalSupply, avalancheGetTotalSupply, "eth", ethereumGetTotalSupply)
    let tvlActiveTotal =
        usdc(polygonGetTotalSupply) +
        usdc(avalancheGetTotalSupply) +
        usdc(ethereumGetTotalSupply);
    let tvlActiveReturn = {
        total: tvlActiveTotal,
        polygon: usdc(polygonGetTotalSupply),
        avalanche: usdc(avalancheGetTotalSupply),
        ethereum: usdc(ethereumGetTotalSupply),
    };
    return tvlActiveReturn;
}
module.exports.TvlActive = tvlActive