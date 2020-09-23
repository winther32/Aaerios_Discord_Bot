/*
 * Function to add a new clip to the sheet.
 * 
 * Verifies link, checks for duplicates (O(N)). Writes new row if new duplicates
 * Row includes: Keywords, User who added, date added, link to clip
*/

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('./client_secret.json');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E');

// Function to use google API and access sheet
async function start(message, args, username, link) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    // For loop to check for dupicate links
    message.channel.send('Checking for duplicates...')
    var rows = await sheet.getRows();
    // gets unique twitch clip code from link
    var key = link.split('/').pop().split('?')[0]; 
    var i;
    for (i = 0; i < rows.length; i++) {
        if (rows[i].Clip.includes(key)) {
            console.log('Found duplicate link ' + rows[i].Clip);
            var keywords = rows[i].Keywords;
            message.channel.send('This clip is already in the database! It\'s keywords are: ' + keywords);
            return; // If find a match end function without adding.
        }
    }

    // Get today's in a human readable string
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy; 

    // Create array which will pushed into next row available
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
        // Ensure getting something to sort by and a link
        if (args.length >= 1) {
            // get the last argument of the command. Should be clip
            const last = args.pop();
            // Verify that clip is valid link and from Aaerios's twitch
            if (last.includes('twitch.tv') && last.includes('clip') && 
                (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
                // placeholder for google addition api
                message.channel.send('Attempting to add clip to database...');
                // Launch Async function 
                (async() => {
                    await start(message, args, username, last);
                })();
            } else {
                message.channel.send('Invalid format\n**Usage:** $add <comma seperated keywords/phrases>**,** <link>\n' +
                                    "**Example:** $add we are tarkov, escape from tarkov, song, www.twitchClip.com");
            }
        } else {
            message.channel.send('Invalid format\n**Usage:** $add <comma seperated keywords/phrases>**,** <link>\n' +
                                "**Example:** $add we are tarkov, escape from tarkov, song, www.twitchClip.com");
        }
    }
}