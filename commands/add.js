const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('./client_secret.json');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E');


async function start(message, args, username, link) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    // Get the sheet in spreadsheet
    const sheet = await doc.sheetsByIndex[0];

    // For loop to check for dupicate links
    message.channel.send('Checking for duplicates...')
    var rows = await sheet.getRows();
    // console.log(rows[0]);
    // console.log(rows[1]);
    // console.log(rows.length);
    var i;
    for (i = 0; i < rows.length; i++) {
        if (rows[i].Clip == link) {
            console.log('Found duplicate link ' + rows[i].Clip);
            var keywords = rows[i].Keywords;
            message.channel.send('This clip is already in the database! It\'s keywords are: ' + keywords);
            return;
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
            if (last.includes('www.twitch.tv/siraaerios/clip/') && 
                (last.startsWith('https') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
                // placeholder for google addition api
                message.channel.send('Attempting to add clip to database...');
                
                (async() => {
                    // console.log('start async ' + username);
                    await start(message, args, username, last);
                    // console.log('end async');
                })();
            } else {
                message.channel.send('Invalid format\nUsage: !add <comma seperated keywords>, <link>');
            }
        } else {
            message.channel.send('Invalid format\nUsage: !add <comma seperated keywords>, <link>');
        }
    }
}