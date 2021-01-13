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
            console.log("Error: Unable to query lookup table. " + error);
        } else {
            // Successful query
            console.log("Query success");
            if (data.Count == 0) {
                // Clip not already in the DB. Run function to add it to DB
                enterData(keywords, username, link, twitchID);
            } else {
                // Entry already in the lookup DB
                console.log("Clip already in DB.");
            }
        }
    })


    // Function to enter entry data into the DB
    function enterData(keywords, username, link, twitchID) {
        console.log("Attempting to add entry to lookup DB.");
        // Object to hold all the data as a value
        let data = {};

        // Build the object
        data.link = link;
        data.author = username;
        data.date = Date.now(); // Date as number (unix time)
        data.keywords = keywords;

        // console.log(data);

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
                console.log("Error: Unable to save to DB via add command." + error);
                // throw "Error: Unable to save to DB. " + error;
            } else {
                // Success message and log
                console.log("Successfully added entry to DB.");
            }
        }))
    }   
}


// Function to use google API and access sheet
async function addToSheet(message, args, username, link) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    message.channel.send('Checking for duplicates...')
    var rows = await sheet.getRows();
    // gets unique twitch clip code from link
    var key = link.split('/').pop().split('?')[0]; 
    // For loop to check for dupicate links
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].Clip.includes(key)) {
            console.log('Found duplicate link ' + rows[i].Clip);
            var keywords = rows[i].Keywords;
            message.channel.send('This clip is already in the database! It\'s keywords are: ' + keywords);
            return; // If find a match end function without adding.
        }
    }

    // Get today's date in a human readable string
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy; 

    // Create array which will be pushed into next row available
    const rowArray = [args.join().toLowerCase()];
    rowArray.push(username);
    rowArray.push(today);
    rowArray.push(link); 

    // Write array into next available row
    const newRow = await sheet.addRow(rowArray);
    message.channel.send('Clip added!')
    console.log('Clip added to sheet: ' + link);
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
            // args have been validated by now

            // message.channel.send('Attempting to add clip to database...');
            // // Launch Async function to interact w/Google API 
            // (async() => {
            //     await addToSheet(message, args, username, last);
            // })();

            addLookupDB(message, args, username, last);
        } else {
            message.channel.send("Invalid twitch clip link!");
        }
    }
}