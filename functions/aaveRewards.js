
const fetch = require("cross-fetch")
const { CONTRACTS} = require("../constants/contracts.js")
const { ADDRESS } = require("../constants/address.js")
async function aaveRewards() {
    let geckoPrice =
      "https://api.coingecko.com/api/v3/simple/price?ids=matic-network%2Caave%2Cavalanche-2%2Coptimism&vs_currencies=usd";
    
// let opGeckoUrl = "https://api.coingecko.com/api/v3/simple/price?ids=optimismvs_currencies=usd";
let [
      polygonAaveIncentivesBalance,
      avalancheAaveIncentivesBalance,
      ethereumAaveIncentivesBalance,
      optimismAaveIncentiveBalance,
      geckoPriceFetch,
      
    ] = await Promise.all([
      CONTRACTS.AAVEINCENTIVES.POLYGON.getUserUnclaimedRewards(
        ADDRESS.POLYGON.YIELDSOURCE
      ),
      CONTRACTS.AAVEINCENTIVES.AVALANCHE.getUserUnclaimedRewards(
        ADDRESS.AVALANCHE.YIELDSOURCE
      ),
      CONTRACTS.AAVEINCENTIVES.ETHEREUM.getUserUnclaimedRewards(
        ADDRESS.ETHEREUM.YIELDSOURCE
      ),
CONTRACTS.AAVEINCENTIVES.OPTIMISM.getUserRewards(['0x625E7708f30cA75bfd92586e17077590C60eb4cD'],
        ADDRESS.OPTIMISM.YIELDSOURCE,'0x4200000000000000000000000000000000000042'
      ),
      fetch(geckoPrice),
      
    ]);
    let geckoJson = await geckoPriceFetch.json();
console.log("avax",avalancheAaveIncentivesBalance.toString(),"poly",polygonAaveIncentivesBalance.toString(),"eth",ethereumAaveIncentivesBalance.toString())
    let incentives = {
      polygon: polygonAaveIncentivesBalance / 1e18,
      polygonPrice: geckoJson["matic-network"].usd,
      avalanche: avalancheAaveIncentivesBalance / 1e18,
      avaxPrice: geckoJson["avalanche-2"].usd,
      ethereum: ethereumAaveIncentivesBalance / 1e18,
      aavePrice: geckoJson["aave"].usd,
      optimism: optimismAaveIncentiveBalance / 1e18,
      optimismPrice: geckoJson["optimism"].usd
    };
    return incentives;
  }
  module.exports.AaveRewards = aaveRewards
