/*
 * Writes over existing keywords for a given clip.
 *
 * Verifies link and got at least replacement keywords/phrase.
 * Linearly searches for a match to the given line in O(N).
 * 
 * Once a match is found, the user is asked to verify that they want to 
 * overwrite the given keywords. This utilizes the react functionality of 
 * Discord to gather the yes or no via thumbs up or down emotes.
 * 
*/


// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('../secrets/client_secret.json'); // Sheet manager creds
var sheetInfo = require('../secrets/sheetID'); // Lib sheet ID
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet(sheetInfo.ID);

// init AWS DynamoDB access and doc client
const awsCreds = require('../secrets/awsEnv'); // AWS env values
const AWS = require('aws-sdk');
AWS.config.update({
    region: awsCreds.AWS_REGION,
    accessKeyId: awsCreds.AWS_KEY_ID,
    secretAccessKey: awsCreds.AWS_SECRET_KEY
})
const docClient = new AWS.DynamoDB.DocumentClient();


// Top level overwrite function call. Begins process of query for match, verify, call Sheet and Dynamo APIs.
function newOverwrite(message, newKeywords, link) {
    // Get unique id from twitch clip url
    const twitchID = link.split('/').pop().split('?')[0];
    console.log("Begin overwrite...querying lookup DB. Key:" + twitchID);
        
    // Duplicate query params
    var qParams = {
        TableName: 'discord-clip-lookup',
        KeyConditionExpression: "id = :key",
        ExpressionAttributeValues:{
            ":key": twitchID
        }
    }

    // Query the DB to check for duplicates
    docClient.query(qParams, (error, data) => {
        if (error) {
            // Failure to complete the query
            console.error("Error: Unable to query lookup table for overwrite. " + error);
            message.channel.send("Uh oh ... Something went wrong! Overwrite cancelled.");
        } else {
            // Successful query
            console.log("Query success. Key:" + twitchID);
            if (data.Count == 0) {
                // Clip not in the DB. Nothing to overwrite.
                // Log and message clip not in DB
                message.channel.send("Clip not yet in database, use the `$add` command to add it!");
                console.log("Clip not in Dynamo. Key:" + twitchID);
            } else {
                // Found Clip in DB. 
                // Call verification method to verify action with user and then call overwrite functions
                verify(message, data.Items[0].info.keywords, newKeywords, twitchID);
            }
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
                overwriteSheet(newKeywords, twitchID).then( () => { 
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
    // Update params
    var params = {
        TableName:  'discord-clip-lookup',
        Key: { 'id': twitchID},
        UpdateExpression: "set #i.#k = :nK",
        ExpressionAttributeNames: {
            "#i": "info",
            "#k": "keywords" 
        },
        ExpressionAttributeValues:{
            ':nK': newKeywords.join()
        }
    }

    docClient.update(params, (error) => {
        if (error) {
            // Overwrite in Dynamo failure
            console.error("Unable to overwrite DB. Key:" + twitchID + "Err: " + error);
            message.channel.send("Something went wrong! Unable to update clip."); 
            // TODO error correction triggered here. In sheet but not DB.
        } else {
            // Overwrite of DB is a success
            console.log("DB ovewrite successful " + twitchID);
            // Log end of overwrite since called after sheet overwrite
            console.log("Overwrite finished. Key: " + twitchID);
            message.channel.send('Overwrite complete!');
        }
    })
}


// Overwrite keywords in Sheet in O(n)
async function overwriteSheet(newKeywords, twitchID) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    // Get the sheet in spreadsheet
    const sheet = doc.sheetsByIndex[0];
    var rows = await sheet.getRows();

    // Look for the given link in O(N)
    var i;
    for (i = 0; i < rows.length; i++) {
        if (rows[i].Clip.includes(twitchID)) {
            // Replace keywords in the appropriate row
            rows[i].Keywords = newKeywords.join();
            rows[i].save();
            // Log completion of sheet overwrite
            console.log("Sheet overwrite successful for: " + twitchID);
            break;
        }
    }
    // If didn't find the clip in the sheet, throw error.
    if (i == rows.length) {
        throw "Overwrite unsuccessful. Unable to find clip in Sheet. Likely clip in DB but not sheet.";
    }
}

module.exports = {
    name: 'overwrite',
    description: 'overwrite keywords for given clip',
    execute(message, args) {
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
            // Valid arguments. Make keywords all lowercase
            args = args.map( el => el.toLowerCase()); 
            newOverwrite(message, args, last);
        } else {
            message.channel.send("Invalid twitch clip link!");
        }
    }
}