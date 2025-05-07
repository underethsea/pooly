const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const ethers = require("ethers");
const fetch = require("cross-fetch");

const Discord = require("discord.js");
const { DISCORDID } = require("./constants/discordId.js");
const { MessageEmbed } = require("discord.js");

const client = new Client({
 partials: ["CHANNEL"],
 intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
/*intents: [GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,]
*/
});
module.exports.Client = client;

const { AddWallet, RemoveWallet, PlayerWallets } = require("./birdCall.js");

async function go() {
  client.once("ready", () => {
    console.log("Ready!");
  });
  client.on("messageCreate", (message) => {
if (message.content === "=list") {
          try {
            PlayerWallets(message.author.id).then((walletsText) => {
              //    console.log("=list text: ",walletsText);
              message.author.send(walletsText);
            });
          } catch (error) {
            message.author.send(
              "No wallets found. You can `=add <wallet address>`"
            );
          }
        } 
        if (message.content.startsWith("=remove")) {
          let addQuery = message.content.split(" ");
          wallet = addQuery[1];
          try {
            let q = ethers.utils.getAddress(wallet);
            let user = message.author.id;
            RemoveWallet(user, wallet).then((removeText) => {
              message.author.send(removeText);
            });
          } catch (error) {
            message.author.send("Invalid wallet address.");
          }
        }

        if (message.content.startsWith("=add")) {
          if (message.content.includes(">") || message.content.includes("<")) {
            message.reply("Try without the `<>`, friend");
          } else {
            let addQuery = message.content.split(" ");
            wallet = addQuery[1];
            label = addQuery[2];

            try {
              let q = ethers.utils.getAddress(wallet);
              // check for user limit and existing address
              let user = message.author.id;
              AddWallet(user, wallet, label).then((addText) => {
                message.author.send(addText);
              });
            } catch (error) {
              message.author.send("Invalid wallet address.");
            }
          }
        }
})
  client.login(process.env.BOT_KEY);

}
go()
