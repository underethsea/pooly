

const dotenv = require("dotenv");
dotenv.config();

const fetch = require("cross-fetch")

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
      let ethGas = await fetch(
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
        process.env.ETHERSCAN_KEY
      );
      ethGas = await ethGas.json();
      let gas = {
        safe: ethGas.result.SafeGasPrice,
        propose: ethGas.result.ProposeGasPrice,
        fast: ethGas.result.FastGasPrice,
      };
      return "ETH GAS ||    " + gas.safe + " / " + gas.propose + " / " + gas.fast;
    }
    {
      return "Chain ID not setup";
    }
  }
  module.exports.Gas = gas