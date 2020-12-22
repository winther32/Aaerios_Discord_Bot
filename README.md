# Clippy Bot Discord Bot
**By Mac Lyle**

Many of the most memorable moments in a Twitch stream are clipped by viewers. However, finding the links to these clips again is a nightmare as Twitch provides no way to search for them.

I set out to solve this problem with Clippy Bot, my first JS bot! Clippy Bot manages a community run library of Twitch clip links so anyone can find and enjoy their favorite clips with ease.

## Overview
Clippy Bot uses a Google Sheet to store all of the clip links along with keywords, dated added, and which user added it. Through commands typed in Discord, a user can:
1. Add a new clip to the sheet.
2. Overwrite the keywords for a clip.
3. Lookup the keywords for a given clip link.
4. Search the sheet for clips using keywords.

### Why use Google Sheets instead of a DB?
The main reason behind using Google Sheets is that I wanted this library of clips in its entirety to be easily accessible to the public. Sheets can be run in a browser and provided a quick and easy way to display the information to anyone with a link. Google Sheets is also very common and many people know how to use and navigate it. The APIs were also fairly simply and allowed for quicker development. 

Some drawbacks of using Google Sheets as a database are the speed and lack of common database features. However, as long as the number of rows (clips uploaded) remain relatively small the linear searche algorithm will give decent performance. 

## How can I add this bot to my Discord server?
Unfortunately this exact bot is set up to be unique to one Discord server and will require some very basic coding to set up on another server. There are 4 main steps required: 
1. Create your own Discord bot via the Discord dev console.
2. Set up a Google Sheets service account with access to a Google Sheet via Google API console.
3. Add the Google service account secrets json, Google sheet ID, and Discord bot token to the bot code. 
4. Add it to your server!

#### Make your own Discord bot
Follow https://www.sitepoint.com/discord-bot-node-js/ up to the start of step 4 then just clone this repo instead of theirs. The bot will need access to all the text permissions of the server.

#### Set up your Google Sheet backend
Follow https://support.google.com/a/answer/7378726?hl=en and select the Sheets API for the service account. You will then have to add the service account email as an editor to the sheet. Download the API secret json.

#### Integrate backend into code
1. You will need to add your bot token to the last line in main.js.
2. Put the secrets json in the commands folder. In the add.js, lookup.js, and overwrite.js files, you will need to replace paths in the creds and sheet variables with your own sheet manager json and sheet ID (the ID is just part of the Google sheet URL).

Beyond that I would suggest removing all of the server specific commands (marked in the comments) in main.js.

