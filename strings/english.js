module.exports = {
    // Bot Status (console)
    bot_online: "Clippy Bot is Online",
    bot_online_testing: "Testing Bot is Online as Clippy Bot",

    // All strings below are sent to discord via message.channel.send()

    // Dynamo Status
    dyno_get_error: "Something went wrong! Unable to find clip.",
    dyno_get_found: "**Found the Clip!\nIt\'s keywords are: **",
    dyno_get_null: "This clip is not yet in the database! Feel free to add it with the `$add` command.",
    dyno_add_error: "Something went wrong! Unable to add clip.",
    dyno_add_success: "Clip successfully added!",
    dyno_update_error: "Something went wrong! Unable to update clip.",
    dyno_update_success: "Overwrite complete!",

    // Links:
    link_invalid: "Invalid twitch clip link!",

    //////////////////////// Commands ///////////////////////////

    // Add Command:
    cmd_add_starting: "Attempting to add clip...",
    cmd_add_usage: '**Usage:** `$add <comma seperated keywords/phrases>, <link>`\n',
    cmd_add_example: "**Example:** `$add we are tarkov, escape from tarkov, song, www.TwitchClip.com`",
    cmd_add_keyword_required: "At least one unique keyword/phrase is required.\n", 
   
    // Lookup Command:
    cmd_lookup_starting: "Looking up clip in database...",
    cmd_lookup_usage: "Invalid format\n**Usage:** `$lookup <link>`\n",
    cmd_lookup_example: "**Example:** `$lookup www.TwitchClip.com`",

    // Search Command
    cmd_search_starting: "Looking for clips with keyword(s): ",
    cmd_search_usage: "**Usage:** `$search <comma seperated keywords>`\n",
    cmd_search_example: "**Example:** `$lookup 50, cry`",
    cmd_search_keyword_cap_error: "For now you may only use up to **5** keywords in your search.",

    // Overwrite Command:
    cmd_overwrite_starting: "",
    cmd_overwrite_usage: "**Usage:** `$overwrite <comma seperated keywords/phrases>, <link>`\n",
    cmd_overwrite_example: "**Example:** `$overwrite we are tarkov, escape from tarkov, song, www.TwitchClip.com`",
    cmd_overwrite_keyword_required: "At least one unique keyword/phrase is required.\n", 
    
};