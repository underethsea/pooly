const { PROVIDERS } = require("../constants/providers.js")
const { FILTERS } = require("../constants/filters.js")
const { DISCORDID } = require("../constants/discordId.js")
const { MessageEmbed } = require("discord.js")
const  emoji  = require("../functions/emoji.js")
const ethers = require("ethers")
const { Commas } = require("../functions/commas.js")
const { Client } = require("../pooly.js")
 PROVIDERS.POLYGON.on(FILTERS.DEPOSIT.POLYGON, (depositEvent) => {
    let amount = ethers.utils.defaultAbiCoder.decode(
      ["uint256"],
      depositEvent.data
    );
    amount = parseFloat(amount[0]) / 1e6;

    if (amount > 99) {
      let address = ethers.utils.defaultAbiCoder.decode(
        ["address"],
        depositEvent.topics[2]
      );
      address = address[0];
      let depositString =
        "Player [" +
        address.substring(0, 10) +
        "](" +
        "https://polygonscan.com/address/" +
        address +
        ")";

      const depositEmbed = new MessageEmbed()
        .setColor("#9B59B6")
        .setTitle(
          emoji("polygon") +
          " Deposit    " +
          emoji("usdc") +
          " " +
          Commas(amount)
        )
        .setDescription(depositString);
      Client.channels.cache
        .get(DISCORDID.PT.TURNSTILE)
        .send({ embeds: [depositEmbed] });
    }
  });


  PROVIDERS.AVALANCHE.on(FILTERS.DEPOSIT.AVALANCHE, (depositEvent) => {
    let amount = ethers.utils.defaultAbiCoder.decode(
      ["uint256"],
      depositEvent.data
    );
    amount = parseFloat(amount[0]) / 1e6;

    if (amount > 99) {
      let address = ethers.utils.defaultAbiCoder.decode(
        ["address"],
        depositEvent.topics[2]
      );
      address = address[0];
      let depositString =
        "Player [" +
        address.substring(0, 10) +
        "](" +
        "https://snowtrace.io/address/" +
        address +
        ")";

      const depositEmbed = new MessageEmbed()
        .setColor("#9B59B6")
        .setTitle(
          emoji("avalanche") +
          " Deposit    " +
          emoji("usdc") +
          " " +
          Commas(amount)
        )
        .setDescription(depositString);
      Client.channels.cache
        .get(DISCORDID.PT.TURNSTILE)
        .send({ embeds: [depositEmbed] });
    }
  });
