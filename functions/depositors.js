
const fetch = require("cross-fetch")
const dotenv = require("dotenv");
dotenv.config();

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
  module.exports.Depositors = depositors