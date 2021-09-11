// Services relating to the handling and manipulation of URLs.

module.exports = {
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