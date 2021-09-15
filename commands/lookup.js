/*
 * Function to determine if clip is already in the sheet and return it's keywords.
 * The lookup by link function uses DynamoDb query and runs in O(1)
*/

// const { PerformanceObserver, performance } = require('perf_hooks'); // Performance API
const linkUtil = require('../utils/links');
const strs = require('../strings/english');
const Dynamo = require('../services/dynamo');

const dynamo = new Dynamo();


// Determine if the link provided exists in the database
function lookupLink(message, link) {
    // Performance logging
    // var start = performance.now();

    // Get unique twitchID from link
    const twitchID = linkUtil.extractTwitchID(link);

    // Call dynamo service
    dynamo.get(twitchID, (error, keywords) => {
        if (error) {
            message.channel.send(strs.dyno_get_error);
        } else if (keywords) {
            message.channel.send(strs.dyno_get_found + keywords);
        } else {
            message.channel.send(strs.dyno_get_null);
        }

        // Performance logging
        // var stop = performance.now();
        // console.log("Lookup call took " + (stop-start) +  " milliseconds.");
    });
}

module.exports = {
    name: 'lookup',
    description: 'looks up clip in db',
    execute(message, args) {
        // Verify got correct args for this function. I.E. just a link or comma separated keywords (up to 5)
        // Check if args are empty
        if (args.length == 0) {
            message.channel.send(strs.cmd_lookup_usage + strs.cmd_lookup_example);
            return;
        }
    
        var link = args[0]; // Check if first arg is a link. Determines lookup/find method
        // Verfiy link
        if (linkUtil.verifyLink(link)) {
            // placeholder for google addition api
            message.channel.send(strs.cmd_lookup_starting);
            // Launch function to lookup O(1)
            lookupLink(message, link);
        } else {
            message.channel.send(strs.link_invalid);
        }
    }
}