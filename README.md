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

Some drawbacks of using Google Sheets as a database are the speed and lack of common database features. However, since I knew the number of rows will be relatively small (<1000) and I am only dealing with a single table of set columns, these were trade-offs I was willing to make. 