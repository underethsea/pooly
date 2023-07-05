const { TvlActive } = require("./tvlActive");
const emoji = require("./emoji");
// const ChainMap = require("./chainMap")
const { TierPrizes } = require("../constants/tierPrizes");
const { PrizeTier } = require("./prizeTier");
const oddsNumber = (amount) => {
  console.log("amount------------------",amount)
  if (amount >= 100) {
    return amount.toFixed();
  } else {
    return amount.toFixed(2);
  }
};

async function prizeCheck(chain, amount) {
  let chainName = "";
  if (chain == "1" || chain.startsWith("eth")) {
    chain = 1;
    chainName = "ethereum";
  } else if (chain == "3" || chain.startsWith("poly")) {
    chain = 3;
    chainName = "polygon";
  } else if (chain == "4" || chain.startsWith("ava")) {
    chain = 4;
    chainName = "avalanche";
  } else if (chain === "6" || chain.startsWith("op")) {
    chain = 6;
    chainName = "optimism";
  } else {
    chain = 6;
    chainName = "optimism";
  }
  try {
    let tvl = await TvlActive();
    tvl = tvl[chainName];
    let tvlTotal = tvl;
if(amount > 0)
{tvlTotal = amount}
    let prizeTier = await PrizeTier(chain);
    //Chance = (Percentage Rate * Prize Pool TVL) / Total Prize

    const chance = (tvlTotal * prizeTier.dpr) / prizeTier.totalPrize;
    const tvlAndDpr = tvlTotal * prizeTier.dpr
    const totalPrizeParam = prizeTier.totalPrize
    console.log("tvl and drp",tvlAndDpr)
    console.log("total prize param",totalPrizeParam)
  
    let oddsResult = [];
    let totalPrizes = 0;
    let index = 0;
     console.log("prize tier ----------",prizeTier)
    let prizes = []
    console.log(prizeTier.tierPrizes)
    console.log("PRIZE TIER---------",TierPrizes)
    console.log
    for (x in prizeTier.tierPrizes) {
    prizes.push({prize:prizeTier.tierPrizes[x],daily:tvlAndDpr / totalPrizeParam * TierPrizes[x]})
    }
    console.log(prizes)
    prizes = Object.values(
        prizes.reduce((acc, item) => {
          acc[item.prize] = acc[item.prize]
            ? { ...item, daily: item.daily + acc[item.prize].daily }
            : item;
          return acc;
        }, {})
      );
      //remove prizes value 0
      prizes = prizes.filter(function(entry){return parseInt(entry.prize)!==0})
      // sort from smallest to biggest prize
      prizes.sort((a,b) => a.prize - b.prize);

    console.log(prizes)
    
    // let anyPrizeOdds =
    //   1 / (1 - Math.pow((tvlTotal - amount) / tvlTotal, totalPrizes));
    // console.log("tvl", tvl, " amount ", amount, " totalPrizes ", totalPrizes);
    let returnString =
      ":link: Network " +
      emoji(chain) +
      "\n" 
    //   emoji("trophy") +
    //   "    Any prize `1 in " +
    //   oddsNumber(anyPrizeOdds) +
    //   "`\n\n";
    // prizeTier = prizeTier.tierPrizes.reverse();
    // oddsResult = oddsResult.reverse()

    // for (x in prizes) {
    //   if(indexOfAll(prizeTier,prizeTier[x]).length>1){
    //     console.log("duplicate " + x + " " + prizeTier[x] +  " ",indexOfAll(prizeTier,prizeTier[x]))
    //   }
    // }
    for (x in prizes) {
      
        returnString += prizes[x].prize + " " + emoji("usdc") + " " + parseFloat(prizes[x].daily).toFixed(2) + " per day\n";
      }


    return returnString;
  } catch (error) {
    console.log(error);
  }
}
module.exports.PrizeCheck = prizeCheck;
