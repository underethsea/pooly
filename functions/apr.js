const { TvlActive } = require("./tvlActive.js")
const { PrizePerDay } = require("./prizePerDay.js")

async function apr() {
    try {
        let tvlNow = await TvlActive();
        tvlNow = tvlNow.total;
        let annualPrize = await PrizePerDay();
        annualPrize = annualPrize * 365;
        let aprData = {
            tvl: tvlNow,
            prizePerYear: annualPrize,
            apr: (annualPrize / tvlNow) * 100
        }
        return aprData;
    } catch (error) {
        console.log(error);
    }
}
module.exports.Apr = apr
