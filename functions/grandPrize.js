const fetch = require("cross-fetch")
const { Emoji } = require("./emoji.js")
  async function grandPrize(draw) {
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
            "\n   " + Emoji(grand.n) + " `" + grand.a + "` [" + grand.w + "]";
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
  module.exports.GrandPrize = grandPrize