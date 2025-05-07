const fetch = require("cross-fetch")
const emoji  = require("./emoji.js")
async function wins(address) {
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
      let optimismWins = {};
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
 try {
        optimismWins = drawResult.filter((word) => word.network === "optimism");
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
if (optimismWins.length > 0) {
        let winsCount = 0;
        winsString += "    " + emoji("optimism");
        optimismWins.forEach((entry) => {
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
if(ethereumWins.length <1 && optimismWins.length <1 && avalancheWins.length <1 && polygonWins.length < 1) {winsString+=" No wins yet my friend"}
      return winsString;
    } catch (error) {
      console.log("=wins error, address" + address + " " + error);
      return "Could not find that one friend. Try `=wins <address>`";
    }
  }
  module.exports.Wins = wins
