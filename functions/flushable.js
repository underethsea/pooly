
const { CONTRACTS } = require("../constants/contracts.js")
const { ADDRESS } = require("../constants/address.js")
const { Usdc } = require("./usdc.js")
const { DiscordEmbed } = require("./discordEmbed.js")
async function flushable() {
    let [
      polygonTotalSupply,
      avalancheTotalSupply,
      ethereumTotalSupply,
      polygonAaveBalance,
      avalancheAaveBalance,
      ethereumAaveBalance,
    ] = await Promise.all([
      CONTRACTS.TICKET.POLYGON.totalSupply(),
      CONTRACTS.TICKET.AVALANCHE.totalSupply(),
      CONTRACTS.TICKET.ETHEREUM.totalSupply(),
      CONTRACTS.AAVE.POLYGON.balanceOf(ADDRESS.POLYGON.YIELDSOURCE),
      CONTRACTS.AAVE.AVALANCHE.balanceOf(ADDRESS.AVALANCHE.YIELDSOURCE),
      CONTRACTS.AAVE.ETHEREUM.balanceOf(ADDRESS.ETHEREUM.YIELDSOURCE),
    ]);
    polygonTotalSupply = usdc(polygonTotalSupply);
    avalancheTotalSupply = usdc(avalancheTotalSupply);
    ethereumTotalSupply = usdc(ethereumTotalSupply);
  
    polygonAaveBalance = usdc(polygonAaveBalance);
    avalancheAaveBalance = usdc(avalancheAaveBalance);
    ethereumAaveBalance = usdc(ethereumAaveBalance);
  
    let polygonFlushable = polygonAaveBalance - polygonTotalSupply;
    let avalancheFlushable = avalancheAaveBalance - avalancheTotalSupply;
    let ethereumFlushable = ethereumAaveBalance - ethereumTotalSupply;
  
    let flushable = discordEmbed(
      "Flushable Yield",
      emoji("polygon") + " `" + commas(polygonFlushable) + "`\n" +
      emoji("avalanche") + " `" + commas(avalancheFlushable) + "`\n" +
      emoji("ethereum") + " `" + commas(ethereumFlushable) + "`"
    )
    return flushable;
  }

  module.exports.Flushable = flushable