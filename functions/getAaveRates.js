const ethers = require("ethers");
const { ADDRESS } = require("../constants/address");
const { CONTRACTS } = require("../constants/contracts");
const { TvlActive } = require("./tvlActive");
const fetch = require("cross-fetch");
async function getAaveRates() {
  let tvl = await TvlActive();
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

  // let polygonLendingRate = await CONTRACTS.AAVEDATA.POLYGON.getReserveData(ADDRESS.POLYGON.USDC)
  console.log(polygonLendingRate, "poly");
  // console.log(optimismLendingRate," op rate")
  let optimismRate = optimismLendingRate[5] / 1e25;
  console.log(optimismRate, " op rate ", tvl.optimism, " op tvl");

  let polygonRate = polygonLendingRate[3] / 1e25;
  console.log(polygonRate, "polyrate");
  let avalancheRate = avalancheLendingRate[3] / 1e25;
  console.log(avalancheRate, "avax rate ", tvl.avalanche, "tvl");

  let polygonRateApi = await getAaveAPI();
  polygonRateApi = parseFloat(polygonRateApi.liquidityRate) * 100;
  console.log(polygonRateApi, " poly rate api");

  let ethereumRate = ethereumLendingRate[3] / 1e25;
  console.log(ethereumRate, "eth rate ", tvl.ethereum, "tvl");
  let optimismDailyYield =
    ((optimismRate / 100) * parseInt(tvl.optimism)) / 365;
  let ethereumDailyYield =
    ((ethereumRate / 100) * parseInt(tvl.ethereum)) / 365;
  let polygonDailyYield = ((polygonRate / 100) * parseInt(tvl.polygon)) / 365;
  let avalancheDailyYield =
    ((avalancheRate / 100) * parseInt(tvl.avalanche)) / 365;

  polygonDailyYield = ((polygonRateApi / 100) * parseInt(tvl.polygon)) / 365;
  console.log("op day yield: ", optimismDailyYield);
  console.log("eth day yield: ", ethereumDailyYield);
  console.log("poly day yield: ", polygonDailyYield);

  let rates = {
    total:
      optimismDailyYield +
      ethereumDailyYield +
      polygonDailyYield +
      avalancheDailyYield,
    totalTvl: tvl.optimism + tvl.ethereum + tvl.polygon + tvl.avalanche,
    averageApr:
      (optimismRate + ethereumRate + polygonRateApi + avalancheRate) / 4,
    optimism: {
      apr: optimismRate.toFixed(2),
      dayYield: optimismDailyYield,
      tvl: tvl.optimism,
    },
    ethereum: {
      apr: ethereumRate.toFixed(2),
      dayYield: ethereumDailyYield,
      tvl: tvl.ethereum,
    },
    polygon: {
      apr: polygonRateApi.toFixed(2),
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
module.exports.GetAaveRates = getAaveRates;

async function getAaveAPI() {
  // aave v2 poly
  let apiData = await fetch(
    "https://aave-api-v2.aave.com/data/liquidity/v2?poolId=0xd05e3E715d945B59290df0ae8eF85c1BdB684744"
  );
  apiData = await apiData.json();
  let usdc = apiData.find((element) => element.symbol === "USDC");
  return usdc;
}
