

// https://github.com/Ncookiez/prize-simulation/blob/main/prizeCalculation.js

/* ========================================================================================================================================================================= */

const { TvlActive } = require("./tvlActive")
// Function to calculate estimated prize APR:
async function CalculatePrizeAPR (depositAmount,maxPrizes,prizeTiers) {
      let tvl = await TvlActive()
      tvl = tvl.total
      // Initializations:
      let dailyPrizeCount = 0;
      let winnings = 0;
      let cumulativeMaxPrizes = 0;
      let expectedYearlyWins = '';
  
      // Finding Total Prize Data:
      prizeTiers.forEach(tier => {
        dailyPrizeCount += tier.num;
      });
  
      // Finding Daily Winning Probability:
      let dailyWinProbability = (1 / (tvl / dailyPrizeCount)) * depositAmount;
  
      // Calculating Daily Winnings:
      prizeTiers.forEach(tier => {
        let expectedWins = Math.min(((tier.num / dailyPrizeCount) * dailyWinProbability), maxPrizes - cumulativeMaxPrizes);
        winnings += expectedWins * tier.prize;
        if(cumulativeMaxPrizes < maxPrizes) {
          cumulativeMaxPrizes = Math.min(cumulativeMaxPrizes + expectedWins, maxPrizes);
        }
        if(expectedWins > 0) {
          expectedYearlyWins += `${formatWins(expectedWins)} $${tier.prize} wins, `;
        }
      });
  
      // Calculating APR:
      let apr = (winnings * 365 / depositAmount) * 100;
  
      console.log(`Estimated APR for $${depositAmount}: ${apr.toFixed(2)}%`);
  
      // // Displaying Expected Yearly Wins:
      // console.log('  - Expected', expectedYearlyWins.slice(0, expectedYearlyWins.length - 2) + '.');
      let returnData = {
          deposit: depositAmount,
          annualWinnings: parseInt(winnings * 365),
          apr: apr.toFixed(2),
      }
      return returnData
    
  }
  
  /* ========================================================================================================================================================================= */
  
  // Helper function to prettify wins output:
  const formatWins = (wins) => {
    let yearlyWins = wins * 365;
    if(yearlyWins > 10) {
      return yearlyWins.toFixed(0);
    } else if(yearlyWins > 1) {
      return yearlyWins.toFixed(1);
    } else if(yearlyWins > 0.1) {
      return yearlyWins.toFixed(2);
    } else if(yearlyWins > 0.01) {
      return yearlyWins.toFixed(3);
    } else if(yearlyWins > 0.001) {
      return yearlyWins.toFixed(4);
    } else if(yearlyWins > 0.0001) {
      return yearlyWins.toFixed(5);
    } else {
      return yearlyWins.toFixed(6);
    }
  }
  
  /* ========================================================================================================================================================================= */
  
  module.exports.CalculatePrizeAPR = CalculatePrizeAPR
