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
}


module.exports = {
    name: 'lookup',
    description: 'looks up clip in sheet',
    execute(message, args) {
        var link = args[0]; // Get full link from args
        // Verfiy link
        if (last.includes('twitch.tv') && last.includes('clip') && 
            (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
            // placeholder for google addition api
            message.channel.send('Looking up clip in database...');
            // Launch function to lookup
            (async() => {
                await lookup(message, link);
            })();   
        } else {
            message.channel.send('Invalid format\n**Usage:** !lookup <link>');
        }
    }
}