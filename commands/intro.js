/*
 * This function produces a formatted display of all commands that this bot uses.
*/

module.exports = {
    name: 'intro',
    description: 'introduction speech',
    execute(message) {
        message.channel.send("**Hello I'm Clippy Bot!**\n" + 
                           "My purpose is to help you create a community managed twitch clip library on Google Sheets.\n\n" +
                           "**What can I do?**\n" +
                           "I can add clips to a sheet, overwrite the keywords, and get the keywords for a given link.\n" + 
                           "**What can't I do?**\n" +
                           "I can't search the library! You're gonna have to use ctrl + f in spreadsheet for that (for now).\n" +
                           "I can't delete clips from the sheet. You're gonna have to ask Winter32 to do that.\n\n" +
                           "**Some tips for creating a great library:**\n" +
                           "Make sure to use unique keywords. I would suggest a title/description, the game, and a category descriptor such as song, funny, fail, etc.\n" +
                           "All of these keywords are how you will find the clips later so try to make them useful!");
    }
}