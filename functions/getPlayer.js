const ethers = require("ethers")
const fetch = require("cross-fetch")
const emoji = require("./emoji.js")
const { CONTRACTS } = require("../constants/contracts.js")

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

module.exports.GetPlayer = getPlayer
module.exports.GetPlayerAvax= getPlayerAvax
