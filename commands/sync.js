/* 
 * Function to help resync the Google sheet and DynamoDB if needed.
 */

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../secrets/client_secret.json'); // Sheet manager creds
const sheetInfo = require('../secrets/sheetID'); // Lib sheet ID
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


// This reads from the google sheet and writes into the DB
async function sheet2db() {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];
    var rows = await sheet.getRows();

    var newEntries = 0; // To count how many entries added to DB from sheet
    var scanned = 0; // to track total number of entries attempted to be added.

    var link;
    var twitchID;
    var keywords;
    var author;
    start(scanned, () => {
        // Log results of run.
        console.log("Scanned " + scanned + ". Added " + newEntries + " to DB.");
    });

    // Recursive function to iterate through all of the entries in sheet
    function start(index, _callback) {
        link = rows[index].Clip;
        twitchID = link.split('/').pop().split('?')[0];
        keywords = rows[index].Keywords;
        author = "Winter32"; // No good way to access the column since header has a space in it. Hardcoded for now. :/ 
        
        dbQueryAdd(twitchID, link, author, keywords, (added) => {
            if (added) {
                newEntries++;
            }
            scanned++;
            if (scanned < rows.length) {
                start(scanned, _callback);
            } else {
                _callback();
            }
        })
    }
}

// Function to interact with DynamoDB. Checks for dupilcates and adds if none.
function dbQueryAdd(twitchID, link, author, keywords, _callback) {
    // query params
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
            console.error("Error: Unable to query lookup table. " + error);
            throw "Query failure";
        } else {
            // Successful query
            if (data.Count == 0) {
                // Clip not in the DB add it to DB
                
                // Object to hold all the data as a value
                let data = {};
                // Build the info object
                data.link = link;
                data.author = author;
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
                        // Failure message and log
                        console.error("Error: Unable to save to DB." + error);
                        throw "Unable to add to DB";
                    } else {
                        // Success message and log
                        console.log("Successfully added entry to DB:" + twitchID);
                        _callback(true); // return boolean to indicate successfully added
                    }
                }))
            } else {
                // Clip not in DB
                _callback(false);
            }
        }
    })
}


module.exports = {
    name: 'sync',
    description: 'sync google sheet and dynamoDB entries',
    execute(message, args) {
        // Only allow specific users to call this function (by unique Discord ID). Here it's just me.
        if (message.author.id === "194935918438776832") {
            console.log("Attempting sync operation.");
            (async() => {
                await sheet2db();
            })();
        }
    }
}