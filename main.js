/*
 * Clippy Bot Discord Bot
 *
 * This is a Discord Bot built specifically for SirAaerios's server "The Realm"!
 * 
 * If you wish to adapt this bot to manage another clip library, you will need to create a new bot
 * on Discord and create your own Google service account to manage the google sheet. 
 *
 * This bot helps to build and manage a community driven library of twitch clips via Google Sheets.
 * A link to SirSserios's library is below:
 * @see https://docs.google.com/spreadsheets/d/13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E/edit?usp=sharing
 * 
 * This bot also has fun commands specifically tailored to the SirAaerios Discord server.
 * 
 * Built by Mac Lyle a.k.a Winther32
*/


// Init discord sdk
// const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const Discord = require('discord.js');
const client = new Discord.Client();

// Google Sheet info for clip library
const sheet = require('./secrets/sheetID');

// Prefix for the bot command to be triggered
const prefix = '$';
const prefix1 = 'c!';
const fs = require('fs');
client.commands = new Discord.Collection();

// Read in commands in commands dir
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Log that the Bot is online
client.once('ready', () => {
    console.log('Clippy Bot is online!')
});

// Trigger for bot seeing basic commands
client.on('message', message => {
    // Check if prefix called or message is sent by a bot.
    if((!message.content.toLowerCase().startsWith(prefix) && !message.content.toLowerCase().startsWith(prefix1)) || message.author.bot) return;
    
    // Remove prefix
    var args; 
    if (message.content.toLowerCase().startsWith(prefix)) {
        args = message.content.slice(prefix.length);
    } else {
        args = message.content.slice(prefix1.length);
    }
    
    // Split command from args
    const command = args.split(/ +/).shift().toLowerCase();
    // Create args array based on comma seperations
    args = args.slice(command.length+1).split(/ *,+ */);

    // Clean user input.
    // Filter out potential holes in args array
    args = args.filter(function (el) {
        return (el != null && el != "" && el != NaN);
    });
    // Trim all input strings
    for (var i = 0; i < args.length; i++) {
        args[i] = args[i].trim();
    }

    var username = message.author.username; // User who send the command
    // Log parsed call info
    console.log("Sender:" + username + ", Command:" + command + ", Args:" + args);

    
    switch (command) {
        // Help commands
        case 'help':
        case 'commands':
            client.commands.get('help').execute(message, args);
            break;
        case 'intro':
            client.commands.get('intro').execute(message);
            break;

        // Library Commands
        case 'library':
        case 'lib':
            message.channel.send(sheet.link);
            break;
        case 'add':
            client.commands.get('add').execute(message, args, username);
            break;
        case 'overwrite':
            client.commands.get('overwrite').execute(message, args);
            break;
        case 'lookup':
        case 'search':
            client.commands.get('lookup').execute(message, args);
            break;
        case 'sync':
            client.commands.get('sync').execute(message, args);
            break;

        // Hardcode Clip commands (Server specific)
        case 'mustard':
            message.channel.send('https://www.twitch.tv/siraaerios/clip/BumblingLachrymoseFloofM4xHeh?filter=clips&range=all&sort=time');
            break;
        case 'tarkov':
            message.channel.send('https://www.twitch.tv/siraaerios/clip/AuspiciousCuriousTitanCopyThis?filter=clips&range=all&sort=time');
            break;
        case 'milk':
            message.channel.send('https://www.twitch.tv/siraaerios/clip/PhilanthropicJoyousFriseeRitzMitz?filter=clips&range=all&sort=time');
            break;
        case 'salsa':
            message.channel.send("https://www.twitch.tv/siraaerios/clip/GrotesqueHorribleDogPupper?filter=clips&range=all&sort=time");
            break;
        case 'yogurt':
            message.channel.send("https://clips.twitch.tv/PrettyArtisticTapirPeoplesChamp");
            break;

        // Image commands (Server specific)
        case 'angry':
            message.channel.send('Aaerios ANGRY!', {files: ["https://cdn.discordapp.com/attachments/758413393076944916/785628010665345044/Aaerios_Angry.png"]});
            break;
        case 'unit':
            message.channel.send("Aaerios is BUILT DIFFERENT. He's a UNIT!", {files: ["https://cdn.discordapp.com/attachments/758413393076944916/785627801332088852/swol_aaerios.jpg"]});
            break;
        case 'devil':
            message.channel.send({files: ["https://cdn.discordapp.com/attachments/758413393076944916/785627918972878868/devil_aaerios.png"]});
            break;
        case 'nom':
            message.channel.send({files: ["https://cdn.discordapp.com/attachments/708925850690650166/796615093629747220/qlufpuswmn921.png"]});
            break;

        // Misc. commands (Server specific)
        case 'songs':
            message.channel.send('https://docs.google.com/spreadsheets/d/1NKLFkkU6ofni-dDHVYciDnjgOVbcyVhjYalAAMqzSzo/edit?usp=sharing');
            break;

        default:
            break;
    }
});

const access = require("./secrets/discordToken");
client.login(access.token)