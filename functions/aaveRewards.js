
const fetch = require("cross-fetch")
const { CONTRACTS} = require("../contracts/contracts.js")
const { ADDRESS } = require("../constants/address.js")
async function aaveRewards() {
    let geckoPrice =
      "https://api.coingecko.com/api/v3/simple/price?ids=matic-network%2Caave%2Cavalanche-2&vs_currencies=usd";
    let [
      polygonAaveIncentivesBalance,
      avalancheAaveIncentivesBalance,
      ethereumAaveIncentivesBalance,
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
      fetch(geckoPrice),
    ]);
    let geckoJson = await geckoPriceFetch.json();
    let incentives = {
      polygon: polygonAaveIncentivesBalance / 1e18,
      polygonPrice: geckoJson["matic-network"].usd,
      avalanche: avalancheAaveIncentivesBalance / 1e18,
      avaxPrice: geckoJson["avalanche-2"].usd,
      ethereum: ethereumAaveIncentivesBalance / 1e18,
      aavePrice: geckoJson["aave"].usd,
    };
    return incentives;
  }
  module.exports.AaveRewards = aaveRewards