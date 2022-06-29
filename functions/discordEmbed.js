
const { MessageEmbed } = require("discord.js");

const discordEmbed = (title, description) => {
    try {
      let titleString = title.toString()
      const newEmbed = new MessageEmbed()
        .setColor("#9B59B6")
        .setTitle(titleString)
        .setDescription(description);
      return newEmbed
    } catch (error) { console.log("discord embed error for title" + title + "\n" + error) }
  }

  module.exports.DiscordEmbed = discordEmbed