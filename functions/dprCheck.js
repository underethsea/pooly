const { TvlActive } = require("./tvlActive");
const emoji = require("./emoji");
const { TierPrizes } = require("../constants/tierPrizes");
const { PrizeTier } = require("./prizeTier");
const ethers = require("ethers");
const { ADDRESS } = require("../constants/address");
const { CONTRACTS } = require("../constants/contracts");
const { Tvl } = require("./tvlReturn");

const fetch = require("cross-fetch");

const chains = ["optimism", "polygon",  "avalanche", "ethereum"];

function separator(numb) {
    var str = numb.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
  }
async function dprCheck() {
  try {
    let aave = await getAaveRates();
    let tvl = await TvlActive();
    let tiers = {};
    for (x = 0; x < chains.length; x++) {
      let chainName = "";
      let chain = 1;
      if (chains[x] == "1" || chains[x].startsWith("eth")) {
        chain = 1;
        chainName = "ethereum";
      } else if (chains[x] == "3" || chains[x].startsWith("poly")) {
        chain = 3;
        chainName = "polygon";
      } else if (chains[x] == "4" || chains[x].startsWith("ava")) {
        chain = 4;
        chainName = "avalanche";
      } else if (chains[x] === "6" || chains[x].startsWith("op")) {
        chain = 6;
        chainName = "optimism";
      }
      console.log("getting prize tier for chain", chain, chainName);
      tiers[chainName] = await PrizeTier(chain);
      console.log("got it------------------------------------ " + chainName+" ", tiers[chainName]);
    }


    console.log("tvl active", tvl);
    // tvl = tvl[chainName];

    //Chance = (Percentage Rate * Prize Pool TVL) / Total Prize
    let infoString = "CHAIN | TVL ACTIVE | PRIZE | YIELD | SUBSIDY\n";
let result = {}    
result.chains = {}
let prizeSum = 0
let yieldSum = 0
let tvlSum = 0

chains.forEach((chain) => {
console.log("chain!!!!!!",chain)
console.log("chain tier",tiers[chain])
tvlSum += tvl[chain]
prizeSum += tiers[chain].dpr * tvl[chain]
yieldSum += aave[chain].apr/100*tvl[chain]/365
// infoString +=
//         chain.substring(0,3).padEnd(5,' ') +
//         " | " +
//         separator(Math.round(tvl[chain]).toString()).padEnd(10,' ') +
//         " | " +
//         Math.round(tiers[chain].dpr * tvl[chain]).toString().padStart(5, ' ' ) +
//         " | " +
//         Math.round(aave[chain].apr/100*tvl[chain]/365).toString().padStart(5, ' ' ) +
//         " | " +
//         (Math.round((((aave[chain].apr/100*tvl[chain]/365) - (tiers[chain].dpr * tvl[chain])) / ((aave[chain].apr/100) * tvl[chain]/365))*-100) + "%").toString().padEnd(4, ' ' ) +
//         "\n";
    result.chains[chain] = {tvl: separator(Math.round(tvl[chain]).toString()),
    prize: Math.round(tiers[chain].dpr * tvl[chain]).toString(),
yield: Math.round(aave[chain].apr/100*tvl[chain]/365).toString(),
subsidy: (Math.round((((aave[chain].apr/100*tvl[chain]/365) - (tiers[chain].dpr * tvl[chain])) / ((aave[chain].apr/100) * tvl[chain]/365))*-100) + "%").toString()
}
    });
    result.totalPrize = Math.round(prizeSum).toString()
    result.totalYield = Math.round(yieldSum).toString()
    result.tvl = separator(Math.round(tvlSum))

    return result;
  } catch (error) {
    console.log(error);
  }
}
module.exports.DprCheck = dprCheck;

async function getAaveRates() {
  const opPerDay = 13805;
  // let geckoPrice =
  //       "https://api.coingecko.com/api/v3/simple/price?ids=optimism&vs_currencies=usd";

  let tvl = await Tvl();
  console.log(tvl);
  // console.log(CONTRACTS.AAVEDATA.OPTIMISM ,"contract")
  // console.log(ADDRESS.OPTIMISM.USDC,"address")
  let [
    optimismLendingRate,
    polygonLendingRate,
    ethereumLendingRate,
    avalancheLendingRate,
  ] = await Promise.all([
    CONTRACTS.AAVEDATA.OPTIMISM.getReserveData(ADDRESS.OPTIMISM.USDC),
    CONTRACTS.AAVEDATA.POLYGON.getReserveData(ADDRESS.POLYGON.USDC),
    CONTRACTS.AAVEDATA.ETHEREUM.getReserveData(ADDRESS.ETHEREUM.USDC),
    CONTRACTS.AAVEDATA.AVALANCHE.getReserveData(ADDRESS.AVALANCHE.USDC),
  ]);
  // opPrice = await opPrice.json()
  // opPrice = parseFloat(opPrice["optimism"].usd)
  // let polygonLendingRate = await CONTRACTS.AAVEDATA.POLYGON.getReserveData(ADDRESS.POLYGON.USDC)
  console.log(polygonLendingRate, "poly");
  console.log("op lending rate", optimismLendingRate.totalAToken.toString());
  let opATokens = parseInt(optimismLendingRate.totalAToken.toString()) / 1e6;
  // console.log( opPerDay," ",opPrice," ",opATokens)
  // let opYieldPerDay = ((opPerDay * opPrice) / opATokens) * 100
  // console.log(opYieldPerDay,"% op per day")
  let optimismRate = optimismLendingRate[5] / 1e25;
  console.log(optimismRate, " op rate ", tvl.optimism, " op tvl");

  let polygonRate = polygonLendingRate[3] / 1e25;
  console.log(polygonRate, "polyrate");
  let avalancheRate = avalancheLendingRate[3] / 1e25;
  console.log(avalancheRate, "avax rate ", tvl.avalanche, "tvl");

  //  let polygonRateApi = await getAaveAPI();
  // polygonRateApi = parseFloat(polygonRateApi.liquidityRate) * 100;
  // console.log(polygonRateApi, " poly rate api");

  let ethereumRate = ethereumLendingRate[3] / 1e25;
  console.log(ethereumRate, "eth rate ", tvl.ethereum, "tvl");
  let optimismDailyYield =
    ((optimismRate / 100) * parseInt(tvl.optimism)) / 365;
  let ethereumDailyYield =
    ((ethereumRate / 100) * parseInt(tvl.ethereum)) / 365;
  let polygonDailyYield = ((polygonRate / 100) * parseInt(tvl.polygon)) / 365;
  let avalancheDailyYield =
    ((avalancheRate / 100) * parseInt(tvl.avalanche)) / 365;
  //  let opRewardsDailyYield = tvl.optimism * opYieldPerDay / 100
  polygonDailyYield = ((polygonRate / 100) * parseInt(tvl.polygon)) / 365;
  console.log("op day yield: ", optimismDailyYield);
  console.log("eth day yield: ", ethereumDailyYield);
  console.log("poly day yield: ", polygonDailyYield);

  let rates = {
    total:
      optimismDailyYield +
      ethereumDailyYield +
      polygonDailyYield +
      avalancheDailyYield,
    // opRewardsDailyYield,
    totalTvl: tvl.optimism + tvl.ethereum + tvl.polygon + tvl.avalanche,
    averageApr: (optimismRate + ethereumRate + polygonRate + avalancheRate) / 4,
    optimism: {
      apr: optimismRate.toFixed(2),
      dayYield: optimismDailyYield,
      tvl: tvl.optimism,
      rewardsPerDay: 0,
      rewardsValuePerDay: 0,
      rewardsApr: 0,
      // rewardsPerDay: tvl.optimism / opATokens * opPerDay,
      // rewardsValuePerDay: opRewardsDailyYield,
      // rewardsApr: opYieldPerDay * 365,
    },
    ethereum: {
      apr: ethereumRate.toFixed(2),
      dayYield: ethereumDailyYield,
      tvl: tvl.ethereum,
    },
    polygon: {
      apr: polygonRate.toFixed(2),
      dayYield: polygonDailyYield,
      tvl: tvl.polygon,
    },
    avalanche: {
      apr: avalancheRate.toFixed(2),
      dayYield: avalancheDailyYield,
      tvl: tvl.avalanche,
    },
  };
  return rates;
}

async function getAaveAPI() {
  try {
    // aave v2 poly
    let apiData = await fetch(
      "https://aave-api-v2.aave.com/data/liquidity/v2?poolId=0xd05e3E715d945B59290df0ae8eF85c1BdB684744"
    );
    apiData = await apiData.json();
    let usdc = apiData.find((element) => element.symbol === "USDC");
    return usdc;
  } catch (error) {
    console.log(error);
  }
}
