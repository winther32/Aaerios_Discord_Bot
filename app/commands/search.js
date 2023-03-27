/*
 * Function searches sheet for keyword matches and returns matching clips
 * 
 * The search function is basic and searches the sheet in O(N*M*O(X)) 
 * N=rows, M=keywords, O(X)=Big O of JS string.includes method
 * However in practice is expected to run closer to O(N) as M is limited to 5 and 
 * most rows will be evaluated based on the first keyword check.
 * 
 */

const strs = require('../strings/english');
const GcpService = require('../services/gcpSheets');

const gcpService = new GcpService();

// Call the keyword search in the GCP service and respond to user.
async function keywordSearch(message, args) {
    gcpService.searchSheet(args, (res) => {
        if (res.totalMatches == 0) {
            message.channel.send(strs.cmd_search_none_found + args);
        } else {
            message.channel.send(`**${res.totalMatches}** clips matched your search. ${res.totalMatches > 5 ? "Here are the first 5:" : ""}\n`);
            for (const link of res.data) {
                message.channel.send(link);
            }
            if (res.totalMatches > 5) {
                message.channel.send(strs.cmd_search_result_overflow);
            }
        }
    });
}

module.exports = {
    name: 'search',
    description: 'keyword search of clips in sheet',
    execute(message, args) {
        // Verify got correct args for this function. I.E. <=5 comma separated keywords
        // Check if args are empty
        if (args.length == 0) {
            message.channel.send(strs.cmd_search_usage + strs.cmd_search_example);
            return;
        } else if (args.length > 5) {
            message.channel.send(strs.cmd_search_keyword_cap_error);
            return;
        } else {
            message.channel.send(strs.cmd_search_starting + args);
            (async () => {
                await keywordSearch(message, args);
            })();
        }
    }
}