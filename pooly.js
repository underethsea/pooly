
const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const ethers = require("ethers");
const fetch = require("cross-fetch");

const Discord = require("discord.js");
const { DISCORDID } = require("./constants/discordId.js")
const { MessageEmbed } = require("discord.js");
const client = new Discord.Client({
    partials: ["CHANNEL"],
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});
module.exports.Client = client
var emoji = require("./functions/emoji.js");
const { GetLp } = require("./protocolOwnedLiquidity.js")
const { AddWallet, RemoveWallet, PlayerWallets } = require("./birdCall.js")

const { Usdc } = require("./functions/usdc")
const { Commas } = require("./functions/commas")
const { Gas } = require("./functions/gas")
const { Flushable } = require("./functions/flushable")
const { Prizes } = require("./functions/prizes")
const { Player } = require("./functions/player")
const { AllSea, Gallery, SeaFloor } = require("./functions/nft")
const { Depositors } = require("./functions/depositors")
const { DelegatedBalance } = require("./functions/delegatedBalance")
const { Ukraine } = require("./functions/ukraine")
const { Wins } = require("./functions/wins")
const { GrandPrize } = require("./functions/grandPrize")
const { AaveRewards } = require("./functions/aaveRewards")
const { TvlActive } = require("./functions/tvlActive")
const { Apr } = require("./functions/apr")
const { Tvl } = require("./functions/tvl")
const { SimulateApy } = require("./functions/simulateApy")
const { Liquidity } = require("./functions/liquidity")
const { Odds } = require("./functions/odds")
const { CalculatePrizeAPR } = require("./functions/calculatePrizeAPR")
const { PrizeTier } = require("./functions/prizeTier")
require("./listeners/claimEvents")
require("./listeners/withdrawEvents")
require("./listeners/depositEvents")

async function winners(draw) {
    let drawId = parseInt(draw)
    let drawFetch = await fetch("https://poolexplorer.xyz/draw" + drawId)
    drawFetch = await drawFetch.json()
    let winnerCount = drawFetch.length
    return winnerCount.toString()
}

const commas = (number) => {
    let fixed = number.toFixed();
    return fixed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const usdc = (amount) => {
    return amount / 1e6;
};
async function droppedPrizes(address) {
    let newAddress = address.substring(1, address.length);
    newAddress = "\\" + newAddress;
    console.log(newAddress);
    let query = "select dropped_prizes,network,draw_id from prizes where address = '" + newAddress + "' and not (dropped_prizes='{}')";
    console.log(query)
}

async function lucky(draw) {
    try {
        let drawFetch = await fetch("https://poolexplorer.xyz/draw" + draw);
        let drawResult = await drawFetch.json();
        let luckyRatio = 0;
        let user = {};
        let luckyResult = [];
        drawResult.forEach((entry) => {
            luckyRatio = entry.w / entry.g;
            user = { n: entry.n, a: entry.a, w: entry.w, g: entry.g, l: luckyRatio };
            luckyResult.push(user);
        });
        luckyResult.sort(function (a, b) {
            return parseFloat(a.l) - parseFloat(b.l);
        });
        luckyResult.reverse();
        return luckyResult;
    } catch (error) {
        console.log(error);
    }
}

async function luckyg(draw) {
    try {
        const drawFetch = await fetch("https://poolexplorer.xyz/draw" + draw);
        const drawResult = await drawFetch.json();
        let luckyRatio = 0;
        let user = {};
        let luckyResult = [];
        drawResult.forEach((entry) => {
            luckyRatio = entry.w - entry.g;
            user = { n: entry.n, a: entry.a, w: entry.w, g: entry.g, l: luckyRatio };
            luckyResult.push(user);
        });
        luckyResult.sort(function (a, b) {
            return parseFloat(a.l) - parseFloat(b.l);
        });
        luckyResult.reverse();
        return luckyResult;
    } catch (error) {
        console.log(error);
    }
}

const fourteenUsdc = (amount) => {
    let usdc = amount / 1e14;
    return usdc.toFixed();
};
async function go() {
    client.once("ready", () => {
        console.log("Ready!");
    });
    client.on("messageCreate", (message) => {
        const dmHelp = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Calling Pooly")
            .setURL("")
            .setAuthor({
                name: "",
                iconURL: "https://imgur.com/a/AvyRyoT",
                url: "",
            })
            .setDescription("")
            .setThumbnail("")
            .addFields(
                {
                    name: "`=add <wallet address>`",
                    value: "add a wallet to your list",
                },

                {
                    name: "`=remove <wallet address>`",
                    value: "remove a wallet from your list",
                },
                {
                    name: "`=list`",
                    value: "list wallets on your list",
                },
                {
                    name: "`=odds <amount>`",
                    value: "check the current odds of a deposit amount",
                },

                {
                    name: "`=player <address>`",
                    value: "player history overview",
                },

                {
                    name: "`=wins <address>`",
                    value: "find all the wins for a specific address",
                },
                {
                    name: "`=prizes <address> <draw id>`",
                    value: "check prizes won for a specific draw",
                }
            )

            .setImage("")
            .setFooter({
                text: "for any bugs or feature requests @underthesea",
                iconURL: "",
            });
        try {

            //  =============================================== //
            //           DM commands                            //
            // ================================================//
            if (message.channel.type == "DM") {
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
                        message.reply("Try without the `<>`, friend")
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
                if (
                    message.content.startsWith("pooly help") ||
                    message.content.toLowerCase() === "pooly help" ||
                    message.content === "=help"
                ) {
                    message.channel.send({ embeds: [dmHelp] });
                }
                if (message.content.startsWith("=prizes")) {
                    let prizeQuery = message.content.split(" ");
                    address = prizeQuery[1];
                    draw = prizeQuery[2];
                    Prizes(address, draw).then((prizeText) => {
                        message.author.send(prizeText);
                    });
                }
                if (message.content.startsWith("=player")) {
                    let prizeQuery = message.content.split(" ");
                    address = prizeQuery[1];
                    Player(address).then((playerText) => {
                        const playerEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setDescription(playerText);

                        message.author.send({ embeds: [playerEmbed] });
                    });
                }
                if (message.content.startsWith("=ukraine")) {
                    ukraine().then((playerText) => {
                        message.reply(playerText);
                    });
                }
                if (message.content.startsWith("=balance")) {
                    let prizeQuery = message.content.split(" ");
                    address = prizeQuery[1];
                    DelegatedBalance(address).then((playerText) => {
                        message.reply(
                            "BALANCE: " + emoji("usdc") + " " + Commas(parseFloat(playerText))
                        );
                    });
                }
                if (message.content.startsWith("=odds")) {
                    let oddsQuery = message.content.split(" ");
                    amount = oddsQuery[1];
		   let chainInput = oddsQuery[2]
		console.log(chainInput)
                    Odds(amount,chainInput).then((oddsText) => {
                        const oddsEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Daily Odds with " + emoji("usdc") + " " + Commas(parseFloat(amount)))
                            .setDescription(oddsText);
                        message.reply({ embeds: [oddsEmbed] });
                    });
                }
                if (message.content.startsWith("=oddsA")) {
                    let oddsQuery = message.content.split(" ");
                    amount = oddsQuery[1];
                    oddsA(amount).then((oddsText) => {
                        message.author.send(oddsText);
                    });
                }
                if (message.content.startsWith("=wins")) {
                    let winsQuery = message.content.split(" ");
                    address = winsQuery[1];
                    Wins(address).then((winsText) => {
                        message.author.send(winsText);
                    });
                }
            }

            // ================================================= //
            //             TWG COMMANDS                          //
            // ================================================= //

            if (message.channel.id === DISCORDID.PT.TWG) {
                if (message.content === "=pol") {
                    GetLp().then(lpText => message.reply({ embeds: [lpText] }))
                }
            }

            // ================================================= //
            //             PT PUBLIC COMMANDS                    //
            //            & PT TESTING CHANNEL                   //
            // ================================================= //
            if (
                message.channel.id === DISCORDID.PT.BOT ||
                message.channel.id === DISCORDID.PT.EXECUTIVE ||
                message.channel.id === DISCORDID.US.TEST ||
                message.channel.id === DISCORDID.US.NFT
            ) {
                if (message.content.startsWith("=add")) { message.reply('Send me a DM to use `=add` my friend') }
                if (message.content.startsWith("=sea")) {
                    let seaRequest = message.content.split(" ");
                    let collection = seaRequest[1];
                    AllSea(collection).then(sea => { message.reply({ embeds: [sea] }) }

                    )
                }
                if (message.content === "=pol") {
                    GetLp().then(lpText => message.reply({ embeds: [lpText] }))
                }
if (message.content === "=tier") {
                    PrizeTier().then(tier => message.reply({ embeds: [tier] }))
                }
                if (message.content.startsWith("=winners")) {
                    let winnersRequest = message.content.split(" ");
                    let drawId = winnersRequest[1];
                    winners(drawId).then(winnerReturn => {
                        message.reply('Draw `' + drawId + "` had " + winnerReturn + " winners!")
                    })
                }

                if (message.content.startsWith("=gallery")) {
                    Gallery().then(sea => { message.reply({ embeds: [sea] }) }
                    )
                }
                if (message.content.startsWith("=floor")) {
                    let seaRequest = message.content.split(" ");
                    let collection = seaRequest[1];
                    SeaFloor(collection).then(sea => { message.reply(sea) }

                    )
                }
                if (message.content === "=liquidity") {
                    Liquidity().then((liquidityData) => {
                        let liquidityString = emoji("polygon") + " `" +
                            Commas(usdc(liquidityData.polygon)) +
                            "`\n" + emoji("ethereum") + " `" +
                            Commas(usdc(liquidityData.ethereum)) +
                            "`\n" + emoji("avalanche") + " `" +

                            Commas(usdc(liquidityData.avalanche)) + "`" +
"\n" + emoji("optimism") + " `" +

                            Commas(usdc(liquidityData.optimism)) + "`"
                        const liquidityEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Prize Liquidity")
                            .setDescription(liquidityString);

                        message.reply({ embeds: [liquidityEmbed] });
                    }
                    );
                }
                if (message.content.startsWith("=calculateapr")) {
                    let apyQuery = message.content.split(" ");
                    amount = apyQuery[1];
                    if (amount < 2 || amount > 20000000) {
                        message.reply("What amount is that friend?");
                    } else {
                        let depositAmounts = [amount];
                        // let tvl = await TvlActive();
                        // tvl = tvl.total
                        let maxPrizes = 1;
                        let prizeTiers = [
                            { prize: 1420, num: 1 },
                            { prize: 69, num: 48 }];

                        CalculatePrizeAPR(depositAmounts, maxPrizes, prizeTiers).then((apyText) => {
                            let simulateText =
                                "<:TokenUSDC:823404729634652220> DEPOSIT `" +
                                Commas(parseFloat(amount)) +
                                "`\n:scales: APR Estimate `" +
                                apyText.apr +
                                "%`\n:calendar_spiral: Annual Prize `" +
                                apyText.annualWinnings + "`"
                            const simulateEmbed = new MessageEmbed()
                                .setColor("#0099ff")
                                .setTitle(":cookie: Prize Calculator")
                                .setDescription(simulateText);

                            message.reply({ embeds: [simulateEmbed] });
                        });
                    }
                }

                if (message.content.startsWith("=simulate")) {
                    let apyQuery = message.content.split(" ");
                    amount = apyQuery[1];
 	            chain = apyQuery[2]
		   let chainText = ""
		    if (chain == "1" || chain.startsWith("eth")) { chain = 1;chainText="Ethereum" }
    else if (chain == "3" || chain.startsWith("poly")) { chain = 3;chainText="Polygon" }
    else if (chain == "4" || chain.startsWith("ava")) { chain = 4;chainText="Avalanche" }
    else if (chain === "6" || chain.startsWith("op")) { chain = 6;chainText="Optimism" }
    else { chain = 3;chainText="Polygon" }

                    if (amount < 2 || amount > 20000000) {
                        message.reply("What amount is that friend?");
                    } else {
                        message.reply("I'm going to do a bunch of calculations, be right back!");
                        SimulateApy(amount, 30000000, 0.05, chain).then((apyText) => {
                            let simulateText = ":chains: Network `" + chainText + "`\n" +
                                "<:TokenUSDC:823404729634652220> DEPOSIT `" +
                                Commas(parseFloat(amount)) +
                                "`\n:calendar_spiral: APR Range `" +
                                apyText.unlucky +
                                "% - " +
                                apyText.lucky +
                                "%`\n:scales: Average `" +
                                apyText.average +
                                "%`\n\n*Results out of 100 Simulations*";
                            const simulateEmbed = new MessageEmbed()
                                .setColor("#0099ff")
                                .setTitle("Prize Simulator")
                                .setDescription(simulateText);

                            message.reply({ embeds: [simulateEmbed] });
                        });
                    }
                }
                // if (message.content.startsWith("=ptip66a")) {
                //   let apyQuery = message.content.split(" ");
                //   amount = apyQuery[1];
                //   if (amount < 2 || amount > 20000000) {
                //     message.reply("What amount is that friend?");
                //   } else {
                //     optionA(amount, 30000000, 0.05).then((apyText) => {
                //       let simulateText =
                //         "<:TokenUSDC:823404729634652220> DEPOSIT `" +
                //         Commas(parseFloat(amount)) +
                //         "`\n:calendar_spiral: APR Range `" +
                //         apyText.unlucky +
                //         "% - " +
                //         apyText.lucky +
                //         "%`\n:scales: Average `" +
                //         apyText.average +
                //         "%`\n:first_place: Avg 1st prize day `" +
                //         apyText.firstPrizeDay +
                //         "`\n\n*Results out of 100 Simulations*";
                //       apyText.lucky

                //       const simulateEmbed = new MessageEmbed()
                //         .setColor("#0099ff")
                //         .setTitle("Prize Simulator - PTIP-66 Option A")
                //         .setDescription(simulateText);

                //       message.reply({ embeds: [simulateEmbed] });
                //     });
                //   }
                // }

                // if (message.content.startsWith("=ptip66b")) {
                //   let apyQuery = message.content.split(" ");
                //   amount = apyQuery[1];
                //   if (amount < 2 || amount > 20000000) {
                //     message.reply("What amount is that friend?");
                //   } else {
                //     optionB(amount, 30000000, 0.05).then((apyText) => {
                //       let simulateText =
                //         "<:TokenUSDC:823404729634652220> DEPOSIT `" +
                //         Commas(parseFloat(amount)) +
                //         "`\n:calendar_spiral: APR Range `" +
                //         apyText.unlucky +
                //         "% - " +
                //         apyText.lucky +
                //         "%`\n:scales: Average `" +
                //         apyText.average +
                //         "%`\n:first_place: Avg 1st prize day `" +
                //         apyText.firstPrizeDay +
                //         "`\n\n*Results out of 100 Simulations*";
                //       const simulateEmbed = new MessageEmbed()
                //         .setColor("#0099ff")
                //         .setTitle("Prize Simulator - PTIP-66 Option B")
                //         .setDescription(simulateText);

                //       message.reply({ embeds: [simulateEmbed] });
                //     });
                //   }
                // }
                if (message.content.startsWith("=aaverewards")) {
                    AaveRewards().then((rewardsText) => {
                        let polygonTotal = rewardsText.polygon * rewardsText.polygonPrice;
                        let avalancheTotal = rewardsText.avalanche * rewardsText.avaxPrice;
                        let ethereumTotal = rewardsText.ethereum * rewardsText.aavePrice;
                        let text =
                            emoji("polygon") +
                            " " +
                            rewardsText.polygon.toFixed(2) +
                            "   MATIC     `$" +
                            polygonTotal.toFixed(2) +
                            "`\n" +
                            emoji("avalanche") +
                            " " +
                            rewardsText.avalanche.toFixed(2) +
                            "  AVAX    `$" +
                            avalancheTotal.toFixed(2) +
                            "`\n" +
                            emoji("ethereum") +
                            " " +
                            rewardsText.ethereum.toFixed(2) +
                            "  AAVE     `$" +
                            ethereumTotal.toFixed(2) +
                            "`";

                        const rewardsEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Protocol Pending Incentives")
                            .setDescription(text);
                        message.channel.send({ embeds: [rewardsEmbed] });
                    });
                }

                if (message.content.startsWith("=prizes")) {
                    let prizeQuery = message.content.split(" ");
                    address = prizeQuery[1];
                    draw = prizeQuery[2];
                    Prizes(address, draw).then((prizeText) => {
                        message.channel.send(prizeText);
                    });
                }
                if (message.content === "=apr") {
                    Apr().then((aprText) => {
                        const aprEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Current Prize APR")
                            .setDescription(":trophy: `" + aprText.apr.toFixed(2) + "%`\n" + "TVL `" + Commas(aprText.tvl) + "`\n" + "Annual prize `" + Commas(aprText.prizePerYear) + "`");
                        message.channel.send({ embeds: [aprEmbed] });
                    });
                }
                if (message.content === "=tvl") {
                    Tvl().then((tvlText) => message.channel.send({ embeds: [tvlText] }));
                }
                if (message.content === "=tvl active") {
                    TvlActive().then((tvlActiveAmt) => {
                        let tvlEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle(
                                " V4 TVL Active Total " +
                                emoji("usdc") +
                                " " +
                                Commas(tvlActiveAmt.total)
                            )
                            .setDescription(
                                emoji("polygon") +
                                " Polygon " +
                                Commas(tvlActiveAmt.polygon) +
                                "\n" +
                                emoji("ethereum") +
                                " Ethereum " +
                                Commas(tvlActiveAmt.ethereum) +
                                "\n" +
                                emoji("avalanche") +
                                " Avalanche " +
                                Commas(tvlActiveAmt.avalanche) +
				"\n" +
                                emoji("optimism") +
                                " Optimism " +
                                Commas(tvlActiveAmt.optimism)
                            );


                        message.channel.send({ embeds: [tvlEmbed] });
                    });
                }

                if (message.content.startsWith("=ukraine")) {
                    ukraine().then((playerText) => {
                        message.reply(playerText);
                    });
                }
                if (message.content.startsWith("=player")) {
                    let prizeQuery = message.content.split(" ");
                    address = prizeQuery[1];
                    Player(address).then((playerText) => {
                        const playerEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setDescription(playerText);

                        message.reply({ embeds: [playerEmbed] });
                    });
                }
                if (message.content === "=flushable") {
                    Flushable().then((flushableText) =>
                        message.channel.send({ embeds: [flushableText] })
                    );
                }
                if (message.content.startsWith("=gas")) {
                    let chain = message.content.split(" ");
                    chain = chain[1];
                    Gas(chain).then((gasText) => message.channel.send(gasText));
                }
                if (message.content.startsWith("=grandprize")) {
                    let draw = message.content.split(" ");
                    draw = draw[1];
                    GrandPrize(draw).then((grandText) => message.channel.send(grandText));
                }
                if (message.content.startsWith("=lucky ")) {
                    let draw = message.content.split(" ");
                    draw = draw[1];
                    lucky(draw).then((luckyResult) => {
                        const luckyEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Luckiest Players Draw " + draw)
                            .setURL("")
                            .setDescription(
                                emoji(luckyResult[0].n) +
                                " `" +
                                luckyResult[0].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[0].g) +
                                "   WON " +
                                parseInt(luckyResult[0].w) +
                                "\n \n" +
                                emoji(luckyResult[1].n) +
                                " `" +
                                luckyResult[1].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[1].g) +
                                "   WON " +
                                parseInt(luckyResult[1].w) +
                                "\n \n" +
                                emoji(luckyResult[2].n) +
                                " `" +
                                luckyResult[2].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[2].g) +
                                "   WON " +
                                parseInt(luckyResult[2].w)
                            );

                        message.channel.send({ embeds: [luckyEmbed] });
                    });
                }

                if (message.content.substr(0, 6) === "=luckyg") {
                    let draw = message.content.split(" ");
                    draw = draw[1];
                    luckyg(draw).then((luckyResult) => {
                        const luckyEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Luckiest Players Draw " + draw)
                            .setURL("")
                            .setDescription(
                                emoji(luckyResult[0].n) +
                                " `" +
                                luckyResult[0].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[0].g) +
                                "   WON " +
                                parseInt(luckyResult[0].w) +
                                "\n \n" +
                                emoji(luckyResult[1].n) +
                                " `" +
                                luckyResult[1].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[1].g) +
                                "   WON " +
                                parseInt(luckyResult[1].w) +
                                "\n \n" +
                                emoji(luckyResult[2].n) +
                                " `" +
                                luckyResult[2].a +
                                "`   " +
                                // "` WON: " +
                                parseInt(luckyResult[2].g) +
                                "   WON " +
                                parseInt(luckyResult[2].w)
                            );

                        message.channel.send({ embeds: [luckyEmbed] });
                    });
                }
                if (message.content.startsWith("=wins")) {
                    let winsQuery = message.content.split(" ");
                    address = winsQuery[1];
                    Wins(address).then((winsText) => {
                        message.channel.send(winsText);
                    });
                }

                if (message.content === "=depositors") {
                    Depositors().then((depositorsText) => {
                        message.reply(depositorsText);
                    });
                }

                if (message.content.startsWith("=odds")) {
                    let oddsQuery = message.content.split(" ");
                    amount = oddsQuery[1];
			let chainInput = oddsQuery[2]
                    Odds(amount,chainInput).then((oddsText) => {
                        const oddsEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("Daily Odds with " + emoji("usdc") + " " + Commas(parseFloat(amount)))
                            .setDescription(oddsText);
                        message.reply({ embeds: [oddsEmbed] });
                    });
                }
                // inside a command, event listener, etc.
                let footerText =
                    "for any bugs or feature requests @underthesea - [poolexplorer.win](https://poolexplorer.win)";
                const exampleEmbed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("Calling Pooly")
                    .setURL("")
                    .setAuthor({
                        name: "",
                        iconURL: "https://imgur.com/a/AvyRyoT",
                        url: "",
                    })
                    .setDescription("")
                    .setThumbnail("")
                    .addFields(
                        {
                            name: "`=odds <deposit amount>`",
                            value: "see the odds for any deposit amount",
                        },
                        {
                            name: "`=simulate <deposit>`",
                            value: "project prize apr for 365 days deposited",
                        },

                        {
                            name: "`=player <address>`",
                            value: "player history overview",
                        },

                        {
                            name: "`=wins <address>`",
                            value: "check a address for all-time wins",
                        },
                        {
                            name: "`=prizes <address> <draw>`",
                            value: "check prizes for an address from a specific draw",
                        },

                        {
                            name: "`=lucky <draw>`",
                            value: "find the luckiest player for a certain draw",
                        },
                        {
                            name: "`=grandprize <draw>`",
                            value: "find the grandprize winners for a certain draw",
                        },
                        { name: "`=tvl`", value: "total value locked for v4" },
                        {
                            name: "`=gas <network>`",
                            value: "check gas conditions on specified network",
                        }
                    )

                    .setImage("")
                    .addField("\u200B", footerText);

                // .addField('', '', true)
                if (message.content.startsWith("pooly help")) {
                    message.channel.send({ embeds: [exampleEmbed] });
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    client.login(process.env.BOT_KEY);
}

go();
