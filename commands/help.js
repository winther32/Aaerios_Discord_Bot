module.exports = {
    name: 'help',
    description: 'info on available commands',
    execute(message, args) {
        message.channel.send("Clippy Boi Command List!\nClips: mustard, tarkov\nData: list, overwrite, add\nQuestions: DM Winther32");
    }
}