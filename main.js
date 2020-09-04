const Discord = require('discord.js');
const client = new Discord.Client();

// Prefix for the bot command to be triggered
const prefix = '!';
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
    console.log('Music Boi is online!')
});

// trigger for bat seeing basic commands
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    var args = message.content.slice(prefix.length);
    
    const command = args.split(/ +/).shift().toLowerCase();

    args = args.slice(command.length+1).split(', ');
    // console.log(args);

    var sender = message.author; // User who send the command

    // Debug and basic test commands
    if (command == 'ping') {
        message.channel.send('pong');
    } else if (command == 'whoami') {
        message.channel.send(sender.username);
    } 
    // Function commands
    else if (command == 'mustard'){
        client.commands.get('mustard').execute(message, args);
    } else if (command == 'tarkov') {
        message.channel.send('https://www.twitch.tv/siraaerios/clip/AuspiciousCuriousTitanCopyThis?filter=clips&range=all&sort=time');
    } else if (command == 'list') {
        message.channel.send('https://docs.google.com/spreadsheets/d/13NWMHvTFKaaeKlu2u7HOkPT84PT-5ARKpsnHAihU26E/edit?usp=sharing');
    } else if (command == 'add') {
        client.commands.get('add').execute(message, args, sender.username);
    } else if (command == 'help') {
        client.commands.get('help').execute(message, args);
    } else if (command == 'overwrite') {
        client.commands.get('overwrite').execute(message, args, sender.username);
    }

});

client.login('NzUwMjE0NTUxNDU0MDg5MjM3.X03Rvw.-xeUprxzZWF4EgD-RITp7oxrmVw')