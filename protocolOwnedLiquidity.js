
const ethers = require("ethers");
const fetch = require("cross-fetch");
const pgp = require("pg-promise")(/* initialization options */);
const dotenv = require("dotenv");
dotenv.config();
const Discord = require("discord.js");


const cnLP = {
    host: "localhost", // server name or IP address;
    port: 5432,
    database: "lp",
    user: process.env.USER,
    password: process.env.PASSWORD,
  };
  const dbLP = pgp(cnLP);
  module.exports = async function GetLp() {
    let query = "SELECT nft,pool,eth,total,time FROM nfts;"
    try {
      let nfts = await dbLP.any(query);
      var embed = new Discord.MessageEmbed();
      embed.setTitle('Protocol Owned Liquidity')
      let poolEthPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pooltogether&vs_currencies=eth')
      poolEthPrice = await poolEthPrice.json()
      let poolWethPrice = poolEthPrice["pooltogether"].eth;
  
      poolText = "";
      ethText = "";
      totalText = "";
      totalPool = 0
      totalEth = 0
      totalValue = 0
      nfts.forEach(nft => {
        totalPool += parseFloat(nft.pool)
        totalEth += parseFloat(nft.eth)
        totalValue += parseFloat(nft.total)
        poolText += parseInt(nft.pool) + "\n";
        ethText += nft.eth + "\n";
        totalText += "$" + parseInt(nft.total) + "\n";
  
      })
      poolText += "-------\n" + totalPool.toFixed(0)
      ethText += "-------\n" + totalEth.toFixed(3)
      totalText += "-------\n$" + totalValue.toFixed(0)
      embed.setDescription("GECKO (GATEIO) `" + poolWethPrice + "`\nData from <t:" + nfts[0].time + ":R>")
      embed.addFields(
        { name: 'POOL', value: poolText, inline: true },
        { name: 'WETH', value: ethText, inline: true },
        { name: 'TOTAL', value: totalText, inline: true }
      )
      // embed.setFooter("POOL `"+totalPool.toFixed(0)+"` WETH `"+totalEth.toFixed(3)+"` TOTAL `"+totalValue.toFixed(0)+"`")
      // let footerText = "Data from <t:"+nfts[0].now+":R>"
      // embed.setFooter({text:footerText})
      return embed
    } catch (error) {
      console.log(error)
    }
  }
