// Service layer for interacting with GCP sheet

const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../secrets/client_secret.json'); // Sheet manager creds

/* init Google sheet access via wrapper 
 * @see https://theoephraim.github.io/node-google-spreadsheet/#/
 * Create a document object using the ID of the spreadsheet - obtained from its URL. */
const doc = new GoogleSpreadsheet(process.env.GCP_SHEET_ID);

// class wrapper for all service functions.
class GcpSheetService {
    
    // Function to use google API and access sheet
    async addToSheet(keywords, username, link, twitchID) {
        // Catch for dev testing so don't modify db or sheet in testing.
        if (process.env.DEV_MODE) {
            // Dummy response for dev
            console.log("Ping addToSheet Service Layer");
            return;
        }

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

    // Overwrite keywords in Sheet in O(n)
    async overwriteSheet(newKeywords, twitchID) {
        // Catch for dev testing so don't modify db or sheet in testing.
        if (process.env.DEV_MODE) {
            // Dummy response for dev
            console.log("Ping overwriteSheet Service Layer");
            return;
        }

        // Authenticate with the Google Spreadsheets API.
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        // Get the sheet in spreadsheet
        const sheet = doc.sheetsByIndex[0];
        var rows = await sheet.getRows();

        // Look for the given link in O(N)
        // Searches in reverse order since overwrite is likely to be used most often to correct mistakes in clips just added.
        var i;
        for (i = (rows.length - 1); i >= 0; i--) {
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
        if (i < 0) {
            throw "Overwrite unsuccessful. Unable to find clip in Sheet. Likely clip in DB but not sheet.";
        }
    }

    // Function to lookup and return a list of clips with given keywords
    // This is a basic search algorithm. O(N*M) N=rows in database, M=args given
    // Realistically, in practice expect to get much closer to O(N) time.
    async searchSheet(args, callback) {
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();

        // Get the sheet in spreadsheet
        const sheet = await doc.sheetsByIndex[0];
        var rows = await sheet.getRows();

        // Keyword search function
        var results = [];
        var numberOfResults = 0;
        // Linear loop to find match if exists up to 5 matches returned
        for (let i = 0; i < rows.length; i++) {
            let j = 0;
            // Verify rest user keywords are present in clip keywords.
            for (j; j < args.length; j++) {
                if (!rows[i].Keywords.includes(args[j])) {
                    break;
                }
            }
            // If all user keywords present, add clip to result and count it.
            if (j == args.length) {
                // Only add to the results array if less than 5 stored.
                if (results.length < 5) {
                    results.push(rows[i].Clip);
                }
                numberOfResults++;
            }
        }

        // Return the results of search in response obj
        let response = {
            data: results,
            totalMatches: numberOfResults
        }
        // Throw the callback response up with success (ie no error)
        if (typeof callback == "function") {
            callback(response);
        }
    }
}

module.exports = GcpSheetService;