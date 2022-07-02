
const { ADDRESS } = require("../constants/address.js")
const emoji = require("./emoji.js")
const { Commas } = require("./commas.js")
const { Usdc } = require("./usdc.js")
const { CONTRACTS } = require("../constants/contracts.js")
const { MessageEmbed } = require("discord.js");

async function tvl() {
    let [polygonAaveBalance, avalancheAaveBalance, ethereumAaveBalance] =
      await Promise.all([
        CONTRACTS.AAVE.POLYGON.balanceOf(ADDRESS.POLYGON.YIELDSOURCE),
        CONTRACTS.AAVE.AVALANCHE.balanceOf(ADDRESS.AVALANCHE.YIELDSOURCE),
        CONTRACTS.AAVE.ETHEREUM.balanceOf(ADDRESS.ETHEREUM.YIELDSOURCE),
      ]);
    polygonAaveBalance = Usdc(polygonAaveBalance);
    avalancheAaveBalance = Usdc(avalancheAaveBalance);
    ethereumAaveBalance = Usdc(ethereumAaveBalance);
    let total = polygonAaveBalance + avalancheAaveBalance + ethereumAaveBalance;
    let tvl = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(" V4 TVL Total " + emoji("usdc") + " " + Commas(total))
      .setDescription(
        emoji("polygon") +
        " Polygon " +
        Commas(polygonAaveBalance) +
        "\n" +
        emoji("ethereum") +
        " Ethereum " +
        Commas(ethereumAaveBalance) +
        "\n" +
        emoji("avalanche") +
        " Avalanche " +
        Commas(avalancheAaveBalance)
      );
    return tvl;
  }
  module.exports.Tvl = tvl
