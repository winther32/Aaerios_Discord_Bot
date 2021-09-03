module.exports = {
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
    }
}