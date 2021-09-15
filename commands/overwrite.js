/*
 * Writes over existing keywords for a given clip.
 *
 * Verifies link via DynamoDb and checks recieved at least 1 replacement keyword/phrase.
 * Replaces keywords in Sheet in O(N), in DB O(1)
 * 
 * The user is asked to verify that they want to 
 * overwrite the given keywords. This utilizes the react functionality of 
 * Discord to gather the yes or no via thumbs up or down emotes.
 * 
*/

const linkUtil = require('../utils/links');
const strs = require('../strings/english');

const Dynamo = require('../services/dynamo');
const GcpService = require('../services/gcpSheets');

const dynamo = new Dynamo();
const gcpService = new GcpService();



// Top level overwrite function call. Begins process of query for match, verify, call Sheet and Dynamo APIs.
function newOverwrite(message, newKeywords, link) {
    // Get unique id from twitch clip url
    const twitchID = link.split('/').pop().split('?')[0];
    console.log("Begin overwrite...querying lookup DB. Key:" + twitchID);

    dynamo.get(twitchID, (error, response) => {
        if (error) {
            message.channel.send(strs.dyno_get_error);
        } else if (response) {
            // Found Clip in DB. 
            verify(message, response, newKeywords, twitchID);
        } else {
            // Clip not in the DB. Nothing to overwrite.
            message.channel.send(strs.dyno_get_null);
        }
    });
}


// Verify action with user by using react emojis. On validation, call overwrite functions.
function verify(message, oldKeywords, newKeywords, twitchID) {
    // Filter for user response via reations 
    const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    // Verification message. Provide new and old keywords. Wait for response via reaction.
    message.channel.send('**Are you sure you want to overwrite the following keywords?**\n' + oldKeywords +
                        '\n**New Keywords:**\n' + newKeywords).then(txt => {
        txt.react('👍').then(() => txt.react('👎')),
        txt.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();
            if (reaction.emoji.name === '👍') {
                // Confirmed to overwrite
                console.log("Attempting to overwrite keywords. Key: " + twitchID);
                 // Launch function to overwrite keywords in the Sheet. On completion try overwrite to DB.
                gcpService.overwriteSheet(newKeywords, twitchID).then(() => { 
                    // OverwriteDB func
                    overwriteDB(message, newKeywords, twitchID)
                }).catch(err => {
                    // Failure of the sheet overwrite call
                    message.channel.send("Something went wrong! Unable to update clip."); 
                    console.warn("Overwrite failure in sheet DB not executed. Key:" + twitchID + "Error:" + err);           
                });
            } else {
                // Cancel overwrite
                message.channel.send('Cancelled');
                console.log('User cancelled overwrite' + twitchID);
            }
        })
        .catch(collected => {
            // Catch for taking too long.
            message.reply('Action cancelled. Timed out.');
            console.log("Overwrite cancelled. Verification timed out. Key:" + twitchID);
        })
    });
}


// Overwrite the keywords in the lookup DB with new keywords. O(1)
function overwriteDB(message, newKeywords, twitchID) {
    // Call service to update dynamo
    dynamo.update(newKeywords, twitchID, (error) => {
        if (error) {
            message.channel.send(strs.dyno_update_error); 
        } else {
            message.channel.send(strs.dyno_update_success);
        }
    });
}

module.exports = {
    name: 'overwrite',
    description: 'overwrite keywords for given clip',
    execute(message, args) {
         // Ensure getting new keywords and a link
         // Check for empty args
        if (args.length == 0) {
            message.channel.send(strs.cmd_overwrite_usage + strs.cmd_overwrite_example);
            return;
        }
        // Know have at least one arg
        const last = args.pop(); // link should be last arg given
        // Assert have at least one keyword.
        if (args.length == 0) {
            message.channel.send(strs.cmd_overwrite_keyword_required + strs.cmd_overwrite_example);
            return;
        }
        // Verify link
        if (linkUtil.verifyLink(last)) {
            // Valid arguments. Make keywords all lowercase
            args = args.map( el => el.toLowerCase()); 
            newOverwrite(message, args, last);
        } else {
            message.channel.send(strs.link_invalid);
        }
    }
}