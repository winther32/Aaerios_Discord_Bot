/*
 * Writes over exsiting keywords for a given clip.
*/


// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('./client_secret.json');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E');

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
         if (args.length >= 1) {
            // get the last argument of the command. Should be clip link
            const last = args.pop();
            // Verify link
            if (last.includes('twitch.tv') && last.includes('clip') && 
                (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
                // launch async func
                (async() => {
                    await overwrite(message, args, username, last);
                })();
            } else {
                message.channel.send('Invalid format\n**Usage:** $overwrite <comma seperated keywords/phrases>**,** <link>');
            }
        } else {
            message.channel.send('Invalid format\n**Usage:** $overwrite <comma seperated keywords/phrases>**,** <link>');
        }
    }
}