const { PROVIDERS } = require("../constants/providers.js")
const { FILTERS } = require("../constants/filters.js")
const { DISCORDID } = require("../constants/discordId.js")
const { MessageEmbed } = require("discord")
const ethers = require("ethers")

async function polygonClaimEvents() {
PROVIDERS.POLYGON.on(FILTERS.CLAIM.POLYGON, (claimEvent) => {
    //  console.log(claimEvent.transactionHash)
    let txHash = claimEvent.transactionHash;
    let polygonScanUrl = "https://polygonscan.com/tx/";
    // console.log(claimEvent)
    let claimAmount = ethers.BigNumber.from(claimEvent.data);
    claimAmount = parseFloat(ethers.utils.formatUnits(claimAmount, 6));
    let claimString =
      "Transaction [" +
      txHash.substring(0, 10) +
      "](" +
      polygonScanUrl +
      txHash +
      ")";
    // console.log(claimString);
    const claimEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(
        emoji("polygon") +
        " Prize Claim    " +
        emoji("usdc") +
        " " +
        Commas(claimAmount)
      )
      .setDescription(claimString);

    client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });}
  async function avalancheClaimEvents() {
  PROVIDERS.AVALANCHE.on(FILTERS.CLAIM.AVALANCHE, (claimEvent) => {
    //  console.log(claimEvent.transactionHash)
    let txHash = claimEvent.transactionHash;
    let polygonScanUrl = "https://snowtrace.io/tx/";
    // console.log(claimEvent)
    let claimAmount = ethers.BigNumber.from(claimEvent.data);
    claimAmount = parseFloat(ethers.utils.formatUnits(claimAmount, 6));
    let claimString =
      "Transaction [" +
      txHash.substring(0, 10) +
      "](" +
      polygonScanUrl +
      txHash +
      ")";
    // console.log(claimString);
    const claimEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(
        emoji("avalanche") +
        " Prize Claim    " +
        emoji("usdc") +
        " " +
        Commas(claimAmount)
      )
      .setDescription(claimString);

    client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });
  }

  module.exports.AvalancheClaimEvents = avalancheClaimEvents
  module.exports.PolygonClaimEvents = polygonClaimEvents
  