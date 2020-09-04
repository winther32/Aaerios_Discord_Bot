
const { GoogleSpreadsheet } = require('google-spreadsheet');
var creds = require('./client_secret.json');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E');

async function overwrite(message, args, username, link) {
    // Authenticate with the Google Spreadsheets API.
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
     // Get the sheet in spreadsheet
     const sheet = await doc.sheetsByIndex[0];
     var rows = await sheet.getRows();

     const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

     // Look for the given link in O(N)
     var i;
     for (i = 0; i < rows.length; i++) {
         if (rows[i].Clip == link) {
             console.log('Found link to overwrite: ' + rows[i].Clip);
             var keywords = rows[i].Keywords;
             message.channel.send('Are you sure you want to overwrite the following keywords?\n' + keywords +
                                '\n New Keywords:\n' + args.join().toLowerCase()).then(txt => {
                txt.react('👍').then(() => txt.react('👎')),
                txt.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                        if (reaction.emoji.name === '👍') {
                            rows[i].Keywords = args.join().toLowerCase();
                            rows[i].save();
                            message.channel.send('Overwrite complete!');
                            console.log('Tried to overwrite');
                            return;
                        } else {
                            message.channel.send('Cancelled');
                            console.log('Cancelled overwrite');
                            return;
                        }
                    })
                    .catch(collected => {
                        message.reply('Action cancelled. Timed out.');
                    })
                });
        return;
        }
    }
    message.channel.send("Couldn't find clip in database.");
}

module.exports = {
    name: 'overwrite',
    description: 'overwrite keywords for given clip',
    execute(message, args, username) {
         // Ensure getting something to sort by and a link
         if (args.length >= 1) {
            // get the last argument of the command. Should be clip
            const last = args.pop();
            if (last.includes('twitch.tv/siraaerios/clip/') && 
                (last.startsWith('https://') || last.startsWith('www.') || last.startsWith('twitch.tv'))) {
                // placeholder for google addition api
                
                (async() => {
                    // console.log('start async ' + username);
                    await overwrite(message, args, username, last);
                    // console.log('end async');
                })();
            } else {
                message.channel.send('Invalid format\nUsage: !overwrite <comma seperated keywords>, <link>');
            }
        } else {
            message.channel.send('Invalid format\nUsage: !overwrite <comma seperated keywords>, <link>');
        }
    }
}