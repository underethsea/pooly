
const { CONTRACTS } = require("../constants/contracts.js")
const { ADDRESS } = require("../constants/address.js")
const { Usdc } = require("./usdc.js")
const { DiscordEmbed } = require("./discordEmbed.js")
const { Commas } = require("./commas.js")
const emoji = require("./emoji.js")
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
    polygonTotalSupply = Usdc(polygonTotalSupply);
    avalancheTotalSupply = Usdc(avalancheTotalSupply);
    ethereumTotalSupply = Usdc(ethereumTotalSupply);
  
    polygonAaveBalance = Usdc(polygonAaveBalance);
    avalancheAaveBalance = Usdc(avalancheAaveBalance);
    ethereumAaveBalance = Usdc(ethereumAaveBalance);
  
    let polygonFlushable = polygonAaveBalance - polygonTotalSupply;
    let avalancheFlushable = avalancheAaveBalance - avalancheTotalSupply;
    let ethereumFlushable = ethereumAaveBalance - ethereumTotalSupply;
  
    let flushable = DiscordEmbed(
      "Flushable Yield",
      emoji("polygon") + " `" + Commas(polygonFlushable) + "`\n" +
      emoji("avalanche") + " `" + Commas(avalancheFlushable) + "`\n" +
      emoji("ethereum") + " `" + Commas(ethereumFlushable) + "`"
    )
    return flushable;
  }

  module.exports.Flushable = flushable
