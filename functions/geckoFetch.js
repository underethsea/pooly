const fetch = require("node-fetch");
const geckoPrice = async (tokenID) => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    tokenID +
    "&vs_currencies=usd";
console.log(url)
  try {
    let result = await fetch(url);
    let geckoPrice = await result.json();

    geckoPrice = parseFloat(geckoPrice[tokenID].usd);
    console.log(tokenID, " price ", geckoPrice);
    return geckoPrice;
  } catch (error) {
    console.log(error);
  }
};
module.exports.GeckoPrice = geckoPrice
