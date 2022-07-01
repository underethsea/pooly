const { Commas } = require("./commas.js")
const { DelegatedBalance } = require("./delegatedBalance.js")
async function ukraine() {
    try {
      let ethereumBalance = await DelegatedBalance(
        "0xb37b3b78022E6964fe80030C9161525880274010",
        1
      );
      let polygonBalance = await DelegatedBalance(
        "0xb37b3b78022E6964fe80030C9161525880274010",
        3
      );
      let avalancheBalance = await DelegatedBalance(
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
  module.exports.Ukraine = ukraine
