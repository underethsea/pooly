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

async function odds(amount, chain, newMoney) {
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
    console.log("tvl active", tvl);
    tvl = tvl[chainName];
    console.log("odds tvl", tvl);
    //Chance = (Percentage Rate * Prize Pool TVL) / Total Prize

    // let chance = drp * tvl
    let prizeTier = await PrizeTier(chain);
    let tvlTotal = tvl;
    console.log("newmoney", newMoney, tvlTotal);
    if (newMoney === true) {
      tvlTotal = parseInt(tvlTotal) +  parseInt(amount);
console.log("ADDDED",amount)  
  }
console.log("new tvl",tvlTotal)

    const chance = (tvlTotal * prizeTier.dpr) / prizeTier.totalPrize;
    console.log("chance", chance);
    console.log("total prize", prizeTier.totalPrize);
    // console.log("exp returns",expectedReturns)
    // const oddsAdjustment = expectedReturns / prizeTier.totalPrize
    // console.log("odds adjust",oddsAdjustment)
    let oddsResult = [];
    let totalPrizes = 0;
    let index = 0;
     console.log("prize tier ----------",prizeTier)
    let prizes = []
    console.log(prizeTier.tierPrizes)
    console.log("PRIZE TIER---------",TierPrizes)
    for (x in prizeTier.tierPrizes) {
    prizes.push({prize:prizeTier.tierPrizes[x],number:TierPrizes[x]})
    }
    console.log(prizes)
    let result = Object.values(
        prizes.reduce((acc, item) => {
          acc[item.prize] = acc[item.prize]
            ? { ...item, number: item.number + acc[item.prize].number }
            : item;
          return acc;
        }, {})
      );
      //remove prizes value 0
      result = result.filter(function(entry){return parseInt(entry.prize)!==0})
      // sort from smallest to biggest prize
      result.sort((a,b) => a.prize - b.prize);

console.log(result)
    result.forEach((tier) => {
      let tierOdds = 0;
      
/*        tierOdds =
          1 / (1 - Math.pow((tvlTotal - amount) / tvlTotal, chance * tier.number));
    console.log("1 / (1 - Math.pow(("+tvlTotal+" - "+amount+") /"+ tvlTotal+","+ chance+" * " + tier.number+"))");
*/
tierOdds = 1/(1- Math.pow(1 - (chance * amount / tvlTotal), tier.number))
 console.log("tier prizes ",tier.number)

        totalPrizes += tier.number;
      
      oddsResult.push(tierOdds);
      index += 1;
    });
    console.log("prizetier",prizeTier)
    console.log("odds result",oddsResult)
    console.log("total prizes",totalPrizes)
/*
    let anyPrizeOdds =
      1 / (1 - Math.pow((tvlTotal - amount) / tvlTotal, totalPrizes));
  
*/

console.log(totalPrizes)
 let anyPrizeOdds = 1/(1- Math.pow(1 - (chance * amount / tvlTotal), totalPrizes))

     
  

console.log("tvl", tvl, " amount ", amount, " totalPrizes ", totalPrizes);
    let oddsString =
      ":link: Network " +
      emoji(chain) +
      "\n" +
      emoji("trophy") +
      "    Any prize `1 in " +
      oddsNumber(anyPrizeOdds) +
      "`\n\n";
    // prizeTier = prizeTier.tierPrizes.reverse();
    // oddsResult = oddsResult.reverse()

    // for (x in prizeTier) {
    //   console.log(x+" "+prizeTier)
    //   if(indexOfAll(prizeTier,prizeTier[x]).length>1){
    //     console.log("duplicate " + x + " " + prizeTier[x] +  " ",indexOfAll(prizeTier,prizeTier[x]))
    //   }
    // }
    for (x in oddsResult) {
      if (oddsResult[x] > 0) {
        oddsString += "   `1 in " + oddsNumber(oddsResult[x]) + "` to win ";
        oddsString += " " + emoji("usdc") + " " + result[x].prize + "\n";
      }
    }

    return oddsString;
  } catch (error) {
    console.log(error);
  }
}
module.exports.Odds = odds;
