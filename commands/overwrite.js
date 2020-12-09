/*
 * Writes over existing keywords for a given clip.
 *
 * Verifies link and got at least replacement keywords/phrase.
 * Linearly searches for a match to the given line in O(N).
 * 
 * Once a match is found, the user is asked to verify that they want to 
 * overwrite the given keywords. This utilizes the reat functionality of 
 * Discord to gather the yes or no via thumbs up or down emotes.
 * 
*/


// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('../secrets/client_secret.json');
var sheet = require('../secrets/sheetID');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet(sheet.ID);

// Function to async access sheet with google apis
async function overwrite(message, args, username, link) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
     // Get the sheet in spreadsheet
     const sheet = await doc.sheetsByIndex[0];
     var rows = await sheet.getRows();

     // Filter for user response via reations 
     const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

     // Look for the given link in O(N)
     // gets unique twitch clip code from link
     var key = link.split('/').pop().split('?')[0]; 
     var i;
     for (i = 0; i < rows.length; i++) {
         if (rows[i].Clip.includes(key)) {
             console.log('Found link to overwrite: ' + rows[i].Clip);
             var keywords = rows[i].Keywords;
             // Verification message. Provide new and old keywords. Wait for response via react.
             message.channel.send('**Are you sure you want to overwrite the following keywords?**\n' + keywords +
                                '\n**New Keywords:**\n' + args.join().toLowerCase()).then(txt => {
                txt.react('👍').then(() => txt.react('👎')),
                txt.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                        if (reaction.emoji.name === '👍') {
                            // Confirmed to overwrite
                            rows[i].Keywords = args.join().toLowerCase();
                            rows[i].save();
                            message.channel.send('Overwrite complete!');
                            console.log('Tried to overwrite');
                            return;
                        } else {
                            // Cancel overwrite
                            message.channel.send('Cancelled');
                            console.log('Cancelled overwrite');
                            return;
                        }
                    })
                    .catch(collected => {
                        // Catch for taking too long.
                        message.reply('Action cancelled. Timed out.');
                    })
                });
        return;
        }
    }
    message.channel.send("Couldn't find clip in database.");
}

module.exports = {
    name: 'overwrite',
    description: 'overwrite keywords for given clip',
    execute(message, args, username) {
         // Ensure getting new keywords and a link
         // Check for empty args
        if (args.length == 0) {
            message.channel.send('Invalid format\n**Usage:** `$overwrite <comma seperated keywords/phrases>, <link>`\n' +
                                "**Example:** `$overwrite we are tarkov, escape from tarkov, song, www.TwitchClip.com`");
            return;
        }
        // Know have at least one arg
        const last = args.pop(); // link should be last arg given
        // Assert have at least one keyword.
        if (args.length == 0) {
            message.channel.send("At least one unique keyword/phrase to identify the clip followed by a comma and a link to a twitch clip is required.\n" +
                                "**Example:** `$overwrite we are tarkov, escape from tarkov, song, www.TwitchClip.com`");
            return;
        }
        // Verify link
        if (last.includes('twitch.tv') && last.includes('clip') && 
            (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
            // launch async func
            (async() => {
                await overwrite(message, args, username, last);
            })();
        } else {
            message.channel.send("Invalid twitch clip link!");
        }
    }
}