const { TvlActive } = require("./tvlActive")
const emoji = require("./emoji")
// const ChainMap = require("./chainMap")
const { TierPrizes } = require("../constants/tierPrizes")
const { PrizeTier } = require("./prizeTier")
const oddsNumber = (amount) => {
    if (amount >= 100) {
        return amount.toFixed();
    } else {
        return amount.toFixed(2);
    }
};
async function odds(amount, chain) {
    if (chain == "1" || chain.startsWith("eth")) { chain = 1 }
    else if (chain == "3" || chain.startsWith("poly")) { chain = 3 }
    else if (chain == "4" || chain.startsWith("ava")) { chain = 4 }
    else if (chain === "6" || chain.startsWith("op")) { chain = 6 }
    else { chain = 3 }
    try {
        let tvl = await TvlActive();
        tvl = tvl.total;
        console.log("odds tvl", tvl);
        let prizeTier = await PrizeTier(chain);
        let oddsResult = [];
        let totalPrizes = 0;
        let index = 0
        TierPrizes.forEach((tier) => {
            console.log(tier)
            let tierOdds = 0
            if (prizeTier[index] * tier > 0) {
                tierOdds = 1 / (1 - Math.pow((tvl - amount) / tvl, tier));

                totalPrizes += tier;

            } oddsResult.push(tierOdds);
            index += 1

        });
        let anyPrizeOdds = 1 / (1 - Math.pow((tvl - amount) / tvl, totalPrizes));
        let oddsString =
 ":link: Network "+ emoji(chain) + "\n" +        
    emoji("trophy") +
            "    Any prize `1 in " +
            oddsNumber(anyPrizeOdds) +
            "`\n\n";
        prizeTier = prizeTier.reverse();
        for (x in oddsResult.reverse()) {
            if (oddsResult[x] > 0) {


                oddsString += "   `1 in " + oddsNumber(oddsResult[x]) + "` to win ";
                oddsString += " " + emoji("usdc") + " " + prizeTier[x] + "\n";
            }
        }
        
        return oddsString;
    } catch (error) {
        console.log(error);
    }
}
module.exports.Odds = odds
