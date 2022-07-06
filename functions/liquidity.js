const { CONTRACTS } = require("../constants/contracts.js")
const { ADDRESS } = require("../constants/address.js")
async function liquidity() {
    try {
      console.log("liquidity function");
      let [polygonLiquidity, avalancheLiquidity, ethereumLiquidity, optimismLiquidity] =
        await Promise.all([
          CONTRACTS.TICKET.POLYGON.balanceOf(ADDRESS.POLYGON.LIQUIDITY),
          CONTRACTS.TICKET.AVALANCHE.balanceOf(ADDRESS.AVALANCHE.LIQUIDITY),
          CONTRACTS.TICKET.ETHEREUM.balanceOf(ADDRESS.ETHEREUM.LIQUIDITY),
          CONTRACTS.TICKET.OPTIMISM.balanceOf(ADDRESS.OPTIMISM.LIQUIDITY)
        ]);
      let liquidityData = {
        polygon: polygonLiquidity,
        ethereum: ethereumLiquidity,
        avalanche: avalancheLiquidity,
        optimism: optimismLiquidity
      }
      return liquidityData;
    } catch (error) {
      console.log(error);
      return "Could not fetch";
    }
  }
  module.exports.Liquidity = liquidity
