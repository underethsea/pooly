
    const avaxEmoji = "923600422877397042";
    const polyEmoji = "832697115019837440";
    const ethEmoji = "927556967164149851";
    const usdcEmoji = "823404729634652220";
    const trophyEmoji = "780567510915219476";
    
    module.exports = function emoji(name) {
        let emojiString = "";
        if (name === "polygon" || name === "3") {
            emojiString = "<:TokenMATIC:" + polyEmoji + ">";
        }
        if (name === "ethereum" || name === "1") {
            emojiString = "<:eth:" + ethEmoji + ">";
        }
        if (name === "avalanche" || name === "4") {
            emojiString = "<:avax:" + avaxEmoji + ">";
        }
        if (name === "usdc") {
            emojiString = "<:TokenUSDC:" + usdcEmoji + ">";
        }
        if (name === "trophy") {
            emojiString = "<:TrophyETH:" + trophyEmoji + ">";
        }
        return emojiString;

        }

 
