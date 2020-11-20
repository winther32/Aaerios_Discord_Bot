/*
 * This function produces a formatted display of all commands that this bot uses.
*/

const { DiscordAPIError, Channel } = require("discord.js");
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'info on available commands',
    execute(message, args) {

        // Normal help embed
        const helpEmbed = new Discord.MessageEmbed()
            .setColor('187bcd')
            .setTitle("Clippy Bot Command List")
            .setDescription("Learn how to use the community managed clip library with `$help library`")
            .addFields(
                // {name: '\u200B', value: '\u200B' },
                {name: 'Clips:', value: "`mustard`, `tarkov`, `milk`, `salsa`"},
                {name: 'Images:', value: "`angry`, `unit`, `devil`"},
                {name: 'Library:', value: "`library`, `songs`, `overwrite`, `add`, `lookup`"},
            )
            .setFooter("For command recommnedations and Q's DM Winther");
        
        const libEmbed = new Discord.MessageEmbed()
                .setColor('187bcd')
                .setTitle("Using The Clip Library")
                .setDescription("A quick guide to adding to and searching the community managed clip library!")
                .addFields(
                    {name: 'Why Does This Exist?', value: "`Twitch only organizes clips by all time views. This means that your favorite niche clip can get buried in the plethera of amazing clips! This library while not a perfect solution provides a way to add keywords to a clip and save them in one place so you can find them later!`"},
                    {name: "The Library Command:", value: "`This command provides a link to the full GoogleSheet where everything is saved. Here you can browse all the links and keywords. I hope to add clip thumbnails to this in the future.`"},
                    {name: "Finding A Clip With GoogleSheets:", value: "`To find your favorite clip first you have to open the GoogleSheet where everything is saved. You can get the link with the $library command. Next use the ctrl+F function to search for the keyword you are looking for.`"},
                    {name: "Finding A Clip With The Lookup Command:", value: "`You can also find a clip with the $lookup command followed by comma seperated keywords. Clippy Bot will then list all the clip links that have the given keyword(s). Discord will also show previews for the first 5 links listed.`"},
                    {name: 'Adding A Clip:', value: "`To add a clip simply use the $add command followed by comma seperated keywords and the link to the clip!`"},
                    {name: "Overwriting A Clip:", value: "`If you believe that the keywords paired with a certain clip are wrong or you want to add new keywords you can use the $overwrite command followed by the replacement keywords and the corresponding clip link.`"},
                    {name: "The Lookup Command:", value: "`This command searches the database. If you use $lookup followed by a link, Clippy Bot will find the keywords associated with that link. If you use $lookup followed by keywords Clippy Bot will find all the clips with those keywords.`"},
                    {name: "The Songs Command:", value: "`Our Lord Aaerios has blessed us many a time with his beautiful songs. These have been saved all in one place for your enjoyment at the link provided.`"}
                )
                .setFooter("If you still have questions feel free to DM Winther");


        if (args[0].toLowerCase() == "library") {
            message.channel.send(libEmbed);
        } else {
            message.channel.send(helpEmbed);
        }
    }
}