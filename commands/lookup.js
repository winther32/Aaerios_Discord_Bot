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
// This is a super basic search algorithm. O(n*m) n=rows in database, m=args given
async function find(message, args) {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    var rows = await sheet.getRows();
    var results = [];
    var numberOfResults = 0;
    // Linear loop to find match if exists up to 5 matches returned
    for (var i = 0; i < rows.length; i++) {
        // Try to match args to keyworkds in row.
        for (var j = 0; j < args.length; j++) {
            // Add link to result array if a keyword matches
            if (rows[i].Keywords.includes(args[j])) {
                results.push(rows[i].Clip);
                numberOfResults++;
                break;
            }
        }
    }

    // Return the results of search
    if (results.length == 0) {
        message.channel.send("No clips found with the keyword(s): " + args);
    } else if (numberOfResults > 5) {
        message.channel.send(numberOfResults + " clips matched your search. Here are the first 5:\n")
        for (var i=0; i<5; i++){
            message.channel.send(results[i]);
        }
        message.channel.send("For the rest of the matching clips try narrowing your search or use `$library` and search the full library.")
    } else {
        for (var i=0; i<results.length; i++){
            message.channel.send(results[i]);
        }
    }
}

module.exports = {
    name: 'lookup',
    description: 'looks up clip in sheet',
    execute(message, args) {
        // Verify got args
        if (args[0] == '') {
            message.channel.send('Invalid format\n**Usage:** $lookup <link> **OR** $lookup <comma seperated keywords>');
            return;
        }
        // Limiting large amounts of keywords in search.
        if (args.length > 5) {
            message.channel.send("Please limit your searches to 5 keywords at most");
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