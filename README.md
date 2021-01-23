# Clippy Bot Discord Bot
**By Mac Lyle**

Many of the most memorable moments in a Twitch stream are clipped by viewers. However, finding the links to these clips again is a nightmare as Twitch provides no way to search for them.

I set out to solve this problem with Clippy Bot, my first JS bot! Powered by a AWS and GCP backend Clippy Bot manages a community run library of Twitch clip links so anyone can find and enjoy their favorite clips with ease.

## Overview
Clippy Bot stores all of the clip links along with keywords, date added, and which user added it. Through commands typed in Discord, a user can:
1. Add a new clip.
2. Overwrite the keywords for a clip.
3. Lookup the keywords for a given clip link.
4. Search the sheet for clips using keywords.
         
The library of clips that Clippy Bot manages consists of two tables. One in a Google Sheet for easy public access, the other in DynamoDB for faster query times. 

## Performance
The Dynamo table enables table additions and lookups in O(1). Overwrite must update the sheet and uses a bottom up linear search to find the appropriate clip in O(n), n being number of entries. Keyword search takes O(n*m) where m is the number of keywords.

It should also be noted that the size of the clip library is typically fairly small (< 200) and thus even linear search performance is expected to be under 1 second.

### Why use Google Sheets at all?
The main reason behind using Google Sheets is that I wanted this library of clips in its entirety to be easily accessible to the public. Sheets can be run in a browser and provided a quick and easy way to display the information to anyone with a link. The ctrl + F function also acts as an effective way to do broad searches of the data (for example searching by game). This is particularly helpful as the Bot keyword search only returns a limited number of entries found to prevent spamming in Discord.


## How can I add this bot to my Discord server?
Unfortunately this exact bot is set up to be unique to one Discord server and will require some intermediate coding to set up on another server. There are 4 main steps required: 
1. Create your own Discord bot via the Discord dev console and add it to your server.
2. Set up a Google Sheet and according service account.
3. Set up a DynamoDB table and service account. 
4. Integrate your backend. 

### Make your own Discord bot
Follow https://www.sitepoint.com/discord-bot-node-js/ up to the start of step 4 then just clone this repo instead of theirs. The bot will need access to all the text permissions of the server.

### Set up your Google Sheet backend
Follow https://support.google.com/a/answer/7378726?hl=en and select the Sheets API for the service account. You will then have to add the service account email as an editor to the sheet. Download the API secret json.

### Set up AWS Dynamo backend
See https://brianmorrison.me/blog/storing-info-in-a-database-with-discord-bots/ and follow the steps.

### Integrate backend into code
1. You will need to add your bot token to the last line in main.js.
2. Put the secrets json in the commands folder. In the add.js, lookup.js, and overwrite.js files, you will need to replace paths in the creds and sheet variables with your own sheet manager json and sheet ID (the ID is just part of the Google sheet URL).
3. You will have to add AWS credentials to the project and update all of the DynamoDB call parmaters according to how you set up/named your table.

Beyond that I would suggest removing all of the server specific commands (marked in the comments) in main.js. Also the sync command is specific to my DiscordID, you might want to change that as well.

