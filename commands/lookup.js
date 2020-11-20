/*
 * Function to determine if clip is already in the sheet.
 *
 * If clip in library, returns associated keywords.
*/

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('./client_secret.json');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E');

// Function to access sheet via google api
async function lookup(message, link) {
    console.log("Begin lookup call");
    // Auth
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    // For loop to check for dupicate links
    var rows = await sheet.getRows();
    var i;
    // gets unique twitch clip code from link
    // e.g. https://www.twitch.tv/siraaerios/clip/SpotlessCourageousNoodleMVGame?filter=clips&range=7d&sort=time
    // into SpotlessCourageousNoodleMVGame
    var key = link.split('/').pop().split('?')[0]; 
    // Linear loop to find match if exists
    for (i = 0; i < rows.length; i++) {
        if (rows[i].Clip.includes(key)) {
            console.log('lookup success');
            var keywords = rows[i].Keywords;
            message.channel.send('**This clip is already in the database!\nIt\'s keywords are: **' + keywords);
            return;
        }
    }
    console.log("no clip found in lookup");
    message.channel.send("This clip is not yet in the database! Feel free to add it with the $add command.");
}

// Function to lookup and return a list of clips with given keywords
async function find(message, args) {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    // For loop to check for dupicate links
    var rows = await sheet.getRows();
    var results = "";
    // Linear loop to find match if exists
    for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < args.length; j++) {
            if (rows[i].Keywords.includes(args[j])) {
                results = results + rows[i].Clip + "\n";
                break;
            }
        }
    }
    if (results == "") {
        message.channel.send("No clips found with the keyword(s): " + args);
    } else {
        message.channel.send(results);
    }
}

module.exports = {
    name: 'lookup',
    description: 'looks up clip in sheet',
    execute(message, args) {
        // Verify got args
        if (args.length < 1) {
            message.channel.send('Invalid format\n**Usage:** $lookup <link> **OR** $lookup <comma seperated keywords>');
            return;
        }
        var link = args[0]; // Get full link from args
        // Verfiy link
        if (link.includes('twitch.tv') && link.includes('clip') && 
            (link.startsWith('https://') || link.startsWith('www.') || last.startsWith('twitch.tv'))) {
            // placeholder for google addition api
            message.channel.send('Looking up clip in database...');
            // Launch function to lookup
            (async() => {
                await lookup(message, link);
            })();   
        } else {
            message.channel.send("Looking for clips with keyword(s): " + args);
            // Start the find function
            (async() => {
                await find(message, args);
            })();
        }
    }
}