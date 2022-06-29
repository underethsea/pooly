
const dotenv = require("dotenv");
dotenv.config();
const pgp = require("pg-promise")(/* initialization options */);

// birdCALL ------------------------------------------->>>>>>>>>>> DM WALLET ALERTS
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
  module.exports = async function RemoveWallet(discord, wallet) {
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
  
  exports.module = async function AddWallet(discord, wallet) {
    try {
      let user = await getUser(discord);
      if (user.length > 4) {
        return "You have hit the maximum of 5 wallets";
      }
      let polygonDelegatedBalance = await delegatedBalance(wallet, 3)
      let avalancheDelegatedBalance = await delegatedBalance(wallet, 4)
      let ethereumDelegatedBalance = await delegatedBalance(wallet, 1)
      polygonDelegatedBalance = parseFloat(polygonDelegatedBalance)
      avalancheDelegatedBalance = parseFloat(avalancheDelegatedBalance)
      ethereumDelegatedBalance = parseFloat(ethereumDelegatedBalance)
      let totalBalance = polygonDelegatedBalance + avalancheDelegatedBalance + ethereumDelegatedBalance
      if (totalBalance > 3) {
        let queryAddWallet =
          "INSERT INTO addresses(DISCORD,WALLET) values('" +
          discord +
          "','" +
          wallet +
          "');";
        //   console.log("adding: ",queryAddWallet)
        let addWallet = await db.any(queryAddWallet);
        return "Wallet `" + wallet + "` added!";
      } else { return "No ticket balance found on address `" + wallet + "`" }
    } catch (error) {
      console.log(error);
      return "Could not add wallet friend, sorry!";
    }
  }
  exports.module = async function PlayerWallets(discord) {
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