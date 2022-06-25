// cron to alert winners

const { Client, Intents } = require("discord.js");
const Discord = require("discord.js");

const pgp = require("pg-promise")(/* initialization options */);
const ethers = require("ethers");
const fs = require("fs");
const express = require("express");

const fetch = require("cross-fetch");
const { MessageEmbed } = require("discord.js");
const dotenv = require("dotenv");
var emoji = require("./functions/emoji.js");

dotenv.config();

// user to receive notifiation that alerts have completed
const userReportsId = '662117180158246926'

const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

const fourteenUsdc = (amount) => {
  let newNum = amount / 1e14;
  return newNum.toFixed();
};


const cdn = {
  host: "localhost", // server name or IP address;
  port: 5432,
  database: "pooltogether",
  user: process.env.USER,
  password: process.env.PASSWORD,
};
const db2 = pgp(cdn);
async function getCurrentDraw() {
  let queryDrawNumber = "SELECT max(draw_id) FROM draws";
  let currentDrawNumber = await db2.any(queryDrawNumber);
  // console.log("current draw number",currentDrawNumber)
  let draws = currentDrawNumber[0].max;
  console.log("current draw ", draws);

  // hardcode draw# - prob need to change lastAlertedDraw.txt
//  draws = "193"

  return draws;
}

const cn = {
  host: "localhost", // server name or IP address;
  port: 5432,
  database: "birdcall",
  user: process.env.USER,
  password: process.env.PASSWORD,
};
const db = pgp(cn);

async function processCompleteDiscordNotify (drawId,dbLength) {
  drawId = parseInt(drawId);
  try{
    let drawFetch = await fetch(
      "https://poolexplorer.xyz/draw" + drawId
    );
    let drawResult = await drawFetch.json();

  client.users.fetch(userReportsId, false).then((user) => {
    message = "DB processed length " + dbLength + "\n" +
    "Draw results length " + drawResult.length
    user.send(message).catch(err => console.log(err));
  })
}catch(error){console.log(error);client.users.fetch(userReportsId, false).then((user) => {
  
  user.send(error).catch(err => console.log(err));
})}
}

async function prizes(discord, address, draw) {
  const tempBlacklist =[]
  if (tempBlacklist.includes(address)) { console.log("skipped",address)}else{
  try {
    console.log("address", address,"draw", draw);
    drawId = parseInt(draw);
    let drawFetch = await fetch(
      "https://poolexplorer.xyz/player?address=" + address
    );
    let drawResult = await drawFetch.json();
    drawResult = drawResult.filter((draw) => draw.draw_id === drawId);
    let polygonWins = {};
    let avalancheWins = {};
    let ethereumWins = {};
    console.log(address, " ",drawResult);
    try {
      polygonWins = drawResult.filter((word) => word.network === "polygon");
      polygonWins = polygonWins[0];
    } catch (error) {
      console.log(error);
    }
    try {
      avalancheWins = drawResult.filter((word) => word.network === "avalanche");
      avalancheWins = avalancheWins[0];
    } catch (error) {
      console.log(error);
    }
    try {
      ethereumWins = drawResult.filter((word) => word.network === "ethereum");
      ethereumWins = ethereumWins[0];
    } catch (error) {
      console.log(error);
    }
    // console.log(result);
    // console.log(result.length);
    let didTheyWin = 0;
    let prizeString = "";
    try {
      if (polygonWins.claimable_prizes.length === 0) {
        // tellUser(discord, "No claimable prizes for draw " + drawId);
      } else if (polygonWins.claimable_prizes.length === 1) {
        if (didTheyWin > 0) {
          prizeString += "\n";
        }

        didTheyWin = 1;
        prizeString +=
          emoji(polygonWins.network) +
          " WIN !!! `" +
          address.substring(0, 5) +
          "`    `DRAW " +
          draw +
          "`  ";
        prizeString +=
          "   " +
          fourteenUsdc(polygonWins.claimable_prizes[0]) +
          " " +
          emoji("usdc");
      } else {
        didTheyWin = 1;
        prizeString +=
          emoji(polygonWins.network) +
          " WIN !!! `" +
          address.substring(0, 5) +
          "`    `DRAW " +
          draw +
          "`  ";

        for (doubleWin of polygonWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin) + " " + emoji("usdc");
        }
      }
    } catch (error) {}
    try {
      if (avalancheWins.claimable_prizes.length === 0) {
        // tellUser(discord, "No claimable prizes for draw " + drawId);
      } else if (avalancheWins.claimable_prizes.length === 1) {
        if (didTheyWin > 0) {
          prizeString += "\n";
        }

        didTheyWin = 1;

        prizeString +=
          emoji(avalancheWins.network) +
          " WIN !!! `" +
          address.substring(0, 5) +
          "`    `DRAW " +
          draw +
          "`  ";
        prizeString +=
          "   " +
          fourteenUsdc(avalancheWins.claimable_prizes[0]) +
          " " +
          emoji("usdc");
      } else {
        if (didTheyWin > 0) {
          prizeString += "\n";
        }

        didTheyWin = 1;

        prizeString +=
          emoji(avalancheWins.network) +
          " WIN !!! `" +
          address.substring(0, 5) +
          "`    `DRAW " +
          draw +
          "`  ";

        for (doubleWin of avalancheWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin) + " " + emoji("usdc");
        }
      }
    } catch (error) {}
    try {
      if (ethereumWins.claimable_prizes) {
        if (ethereumWins.claimable_prizes.length === 0) {
          //   tellUser(discord, "No claimable prizes for draw " + drawId);
        } else if (ethereumWins.claimable_prizes.length === 1) {
          if (didTheyWin > 0) {
            prizeString += "\n";
          }

          didTheyWin = 1;

          prizeString +=
            emoji(ethereumWins.network) +
            " WIN !!! `" +
            address.substring(0, 5) +
            "`    `DRAW " +
            draw +
            "`  ";
          prizeString +=
            "   " +
            fourteenUsdc(ethereumWins.claimable_prizes[0]) +
            " " +
            emoji("usdc");
        } else {
          if (didTheyWin > 0) {
            prizeString += "\n";
          }

          didTheyWin = 1;

          prizeString +=
            emoji(ethereumWins.network) +
            " WIN !!! `" +
            address.substring(0, 5) +
            "`    `DRAW " +
            draw +
            "`  ";

          for (doubleWin of ethereumWins.claimable_prizes) {
            prizeString +=
              "   " + fourteenUsdc(doubleWin) + " " + emoji("usdc");
          }
        }
      }
    } catch (error) {}
    if (didTheyWin === 1) {
      try{
      tellUser(discord, prizeString);
      }catch(error){console.log(error)}
    }
  } catch (error) {
    console.log(error);
  }
}
}
async function isNewDraw(draw) {
  try {
    const data = fs.readFileSync("./lastAlertedDraw.txt", "utf8");
    console.log("last alerted draw: ", data);
    if (parseInt(data) + 1 === parseInt(draw)) {
      console.log("new draw confirmed");
      try {
        let drawString = draw.toString()
        fs.writeFileSync("./lastAlertedDraw.txt",drawString);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    } else {
      console.log("does not seem to be a new draw");
      return false;
    }
  } catch (error) {
    console.log("error", error);
    return false;
  }
}

async function tellUser(user, message) {
  try {
    client.users.fetch(user, false).then((user) => {
     // console.log("USER: ",user)
      user.send(message).catch(err => console.log(err));
      console.log(message)
    });
  } catch (error) {
    console.log("could not alert user: ", error);
  }
}
async function go() {
  client.once("ready", () => {
    console.log("Ready!");
  });
  let drawId = await getCurrentDraw();
  let isNew = await isNewDraw(drawId)
  if (isNew) {
  let query = "SELECT DISCORD,WALLET from addresses";
  let queryRun = await db.any(query);

  let dbLength = queryRun.length

  queryRun.forEach((player) => {
      prizes(player.discord, player.wallet, drawId);
  });
  
  processCompleteDiscordNotify(drawId,dbLength)
  console.log("finished");
  client.login(process.env.BOT_KEY);
}else{console.log("not a new draw posted")}
}
go();
