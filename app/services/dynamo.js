// Service layer for interacting with DynamoDB

const AWS = require('aws-sdk');
const dev = process.env.DEV_MODE;

// init AWS DynamoDB access and doc client
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
})
const docClient = new AWS.DynamoDB.DocumentClient();

class DynamoService {

    // Queries DB for clip with given ID, if exists returns clip keywords, else return null;
    get(twitchID, callback) {
        // Dynamo query params
        var qParams = {
            TableName: 'discord-clip-lookup',
            KeyConditionExpression: "id = :key",
            ExpressionAttributeValues: {
                ":key": twitchID
            }
        }

        console.log("Querying lookup DB... Key: " + twitchID);

        // Query the DB to check for duplicates
        docClient.query(qParams, (error, data) => {
            if (error) {
                // Failure to complete the query
                console.error("Error: Unable to query dynamo lookup table. " + error);
            } else {
                // Successful query
                console.log("Get query success: " + twitchID);
                if (data.Count != 0) {
                    // Entry already in the lookup DB
                    dev ? console.log("Clip already in DB.") : '';
                    data = data.Items[0].info.keywords;
                } else {
                    // Clip not found in DB
                    dev ? console.log("Clip not found in DB.") : '';
                    data = null;
                }
            }
            // Throw the callback response up.
            if (typeof callback == "function") {
                callback(error, data);
            }
        });
    };

    // Builds clip object and then attempts to put into Dynamo. Callback returns error or null (success)
    put(keywords, username, link, twitchID, callback) {
        // Catch for dev testing so don't modify db or sheet in testing.
        if (process.env.DEV_MODE) {
            // Dummy response for dev
            console.log("Ping add to Dynamo Service Layer");
            // Throw the callback response up with success (ie no error)
            if (typeof callback == "function") {
                callback();
            }
            return;
        }

        console.log("Attempting to add entry to lookup DB.");
        // Object to hold all the data as a value
        let data = {};
        // Build the info object
        data.link = link;
        data.author = username;
        data.date = Date.now(); // Date as number (unix time)
        data.keywords = keywords;

        // Set up the params for Dynamo to save to table
        const params = {
            TableName: 'discord-clip-lookup',
            Item: {
                // unique key for table
                id: twitchID,
                // where the data is stored (value)
                info: data
            }
        }

        // Actually put value into table
        docClient.put(params, (error => {
            if (error) {
                // Failure log. Throw error.
                console.error("Unable to add to DB." + error);
            } else {
                // Success log
                console.log("DB add success:" + twitchID);
            }
            // Throw the callback response up.
            if (typeof callback == "function") {
                callback(error);
            }
        }));
    };

    // Builds update params and calls update on dynamo. Callback returns error or null (success)
    update(newKeywords, twitchID, callback) {
        // Catch for dev testing so don't modify db or sheet in testing.
        if (process.env.DEV_MODE) {
            // Dummy response for dev
            console.log("Ping update to Dynamo Service Layer");
            // Throw the callback response up with success (ie no error)
            if (typeof callback == "function") {
                callback();
            }
            return;
        }

        // Update params
        var params = {
            TableName: 'discord-clip-lookup',
            Key: { 'id': twitchID },
            UpdateExpression: "set #i.#k = :nK",
            ExpressionAttributeNames: {
                "#i": "info",
                "#k": "keywords"
            },
            ExpressionAttributeValues: {
                ':nK': newKeywords.join()
            }
        }

        docClient.update(params, (error) => {
            if (error) {
                // Overwrite in Dynamo failure
                console.error("Unable to overwrite DB. Key:" + twitchID + "Err: " + error);
            } else {
                // Overwrite of DB is a success
                console.log("DB ovewrite successful " + twitchID);
            }
            // Throw the callback response up with success (ie no error)
            if (typeof callback == "function") {
                callback(error);
            }
        });
    }
}

module.exports = DynamoService;
