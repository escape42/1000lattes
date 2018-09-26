/*
 configuration for each condition.
 add any conditions here
 */
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

var SLACK_CONFIG = {
    token: "xoxb-214269429168-S3XfBRR2khepS35zPbflBMK4",
    base_api_path: "https://slack.com/api/users.list"
};

var http = require ('https');
var querystring = require ('querystring');

exports.handler = function(event, context) {
    console.log(event);
    console.log(event.Records);

    // parse information
    // var message = event.Records[0].Sns.Message;
    // var subject = event.Records[0].Sns.Subject;
    // var timestamp = event.Records[0].Sns.Timestamp;
    
    // Get all users
    var postData = querystring.stringify({
        "token": SLACK_CONFIG.token
    });
    
    var options = {
    host: "slack.com",
    path: SLACK_CONFIG.base_api_path,
    method: 'POST',
    headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    
    
    var body = ''
    var req = http.request(options, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function() {
            console.log("WTF")
            var body_json = JSON.parse(body)
            console.log(body_json.members.length);
            var items = body_json.members;
            put_items(items);
            });
    }).on('error', function(e) {
        context.done('error', e);
    });
    req.write(postData);
    req.end();
    
};

var put_items = function (items)
{
    member = items.pop();
    var item = {
        "uname": member.name,
        "id": member.id,
    };
    dynamodb.putItem({
            "TableName": "LattesSlackTeamMembers",
            "Item": item
        }, function(err, data) {
            if (err) 
            {
                console.log('ERROR: Dynamo failed: ' + err);
            } 
            else 
            {
                console.log("Put_item done", items.length);
                if( items.length > 0 )
                {
                    put_items(items);
                }
                else
                {
                    context.done(null,"WTF done yo")
                }
            }
        });
};

var put_item = function (item)
{
    dynamodb.putItem({
            "TableName": "LattesSlackTeamMembers",
            "Item": item
        }, function(err, data) {
            if (err) 
            {
                console.log('ERROR: Dynamo failed: ' + err);
            } 
            else 
            {
                console.log("Put_item done");
            }
        });
};