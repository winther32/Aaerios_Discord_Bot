/*
 * Function searches sheet for keyword matches and returns matching clips
 * 
 * The search function is basic and searches the sheet in O(N*M*O(X)) 
 * N=rows, M=keywords, O(X)=Big O of JS string.includes method
 * However in practice is expected to run closer to O(N) as M is limited to 5 and 
 * most rows will be evaluated based on the first keyword check.
 * 
 */

const linkUtil = require('../utils/links');
require('dotenv').config(); // init env variables
const strs = require('../strings/english');
const creds = require('../secrets//client_secret.json'); // Sheet manager creds
const { GoogleSpreadsheet } = require('google-spreadsheet');

// init Google sheet access via wrapper 
// @see https://theoephraim.github.io/node-google-spreadsheet/#/
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet(process.env.GCP_SHEET_ID);

// Function to lookup and return a list of clips with given keywords
// This is a basic search algorithm. O(N*M) N=rows in database, M=args given
// Realistically, in practice expect to get much closer to O(N) time.
async function keywordSearch(message, args) {
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
            for (matches; matches < args.length; matches++) {
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
        for (var i = 0; i < 5; i++) {
            message.channel.send(results[i]);
        }
        message.channel.send("For the rest of the matching clips try narrowing your search or use `$library` and search the full library.")
    } else {
        for (var i = 0; i < results.length; i++) {
            message.channel.send(results[i]);
        }
    }
}

module.exports = {
    name: 'search',
    description: 'keyword search of clips in sheet',
    execute(message, args) {
        // Verify got correct args for this function. I.E. just a link or comma separated keywords (up to 5)
        // Check if args are empty
        if (args.length == 0) {
            message.channel.send(strs.cmd_search_usage + strs.cmd_search_example);
            return;
        } else {
            message.channel.send(strs.cmd_search_starting + args);
            (async () => {
                await keywordSearch(message, args);
            })();
        }
    }
}