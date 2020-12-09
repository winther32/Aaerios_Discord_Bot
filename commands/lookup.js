/*
 * Function to determine if clip is already in the sheet and return it's keywords.
 * OR function searches sheet for keyword matches and returns matching clips
 *
 * 
 * The lookup by link function is a simple linear search O(N) N=rows
 * 
 * The search function is basic and searches the sheet in O(N*M*O(X)) 
 * N=rows, M=keywords, O(X)=Big O of JS string.includes method
 * However in practice is expected to run closer to O(N) as M is limited to 5 and 
 * most rows will be evaluated based on the first keyword check.
 * 
*/

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('../secrets//client_secret.json'); // Sheet manager creds
var sheet = require('../secrets/sheetID'); // Lib sheet ID
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet(sheet.ID);

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
    message.channel.send("This clip is not yet in the database! Feel free to add it with the `$add` command.");
}

// Function to lookup and return a list of clips with given keywords
// This is a basic search algorithm. O(N*M) N=rows in database, M=args given
// Realistically, in practice expect to get much closer to O(N) time.
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
        // If the first keyword matches, verify rest of keywords before adding
        if (rows[i].Keywords.includes(args[0])) {
            var matches = 1; // Count keyword matches, already matched 1
            // Verify rest user keywords are present in clip keywords. Won't enter loop if only 1 user keyword
            for (matches; matches<args.length; matches++) {
                if (!rows[i].Keywords.includes(args[matches])) {
                    break;
                }
            }
            // If all user keywords present, add clip to result and count it.
            if (matches == args.length) {
                results.push(rows[i].Clip);
                numberOfResults++;
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
    description: 'looks up or searches clip in sheet',
    execute(message, args) {
        // Verify got correct args for this function. I.E. just a link or comma separated keywords (up to 5)
        // Check if args are empty
        if (args.length == 0) {
            message.channel.send('Invalid format\n**Usage:** `$lookup <link>` **OR** `$lookup <comma seperated keywords>`\n' +
                                "**Example:** `$lookup www.TwitchClip.com` **OR** `$lookup 50, cry`");
            return;
        }
        // Limiting large amounts of keywords in search.
        if (args.length > 5) {
            message.channel.send("Please limit your searches to 5 keywords at most");
            return;
        }

        var link = args[0]; // Check if first arg is a link. Determines lookup/find method
        // Verfiy link
        if (link.includes('twitch.tv') && link.includes('clip') && 
            (link.startsWith('https://') || link.startsWith('www.') || last.startsWith('twitch.tv'))) {
            // placeholder for google addition api
            message.channel.send('Looking up clip in database...');
            // Launch function to lookup
            (async() => {
                await lookup(message, link);
            })();   
        } else { // first arg is not a link so must be a keyword
            message.channel.send("Looking for clips with keyword(s): " + args);
            // Start the find function
            (async() => {
                await find(message, args);
            })();
        }
    }
}