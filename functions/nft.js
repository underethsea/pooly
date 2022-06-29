
const fetch = require("cross-fetch")
const { MessageEmbed } = require("discord.js");


async function seaFetch(collectionName) {
    try {
        let fetchSea = await fetch("https://api.opensea.io/api/v1/collection/" + collectionName + "/stats")
        let fetchedSea = await fetchSea.json()
        return fetchedSea

    } catch (error) { console.log(error) }
}

async function allSea(collectionName) {
    try {
        let fetchedSea = await seaFetch(collectionName)
        let floorPrice = fetchedSea.stats.floor_price
        let numOwners = fetchedSea.stats.num_owners
        let totalVolume = fetchedSea.stats.total_volume
        let totalSupply = fetchedSea.stats.total_supply
        let seaEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("OpenSea Details for `" + collectionName + "`")
            .setDescription("Floor Price `" + floorPrice + "`" +
                "\nOwners `" + numOwners + "`" +
                "\nTotal Volume `" + totalVolume.toFixed(0) + "`" +
                "\nTotal Supply `" + totalSupply + "`"
            )
            .setImage();
        return seaEmbed

    } catch (error) { console.log(error) }
}
async function gallery() {
    let collection = ["tubby-cats", "bobutoken", "murixhaus", "mfers", "milady", "genesis-oath", "snooponsound", "white-rabbit-producer-pass"];
    let descriptionText = ""
    for (x = 0; x < collection.length; x++) {
        let fetchedSea = await seaFetch(collection[x])
        descriptionText = descriptionText + collection[x] + " `" + fetchedSea.stats.floor_price + "`\n"
    }
    let seaEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("NFTogether Gallery Floor Prices")
        .setDescription(descriptionText)
        .setImage();
    return seaEmbed

}
async function seaFloor(collectionName) {
    try {

        let fetchedSea = await seaFetch(collectionName)
        let floorPrice = fetchedSea.stats.floor_price
        if (floorPrice === null) {
            let oneDayAvgPrice = parseFloat(fetchedSea.stats.one_day_average_price)
            return "__OpenSea__ One Day Average Price For:\n`" + collectionName + "` \ \ \ \ \ `" + oneDayAvgPrice.toFixed(2) + "` \ \ \ `ETH`"

        } else {
            return "__OpenSea__ Floor Price For:\n`" + collectionName + "` \ \ \ \ \ `" + floorPrice + "` \ \ \ `ETH`"
        }

    } catch (error) { return "Collection not found"; console.log(error) }
}


module.exports.AllSea = allSea
module.exports.Gallery = gallery
module.exports.SeaFloor = seaFloor
