const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const pgp = require("pg-promise")(/* initialization options */);
const fs = require("fs");
const ethers = require("ethers");
const fetch = require("cross-fetch");
const Discord = require("discord.js");
const { ADDRESS } = require("./address.js");
const {ABI} = require("./abi.js")
const { MessageEmbed } = require("discord.js");
dotenv.config();
const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});
var emoji = require("./functions/emoji.js");

var calculateWinnings = require("./functions/simulate.js");

const ethereumEndpoint =
  "https://mainnet.infura.io/v3/" + process.env.ETHEREUM_KEY;
const polygonEndpoint =
  "https://polygon-mainnet.g.alchemy.com/v2/" + process.env.POLYGON_KEY;
// const avalancheEndpoint = "https://api.avax.network/ext/bc/C/rpc";
const avalancheEndpoint = "https://rpc.ankr.com/avalanche";
const polygonProvider = new ethers.providers.JsonRpcProvider(polygonEndpoint);
const avalancheProvider = new ethers.providers.JsonRpcProvider(
  avalancheEndpoint
);
const ethereumProvider = new ethers.providers.JsonRpcProvider(ethereumEndpoint);

// const polygonAaveIncentives = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
// const ethereumAaveIncentives = "0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5";
// const avalancheAaveIncentives = "0x01D83Fe6A10D2f2B7AF17034343746188272cAc9";

const ethereumPrizeTier = "0xdD1cba915Be9c7a1e60c4B99DADE1FC49F67f80D";

const execChannelId = "895375558966390834";
const botChannelId = "878246045048520704";
const botChannelTestId = "932504732818362378";
const winnersChannelId = "904034122903748659";
const claimsChannelId = "917547918225981503";
const turnstileChannelId = "943062268139175957";

const polygonTicketContract = new ethers.Contract(
  ADDRESS.POLYGON.TICKET,
  ABI.TICKET,
  polygonProvider
);

const prizeTierContract = new ethers.Contract(
  ADDRESS.ETHEREUM.PRIZETIER,
  ABI.PRIZETIER,
  ethereumProvider
);
const avalancheTicketContract = new ethers.Contract(
  ADDRESS.AVALANCHE.TICKET,
  ABI.TICKET,
  avalancheProvider
);
const ethereumTicketContract = new ethers.Contract(
  ADDRESS.ETHEREUM.TICKET,
  ABI.TICKET,
  ethereumProvider
);


const polygonAaveContract = new ethers.Contract(
  ADDRESS.POLYGON.AAVETOKEN,
  ABI.AAVE,
  polygonProvider
);
const avalancheAaveContract = new ethers.Contract(
  ADDRESS.AVALANCHE.AAVETOKEN,
  ABI.AAVE,
  avalancheProvider
);
const ethereumAaveContract = new ethers.Contract(
  ADDRESS.ETHEREUM.AAVETOKEN,
  ABI.AAVE,
  ethereumProvider
);

const polygonAaveIncentivesContract = new ethers.Contract(
  ADDRESS.POLYGON.AAVEINCENTIVES,
  ABI.AAVEINCENTIVES,
  polygonProvider
);
const avalancheAaveIncentivesContract = new ethers.Contract(
  ADDRESS.AVALANCHE.AAVEINCENTIVES,
  ABI.AAVEINCENTIVES,
  avalancheProvider
);
const ethereumAaveIncentivesContract = new ethers.Contract(
  ADDRESS.ETHEREUM.AAVEINCENTIVES,
  ABI.AAVEINCENTIVES,
  ethereumProvider
);

const polygonWithdrawFilter = {
  address: ADDRESS.POLYGON.POOL,
  topics: [
    ethers.utils.id("Withdrawal(address,address,address,uint256,uint256)"),
  ],
};
const polygonDepositFilter = {
  address: ADDRESS.POLYGON.POOL,
  topics: [ethers.utils.id("Deposited(address,address,address,uint256)")],
};
const avalancheWithdrawFilter = {
  address: ADDRESS.AVALANCHE.POOL,
  topics: [
    ethers.utils.id("Withdrawal(address,address,address,uint256,uint256)"),
  ],
};
const avalancheDepositFilter = {
  address: ADDRESS.AVALANCHE.POOL,
  topics: [ethers.utils.id("Deposited(address,address,address,uint256)")],
};
const polygonClaimFilter = {
  address: ADDRESS.POLYGON.DISTRIBUTOR,
  topics: [ethers.utils.id("ClaimedDraw(address,uint32,uint256)")],
};
const avalancheClaimFilter = {
  address: ADDRESS.AVALANCHE.DISTRIBUTOR,
  topics: [ethers.utils.id("ClaimedDraw(address,uint32,uint256)")],
};

// birdCALL ------------------------------------------->>>>>>>>>>> ALERTS
// ......................................................................
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

const cn = {
  host: "localhost", // server name or IP address;
  port: 5432,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
};
const db = pgp(cn);

async function getUser(discord) {
  let queryUser =
    "SELECT discord,wallet FROM addresses WHERE discord='" + discord + "';";
  try {
    let user = await db.any(queryUser);
    return user;
  } catch (error) {
    return {};
  }
}
async function removeWallet(discord, wallet) {
  try {
    let queryAddWallet =
      "DELETE FROM addresses WHERE DISCORD='" +
      discord +
      "' AND WALLET='" +
      wallet +
      "';";
    //   console.log("deleting: ",queryAddWallet)
    let addWallet = await db.any(queryAddWallet);
    return "Wallet `" + wallet + "` deleted!";
  } catch (error) {
    console.log(error);
    return "Could not remove wallet friend, sorry!";
  }
}

async function addWallet(discord, wallet) {
  try {
    let user = await getUser(discord);
    if (user.length > 9) {
      return "You have hit the maximum of 10 wallets";
    }
    let queryAddWallet =
      "INSERT INTO addresses(DISCORD,WALLET) values('" +
      discord +
      "','" +
      wallet +
      "');";
    //   console.log("adding: ",queryAddWallet)
    let addWallet = await db.any(queryAddWallet);
    return "Wallet `" + wallet + "` added!";
  } catch (error) {
    console.log(error);
    return "Could not add wallet friend, sorry!";
  }
}
async function playerWallets(discord) {
  try {
    let playerWalletsQuery =
      "SELECT DISCORD,WALLET from addresses WHERE DISCORD ='" + discord + "';";
    let playerWalletsReturn = await db.any(playerWalletsQuery);
    //   console.log(playerWalletsReturn)
    let count = 1;
    let walletsString = "";
    playerWalletsReturn.forEach((x) => {
      walletsString += count + ":   `" + x.wallet + "`\n";
      count += 1;
    });
    if (walletsString === "") {
      return "Could not find any wallets. try `=add <wallet address>`";
    } else {
      return walletsString;
    }
  } catch (error) {
    console.log(error);
    return "Could not find any wallets. try `=add <wallet address>`";
  }
}

async function prizes(address, draw) {
  try {
    // console.log("address", address);
    // console.log("draw", draw);
    drawId = parseInt(draw);
    let drawFetch = await fetch(
      "https://poolexplorer.xyz/player?address=" + address
    );
    let drawResult = await drawFetch.json();
    drawResult = drawResult.filter((draw) => draw.draw_id === drawId);
    let polygonWins = {};
    let avalancheWins = {};
    let ethereumWins = {};
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

    let prizeString = "PRIZES WON || `DRAW " + draw + "`  ";
    try {
      if (polygonWins.claimable_prizes.length === 0) {
        return "No claimable prizes for draw " + drawId;
      } else if (polygonWins.claimable_prizes.length === 1) {
        prizeString += "    " + emoji(polygonWins.network);
        prizeString += "   " + fourteenUsdc(polygonWins.claimable_prizes[0]);
      } else {
        prizeString += "    " + emoji(polygonWins.network);

        for (doubleWin of polygonWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin);
        }
      }
    } catch (error) {}
    try {
      if (avalancheWins.claimable_prizes.length === 0) {
        return "No claimable prizes for draw " + drawId;
      } else if (avalancheWins.claimable_prizes.length === 1) {
        prizeString += "    " + emoji(avalancheWins.network);
        prizeString += "   " + fourteenUsdc(avalancheWins.claimable_prizes[0]);
      } else {
        prizeString += "    " + emoji(avalancheWins.network);

        for (doubleWin of avalancheWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin);
        }
      }
    } catch (error) {}
    try {
      if (ethereumWins.claimable_prizes) {
        if (ethereumWins.claimable_prizes.length === 0) {
          return "No claimable prizes for draw " + drawId;
        } else if (ethereumWins.claimable_prizes.length === 1) {
          prizeString += "    " + emoji(ethereumWins.network);
          prizeString += "   " + fourteenUsdc(ethereumWins.claimable_prizes[0]);
        } else {
          prizeString += "    " + emoji(ethereumWins.network);

          for (doubleWin of ethereumWins.claimable_prizes) {
            prizeString += "   " + fourteenUsdc(doubleWin);
          }
        }
      }
    } catch (error) {}
    return prizeString;
  } catch (error) {
    console.log(error);
  }
}
const commas = (number) => {
  let fixed = number.toFixed();
  return fixed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const usdc = (amount) => {
  return amount / 1e6;
};
async function gas(chain) {
  if (chain === "137" || chain === "poly" || chain === "polygon") {
    let polyScanGas = await fetch(
      "https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=" +
        process.env.POLYGONSCAN_KEY
    );
    polyScanGas = await polyScanGas.json();
    let gas = {
      safe: polyScanGas.result.SafeGasPrice,
      propose: polyScanGas.result.ProposeGasPrice,
      fast: polyScanGas.result.FastGasPrice,
      price: polyScanGas.result.UsdPrice,
    };
    return (
      "POLY GAS ||    " +
      gas.safe +
      " / " +
      gas.propose +
      " / " +
      gas.fast +
      "    MATIC PRICE: " +
      gas.price
    );
  } else if (
    chain === "1" ||
    chain === "main" ||
    chain === "eth" ||
    chain === "ethereum"
  ) {
    let polyScanGas = await fetch(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
        process.env.ETHERSCAN_KEY
    );
    polyScanGas = await polyScanGas.json();
    let gas = {
      safe: polyScanGas.result.SafeGasPrice,
      propose: polyScanGas.result.ProposeGasPrice,
      fast: polyScanGas.result.FastGasPrice,
    };
    return "ETH GAS ||    " + gas.safe + " / " + gas.propose + " / " + gas.fast;
  }
  {
    return "Chain ID not setup";
  }
}
async function delegatedBalance(address, network) {
  try {
    if (network === 1) {
      contract = ethereumTicketContract;
    }
    if (network === 3) {
      contract = polygonTicketContract;
    }
    if (network === 4) {
      contract = avalancheTicketContract;
    }
    let nowTime = parseInt(Date.now() / 1000);
    let balance = await contract.getBalanceAt(address, nowTime);
    balance = ethers.utils.formatUnits(balance, 6);
    return balance;
  } catch (error) {
    console.log(error);
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
        "    POLY: " + emoji("usdc") + " " + commas(parseFloat(polygonBalance));
    }
    if (avalancheBalance > 0) {
      ukraineString +=
        "    AVAX: " +
        emoji("usdc") +
        " " +
        commas(parseFloat(avalancheBalance));
    }
    if (ethereumBalance > 0) {
      ukraineString +=
        "    ETH: " + emoji("usdc") + " " + commas(parseFloat(ethereumBalance));
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
    commas(totalDepositors) +
    "    POLY: " +
    commas(polyCount) +
    "    AVAX: " +
    commas(avaxCount) +
    "    ETH: " +
    commas(ethCount)
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
    polygonAaveIncentivesContract.getUserUnclaimedRewards(
      ADDRESS.POLYGON.YIELDSOURCE
    ),
    avalancheAaveIncentivesContract.getUserUnclaimedRewards(
      ADDRESS.AVALANCHE.YIELDSOURCE
    ),
    ethereumAaveIncentivesContract.getUserUnclaimedRewards(
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

async function tvlTotal() {
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
  return total;
}
async function apr() {
  try {
    let tvlNow = await tvlActive();
    tvlNow = tvlNow.total;
    let annualPrize = await prizePerDay();
    annualPrize = annualPrize * 365;
    let aprAmount = (annualPrize / tvlNow) * 100;
    return aprAmount;
  } catch (error) {
    console.log(error);
  }
}
async function prizePerDay() {
  try {
    let newestDrawId = await prizeTierContract.getNewestDrawId();
    let prizeTier = await prizeTierContract.getPrizeTier(newestDrawId);
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
      polygonTicketContract.getTotalSupplyAt(timeNow),
      avalancheTicketContract.getTotalSupplyAt(timeNow),
      ethereumTicketContract.getTotalSupplyAt(timeNow),
    ]);
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
    .setTitle(" V4 TVL Total " + emoji("usdc") + " " + commas(total))
    .setDescription(
      emoji("polygon") +
        " Polygon " +
        commas(polygonAaveBalance) +
        "\n" +
        emoji("ethereum") +
        " Ethereum " +
        commas(ethereumAaveBalance) +
        "\n" +
        emoji("avalanche") +
        " Avalanche " +
        commas(avalancheAaveBalance)
    );
  return tvl;
}
async function flushable() {
  let [
    polygonTotalSupply,
    avalancheTotalSupply,
    ethereumTotalSupply,
    polygonAaveBalance,
    avalancheAaveBalance,
    ethereumAaveBalance,
  ] = await Promise.all([
    polygonTicketContract.totalSupply(),
    avalancheTicketContract.totalSupply(),
    ethereumTicketContract.totalSupply(),
    polygonAaveContract.balanceOf(ADDRESS.POLYGON.YIELDSOURCE),
    avalancheAaveContract.balanceOf(ADDRESS.AVALANCHE.YIELDSOURCE),
    ethereumAaveContract.balanceOf(ADDRESS.ETHEREUM.YIELDSOURCE),
  ]);
  polygonTotalSupply = usdc(polygonTotalSupply);
  avalancheTotalSupply = usdc(avalancheTotalSupply);
  ethereumTotalSupply = usdc(ethereumTotalSupply);

  polygonAaveBalance = usdc(polygonAaveBalance);
  avalancheAaveBalance = usdc(avalancheAaveBalance);
  ethereumAaveBalance = usdc(ethereumAaveBalance);
  // console.log(ethereumTotalSupply);
  // console.log(ethereumAaveBalance);

  let polygonFlushable = polygonAaveBalance - polygonTotalSupply;
  let avalancheFlushable = avalancheAaveBalance - avalancheTotalSupply;
  let ethereumFlushable = ethereumAaveBalance - ethereumTotalSupply;

  let flushable =
    commas(polygonFlushable) +
    "   ETH: " +
    commas(ethereumFlushable) +
    "    AVAX: " +
    commas(avalancheFlushable);
  return "FLUSHABLE YIELD ||    POLY: " + flushable;
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
    const prizeTier = [3, 48, 192, 768];
    let tierPrizes = [1000, 50, 10, 5];
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

async function player(address) {
  let withdrawString = "";
  let gotOne = 0;
  try {
    const currentTimestamp = parseInt(Date.now() / 1000);
    const ticketStartTimestamp = 1634184538;
    const avaxTicketStartTimestamp = 1640043176;
    let timeElapsed = 31536000 / (currentTimestamp - ticketStartTimestamp);
    timeElapsed = timeElapsed * 100;
    let timeElapsedAvax =
      31536000 / (currentTimestamp - avaxTicketStartTimestamp);
    timeElapsedAvax = timeElapsedAvax * 100;

    let url = "https://poolexplorer.xyz/player?address=" + address;
    let [
      balance,
      balanceAvalanche,
      averageBalance,
      averageBalanceAvalanche,
      averageBalanceEthereum,
      playerData,
    ] = await Promise.all([
      polygonTicketContract.balanceOf(address),
      avalancheTicketContract.balanceOf(address),
      polygonTicketContract.getAverageBalanceBetween(
        address,
        ticketStartTimestamp,
        currentTimestamp
      ),
      avalancheTicketContract.getAverageBalanceBetween(
        address,
        avaxTicketStartTimestamp,
        currentTimestamp
      ),
      ethereumTicketContract.getAverageBalanceBetween(
        address,
        ticketStartTimestamp,
        currentTimestamp
      ),
      fetch(url),
    ]);
    let balanceEthereum = await ethereumTicketContract.balanceOf(address);
    let polygonDelegatedBalance = await delegatedBalance(address, 3);

    // console.log("balance ",balance)
    playerData = await playerData.json();
    playerDataPolygon = playerData.filter(function (entry) {
      return entry.network === "polygon";
    });

    let experience = playerDataPolygon.length;
    let balanceRemaining = parseFloat(ethers.utils.formatUnits(balance, 6));

    if (experience > 0) {
      gotOne = 1;
      withdrawString +=
        emoji("polygon") +
        " Player [" +
        address.substring(0, 10) +
        "](" +
        "https://polygonscan.com/address/" +
        address +
        ")";

      withdrawString += "   XP  " + experience + " draws ";

      let totalClaimable = 0;
      for (let x of playerDataPolygon) {
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
        averageBalance = averageBalance / 1e6;
        let apr = parseFloat(
          (totalClaimable / averageBalance) * timeElapsed
        ).toFixed();
        withdrawString +=
          "\nWon " +
          emoji("usdc") +
          " " +
          commas(totalClaimable) +
          "    => " +
          apr +
          "% APR";
        // nAverage Balance " + emoji("usdc") + " \ \ " + commas(averageBalance)
      }
    }
    // console.log("baLANCE REMAINING: ",balanceRemaining)
    // console.log("polygon delegate balance: ",polygonDelegatedBalance)

    if (balanceRemaining > 1) {
      withdrawString +=
        "\n Tickets Held" + emoji("usdc") + " " + commas(balanceRemaining);
    }
    if (polygonDelegatedBalance > balanceRemaining) {
      withdrawString +=
        "Tickets + Delegation " +
        emoji("usdc") +
        " " +
        commas(parseFloat(polygonDelegatedBalance));
    }

    playerDataAvalanche = playerData.filter(function (entry) {
      return entry.network === "avalanche";
    });

    let experienceAvalanche = playerDataAvalanche.length;
    let balanceRemainingAvalanche = parseFloat(
      ethers.utils.formatUnits(balanceAvalanche, 6)
    );
    let avalancheDelegatedBalance = await delegatedBalance(address, 4);

    if (experienceAvalanche > 0) {
      if (gotOne === 1) {
        withdrawString += "\n \n";
      }
      withdrawString +=
        emoji("avalanche") +
        " Player [" +
        address.substring(0, 10) +
        "](" +
        "https://snowtrace.io/address/" +
        address +
        ")";

      withdrawString += "   XP  " + experienceAvalanche + " draws ";

      totalClaimable = 0;
      for (let x of playerDataAvalanche) {
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
        averageBalanceAvalanche = averageBalanceAvalanche / 1e6;
        let aprAvax = parseFloat(
          (totalClaimable / averageBalanceAvalanche) * timeElapsedAvax
        ).toFixed();
        withdrawString +=
          "\nWon " +
          emoji("usdc") +
          " " +
          commas(totalClaimable) +
          "    => " +
          aprAvax +
          "% APR";
        // Average Balance " + emoji("usdc") + " \ \ " + commas(averageBalanceAvalanche)
      }
    }

    if (balanceRemainingAvalanche > 1) {
      withdrawString +=
        "\n Tickets Held " +
        emoji("usdc") +
        " " +
        commas(balanceRemainingAvalanche);
    }
    if (avalancheDelegatedBalance > balanceRemainingAvalanche) {
      withdrawString +=
        "\nTickets + Delegation " +
        emoji("usdc") +
        " " +
        commas(parseFloat(avalancheDelegatedBalance));
    }

    playerDataEthereum = playerData.filter(function (entry) {
      return entry.network === "ethereum";
    });

    let experienceEthereum = playerDataEthereum.length;
    let balanceRemainingEthereum = parseFloat(
      ethers.utils.formatUnits(balanceEthereum, 6)
    );
    let delegatedBalanceEthereum = await delegatedBalance(address, 1);

    if (experienceEthereum > 0) {
      if (gotOne === 1) {
        withdrawString += "\n \n";
      }
      withdrawString +=
        emoji("ethereum") +
        " Player [" +
        address.substring(0, 10) +
        "](" +
        "https://etherscan.io/address/" +
        address +
        ")";

      withdrawString += "   XP  " + experienceEthereum + " draws ";

      totalClaimable = 0;
      for (let x of playerDataEthereum) {
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
        averageBalanceEthereum = averageBalanceEthereum / 1e6;
        let apr = parseFloat(
          (totalClaimable / averageBalanceEthereum) * timeElapsed
        ).toFixed();
        withdrawString +=
          "\nWon " +
          emoji("usdc") +
          " " +
          commas(totalClaimable) +
          "    => " +
          apr +
          "% APR\nAverage Balance " +
          emoji("usdc") +
          "   " +
          commas(averageBalanceEthereum);
      }
    }

    if (balanceRemainingEthereum > 1) {
      withdrawString +=
        "\n Current Balance " +
        emoji("usdc") +
        " " +
        commas(balanceRemainingEthereum);
    }
    if (delegatedBalanceEthereum > balanceRemainingEthereum) {
      withdrawString +=
        "\nDelegated Balance " +
        emoji("usdc") +
        " " +
        commas(parseFloat(delegatedBalanceEthereum));
    }
  } catch (error) {
    console.log(error);
  }
  return withdrawString;
}

async function liquidity() {
  try {
    console.log("liquidity function");
    let [polygonLiquidity, avalancheLiquidity, ethereumLiquidity] =
      await Promise.all([
        polygonTicketContract.balanceOf(ADDRESS.POLYGON.LIQUIDITY),
        avalancheTicketContract.balanceOf(ADDRESS.AVALANCHE.LIQUIDITY),
        ethereumTicketContract.balanceOf(ADDRESS.ETHEREUM.LIQUIDITY),
      ]);
    let liquidityString =
      commas(usdc(polygonLiquidity)) +
      "    ETH: " +
      commas(usdc(ethereumLiquidity)) +
      "    AVAX: " +
      commas(usdc(avalancheLiquidity));
    // console.log("liquidity check: ", liquidityString);
    return "PRIZE LIQUIDITY ||    POLY: " + liquidityString;
    // When the client is ready, run this code (only once)
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
async function wins(address) {
  try {
    let fetchAddress = "https://poolexplorer.xyz/player?address=" + address;
    let drawFetch = await fetch(fetchAddress);
    // console.log(fetchAddress);
    let drawResult = await drawFetch.json();

    // temporarrry
    drawResult = drawResult.filter(function (entry) {
      return entry.network === "polygon";
    });
    // console.log(drawResult[0]);
    // console.log(drawResult.length);
    let winString = "WINS || ";
    for (
      let entry = 0;
      entry < drawResult.length;
      entry += 1 // console.log("0", drawResult[0]); // console.log("entry number", entry);
    ) // console.log("entry array", drawResult[entry]);
    // console.log(drawResult[entry].claimable_prizes[0]);
    {
      if (parseFloat(drawResult[entry].claimable_prizes[0]) !== null) {
        winString +=
          "   " +
          emoji(drawResult[entry].network) +
          " DRAW " +
          drawResult[entry].draw_id +
          "";
      }
    }
    if (winString !== "WINS || ") {
      return winString;
    } else {
      return "No wins yet";
    }
  } catch (error) {
    console.log(error);
    return "Can't find that one friend.";
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
    // return (
    //   "LUCKYIEST ||    DRAW " +
    //   draw +
    //   "   " +
    //   emoji(luckyResult[0].n) +
    //   " " +
    //   luckyResult[0].a +
    //   " WON: " +
    //   luckyResult[0].w +
    //   " BALANCE: " +
    //   parseInt(luckyResult[0].g)
    // );
    return luckyResult;
  } catch (error) {
    console.log(error);
  }
}

async function luckyg(draw) {
  try {
    let drawFetch = await fetch("https://poolexplorer.xyz/draw" + draw);
    let drawResult = await drawFetch.json();
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
    // return (
    //   "LUCKYIEST ||    DRAW " +
    //   draw +
    //   "   " +
    //   emoji(luckyResult[0].n) +
    //   " " +
    //   luckyResult[0].a +
    //   " WON: " +
    //   luckyResult[0].w +
    //   " BALANCE: " +
    //   parseInt(luckyResult[0].g)
    // );
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
async function prizes(address, draw) {
  try {
    // console.log("address", address);
    // console.log("draw", draw);
    drawId = parseInt(draw);
    let drawFetch = await fetch(
      "https://poolexplorer.xyz/player?address=" + address
    );
    let drawResult = await drawFetch.json();
    drawResult = drawResult.filter((draw) => draw.draw_id === drawId);
    let polygonWins = {};
    let avalancheWins = {};
    let ethereumWins = {};
    console.log(drawResult, " resultlsjlkjsdf");
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

    let prizeString = "PRIZES WON || `DRAW " + draw + "`  ";
    try {
      if (polygonWins.claimable_prizes.length === 0) {
        return "No claimable prizes for draw " + drawId;
      } else if (polygonWins.claimable_prizes.length === 1) {
        prizeString += "    " + emoji(polygonWins.network);
        prizeString += "   " + fourteenUsdc(polygonWins.claimable_prizes[0]);
      } else {
        prizeString += "    " + emoji(polygonWins.network);

        for (doubleWin of polygonWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin);
        }
      }
    } catch (error) {}
    try {
      if (avalancheWins.claimable_prizes.length === 0) {
        return "No claimable prizes for draw " + drawId;
      } else if (avalancheWins.claimable_prizes.length === 1) {
        prizeString += "    " + emoji(avalancheWins.network);
        prizeString += "   " + fourteenUsdc(avalancheWins.claimable_prizes[0]);
      } else {
        prizeString += "    " + emoji(avalancheWins.network);

        for (doubleWin of avalancheWins.claimable_prizes) {
          prizeString += "   " + fourteenUsdc(doubleWin);
        }
      }
    } catch (error) {}
    try {
      if (ethereumWins.claimable_prizes) {
        if (ethereumWins.claimable_prizes.length === 0) {
          return "No claimable prizes for draw " + drawId;
        } else if (ethereumWins.claimable_prizes.length === 1) {
          prizeString += "    " + emoji(ethereumWins.network);
          prizeString += "   " + fourteenUsdc(ethereumWins.claimable_prizes[0]);
        } else {
          prizeString += "    " + emoji(ethereumWins.network);

          for (doubleWin of ethereumWins.claimable_prizes) {
            prizeString += "   " + fourteenUsdc(doubleWin);
          }
        }
      }
    } catch (error) {}
    return prizeString;
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
  polygonProvider.on(polygonDepositFilter, (depositEvent) => {
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
            commas(amount)
        )
        .setDescription(depositString);
      client.channels.cache
        .get(turnstileChannelId)
        .send({ embeds: [depositEmbed] });
    }
  });
  polygonProvider.on(polygonWithdrawFilter, (withdrawEvent) => {
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
              commas(amount)
          )
          .setDescription(withdrawString);

        client.channels.cache
          .get(turnstileChannelId)
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
        polygonTicketContract.balanceOf(address),
        polygonTicketContract.getAverageBalanceBetween(
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

  avalancheProvider.on(avalancheDepositFilter, (depositEvent) => {
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
            commas(amount)
        )
        .setDescription(depositString);
      client.channels.cache
        .get(turnstileChannelId)
        .send({ embeds: [depositEmbed] });
    }
  });
  avalancheProvider.on(avalancheWithdrawFilter, (withdrawEvent) => {
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
              commas(amount)
          )
          .setDescription(withdrawString);

        client.channels.cache
          .get(turnstileChannelId)
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
        polygonTicketContract.balanceOf(address),
        polygonTicketContract.getAverageBalanceBetween(
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
  polygonProvider.on(polygonClaimFilter, (claimEvent) => {
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
          commas(claimAmount)
      )
      .setDescription(claimString);

    client.channels.cache.get(claimsChannelId).send({ embeds: [claimEmbed] });
  });
  avalancheProvider.on(avalancheClaimFilter, (claimEvent) => {
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
          commas(claimAmount)
      )
      .setDescription(claimString);

    client.channels.cache.get(claimsChannelId).send({ embeds: [claimEmbed] });
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
            playerWallets(message.author.id).then((walletsText) => {
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
            removeWallet(user, wallet).then((removeText) => {
              message.author.send(removeText);
            });
          } catch (error) {
            message.author.send("Invalid wallet address.");
          }
        }

        if (message.content.startsWith("=add")) {
          let addQuery = message.content.split(" ");
          wallet = addQuery[1];

          try {
            let q = ethers.utils.getAddress(wallet);
            // check for user limit and existing address
            let user = message.author.id;
            addWallet(user, wallet).then((addText) => {
              message.author.send(addText);
            });
          } catch (error) {
            message.author.send("Invalid wallet address.");
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
          prizes(address, draw).then((prizeText) => {
            message.author.send(prizeText);
          });
        }
        if (message.content.startsWith("=player")) {
          let prizeQuery = message.content.split(" ");
          address = prizeQuery[1];
          player(address).then((playerText) => {
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
              "BALANCE: " + emoji("usdc") + " " + commas(parseFloat(playerText))
            );
          });
        }
        if (message.content.startsWith("=odds")) {
          let oddsQuery = message.content.split(" ");
          amount = oddsQuery[1];
          odds(amount).then((oddsText) => {
            const oddsEmbed = new MessageEmbed()
              .setColor("#0099ff")
              .setTitle("Daily Odds with " + emoji("usdc") + " " + amount)
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
        // if (message.content.startsWith("=simulate")) {
        //   let apyQuery = message.content.split(" ");
        //   amount = apyQuery[1];
        //   if (amount < 2 || amount > 20000000)
        //   {message.author.send("What amount is that friend?")}else{
        //   simulateApy(amount,28000000,.05).then((apyText) => {
        //     message.author.send("100 SIMULATIONS || \ \ \ DEPOSIT: " + amount + " \ \ \  APR: " + apyText.unlucky + "% - " + apyText.lucky + "% \ \ \ AVG: " + apyText.average + "%");
        //   });}
        // }
        if (message.content.startsWith("=wins")) {
          let winsQuery = message.content.split(" ");
          address = winsQuery[1];
          wins2(address).then((winsText) => {
            message.author.send(winsText);
          });
        }
      }
      // if(message.channel.id === winnersChannelId) {
      //   if (message.content.startsWith("=odds")) {
      //     let oddsQuery = message.content.split(" ");
      //     amount = oddsQuery[1]
      //     odds(amount).then((oddsText) => {message.channel.send(oddsText)})
      //  }
      // }
      if (
        message.channel.id === botChannelId ||
        message.channel.id === execChannelId ||
        message.channel.id === botChannelTestId
      ) {
        if (message.content === "=liquidity") {
          liquidity().then((liquidityText) =>
            message.channel.send(liquidityText)
          );
        }
        if (message.content.startsWith("=simulate")) {
          let apyQuery = message.content.split(" ");
          amount = apyQuery[1];
          if (amount < 2 || amount > 20000000) {
            message.reply("What amount is that friend?");
          } else {
            simulateApy(amount, 30000000, 0.05).then((apyText) => {
              let simulateText =
                "<:TokenUSDC:823404729634652220> DEPOSIT `" +
                commas(parseFloat(amount)) +
                "`\n:calendar_spiral: APR Range `" +
                apyText.unlucky +
                "% - " +
                apyText.lucky +
                "%`  \n:scales: Average `" +
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
          prizes(address, draw).then((prizeText) => {
            message.channel.send(prizeText);
          });
        }
        if (message.content === "=apr") {
          apr().then((aprText) => {
            let aprMessage = aprText.toFixed(2);
            const aprEmbed = new MessageEmbed()
              .setColor("#0099ff")
              .setTitle("Current Prize APR")
              .setDescription(":trophy: " + aprMessage + "%");
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
                  commas(tvlActiveAmt.total)
              )
              .setDescription(
                emoji("polygon") +
                  " Polygon " +
                  commas(tvlActiveAmt.polygon) +
                  "\n" +
                  emoji("ethereum") +
                  " Ethereum " +
                  commas(tvlActiveAmt.ethereum) +
                  "\n" +
                  emoji("avalanche") +
                  " Avalanche " +
                  commas(tvlActiveAmt.avalanche)
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
          player(address).then((playerText) => {
            const playerEmbed = new MessageEmbed()
              .setColor("#0099ff")
              .setDescription(playerText);

            message.reply({ embeds: [playerEmbed] });
          });
        }
        if (message.content === "=flushable") {
          flushable().then((flushableText) =>
            message.channel.send(flushableText)
          );
        }
        if (message.content.startsWith("=gas")) {
          let chain = message.content.split(" ");
          chain = chain[1];
          gas(chain).then((gasText) => message.channel.send(gasText));
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
              .setTitle("Daily Odds with " + emoji("usdc") + " " + amount)
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
const tierNumPrizes = [3, 48, 192, 768]; // newly proposed

// const tierPrizes = [2500, 500, 200, 50, 10, 5, 1];
const tierPrizes = [1000, 50, 10, 5]; //newly proposed

async function simulateApy(depositAmount, tvl, gasToClaim) {
  let scalingVariable = 1; // used to make calculating prizes faster as deposit grows
  if (depositAmount > 200) {
    scalingVariable = 2;
  }
  if (depositAmount > 1999) {
    scalingVariable = 5;
  }
  if (depositAmount > 4999) {
    scalingVariable = 10;
  }
  if (depositAmount > 9999) {
    scalingVariable = 20;
  }
  if (depositAmount > 19999) {
    scalingVariable = depositAmount / 400;
  }

  // charts if you wanna get cray cray
  // var asciichart = require ('asciichart')
  let totalPrizeValue = 0;
  let totalPrizes = 0;
  let gasCost = 0;

  for (x = 0; x < tierNumPrizes.length; x++) {
    totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
    if (tierNumPrizes[x] * tierPrizes[x] > 0) {
      totalPrizes += tierNumPrizes[x];
    }
  }
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

// simulateApy(5000,28000000,.05).then(apy => console.log("finished"))
