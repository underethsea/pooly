const fetch = require("cross-fetch")
const { emoji } = require("./emoji.js")
const { FourteenUsdc } = require("./fourteenUsdc.js")
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
          prizeString += "   " + FourteenUsdc(polygonWins.claimable_prizes[0]);
        } else {
          prizeString += "    " + emoji(polygonWins.network);
  
          for (doubleWin of polygonWins.claimable_prizes) {
            prizeString += "   " + FourteenUsdc(doubleWin);
          }
        }
      } catch (error) { }
      try {
        if (avalancheWins.claimable_prizes.length === 0) {
          return "No claimable prizes for draw " + drawId;
        } else if (avalancheWins.claimable_prizes.length === 1) {
          prizeString += "    " + emoji(avalancheWins.network);
          prizeString += "   " + FourteenUsdc(avalancheWins.claimable_prizes[0]);
        } else {
          prizeString += "    " + emoji(avalancheWins.network);
  
          for (doubleWin of avalancheWins.claimable_prizes) {
            prizeString += "   " + FourteenUsdc(doubleWin);
          }
        }
      } catch (error) { }
      try {
        if (ethereumWins.claimable_prizes) {
          if (ethereumWins.claimable_prizes.length === 0) {
            return "No claimable prizes for draw " + drawId;
          } else if (ethereumWins.claimable_prizes.length === 1) {
            prizeString += "    " + emoji(ethereumWins.network);
            prizeString += "   " + FourteenUsdc(ethereumWins.claimable_prizes[0]);
          } else {
            prizeString += "    " + emoji(ethereumWins.network);
  
            for (doubleWin of ethereumWins.claimable_prizes) {
              prizeString += "   " + FourteenUsdc(doubleWin);
            }
          }
        }
      } catch (error) { }
      return prizeString;
    } catch (error) {
      console.log(error);
    }
  }
module.exports.Prizes = prizes  