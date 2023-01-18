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
async function odds(amount, chain, newMoney) {
    let chainName = ""
    if (chain == "1" || chain.startsWith("eth")) { chain = 1 ;chainName="ethereum"}
    else if (chain == "3" || chain.startsWith("poly")) { chain = 3;chainName="polygon" }
    else if (chain == "4" || chain.startsWith("ava")) { chain = 4;chainName="avalanche" }
    else if (chain === "6" || chain.startsWith("op")) { chain = 6;chainName="optimism" }
    else { chain = 6 ;chainName="optimism"}
    try {
        let tvl = await TvlActive();
        console.log("tvl active",tvl)
        tvl = tvl[chainName];
        console.log("odds tvl", tvl);
//Chance = (Percentage Rate * Prize Pool TVL) / Total Prize

        // let chance = drp * tvl
        let prizeTier = await PrizeTier(chain);
  let tvlTotal = tvl 
console.log("newmoney",newMoney)
                if(newMoney===true) {tvlTotal += amount}        

const chance  = tvlTotal * prizeTier.dpr / prizeTier.totalPrize
console.log("chance",chance)        
console.log("total prize",prizeTier.totalPrize)
// console.log("exp returns",expectedReturns) 
        // const oddsAdjustment = expectedReturns / prizeTier.totalPrize
        // console.log("odds adjust",oddsAdjustment)
        let oddsResult = [];
        let totalPrizes = 0;
        let index = 0
        TierPrizes.forEach((tier) => {
            console.log(tier)
            let tierOdds = 0
            if (prizeTier.tierPrizes[index] * tier > 0) {
                let prizesPerDay = 
                
                tierOdds = 1 / ((1 - Math.pow((tvlTotal - amount) / tvlTotal, (chance * tier))));
                console.log("tier ",tier)
                totalPrizes += chance * tier;

            } oddsResult.push(tierOdds);
            index += 1

        });
        let anyPrizeOdds = 1 / (1 - Math.pow((tvlTotal - amount) /tvlTotal, totalPrizes));
        console.log("tvl",tvl," amount ",amount," totalPrizes ",totalPrizes)
        let oddsString =
 ":link: Network "+ emoji(chain) + "\n" +        
    emoji("trophy") +
            "    Any prize `1 in " +
            oddsNumber(anyPrizeOdds) +
            "`\n\n";
        prizeTier = prizeTier.tierPrizes.reverse();
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
