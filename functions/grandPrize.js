const fetch = require("cross-fetch")
// const { emoji } = require("./emoji.js")
var emoji = require("./emoji.js");
  
async function grandPrize(draw) {
console.log("grand prize",draw)
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
      console.log(grandDogs)
      let grandString = "GRAND PRIZES DRAW " + draw + " || ";
      if (grandDogs.length > 0) {
console.log("got a grand prize")
        grandDogs.forEach((grand) => {
          grandString += "\n   " + emoji(grand.n) + " `" + grand.a + "` [" + grand.w + "]";
        });
console.log(grandString)
        return grandString;
      } else {
        return "No grand prizes for draw " + draw;
      }
    } catch (error) {
 console.log(error);
      return "Couldn't find that one friend.  `=grandprize <draw number>`";
      console.log(error);
    }
  }
  module.exports.GrandPrize = grandPrize
