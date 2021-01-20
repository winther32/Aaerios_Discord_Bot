/*
 * Function to add a new clip to the sheet.
 * 
 * Verifies link, checks for duplicates (O(N)). Writes new row if no duplicates
 * Row includes: Keywords, User who added, date added, link to clip
*/

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../secrets/client_secret.json'); // Sheet manager creds
const sheet = require('../secrets/sheetID'); // Lib sheet ID
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet(sheet.ID);

// init AWS DynamoDB access and doc client
const awsCreds = require('../secrets/awsEnv'); // AWS env values
const AWS = require('aws-sdk');
AWS.config.update({
    region: awsCreds.AWS_REGION,
    accessKeyId: awsCreds.AWS_KEY_ID,
    secretAccessKey: awsCreds.AWS_SECRET_KEY
})
const docClient = new AWS.DynamoDB.DocumentClient();


// Adding the entry into a DynamoDB for lookup. Key by twitchID 
function addLookupDB(message, keywords, username, link) {
    console.log("Begin add...querying lookup DB.");
    // Get unique id from twitch clip url
    const twitchID = link.split('/').pop().split('?')[0];
    
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
            console.error("Error: Unable to query lookup table for add. " + error);
            message.channel.send("Something went wrong! Unable to add clip.");
        } else {
            // Successful query
            console.log("Query success");
            if (data.Count == 0) {
                // Clip not in the DB. Run function to add it to DB
                addToSheet(message, keywords, username, link, twitchID).then( () => {
                    return enterData(keywords, username, link, twitchID)
                }).then( () => {
                     // Confirmation message is sent only once clip is added to both Sheet and DB
                    message.channel.send("Clip successfully added!");
                }).catch( err => {
                    // Failure in one of the add calls
                    message.channel.send("Something went wrong! Unable to add clip.");
                    console.warn("Potential desync of Dynamo lookup table and google sheet. Key:" + twitchID + err);
                    // TODO: Error correction. determine if wrote to sheet and not db. attempt to resync.
                });
            } else {
                // Entry already in the lookup DB
                console.log("Clip already in DB.");
                message.channel.send('**This clip is already in the database!\n It\'s keywords are: **' + data.Items[0].info.keywords);
            }
        }
    });
}


// Function to enter entry data into the DB
function enterData(keywords, username, link, twitchID) {
    console.log("Attempting to add entry to lookup DB.");
    // Object to hold all the data as a value
    let data = {};
    // Build the info object
    data.link = link;
    data.author = username;
    data.date = Date.now(); // Date as number (unix time)
    data.keywords = keywords;

    // Set up the params for Dynamo to save to table
    const params = {
        TableName: 'discord-clip-lookup',
        Item: {
            // unique key for table
            id: twitchID,
            // where the data is stored (value)
            info: data
        }
    }

    // Actually put value into table
    docClient.put(params, (error => {
        if (error) {
            // Failure log. Throw error.
            console.error("Error: Unable to save to DB via add command." + error);
            throw "Unable to add to DB." + error;
        } else {
            // Success log
            console.log("DB add success:" + twitchID);
        }
    }));
}   


// Function to use google API and access sheet
async function addToSheet(message, keywords, username, link, twitchID) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = doc.sheetsByIndex[0];

    // Get today's date in a human readable string
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy; 

    // Create array which will be pushed into next row available
    const rowArray = [keywords.join()];
    rowArray.push(username);
    rowArray.push(today);
    rowArray.push(link); 

    // Write array into next available row
    const newRow = await sheet.addRow(rowArray);
    console.log('Sheet add successfull: ' + twitchID);
   
}


module.exports = {
    name: 'add',
    description: 'adds clips to spreadsheet',
    execute(message, args, username) {
        // Verify got correct input for funcion i.e. at least one keyword and a link
        // Check for empty args
        if (args.length == 0) {
            message.channel.send('Invalid format!\n**Usage:** `$add <comma seperated keywords/phrases>, <link>`\n' +
                                "**Example:** `$add we are tarkov, escape from tarkov, song, www.TwitchClip.com`");
            return;
        }
        // Know now that there is at least one element in the array
        const last = args.pop(); //Get the last argument of the command. Should be clip link
        // Assert have at least one keyword.
        if (args.length == 0) {
            message.channel.send("At least one unique keyword/phrase to identify the clip followed by a comma and a link to a twitch clip is required.\n" +
                                "**Example:** `$add we are tarkov, escape from tarkov, song, www.TwitchClip.com`");
            return;
        }
        // Verify that clip is valid link and from twitch
        if (last.includes('twitch.tv') && last.includes('clip') && 
            (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
            // args have been validated, now only keywords. Make all keywords lowercase.
            args = args.map(el => el.toLowerCase());
            message.channel.send("Attempting to add clip...");
            // Launch function to add to DB and Sheet
            addLookupDB(message, args, username, last);
        } else {
            message.channel.send("Invalid twitch clip link!");
        }
    }
}