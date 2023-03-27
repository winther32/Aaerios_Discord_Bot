/*
 * This function produces a formatted display of all commands that this bot uses.
*/

const Discord = require('discord.js');
const Colors = require('../colors');

module.exports = {
    name: 'intro',
    description: 'introduction speech',
    execute(message) {
        // Create the intro embed
        const introEmbed = new Discord.MessageEmbed()
            .setColor(Colors.blue)
            .setTitle("Hello I'm Clippy Bot!")
            .setDescription("My purpose is to help you create a community managed twitch clip library on Google Sheets. To learn more use `$help` and `$help library`.")
            .addFields( 
                {name: "What can I do?",  value: "I can add clips to a sheet, overwrite the keywords, and look up clips in the library."},
                {name: "What can't I do?", value: "I can't delete clips from the sheet. You're gonna have to ask Winter32 to do that."},
                {name: "Some tips for creating a great library:", value: "Make sure to use unique keywords. Try to use keywords or short " +
                    "phrases that define what happens in the clip. All of these keywords are how you will find the clips later so try to make them useful!"},
            )
            .setFooter("Created by Winther");
        message.channel.send(introEmbed);
    }
}