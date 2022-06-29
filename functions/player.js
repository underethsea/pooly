
const {CONTRACTS}=require("../constants/contracts.js")
const fetch = require("cross-fetch")
const { Usdc } = require("./usdc.js")
const { Commas } = require("./commas.js")
const emoji = require("./emoji.js")
const ethers = require("ethers")
const { DelegatedBalance } = require("./delegatedBalance.js")

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
        CONTRACTS.TICKET.POLYGON.balanceOf(address),
        CONTRACTS.TICKET.AVALANCHE.balanceOf(address),
        CONTRACTS.TICKET.POLYGON.getAverageBalanceBetween(
          address,
          ticketStartTimestamp,
          currentTimestamp
        ),
        CONTRACTS.TICKET.AVALANCHE.getAverageBalanceBetween(
          address,
          avaxTicketStartTimestamp,
          currentTimestamp
        ),
        CONTRACTS.TICKET.ETHEREUM.getAverageBalanceBetween(
          address,
          ticketStartTimestamp,
          currentTimestamp
        ),
        fetch(url),
      ]);
      let balanceEthereum = await CONTRACTS.TICKET.ETHEREUM.balanceOf(address);
      let polygonDelegatedBalance = await DelegatedBalance(address, 3);
  
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
            Commas(totalClaimable) +
            "    => " +
            apr +
            "% APR";
          // nAverage Balance " + emoji("usdc") + " \ \ " + Commas(averageBalance)
        }
      }
      // console.log("baLANCE REMAINING: ",balanceRemaining)
      // console.log("polygon delegate balance: ",polygonDelegatedBalance)
  
      if (balanceRemaining > 1) {
        withdrawString +=
          "\n Tickets Held" + emoji("usdc") + " " + Commas(balanceRemaining);
      }
      if (polygonDelegatedBalance > balanceRemaining) {
        withdrawString +=
          "\n Tickets + Delegation " +
          emoji("usdc") +
          " " +
          Commas(parseFloat(polygonDelegatedBalance));
      }
  
      playerDataAvalanche = playerData.filter(function (entry) {
        return entry.network === "avalanche";
      });
  
      let experienceAvalanche = playerDataAvalanche.length;
      let balanceRemainingAvalanche = parseFloat(
        ethers.utils.formatUnits(balanceAvalanche, 6)
      );
      let avalancheDelegatedBalance = await DelegatedBalance(address, 4);
  
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
            Commas(totalClaimable) +
            "    => " +
            aprAvax +
            "% APR";
          // Average Balance " + emoji("usdc") + " \ \ " + Commas(averageBalanceAvalanche)
        }
      }
  
      if (balanceRemainingAvalanche > 1) {
        withdrawString +=
          "\n Tickets Held " +
          emoji("usdc") +
          " " +
          Commas(balanceRemainingAvalanche);
      }
      if (avalancheDelegatedBalance > balanceRemainingAvalanche) {
        withdrawString +=
          "\nTickets + Delegation " +
          emoji("usdc") +
          " " +
          Commas(parseFloat(avalancheDelegatedBalance));
      }
  
      playerDataEthereum = playerData.filter(function (entry) {
        return entry.network === "ethereum";
      });
  
      let experienceEthereum = playerDataEthereum.length;
      let balanceRemainingEthereum = parseFloat(
        ethers.utils.formatUnits(balanceEthereum, 6)
      );
      let DelegatedBalanceEthereum = await DelegatedBalance(address, 1);
  
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
            Commas(totalClaimable) +
            "    => " +
            apr +
            "% APR\nAverage Balance " +
            emoji("usdc") +
            "   " +
            Commas(averageBalanceEthereum);
        }
      }
  
      if (balanceRemainingEthereum > 1) {
        withdrawString +=
          "\n Current Balance " +
          emoji("usdc") +
          " " +
          Commas(balanceRemainingEthereum);
      }
      if (DelegatedBalanceEthereum > balanceRemainingEthereum) {
        withdrawString +=
          "\nDelegated Balance " +
          emoji("usdc") +
          " " +
          Commas(parseFloat(DelegatedBalanceEthereum));
      }
    } catch (error) {
      console.log(error);
    }
    return withdrawString;
  }
  module.exports.Player = player
