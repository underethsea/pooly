const { Client, Intents } = require("discord.js");
const Discord = require("discord.js");
const { DISCORDID } = require("./constants/discordId.js");
const pgp = require("pg-promise")(/* initialization options */);
const dotenv = require("dotenv");

dotenv.config();

const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

const cn = {
  host: "localhost",
  port: 5432,
  database: "birdcall",
  user: process.env.USER,
  password: process.env.PASSWORD,
};
const db = pgp(cn);

// Message to be sent to every user
const messageToAll = ".... sorry for the spam, I blame chatgpt"

async function tellUser(user, message) {
  try {
    const fetchedUser = await client.users.fetch(user, false);
    await fetchedUser.send(message);
    console.log(`Message sent to ${fetchedUser.id}`);
  } catch (error) {
    if (error.code === 10013) {
      console.log(`Invalid user ID: ${user}`);
    } else {
      console.log(`Error sending to ${user}: `, error);
    }
  }
}


async function sendToAll() {
  // Fetch all the users from the database
  let query = "SELECT DISCORD from addresses";
  let users 
users = [579297411696951296,
  460366745480200192,
  502137499452309504,
  408197161965322240,
  799403391792054293,
  877269820482146335,
  713890833069506592,
  538420561848827915,
  953953629386190888,
  269862863479242762,
  860876394124017704,
  204094915527835649,
  966579021775249428,
  910866529900453930,
  326514415677603842,
  743168267018829897,
  185689161695494146,
  432586514577227786,
  783373221117296680,
  841755619572973569,
  849985065622569000,
  701693920874201118,
  406892610590998529,
  772937342029529150,
  831194063550021692,
  957670445388279888,
  874428884421083187,
  887705398222651402,
  851147303670906891,
  392789029822660608,
  964361147371360286,
  861123581467164672,
  929196890178850876,
  348242214968754178,
  159063142603685889,
  483323253251637248,
  313052928577372191,
  918783116099862528,
  954922196889915483,
  524598121658056706,
  160080567893884928,
  306101944861196289,
  307365463619403776,
  139202190773321729,
  762587449670631424,
  812164708282794064,
  384378872508186626,
  351061350950109196,
  950258962048118795,
  307484264465956864,
  355377928944615434,
  944787675230126110,
  289364628985872385,
  341901578992615424,
  945550398809313310,
  367062932124860416
].map(String);
  for (const player of users) {
    // Send the generic message to the user
    tellUser(player, messageToAll);

    // Delay for 1 second before sending to the next user
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

client.once("ready", () => {
  console.log("Ready!");
  sendToAll();
});

client.login(process.env.BOT_KEY);
