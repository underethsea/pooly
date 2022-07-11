const { PROVIDERS } = require("../constants/providers.js")
const { FILTERS } = require("../constants/filters.js")
const { DISCORDID } = require("../constants/discordId.js")
const { MessageEmbed } = require("discord.js")
const  emoji  = require("../functions/emoji.js")
const ethers = require("ethers")
const { Commas } = require("../functions/commas.js")
const { Client } = require("../pooly.js")

PROVIDERS.OPTIMISM.on(FILTERS.CLAIM.OPTIMISM, (claimEvent) => {
    //  console.log(claimEvent.transactionHash)
    let txHash = claimEvent.transactionHash;
    let polygonScanUrl = "https://optimistic.etherscan.io/tx/";
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
        emoji("optimism") +
        " Prize Claim    " +
        emoji("usdc") +
        " " +
        Commas(claimAmount)
      )
      .setDescription(claimString);

    Client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });

PROVIDERS.ETHEREUM.on(FILTERS.CLAIM.ETHEREUM, (claimEvent) => {
    //  console.log(claimEvent.transactionHash)
    let txHash = claimEvent.transactionHash;
    let polygonScanUrl = "https://etherscan.io/tx/";
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
        emoji("ethereum") +
        " Prize Claim    " +
        emoji("usdc") +
        " " +
        Commas(claimAmount)
      )
      .setDescription(claimString);

    Client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });


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

    Client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });
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

    Client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
  });
    
