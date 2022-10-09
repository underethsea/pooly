const { ADDRESS } = require("../constants/address.js")
const emoji = require("./emoji.js")
const { Commas } = require("./commas.js")
const { Usdc } = require("./usdc.js")
const { CONTRACTS } = require("../constants/contracts.js")
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch")

async function pool(amount) {
return amount / 1e18;
} 
async function holders(threshold) {
    let [polygonHolders, ethereumHolders, optimismHolders] =
      await Promise.all([
        fetch("https://poolexplorer.xyz/holders137"),
        fetch("https://poolexplorer.xyz/holders1"),
        fetch("https://poolexplorer.xyz/holders10")
      ]);
let amountThreshold = 0

polygonHolders = await polygonHolders.json()
ethereumHolders = await ethereumHolders.json()
optimismHolders = await optimismHolders.json()
polygonHolders = polygonHolders.data.items
ethereumHolders = ethereumHolders.data.items
optimismHolders = optimismHolders.data.items
if(threshold > 0){
polygonHolders = polygonHolders.filter(function isThreshold(num) {
  return (num.balance / 1e18 ) >= threshold;
})
ethereumHolders = ethereumHolders.filter(function isThreshold(num) {
  return (num.balance / 1e18 ) >= threshold;
})
optimismHolders = optimismHolders.filter(function isThreshold(num) {
  return (num.balance / 1e18 ) >= threshold;
})

}
let thresholdString = threshold > 0 ? " >= " + parseFloat(threshold).toFixed(0) : ""
   let bigList = polygonHolders.concat(ethereumHolders)
   bigList = bigList.concat(optimismHolders)
let uniqueObjArray = [
    ...new Map(bigList.map((item) => [item["address"], item])).values(),
];
console.log(uniqueObjArray.length,"  unique holders")
    let holdersEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(" POOL Holders " + thresholdString +
emoji("poolyAttention") + " ")
      .setDescription(
        emoji("polygon") +
        " Polygon " +
        Commas(polygonHolders.length) +
        "\n" +
        emoji("ethereum") +
        " Ethereum " +
        Commas(ethereumHolders.length) +
        "\n" +
        emoji("optimism") +
        " Optimism " +
        Commas(optimismHolders.length) +
"\n" + "\n" +
        emoji("pool") +
        " Unique " +
        Commas(uniqueObjArray.length)
      );
    return holdersEmbed;
  }
  module.exports.Holders = holders
