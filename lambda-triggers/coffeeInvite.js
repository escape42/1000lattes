/*
 configuration for each condition.
 add any conditions here
 */
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

var SLACK_CONFIG = {
    token: "xoxb-214269429168-S3XfBRR2khepS35zPbflBMK4",
    base_api_path: "https://slack.com/api/"
};

var http = require ('https');
var querystring = require ('querystring');
var userIds = [];


exports.handler = function(event, context) {
    console.log("UserIds are: "+ event.Records[0].Sns.Message)
    var matched_people = event.Records[0].Sns.Message.split(" ");
    var main_user = matched_people[0];
    var matched_user = matched_people[1];
    var users = [main_user, matched_user];
    console.log("Printing out Users "+users);
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
    get_userIds(users);
};

var get_userIds = function(users){
    var user = users.pop();
    var params = {
        TableName : "LattesSlackTeamMembers",
        KeyConditionExpression:"#uname = :uname",
        ExpressionAttributeNames: {
            "#uname":"uname"
        },
        ExpressionAttributeValues: {
            ":uname": user 
        }
    };
    
    dynamodb.query(params,function(err,data) {
        if(err) 
        {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } 
        else
        {
           
           if (users.length > 0)
           {
               userIds = userIds + data.Items[0].id + ",";
               get_userIds(users);
           }
           else
           {                
                
                userIds = userIds + data.Items[0].id;
                console.log("userIds",userIds);
                
                var postData = querystring.stringify({
                    "token": SLACK_CONFIG.token,
                    "users": userIds
                    });
                
                var options = {
                host: "slack.com",
                path: SLACK_CONFIG.base_api_path+"mpim.open",
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
                        var body_json = JSON.parse(body)
                        var quotes = ["The universe has decided, the two of you need to have coffee together!",
                        "Coffee and new friends make the perfect blend! Share a cup?", 
                        "ZG is a team sport! Meet a new member on the team?", 
                        "Sometimes coffee with a stranger is all the therapy you need.",
                        "It takes two to latte! Share a coffee or tea if you please?"];
                        var postDataMessage = querystring.stringify({
                        "token": SLACK_CONFIG.token,
                        "channel": body_json.group.id,
                        "text":  quotes[Math.floor(Math.random() * quotes.length)]
                        });
                
                        var optionsMessage = {
                        host: "slack.com",
                        path: SLACK_CONFIG.base_api_path+"chat.postMessage",
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        
                        console.log("Got to right before the next request");
                        var bodyMessageResponse = ''
                        var req = http.request(optionsMessage, function(res) {
                            console.log("Got response: " + res.statusCode);
                            res.on("data", function(chunk) {
                                bodyMessageResponse += chunk;
                            });
                            res.on("end", function() {
                                console.log("??? message")
                                var body_json = JSON.parse(bodyMessageResponse)
                                console.log(body_json);
                                });
                        }).on('error', function(e) {
                            context.done('error', e);
                        });
                        req.write(postDataMessage);
                        req.end();
                                            
                        });
                }).on('error', function(e) {
                    context.done('error', e);
                });
                req.write(postData);
                req.end();
           }
        }
    });
}