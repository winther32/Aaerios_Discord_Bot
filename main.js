/*
 * This is a Discord Bot built specifically for SirAaerios's server "The Realm"
 *
 * This bot helps to build and manage a community driven library of twitch clips via Google Sheets.
 * It also has some fun commands for the community to use.
 * 
 * Built by Mac Lyle a.k.a Winther32
*/


// Init discord sdk
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const Discord = require('discord.js');
const client = new Discord.Client();

// Prefix for the bot command to be triggered
const prefix = '$';
const prefix1 = 'c!';
const fs = require('fs');
client.commands = new Discord.Collection();

// read in commands in commands dir
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Log that the Bot is online
client.once('ready', () => {
    console.log('Clippy Bot is online!')
});

// trigger for bot seeing basic commands
client.on('message', message => {
    if((!message.content.toLowerCase().startsWith(prefix) && !message.content.toLowerCase().startsWith(prefix1)) || message.author.bot) return;
    
    // remove prefix
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

    var sender = message.author; // User who send the command
    // Log parsed call info
    console.log("Sender:" + sender.username + ", Command:" + command + ", Args:" + args);

    // Debug and basic test commands
    if (command == 'ping') {
        message.channel.send('pong');
    } else if (command == 'whoami') {
        message.channel.send(sender.username);
    } 
    // Help command
    else if (command == 'help' || command == 'commands') {
        client.commands.get('help').execute(message, args);
    } else if (command == 'intro') {
        client.commands.get('intro').execute(message);
    }
    // Hardcode Clip commands
    else if (command == 'mustard'){
        message.channel.send('https://www.twitch.tv/siraaerios/clip/BumblingLachrymoseFloofM4xHeh?filter=clips&range=all&sort=time');
    } else if (command == 'tarkov') {
        message.channel.send('https://www.twitch.tv/siraaerios/clip/AuspiciousCuriousTitanCopyThis?filter=clips&range=all&sort=time');
    } else if (command == 'milk') {
        message.channel.send('https://www.twitch.tv/siraaerios/clip/PhilanthropicJoyousFriseeRitzMitz?filter=clips&range=all&sort=time');
    } else if (command == 'salsa') {
        message.channel.send("https://www.twitch.tv/siraaerios/clip/GrotesqueHorribleDogPupper?filter=clips&range=all&sort=time");
    } else if (command == 'yogurt') {
        message.channel.send("https://clips.twitch.tv/PrettyArtisticTapirPeoplesChamp");
    }
    
    // Image commands
    else if (command == 'angry') {
        message.channel.send('Aaerios ANGRY!', {files: ["https://cdn.discordapp.com/attachments/758413393076944916/785628010665345044/Aaerios_Angry.png"]});
    } else if (command == 'unit') {
        message.channel.send("Aaerios is BUILT DIFFERENT. He's a UNIT!", {files: ["https://cdn.discordapp.com/attachments/758413393076944916/785627801332088852/swol_aaerios.jpg"]});
    } else if (command == 'devil') {
        message.channel.send({files: ["https://cdn.discordapp.com/attachments/758413393076944916/785627918972878868/devil_aaerios.png"]});
    }
    
    // Library Commands
    else if (command == 'songs') {
        message.channel.send('https://docs.google.com/spreadsheets/d/1NKLFkkU6ofni-dDHVYciDnjgOVbcyVhjYalAAMqzSzo/edit?usp=sharing');
    } else if (command == 'library' || command == 'lib') {
        message.channel.send('https://docs.google.com/spreadsheets/d/13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E/edit?usp=sharing');
    } else if (command == 'add') {
        client.commands.get('add').execute(message, args, sender.username);
    } else if (command == 'overwrite') {
        client.commands.get('overwrite').execute(message, args, sender.username);
    } else if (command == 'lookup') {
        client.commands.get('lookup').execute(message, args);
    }

});

const access = require("./secrets/discordToken");
client.login(access.token)