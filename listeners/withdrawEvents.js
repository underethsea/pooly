
const { PROVIDERS } = require("../constants/providers.js")
const { FILTERS } = require("../constants/filters.js")
const { DISCORDID } = require("../constants/discordId.js")
const { MessageEmbed } = require("discord.js")
const  emoji  = require("../functions/emoji.js")
const ethers = require("ethers")
const { Commas } = require("../functions/commas.js")
const { Client } = require("../pooly.js")
const { GetPlayer } = require("../functions/getPlayer.js")
  PROVIDERS.POLYGON.on(FILTERS.WITHDRAW.POLYGON, (withdrawEvent) => {
    // console.log("withdraw: ",withdrawEvent)
    // console.log("data",withdrawEvent.data)
    let amounts = ethers.utils.defaultAbiCoder.decode(
      ["uint256", "uint256"],
      withdrawEvent.data
    );
    let address = ethers.utils.defaultAbiCoder.decode(
      ["address"],
      withdrawEvent.topics[2]
    );
    let amount = parseFloat(amounts[0]) / 1e6;
    // console.log("amount: ",amount)
    // console.log("address: ",address[0])
    if (parseInt(amount) > 98) {
      GetPlayer(address[0], amount).then((withdrawString) => {
        const withdrawEmbed = new MessageEmbed()
          .setColor("#992D22")
          .setTitle(
            emoji("polygon") +
            " Withdraw    " +
            emoji("usdc") +
            " " +
            Commas(amount)
          )
          .setDescription(withdrawString);

        Client.channels.cache
          .get(DISCORDID.PT.TURNSTILE)
          .send({ embeds: [withdrawEmbed] });
      });
    }
  });

  PROVIDERS.AVALANCHE.on(FILTERS.WITHDRAW.AVALANCHE, (withdrawEvent) => {
    // console.log("withdraw: ",withdrawEvent)
    // console.log("data",withdrawEvent.data)
    let amounts = ethers.utils.defaultAbiCoder.decode(
      ["uint256", "uint256"],
      withdrawEvent.data
    );
    let address = ethers.utils.defaultAbiCoder.decode(
      ["address"],
      withdrawEvent.topics[2]
    );
    let amount = parseFloat(amounts[0]) / 1e6;
    // console.log("amount: ",amount)
    // console.log("address: ",address[0])
    if (parseInt(amount) > 98) {
      GetPlayerAvax(address[0], amount).then((withdrawString) => {
        const withdrawEmbed = new MessageEmbed()
          .setColor("#992D22")
          .setTitle(
            emoji("avalanche") +
            " Withdraw    " +
            emoji("usdc") +
            " " +
            Commas(amount)
          )
          .setDescription(withdrawString);

        Client.channels.cache
          .get(DISCORDID.PT.TURNSTILE)
          .send({ embeds: [withdrawEmbed] });
      });
    }
  });
