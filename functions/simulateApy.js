
const { TvlActive } = require("./tvlActive.js")
var calculateWinnings = require("./simulate.js");
const {TierPrizes} = require("../constants/tierPrizes")
const {PrizeTier } = require("./prizeTier")

// fork of script from @KingXKok of PT Discord

const simulationDays = 365;
const simulationRuns = 100;

const maxPrizes = 2;

const gasToClaim = 0;
// const tierNumPrizes = [1, 3, 12, 48, 192, 768, 3072];
// const tierPrizes = [2500, 500, 200, 50, 10, 5, 1];



// let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // option A
// let tierPrizes = [1000, 100, 50, 10, 5, 5]; // option A

function scalingFunction(deposit) {
  let scalingVariable = 1; // used to make calculating prizes faster as deposit grows

  if (deposit > 1999 && deposit > 200) {
    scalingVariable = 5;
  }
  if (deposit > 4999) {
    scalingVariable = 10;
  }
  if (deposit > 9999) {
    scalingVariable = 20;
  }
  if (deposit > 19999) {
    scalingVariable = deposit / 400;
  }
  console.log(scalingVariable)

  return scalingVariable

}
async function simulateApy(depositAmount, removedVar, gasToClaim, chain) {

 ///  let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // newly proposed
 //  let tierPrizes = [1000, 100, 50, 10, 5, 5]; //newly proposed
let tierPrizes = await PrizeTier(chain)
let tierNumPrizes = TierPrizes  
let totalPrizeValue = 0;
  let totalPrizes = 0;
  let gasCost = 0;
  console.log(tierNumPrizes)

  let scalingVariable = scalingFunction(depositAmount)
  console.log(scalingVariable)

  for (x = 0; x < tierNumPrizes.length; x++) {
    totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
    if (tierNumPrizes[x] * tierPrizes[x] > 0) {
      totalPrizes += tierNumPrizes[x];
    }
  }
  let tvl = await TvlActive()
  tvl = tvl.total;
  console.log(tvl)
  const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

  // console.log("total prize value: ", totalPrizeValue);
  // console.log("total number of prizes: ", totalPrizes);

  let tierPrizesAfterGas = [];

  for (x in tierPrizes) {
    let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

    tierPrizesAfterGas.push(prizeVal);
  }

  let claimable = 0;
  let winnings = 0;
  let min = depositAmount;
  let max = 0;
  let claimableAmount = 0;
  let droppedTotal = 0;
  let firstPrizeDayTotal = 0;
  for (x = 0; x < simulationRuns; x++) {
    winnings = calculateWinnings(
      depositAmount,
      simulationDays,
      scalingVariable,
      totalPrizes,
      dailyProbWin,
      tierPrizesAfterGas,
      tierNumPrizes,
      maxPrizes
    );
    // log each simulation
    // console.log(winnings);
    droppedNumber = winnings[3];
    droppedTotal += droppedNumber;
    claimableAmount = winnings[0];
    claimable += claimableAmount;
    firstPrizeDayTotal += winnings[4];
    if (claimableAmount < min) {
      min = claimableAmount;
    }
    if (claimableAmount > max) {
      max = claimableAmount;
    }
  }
  tierString = "";
  for (x in tierNumPrizes) {
    tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
  }
  // console.log("prize tiering: ", tierString);
  // console.log(
  //   depositAmount,
  //   " deposited for ",
  //   simulationDays,
  //   " days with gas cost to claim of ",
  //   gasToClaim
  // );
  // console.log("unluckiest player claimable: ", min.toFixed());
  // console.log("luckiest player claimable: ", max.toFixed());

  let annualized = (365 / simulationDays) * 100;
  let averageClaimable = claimable / simulationRuns;
  let averageApr = annualized * (claimable / simulationRuns / depositAmount);
  let unluckyApr = annualized * (min / depositAmount);
  let luckyApr = annualized * (max / depositAmount);

  console.log(
    "average claimable: ",
    averageClaimable.toFixed(),
    " ",
    averageApr.toFixed(2),
    "% APR"
  );
  // console.log("prizes dropped per player", droppedTotal / simulationRuns);
  // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
  // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
  // console.dir(prizeResults, { depth: null });

  // more than 100 items
  // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

  // example ascii chart
  // console.log (asciichart.plot (prizeResults,{height:30}))
  let results = {
    average: averageApr.toFixed(2),
    unlucky: unluckyApr.toFixed(2),
    lucky: luckyApr.toFixed(2),
  };
  return results;
}


// async function optionA(depositAmount, removedVar, gasToClaim) {

//   let tierNumPrizes = [1, 3, 12, 48, 192, 768]; // option A

//   let tierPrizes = [1000, 100, 50, 10, 5, 5]; // option A

//   let totalPrizeValue = 0;
//   let totalPrizes = 0;
//   let gasCost = 0;

//   let scalingVariable = scalingFunction(depositAmount)

//   for (x = 0; x < tierNumPrizes.length; x++) {
//     totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
//     if (tierNumPrizes[x] * tierPrizes[x] > 0) {
//       totalPrizes += tierNumPrizes[x];
//     }
//   }
//   console.log(totalPrizes)
//   console.log(totalPrizeValue)
//   let tvl = await TvlActive()
//   tvl = tvl.total;
//   console.log(tvl)
//   const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

//   // console.log("total prize value: ", totalPrizeValue);
//   // console.log("total number of prizes: ", totalPrizes);

//   let tierPrizesAfterGas = [];

//   for (x in tierPrizes) {
//     let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

//     tierPrizesAfterGas.push(prizeVal);
//   }

//   let claimable = 0;
//   let winnings = 0;
//   let min = depositAmount;
//   let max = 0;
//   let claimableAmount = 0;
//   let droppedTotal = 0;
//   let firstPrizeDayTotal = 0;
//   for (x = 0; x < simulationRuns; x++) {
//     winnings = calculateWinnings(
//       depositAmount,
//       simulationDays,
//       scalingVariable,
//       totalPrizes,
//       dailyProbWin,
//       tierPrizesAfterGas,
//       tierNumPrizes,
//       maxPrizes
//     );
//     // log each simulation
//     // console.log(winnings);
//     droppedNumber = winnings[3];
//     droppedTotal += droppedNumber;
//     claimableAmount = winnings[0];
//     claimable += claimableAmount;
//     firstPrizeDayTotal += winnings[4];
//     if (claimableAmount < min) {
//       min = claimableAmount;
//     }
//     if (claimableAmount > max) {
//       max = claimableAmount;
//     }
//   }
//   tierString = "";
//   for (x in tierNumPrizes) {
//     tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
//   }
//   // console.log("prize tiering: ", tierString);
//   // console.log(
//   //   depositAmount,
//   //   " deposited for ",
//   //   simulationDays,
//   //   " days with gas cost to claim of ",
//   //   gasToClaim
//   // );
//   // console.log("unluckiest player claimable: ", min.toFixed());
//   // console.log("luckiest player claimable: ", max.toFixed());

//   let annualized = (365 / simulationDays) * 100;
//   let averageClaimable = claimable / simulationRuns;
//   let averageApr = annualized * (claimable / simulationRuns / depositAmount);
//   let unluckyApr = annualized * (min / depositAmount);
//   let luckyApr = annualized * (max / depositAmount);

//   console.log(
//     "average claimable: ",
//     averageClaimable.toFixed(),
//     " ",
//     averageApr.toFixed(2),
//     "% APR"
//   );
//   // console.log("prizes dropped per player", droppedTotal / simulationRuns);
//   // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
//   // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
//   // console.dir(prizeResults, { depth: null });

//   // more than 100 items
//   // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

//   // example ascii chart
//   // console.log (asciichart.plot (prizeResults,{height:30}))
//   let results = {
//     average: averageApr.toFixed(2),
//     unlucky: unluckyApr.toFixed(2),
//     lucky: luckyApr.toFixed(2),
//     firstPrizeDay: firstPrizeDayTotal / simulationRuns
//   };
//   return results;
// }



// async function optionB(depositAmount, removedVar, gasToClaim) {

//   let tierNumPrizes = [1, 3, 12, 48, 192, 3072]; // option A

//   let tierPrizes = [1500, 200, 50, 10, 5, 1]; // option A

//   let totalPrizeValue = 0;
//   let totalPrizes = 0;
//   let gasCost = 0;

//   let scalingVariable = scalingFunction(depositAmount)

//   for (x = 0; x < tierNumPrizes.length; x++) {
//     totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
//     if (tierNumPrizes[x] * tierPrizes[x] > 0) {
//       totalPrizes += tierNumPrizes[x];
//     }
//   }
//   console.log(totalPrizes)
//   console.log(totalPrizeValue)
//   let tvl = await TvlActive()
//   tvl = tvl.total;
//   console.log(tvl)
//   const dailyProbWin = 1 / (tvl / totalPrizes / scalingVariable); // daily dollar probability of winning

//   // console.log("total prize value: ", totalPrizeValue);
//   // console.log("total number of prizes: ", totalPrizes);

//   let tierPrizesAfterGas = [];

//   for (x in tierPrizes) {
//     let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

//     tierPrizesAfterGas.push(prizeVal);
//   }

//   let claimable = 0;
//   let winnings = 0;
//   let min = depositAmount;
//   let max = 0;
//   let claimableAmount = 0;
//   let droppedTotal = 0;
//   let firstPrizeDayTotal = 0;
//   for (x = 0; x < simulationRuns; x++) {
//     winnings = calculateWinnings(
//       depositAmount,
//       simulationDays,
//       scalingVariable,
//       totalPrizes,
//       dailyProbWin,
//       tierPrizesAfterGas,
//       tierNumPrizes,
//       maxPrizes
//     );
//     // log each simulation
//     // console.log(winnings);
//     droppedNumber = winnings[3];
//     droppedTotal += droppedNumber;
//     claimableAmount = winnings[0];
//     claimable += claimableAmount;
//     firstPrizeDayTotal += winnings[4];
//     if (claimableAmount < min) {
//       min = claimableAmount;
//     }
//     if (claimableAmount > max) {
//       max = claimableAmount;
//     }
//   }
//   tierString = "";
//   for (x in tierNumPrizes) {
//     tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
//   }
//   // console.log("prize tiering: ", tierString);
//   // console.log(
//   //   depositAmount,
//   //   " deposited for ",
//   //   simulationDays,
//   //   " days with gas cost to claim of ",
//   //   gasToClaim
//   // );
//   // console.log("unluckiest player claimable: ", min.toFixed());
//   // console.log("luckiest player claimable: ", max.toFixed());

//   let annualized = (365 / simulationDays) * 100;
//   let averageClaimable = claimable / simulationRuns;
//   let averageApr = annualized * (claimable / simulationRuns / depositAmount);
//   let unluckyApr = annualized * (min / depositAmount);
//   let luckyApr = annualized * (max / depositAmount);

//   console.log(
//     "average claimable: ",
//     averageClaimable.toFixed(),
//     " ",
//     averageApr.toFixed(2),
//     "% APR"
//   );
//   // console.log("prizes dropped per player", droppedTotal / simulationRuns);
//   // console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
//   // console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
//   // console.dir(prizeResults, { depth: null });

//   // more than 100 items
//   // console.log(util.inspect(prizeResults, { maxArrayLength: null }))

//   // example ascii chart
//   // console.log (asciichart.plot (prizeResults,{height:30}))
//   let results = {
//     average: averageApr.toFixed(2),
//     unlucky: unluckyApr.toFixed(2),
//     lucky: luckyApr.toFixed(2),
//     firstPrizeDay: firstPrizeDayTotal / simulationRuns
//   };
//   return results;
// }

module.exports.SimulateApy = simulateApy

// simulateApy(5000,28000000,.05).then(apy => console.log("finished"))
