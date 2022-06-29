const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const pgp = require("pg-promise")(/* initialization options */);
const fs = require("fs");
const ethers = require("ethers");
const fetch = require("cross-fetch");

const { ADDRESS } = require("./constants/address.js");
const { ABI } = require("./constants/abi.js")
const { FILTERS } = require("./constants/filters.js")
const { PROVIDERS } = require("./constants/providers.js")
const { CONTRACTS } = require("./constants/contracts.js")
const Discord = require("discord.js");
const { DISCORDID } = require("./constants/discordId.js")
const { MessageEmbed } = require("discord.js");
const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});
var emoji = require("./functions/emoji.js");
var calculateWinnings = require("./functions/simulate.js");
const { GetLp } = require("./protocolOwnedLiquidity.js")
const { AddWallet, RemoveWallet, PlayerWallets } = require("./birdCall.js")

const { Usdc } = require("./functions/usdc.js")
const { Commas } = require("./functions/commas.js")
const { Gas } = require("./functions/gas.js")
const { Flushable } = require("./functions/flushable.js")
const { Prizes } = require("./functions/prizes.js")
const { Player } = require("./functions/player.js")
const { AllSea, Gallery, SeaFloor } = require("./functions/nft.js")

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
async function delegatedBalance(address, network) {
  try {
    if (network === 1) {
      contract = CONTRACTS.TICKET.ETHEREUM;
    }
    if (network === 3) {
      contract = CONTRACTS.TICKET.POLYGON;
    }
    if (network === 4) {
      contract = CONTRACTS.TICKET.AVALANCHE;
    }
    let nowTime = parseInt(Date.now() / 1000);
    let balance = await contract.getBalanceAt(address, nowTime);
    balance = ethers.utils.formatUnits(balance, 6);
    return balance;
  } catch (error) {

    console.log(error);
    return 0
  }
}

async function ukraine() {
  try {
    let ethereumBalance = await delegatedBalance(
      "0xb37b3b78022E6964fe80030C9161525880274010",
      1
    );
    let polygonBalance = await delegatedBalance(
      "0xb37b3b78022E6964fe80030C9161525880274010",
      3
    );
    let avalancheBalance = await delegatedBalance(
      "0xb37b3b78022E6964fe80030C9161525880274010",
      4
    );
    let ukraineString = "UKRAINE || ";
    if (polygonBalance > 0) {
      ukraineString +=
        "    POLY: " + emoji("usdc") + " " + Commas(parseFloat(polygonBalance));
    }
    if (avalancheBalance > 0) {
      ukraineString +=
        "    AVAX: " +
        emoji("usdc") +
        " " +
        Commas(parseFloat(avalancheBalance));
    }
    if (ethereumBalance > 0) {
      ukraineString +=
        "    ETH: " + emoji("usdc") + " " + Commas(parseFloat(ethereumBalance));
    }
    return ukraineString;
  } catch (error) {
    console.log(error);
  }
}

async function depositors() {
  const polygonCovalent =
    "https://api.covalenthq.com/v1/137/tokens/0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076/token_holders/?page-size=15000&key=" +
    process.env.COVALENT_KEY;
  const ethereumCovalent =
    "https://api.covalenthq.com/v1/1/tokens/0xdd4d117723c257cee402285d3acf218e9a8236e1/token_holders/?page-size=5000&key=" +
    process.env.COVALENT_KEY;
  const avalancheCovalent =
    "https://api.covalenthq.com/v1/43114/tokens/0xb27f379c050f6ed0973a01667458af6ecebc1d90/token_holders/?quote-currency=USD&format=JSON&block-height=latest&page-size=5000&key=" +
    process.env.COVALENT_KEY;
  let [polyDepositors, avaxDepositors, ethDepositors] = await Promise.all([
    fetch(polygonCovalent),
    fetch(avalancheCovalent),
    fetch(ethereumCovalent),
  ]);
  polyDepositors = await polyDepositors.json();
  avaxDepositors = await avaxDepositors.json();
  ethDepositors = await ethDepositors.json();
  let polyCount = polyDepositors.data.items.length;
  let avaxCount = avaxDepositors.data.items.length;
  let ethCount = ethDepositors.data.items.length;
  let totalDepositors = polyCount + avaxCount + ethCount;
  return (
    "Depositors ||    TOTAL: " +
    Commas(totalDepositors) +
    "    POLY: " +
    Commas(polyCount) +
    "    AVAX: " +
    Commas(avaxCount) +
    "    ETH: " +
    Commas(ethCount)
  );
}
async function aaveRewards() {
  let geckoPrice =
    "https://api.coingecko.com/api/v3/simple/price?ids=matic-network%2Caave%2Cavalanche-2&vs_currencies=usd";
  let [
    polygonAaveIncentivesBalance,
    avalancheAaveIncentivesBalance,
    ethereumAaveIncentivesBalance,
    geckoPriceFetch,
  ] = await Promise.all([
    CONTRACTS.AAVEINCENTIVES.POLYGON.getUserUnclaimedRewards(
      ADDRESS.POLYGON.YIELDSOURCE
    ),
    CONTRACTS.AAVEINCENTIVES.AVALANCHE.getUserUnclaimedRewards(
      ADDRESS.AVALANCHE.YIELDSOURCE
    ),
    CONTRACTS.AAVEINCENTIVES.ETHEREUM.getUserUnclaimedRewards(
      ADDRESS.ETHEREUM.YIELDSOURCE
    ),
    fetch(geckoPrice),
  ]);
  let geckoJson = await geckoPriceFetch.json();
  let incentives = {
    polygon: polygonAaveIncentivesBalance / 1e18,
    polygonPrice: geckoJson["matic-network"].usd,
    avalanche: avalancheAaveIncentivesBalance / 1e18,
    avaxPrice: geckoJson["avalanche-2"].usd,
    ethereum: ethereumAaveIncentivesBalance / 1e18,
    aavePrice: geckoJson["aave"].usd,
  };
  return incentives;
}
async function droppedPrizes(address) {
  let newAddress = address.substring(1, address.length);
  newAddress = "\\" + newAddress;
  console.log(newAddress);
  let query = "select dropped_prizes,network,draw_id from prizes where address = '" + newAddress + "' and not (dropped_prizes='{}')";
  console.log(query)
}

async function apr() {
  try {
    let tvlNow = await tvlActive();
    tvlNow = tvlNow.total;
    let annualPrize = await prizePerDay();
    annualPrize = annualPrize * 365;
    let aprData = {
      tvl: tvlNow,
      prizePerYear: annualPrize,
      apr: (annualPrize / tvlNow) * 100
    }
    return aprData;
  } catch (error) {
    console.log(error);
  }
}
async function prizePerDay() {
  try {
    let newestDrawId = await CONTRACTS.PRIZETIER.ETHEREUM.getNewestDrawId();
    let prizeTier = await CONTRACTS.PRIZETIER.ETHEREUM.getPrizeTier(newestDrawId);
    let prizePerDayNow = parseFloat(prizeTier[5]) / 1e6;
    return prizePerDayNow;
  } catch (error) {
    console.log(error);
  }
}
async function tvlActive() {
  let timeNow = parseInt(Date.now() / 1000);
  let [polygonGetTotalSupply, avalancheGetTotalSupply, ethereumGetTotalSupply] =
    await Promise.all([
      CONTRACTS.TICKET.POLYGON.getTotalSupplyAt(timeNow),
      CONTRACTS.TICKET.AVALANCHE.getTotalSupplyAt(timeNow),
      CONTRACTS.TICKET.ETHEREUM.getTotalSupplyAt(timeNow),
    ]);
  console.log(polygonGetTotalSupply, avalancheGetTotalSupply, "eth", ethereumGetTotalSupply)
  let tvlActiveTotal =
    usdc(polygonGetTotalSupply) +
    usdc(avalancheGetTotalSupply) +
    usdc(ethereumGetTotalSupply);
  let tvlActiveReturn = {
    total: tvlActiveTotal,
    polygon: usdc(polygonGetTotalSupply),
    avalanche: usdc(avalancheGetTotalSupply),
    ethereum: usdc(ethereumGetTotalSupply),
  };
  return tvlActiveReturn;
}
async function tvl() {
  let [polygonAaveBalance, avalancheAaveBalance, ethereumAaveBalance] =
    await Promise.all([
      polygonAaveContract.balanceOf(ADDRESS.POLYGON.YIELDSOURCE),
      avalancheAaveContract.balanceOf(ADDRESS.AVALANCHE.YIELDSOURCE),
      ethereumAaveContract.balanceOf(ADDRESS.ETHEREUM.YIELDSOURCE),
    ]);
  polygonAaveBalance = usdc(polygonAaveBalance);
  avalancheAaveBalance = usdc(avalancheAaveBalance);
  ethereumAaveBalance = usdc(ethereumAaveBalance);
  let total = polygonAaveBalance + avalancheAaveBalance + ethereumAaveBalance;
  let tvl = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(" V4 TVL Total " + emoji("usdc") + " " + Commas(total))
    .setDescription(
      emoji("polygon") +
      " Polygon " +
      Commas(polygonAaveBalance) +
      "\n" +
      emoji("ethereum") +
      " Ethereum " +
      Commas(ethereumAaveBalance) +
      "\n" +
      emoji("avalanche") +
      " Avalanche " +
      Commas(avalancheAaveBalance)
    );
  return tvl;
}
const oddsNumber = (amount) => {
  if (amount >= 100) {
    return amount.toFixed();
  } else {
    return amount.toFixed(2);
  }
};
async function odds(amount) {
  try {
    let tvl = await tvlActive();
    tvl = tvl.total;
    console.log("odds tvl", tvl);
    const prizeTier = [1, 3, 12, 48, 192, 768];
    let tierPrizes = [1000, 100, 50, 10, 5, 5];
    let oddsResult = [];
    let totalPrizes = 0;
    prizeTier.forEach((tier) => {
      let tierOdds = 1 / (1 - Math.pow((tvl - amount) / tvl, tier));
      oddsResult.push(tierOdds);
      totalPrizes += tier;
    });
    let anyPrizeOdds = 1 / (1 - Math.pow((tvl - amount) / tvl, totalPrizes));
    let oddsString =
      emoji("trophy") +
      "    Any prize `1 in " +
      oddsNumber(anyPrizeOdds) +
      "`\n\n";
    tierPrizes = tierPrizes.reverse();
    for (x in oddsResult.reverse()) {
      oddsString += "   `1 in " + oddsNumber(oddsResult[x]) + "` to win ";
      oddsString += " " + emoji("usdc") + " " + tierPrizes[x] + "\n";
    }
    return oddsString;
  } catch (error) {
    console.log(error);
  }
}

async function liquidity() {
  try {
    console.log("liquidity function");
    let [polygonLiquidity, avalancheLiquidity, ethereumLiquidity] =
      await Promise.all([
        CONTRACTS.TICKET.POLYGON.balanceOf(ADDRESS.POLYGON.LIQUIDITY),
        CONTRACTS.TICKET.AVALANCHE.balanceOf(ADDRESS.AVALANCHE.LIQUIDITY),
        CONTRACTS.TICKET.ETHEREUM.balanceOf(ADDRESS.ETHEREUM.LIQUIDITY),
      ]);
    let liquidityData = {
      polygon: polygonLiquidity,
      ethereum: ethereumLiquidity,
      avalanche: avalancheLiquidity
    }
    return liquidityData;
  } catch (error) {
    console.log(error);
    return "Could not fetch";
  }
}


async function wins2(address) {
  try {
    let fetchAddress = "https://poolexplorer.xyz/player?address=" + address;
    let drawFetch = await fetch(fetchAddress);
    let drawResult = await drawFetch.json();
    drawResult.sort(function (a, b) {
      return parseFloat(a.draw_id) - parseFloat(b.draw_id);
    });
    let polygonWins = {};
    let avalancheWins = {};
    let ethereumWins = {};
    try {
      polygonWins = drawResult.filter((word) => word.network === "polygon");
    } catch (error) {
      console.log(error);
    }
    try {
      avalancheWins = drawResult.filter((word) => word.network === "avalanche");
    } catch (error) {
      console.log(error);
    }
    try {
      ethereumWins = drawResult.filter((word) => word.network === "ethereum");
    } catch (error) {
      console.log(error);
    }
    let winsString = "WINS || `" + address.substring(0, 5) + "`    ";
    if (polygonWins.length > 0) {
      let winsCount = 0;
      winsString += "    " + emoji("polygon");
      polygonWins.forEach((entry) => {
        if (entry.claimable_prizes && entry.claimable_prizes.length > 0) {
          winsCount += 1;
          winsString += "   " + entry.draw_id;
        }
      });
      if (winsCount === 0) {
        winsString += "  No wins yet my friend, your time will come.";
      }
    }
    if (avalancheWins.length > 0) {
      let winsCount = 0;
      winsString += "    " + emoji("avalanche");
      avalancheWins.forEach((entry) => {
        if (entry.claimable_prizes && entry.claimable_prizes.length > 0) {
          winsCount += 1;
          winsString += "   " + entry.draw_id;
        }
      });
      if (winsCount === 0) {
        winsString += "  No wins yet my friend, your time will come.";
      }
    }
    if (ethereumWins.length > 0) {
      let winsCount = 0;
      winsString += "    " + emoji("ethereum");
      ethereumWins.forEach((entry) => {
        if (entry.claimable_prizes && entry.claimable_prizes.length > 0) {
          winsCount += 1;
          winsString += "   " + entry.draw_id;
        }
      });
      if (winsCount === 0) {
        winsString += "  No wins yet my friend, your time will come.";
      }
    }
    return winsString;
  } catch (error) {
    console.log("=wins error, address" + address + " " + error);
    return "Could not find that one friend. Try `=wins <address>`";
  }
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

async function grand(draw) {
  let gp = 0;
  if (draw > 106) {
    gp = 1000;
  } else {
    gp = 2500;
  }
  try {
    let drawFetch = await fetch("https://poolexplorer.xyz/draw" + draw);
    let drawResult = await drawFetch.json();
    grandDogs = [];
    drawResult.forEach((entry) => {
      if (parseFloat(entry.w) >= gp) {
        grandDogs.push(entry);
      }
    });
    let grandString = "GRAND PRIZES DRAW " + draw + " || ";
    if (grandDogs.length > 0) {
      grandDogs.forEach((grand) => {
        grandString +=
          "\n   " + emoji(grand.n) + " `" + grand.a + "` [" + grand.w + "]";
      });
      return grandString;
    } else {
      return "No grand prizes for draw " + draw;
    }
  } catch (error) {
    return "Couldn't find that one friend.  `=grandprize <draw number>`";
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
      client.channels.cache
        .get(DISCORDID.PT.TURNSTILE)
        .send({ embeds: [depositEmbed] });
    }
  });
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
      getPlayer(address[0], amount).then((withdrawString) => {
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

        client.channels.cache
          .get(DISCORDID.PT.TURNSTILE)
          .send({ embeds: [withdrawEmbed] });
      });
    }
  });
  async function getPlayer(address, amount) {
    const currentTimestamp = parseInt(Date.now() / 1000);
    const ticketStartTimestamp = 1634184538;
    let parsedAmount = amount / 1e6;
    withdrawString =
      "Player [" +
      address.substring(0, 10) +
      "](" +
      "https://polygonscan.com/address/" +
      address +
      ")";
    try {
      let url = "https://poolexplorer.xyz/player?address=" + address;
      let [balance, averageBalance, playerData] = await Promise.all([
        CONTRACTS.TICKET.POLYGON.balanceOf(address),
        CONTRACTS.TICKET.POLYGON.getAverageBalanceBetween(
          address,
          ticketStartTimestamp,
          currentTimestamp
        ),
        fetch(url),
      ]);
      playerData = await playerData.json();
      playerData = playerData.filter(function (entry) {
        return entry.network === "polygon";
      });
      let experience = playerData.length;
      let balanceRemaining = parseFloat(ethers.utils.formatUnits(balance, 6));

      if (experience > 0) {
        withdrawString += "\nExperience  " + experience + " draws ";

        let totalClaimable = 0;
        for (let x of playerData) {
          let total = 0;
          let prize = 0;

          if (x.claimable_prizes !== null) {
            for (let y of x.claimable_prizes) {
              prize = y / 10000000 / 10000000;
              total += parseFloat(prize.toFixed());
              totalClaimable += parseFloat(prize.toFixed());
            }
          }
        }
        if (totalClaimable > 0) {
          withdrawString += "\nWon " + emoji("usdc") + " " + totalClaimable;
        }
      }
      if (balanceRemaining > 1) {
        withdrawString +=
          "\nNew Balance " + emoji("usdc") + " " + balanceRemaining.toFixed();
      }
    } catch (error) {
      console.log(error);
    }
    return withdrawString;
  }

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
      client.channels.cache
        .get(DISCORDID.PT.TURNSTILE)
        .send({ embeds: [depositEmbed] });
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
      getPlayerAvax(address[0], amount).then((withdrawString) => {
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

        client.channels.cache
          .get(DISCORDID.PT.TURNSTILE)
          .send({ embeds: [withdrawEmbed] });
      });
    }
  });
  async function getPlayerAvax(address, amount) {
    const currentTimestamp = parseInt(Date.now() / 1000);
    const ticketStartTimestamp = 1634184538;
    let parsedAmount = amount / 1e6;
    withdrawString =
      "Player [" +
      address.substring(0, 10) +
      "](" +
      "https://snowtrace.io/address/" +
      address +
      ")";
    try {
      let url = "https://poolexplorer.xyz/player?address=" + address;
      let [balance, averageBalance, playerData] = await Promise.all([
        CONTRACTS.TICKET.POLYGON.balanceOf(address),
        CONTRACTS.TICKET.POLYGON.getAverageBalanceBetween(
          address,
          ticketStartTimestamp,
          currentTimestamp
        ),
        fetch(url),
      ]);
      playerData = await playerData.json();
      playerData = playerData.filter(function (entry) {
        return entry.network === "avalanche";
      });
      let experience = playerData.length;
      let balanceRemaining = parseFloat(ethers.utils.formatUnits(balance, 6));

      if (experience > 0) {
        withdrawString += "\nExperience  " + experience + " draws ";

        let totalClaimable = 0;
        for (let x of playerData) {
          let total = 0;
          let prize = 0;

          if (x.claimable_prizes !== null) {
            for (let y of x.claimable_prizes) {
              prize = y / 10000000 / 10000000;
              total += parseFloat(prize.toFixed());
              totalClaimable += parseFloat(prize.toFixed());
            }
          }
        }
        if (totalClaimable > 0) {
          withdrawString += "\nWon " + emoji("usdc") + " " + totalClaimable;
        }
      }
      if (balanceRemaining > 1) {
        withdrawString +=
          "\nNew Balance " + emoji("usdc") + " " + balanceRemaining.toFixed();
      }
    } catch (error) {
      console.log(error);
    }
    return withdrawString;
  }

  // Login to Discord with your client's token
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

    client.channels.cache.get(DISCORDID.PT.CLAIMS).send({ embeds: [claimEmbed] });
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

            try {
              let q = ethers.utils.getAddress(wallet);
              // check for user limit and existing address
              let user = message.author.id;
              AddWallet(user, wallet).then((addText) => {
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
          delegatedBalance(address).then((playerText) => {
            message.reply(
              "BALANCE: " + emoji("usdc") + " " + Commas(parseFloat(playerText))
            );
          });
        }
        if (message.content.startsWith("=odds")) {
          let oddsQuery = message.content.split(" ");
          amount = oddsQuery[1];
          odds(amount).then((oddsText) => {
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
          wins2(address).then((winsText) => {
            message.author.send(winsText);
          });
        }
      }
      if (message.channel.id === DISCORDID.PT.TWG) {
        if (message.content === "=pol") {
          GetLp().then(lpText => message.reply({ embeds: [lpText] }))
        }
      }
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
          liquidity().then((liquidityData) => {
            let liquidityString = emoji("polygon") + " `" +
              Commas(usdc(liquidityData.polygon)) +
              "`\n" + emoji("ethereum") + " `" +
              Commas(usdc(liquidityData.ethereum)) +
              "`\n" + emoji("avalanche") + " `" +

              Commas(usdc(liquidityData.avalanche)) + "`";
            const liquidityEmbed = new MessageEmbed()
              .setColor("#0099ff")
              .setTitle("Prize Liquidity")
              .setDescription(liquidityString);

            message.reply({ embeds: [liquidityEmbed] });
          }
          );
        }
        if (message.content.startsWith("=simulate")) {
          let apyQuery = message.content.split(" ");
          amount = apyQuery[1];
          if (amount < 2 || amount > 20000000) {
            message.reply("What amount is that friend?");
          } else {
            message.reply("I'm going to do a bunch of calculations, be right back!");
            simulateApy(amount, 30000000, 0.05).then((apyText) => {
              let simulateText =
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
          aaveRewards().then((rewardsText) => {
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
          apr().then((aprText) => {
            const aprEmbed = new MessageEmbed()
              .setColor("#0099ff")
              .setTitle("Current Prize APR")
              .setDescription(":trophy: `" + aprText.apr.toFixed(2) + "%`\n" + "TVL `" + Commas(aprText.tvl) + "`\n" + "Annual prize `" + Commas(aprText.prizePerYear) + "`");
            message.channel.send({ embeds: [aprEmbed] });
          });
        }
        if (message.content === "=tvl") {
          tvl().then((tvlText) => message.channel.send({ embeds: [tvlText] }));
        }
        if (message.content === "=tvl active") {
          tvlActive().then((tvlActiveAmt) => {
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
                Commas(tvlActiveAmt.avalanche)
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
          grand(draw).then((grandText) => message.channel.send(grandText));
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
          wins2(address).then((winsText) => {
            message.channel.send(winsText);
          });
        }

        if (message.content === "=depositors") {
          depositors().then((depositorsText) => {
            message.reply(depositorsText);
          });
        }

        if (message.content.startsWith("=odds")) {
          let oddsQuery = message.content.split(" ");
          amount = oddsQuery[1];
          odds(amount).then((oddsText) => {
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

// fork of script from @KingXKok of PT Discord

const simulationDays = 365;
const simulationRuns = 100;

const maxPrizes = 2;

const gasToClaim = 0;
// const tierNumPrizes = [1, 3, 12, 48, 192, 768, 3072];
// const tierPrizes = [2500, 500, 200, 50, 10, 5, 1];



// let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // option A
// let tierPrizes = [1000, 100, 50, 10, 5, 5]; // option A

function scalingFunction(deposit) {
  let scalingVariable = 1; // used to make calculating prizes faster as deposit grows

  if (deposit > 1999 && deposit > 200) {
    scalingVariable = 5;
  }
  if (deposit > 4999) {
    scalingVariable = 10;
  }
  if (deposit > 9999) {
    scalingVariable = 20;
  }
  if (deposit > 19999) {
    scalingVariable = deposit / 400;
  }
  console.log(scalingVariable)

  return scalingVariable

}
async function simulateApy(depositAmount, removedVar, gasToClaim) {

  let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // newly proposed
  let tierPrizes = [1000, 100, 50, 10, 5, 5]; //newly proposed

  let totalPrizeValue = 0;
  let totalPrizes = 0;
  let gasCost = 0;
  console.log(tierNumPrizes)

  let scalingVariable = scalingFunction(depositAmount)
  console.log(scalingVariable)

  for (x = 0; x < tierNumPrizes.length; x++) {
    totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
    if (tierNumPrizes[x] * tierPrizes[x] > 0) {
      totalPrizes += tierNumPrizes[x];
    }
  }
  let tvl = await tvlActive()
  tvl = tvl.total;
  console.log(tvl)
  const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

  // console.log("total prize value: ", totalPrizeValue);
  // console.log("total number of prizes: ", totalPrizes);

  let tierPrizesAfterGas = [];

  for (x in tierPrizes) {
    let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

    tierPrizesAfterGas.push(prizeVal);
  }

  let claimable = 0;
  let winnings = 0;
  let min = depositAmount;
  let max = 0;
  let claimableAmount = 0;
  let droppedTotal = 0;
  let firstPrizeDayTotal = 0;
  for (x = 0; x < simulationRuns; x++) {
    winnings = calculateWinnings(
      depositAmount,
      simulationDays,
      scalingVariable,
      totalPrizes,
      dailyProbWin,
      tierPrizesAfterGas,
      tierNumPrizes,
      maxPrizes
    );
    // log each simulation
    // console.log(winnings);
    droppedNumber = winnings[3];
    droppedTotal += droppedNumber;
    claimableAmount = winnings[0];
    claimable += claimableAmount;
    firstPrizeDayTotal += winnings[4];
    if (claimableAmount < min) {
      min = claimableAmount;
    }
    if (claimableAmount > max) {
      max = claimableAmount;
    }
  }
  tierString = "";
  for (x in tierNumPrizes) {
    tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
  }
  // console.log("prize tiering: ", tierString);
  // console.log(
  //   depositAmount,
  //   " deposited for ",
  //   simulationDays,
  //   " days with gas cost to claim of ",
  //   gasToClaim
  // );
  // console.log("unluckiest player claimable: ", min.toFixed());
  // console.log("luckiest player claimable: ", max.toFixed());

  let annualized = (365 / simulationDays) * 100;
  let averageClaimable = claimable / simulationRuns;
  let averageApr = annualized * (claimable / simulationRuns / depositAmount);
  let unluckyApr = annualized * (min / depositAmount);
  let luckyApr = annualized * (max / depositAmount);

  console.log(
    "average claimable: ",
    averageClaimable.toFixed(),
    " ",
    averageApr.toFixed(2),
    "% APR"
  );
  // console.log("prizes dropped per player", droppedTotal / simulationRuns);
  // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
  // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
  // console.dir(prizeResults, { depth: null });

  // more than 100 items
  // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

  // example ascii chart
  // console.log (asciichart.plot (prizeResults,{height:30}))
  let results = {
    average: averageApr.toFixed(2),
    unlucky: unluckyApr.toFixed(2),
    lucky: luckyApr.toFixed(2),
  };
  return results;
}


async function optionA(depositAmount, removedVar, gasToClaim) {

  let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // option A

  let tierPrizes = [1000, 100, 50, 10, 5, 5]; // option A

  let totalPrizeValue = 0;
  let totalPrizes = 0;
  let gasCost = 0;

  let scalingVariable = scalingFunction(depositAmount)

  for (x = 0; x < tierNumPrizes.length; x++) {
    totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
    if (tierNumPrizes[x] * tierPrizes[x] > 0) {
      totalPrizes += tierNumPrizes[x];
    }
  }
  console.log(totalPrizes)
  console.log(totalPrizeValue)
  let tvl = await tvlActive()
  tvl = tvl.total;
  console.log(tvl)
  const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

  // console.log("total prize value: ", totalPrizeValue);
  // console.log("total number of prizes: ", totalPrizes);

  let tierPrizesAfterGas = [];

  for (x in tierPrizes) {
    let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

    tierPrizesAfterGas.push(prizeVal);
  }

  let claimable = 0;
  let winnings = 0;
  let min = depositAmount;
  let max = 0;
  let claimableAmount = 0;
  let droppedTotal = 0;
  let firstPrizeDayTotal = 0;
  for (x = 0; x < simulationRuns; x++) {
    winnings = calculateWinnings(
      depositAmount,
      simulationDays,
      scalingVariable,
      totalPrizes,
      dailyProbWin,
      tierPrizesAfterGas,
      tierNumPrizes,
      maxPrizes
    );
    // log each simulation
    // console.log(winnings);
    droppedNumber = winnings[3];
    droppedTotal += droppedNumber;
    claimableAmount = winnings[0];
    claimable += claimableAmount;
    firstPrizeDayTotal += winnings[4];
    if (claimableAmount < min) {
      min = claimableAmount;
    }
    if (claimableAmount > max) {
      max = claimableAmount;
    }
  }
  tierString = "";
  for (x in tierNumPrizes) {
    tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
  }
  // console.log("prize tiering: ", tierString);
  // console.log(
  //   depositAmount,
  //   " deposited for ",
  //   simulationDays,
  //   " days with gas cost to claim of ",
  //   gasToClaim
  // );
  // console.log("unluckiest player claimable: ", min.toFixed());
  // console.log("luckiest player claimable: ", max.toFixed());

  let annualized = (365 / simulationDays) * 100;
  let averageClaimable = claimable / simulationRuns;
  let averageApr = annualized * (claimable / simulationRuns / depositAmount);
  let unluckyApr = annualized * (min / depositAmount);
  let luckyApr = annualized * (max / depositAmount);

  console.log(
    "average claimable: ",
    averageClaimable.toFixed(),
    " ",
    averageApr.toFixed(2),
    "% APR"
  );
  // console.log("prizes dropped per player", droppedTotal / simulationRuns);
  // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
  // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
  // console.dir(prizeResults, { depth: null });

  // more than 100 items
  // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

  // example ascii chart
  // console.log (asciichart.plot (prizeResults,{height:30}))
  let results = {
    average: averageApr.toFixed(2),
    unlucky: unluckyApr.toFixed(2),
    lucky: luckyApr.toFixed(2),
    firstPrizeDay: firstPrizeDayTotal / simulationRuns
  };
  return results;
}



async function optionB(depositAmount, removedVar, gasToClaim) {

  let tierNumPrizes = [1, 3, 12, 48, 192, 3072]; // option A

  let tierPrizes = [1500, 200, 50, 10, 5, 1]; // option A

  let totalPrizeValue = 0;
  let totalPrizes = 0;
  let gasCost = 0;

  let scalingVariable = scalingFunction(depositAmount)

  for (x = 0; x < tierNumPrizes.length; x++) {
    totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
    if (tierNumPrizes[x] * tierPrizes[x] > 0) {
      totalPrizes += tierNumPrizes[x];
    }
  }
  console.log(totalPrizes)
  console.log(totalPrizeValue)
  let tvl = await tvlActive()
  tvl = tvl.total;
  console.log(tvl)
  const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

  // console.log("total prize value: ", totalPrizeValue);
  // console.log("total number of prizes: ", totalPrizes);

  let tierPrizesAfterGas = [];

  for (x in tierPrizes) {
    let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

    tierPrizesAfterGas.push(prizeVal);
  }

  let claimable = 0;
  let winnings = 0;
  let min = depositAmount;
  let max = 0;
  let claimableAmount = 0;
  let droppedTotal = 0;
  let firstPrizeDayTotal = 0;
  for (x = 0; x < simulationRuns; x++) {
    winnings = calculateWinnings(
      depositAmount,
      simulationDays,
      scalingVariable,
      totalPrizes,
      dailyProbWin,
      tierPrizesAfterGas,
      tierNumPrizes,
      maxPrizes
    );
    // log each simulation
    // console.log(winnings);
    droppedNumber = winnings[3];
    droppedTotal += droppedNumber;
    claimableAmount = winnings[0];
    claimable += claimableAmount;
    firstPrizeDayTotal += winnings[4];
    if (claimableAmount < min) {
      min = claimableAmount;
    }
    if (claimableAmount > max) {
      max = claimableAmount;
    }
  }
  tierString = "";
  for (x in tierNumPrizes) {
    tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
  }
  // console.log("prize tiering: ", tierString);
  // console.log(
  //   depositAmount,
  //   " deposited for ",
  //   simulationDays,
  //   " days with gas cost to claim of ",
  //   gasToClaim
  // );
  // console.log("unluckiest player claimable: ", min.toFixed());
  // console.log("luckiest player claimable: ", max.toFixed());

  let annualized = (365 / simulationDays) * 100;
  let averageClaimable = claimable / simulationRuns;
  let averageApr = annualized * (claimable / simulationRuns / depositAmount);
  let unluckyApr = annualized * (min / depositAmount);
  let luckyApr = annualized * (max / depositAmount);

  console.log(
    "average claimable: ",
    averageClaimable.toFixed(),
    " ",
    averageApr.toFixed(2),
    "% APR"
  );
  // console.log("prizes dropped per player", droppedTotal / simulationRuns);
  // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
  // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
  // console.dir(prizeResults, { depth: null });

  // more than 100 items
  // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

  // example ascii chart
  // console.log (asciichart.plot (prizeResults,{height:30}))
  let results = {
    average: averageApr.toFixed(2),
    unlucky: unluckyApr.toFixed(2),
    lucky: luckyApr.toFixed(2),
    firstPrizeDay: firstPrizeDayTotal / simulationRuns
  };
  return results;
}


// simulateApy(5000,28000000,.05).then(apy => console.log("finished"))
