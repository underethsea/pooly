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

const networks = ["optimism", "polygon", "ethereum", "avalanche"]
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
    // draws = "267"
 
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

async function processCompleteDiscordNotify(drawId, dbLength) {
    drawId = parseInt(drawId);
    try {
        let drawFetch = await fetch(
            "https://poolexplorer.xyz/draw" + drawId
        );
        let drawResult = await drawFetch.json();
        console.log("alerts captain", userReportsId)
        client.users.fetch(userReportsId, false).then((user) => {
            message = "DB processed length " + dbLength + "\n" +
                "Draw results length " + drawResult.length
            user.send(message).catch(err => console.log(err));
        })
    } catch (error) {
        console.log(error); client.users.fetch(userReportsId, false).then((user) => {

            user.send(error).catch(err => console.log(err));
        })
    }
}

async function prizes(discord, address, label, draw) {
    // black list for disabling alerts per address
    const tempBlacklist = []
    let labelString = ""
    label !== null & label !== "" ? labelString += " `" + label + "`" : ""
    if (tempBlacklist.includes(address)) { console.log("skipped", address) } else {
        try {
            // console.log("address", address, "draw", draw);
            drawId = parseInt(draw);
            let drawFetch = await fetch(
                "https://poolexplorer.xyz/player?address=" + address
            );
            let drawResult = await drawFetch.json();
            drawResult = drawResult.filter((draw) => draw.draw_id === drawId);

            let didTheyWin = 0;
            let prizeString = "";

            // console.log(address, " ", drawResult);
            networks.forEach(networkName => {
                let networkWins = drawResult.filter((word) => word.network === networkName);
                networkWins = networkWins[0]
                // *********** TODO ********* only works for prizecap of 1
                if (networkWins) {


                    if (networkWins.claimable_prizes.length === 1) {
                        if (didTheyWin > 0) {
                            prizeString += "\n";
                        }

                        didTheyWin = 1;
                        console.log(prizeString)
                        prizeString +=
                            emoji(networkName) +
                            " WIN !!! `" +
                            address.substring(0, 5) +
                            "`    `DRAW " +
                            draw +
                            "`  ";
                        prizeString +=
                            "   " +
                            fourteenUsdc(networkWins.claimable_prizes[0]) +
                            " " +
                            emoji("usdc") + labelString;
                        console.log(address," ",prizeString)


                    }
                    if (didTheyWin === 1) {
                        try {
                            tellUser(discord, prizeString);
                        } catch (error) { console.log(error) }
                    }
                }
            })

        } catch (error) { console.log(error) }
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
                fs.writeFileSync("./lastAlertedDraw.txt", drawString);
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
            console.log(user.id," ",message)
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
        let query = "SELECT DISCORD,WALLET,LABEL from addresses";
        let queryRun = await db.any(query);

        let dbLength = queryRun.length
        console.log("db length", dbLength)

        queryRun.forEach((player) => {
            prizes(player.discord, player.wallet, player.label, drawId);
        });
        
        processCompleteDiscordNotify(drawId, dbLength)
        client.login(process.env.BOT_KEY);
    } else { console.log("not a new draw posted") }
}
go();
