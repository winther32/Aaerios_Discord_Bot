/*
 * Function to add a new clip to the sheet.
 * 
 * Verifies link, checks for duplicates O(1). Writes new row if no duplicates
 * Row includes: Keywords, User who added, date added, link to clip
*/

const linkUtil = require('../utils/links');
const strs = require('../strings/english');
require('dotenv').config(); // init env variables

const Dynamo = require('../services/dynamo');
const GcpService = require('../services/gcpSheets');

const dynamo = new Dynamo();
const gcpService = new GcpService();

// Adding the entry into a DynamoDB for lookup. Key by twitchID 
function addLookupDB(message, keywords, username, link) {
    console.log("Begin add...querying lookup DB.");
    // Get unique id from twitch clip url
    const twitchID = linkUtil.extractTwitchID(link);

    // Verify clip not already in DB, if so run func to add.
    dynamo.get(twitchID, (error, response) => {
        if (error) {
            message.channel.send(strs.dyno_get_error);
        } else if (response) {
            message.channel.send(strs.dyno_get_found);
        } else {
            // Clip not in the DB. Run function to add it to DB
            gcpService.addToSheet(keywords, username, link, twitchID).then(() => {
                enterData(message, keywords, username, link, twitchID)
            }).catch(err => {
                // Failure in sheet add. DB call not executed then.
                message.channel.send(strs.dyno_add_error);
                console.warn("Add failure in sheet DB not executed. Key:" + twitchID + err);
            });
        }
    })
}

// Function to enter entry data into the dynamo DB and send confirmation messages to server
function enterData(message, keywords, username, link, twitchID) {
    dynamo.put(keywords, username, link, twitchID, (error) => {
        if (error) {
            message.channel.send(strs.dyno_add_error);
        } else {
            message.channel.send(strs.dyno_add_success);
        }
    });
}

module.exports = {
    name: 'add',
    description: 'adds clips to spreadsheet',
    execute(message, args, username) {
        // Verify got correct input for funcion i.e. at least one keyword and a link
        // Check for empty args
        if (args.length == 0) {
            message.channel.send(strs.cmd_add_usage + strs.cmd_add_example);
            return;
        }
        // Know now that there is at least one element in the array
        const last = args.pop(); //Get the last argument of the command. Should be clip link
        // Assert have at least one keyword.
        if (args.length == 0) {
            message.channel.send( + strs.cmd_add_keyword_required + strs.cmd_add_example);
            return;
        }
        // Verify that clip is valid link and from twitch
        if (linkUtil.verifyLink(last)) {
            // args have been validated, now only keywords. Make all keywords lowercase.
            args = args.map(el => el.toLowerCase());
            message.channel.send(strs.cmd_add_starting);
            // Launch function to add to DB and Sheet
            addLookupDB(message, args, username, last);
        } else {
            message.channel.send(strs.link_invalid);
        }
    }
}