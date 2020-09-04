/*
 * This function produces a formatted display of all commands that this bot uses.
*/

module.exports = {
    name: 'help',
    description: 'info on available commands',
    execute(message, args) {
        message.channel.send("**Clippy Bot Command List!**\n\n" + 
                            "**Clips:\n**" + 
                            "mustard, tarkov, milk\n" + 
                            "**Library:**\n" + 
                            "library, songs, overwrite, add, lookup\n" + 
                            "**Questions:**\n" +
                            "DM Winther32");
    }
}