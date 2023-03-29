module.exports = {
  /**************** Where all CLI flag commands are defined using yargs ********************/

  // Sets the env var DEV_MODE to true with flag --dev
  devFlag() {
    const argv = require('yargs/yargs')(process.argv.slice(2))
      .usage('Usage: $0 <command> [options]')
      .command("--dev", "run in dev test mode")
      .help()
      .argv;

    if (argv.dev) {
      console.log("Dev Mode activated");
      process.env.DEV_MODE = true;
    }
  },

  /**************** Services relating to the handling and manipulation of URLs. *******************/ 

  // Verifiy that a given link is a link to a twitch clip 
  verifyLink(link) {
    // Ensure var passed in exists
    if (link == null) {
      console.warn("No param passes to verifyLink() service.");
      return false;
    } else if (link.includes('twitch.tv') && link.includes('clip') && 
      (link.startsWith('https://') || link.startsWith('www.') || last.startsWith('twitch.tv'))) {
        return true;
    } else {
      return false;
    }
  },

  // Gets unique twitchID from a valid twitch clip URL
  extractTwitchID(link) {
    return link.split('/').pop().split('?')[0];
  }
}