console.log('Loading event');

var doc = require('dynamodb-doc');
var AWS = require("aws-sdk");
var dynamodb = new doc.DynamoDB();
var tableName = "LattesUsers";

var item; 
var user;
var similar_users = [];
var matched_users = [];
var events;
var curr_event;

exports.lambda_handler = function(event, context) {
    console.log("Request received:\n" );
    console.log("Context received:\n");
    
    events = event;
    handle_events();
};

var handle_events = function()
{
    curr_event = events.Records.shift();
    similar_users = [];
    matched_users = [];
    user = 0;
    var data;
    console.log(curr_event);
    if( curr_event.eventName === "INSERT")
    {
        data = curr_event.dynamodb;
        item = {
                    "userId": data.Keys.userId['S'],
                    "coffeeCount": 0,
                    "interests": [],
                    "matched" : data.NewImage.matched['S']
        };
        data.NewImage.interests['L'].forEach(function(interest)
        {
            item.interests.push(interest['S']);
        });
        user = item.userId;
        if (item.matched === "null")
        {
            get_people_with_interests(item.interests);
        }
        
    }
    else if( curr_event.eventName === "MODIFY")
    {
        data = curr_event.dynamodb;
        console.log("EVent right now\n",data);
        item = {
            "userId": data.Keys.userId['S'],
            "coffeeCount": data.NewImage.coffeeCount,
            "interests": [],
            "matched" : data.NewImage.matched['S']
        };
        console.log("interests",data.NewImage.interests);
        data.NewImage.interests['L'].forEach(function(interest)
        {
            console.log("interests got",interest);
            item.interests.push(interest['S']);
        });
        user = item.userId;
        if( item.matched === "null" )
        {
            get_people_with_interests(item.interests);
        }
        else
        {
            if( events.Records.length > 0 )
              {
                   console.log("Next event")
                   handle_events();
              } 
        }
        
    }
    else
    {
        console.log("Remove_item");
       if( events.Records.length > 0 )
       {
           console.log("Next event");
           handle_events();
       }
    }
}

var update_items = function(items)
{
    item = items.pop();
    dynamodb.updateItem({  
        "TableName" : tableName,
        "Key" : {
            "userId" : item.userId
        },
        "UpdateExpression" : "SET #matched = :attrValue",
        "ExpressionAttributeNames" : {
            "#matched" : "matched"
        },
        "ExpressionAttributeValues" : {
            ":attrValue" : item.matched
        }
    }, function(err,data){
        if(err)
        {
            console.log(err);
        }
        else
        {
            if( items.length > 0)
            {
                update_items(items);
            }
            else
            {
               if( events.Records.length > 0 )
               {
                   console.log("Next event")
                   handle_events();
               }
            }
        }
    });
}

var get_people_with_interests = function(interests)
{
    var params1 = {
        TableName: tableName,
        FilterExpression: "contains(#interests, :interest)",
        ExpressionAttributeNames: {
            "#interests": "interests",
        },
        ExpressionAttributeValues: {
             ":interest": interests.pop()
        }
    };
    
    dynamodb.scan(params1, onScan);
    
    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the userIds and their interests
            data.Items.forEach(function(person) {
                if( person.matched === "null")
                    similar_users.push(person.userId);
            });
            if ( interests.length > 0 ){
                get_people_with_interests(interests);
            }
            else
            {
                console.log("Similar users collected", similar_users);
                get_matched_users(user, "uname");
            }
        }
    }
};

var get_matched_users = function(user, attribute)
{
    var params = {
        TableName: "LattesHistory",
        FilterExpression: "#userId = :user",
        ExpressionAttributeNames: {
            "#userId": attribute,
        },
        ExpressionAttributeValues: {
             ":user": user
        }
    };
    
    dynamodb.scan(params, onScan);
    
    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else 
        {
            // print all the already matched users
            var itemsProcessed = 0;
            if(data.Items.length == 0 )
            {
                if(attribute == "uname")
                    {
                        get_matched_users(user, "mname");
                    }
                else
                    {
                        cleanup_similar_users();
                    }
            }
            else
            {
                data.Items.forEach(function(person) {
                    if ( attribute == "uname" )
                    {
                        console.log("Matched before " + person.mname);
                        matched_users.push(person.mname);
                    }
                    else
                    {
                        console.log("Matched before " + person.uname);
                        matched_users.push(person.uname);
                    }
    
                    itemsProcessed++;
                    if(itemsProcessed === data.Items.length)
                    {
                        if(attribute == "uname")
                        {
                            get_matched_users(user, "mname");
                        }
                        else
                        {
                            cleanup_similar_users();
                        }
                    }
            });
            
            }
        }
    }
};

var cleanup_similar_users = function()
{
    console.log("CLeaning up", similar_users);
    similar_users.sort();
    var counts = [];
    var uname = similar_users[0];
    var count = -1;
    
    var itemsProcessed = 0;
    similar_users.forEach(function(x) {
        if(x == uname)
        {
            count++;
        }
        else
        {
            if(uname != user )
                counts.push({uname, count});
            uname = x;
            count = 0;
        }
        itemsProcessed++;
        if ( itemsProcessed === similar_users.length)
        {
            if(uname != user )
                counts.push({uname,count});
            for( var i = 0 ; i < counts.length - 1 ; i++)
            {
                for( var j = i; j < counts.length ;  j++)
                {
                    if(counts[i].count > counts[j].count)
                    {
                        var temp = counts[i];
                        counts[i] = counts[j];
                        counts[j] = temp;
                        
                    }
                }
            }
            similar_users = [];
            counts.forEach(function(sorted_user)
            {
                similar_users.push(sorted_user.uname);
            });
            compare_matched_similar_users();
        }
    });
};

var compare_matched_similar_users = function()
{
    var matched = "null";
    
    console.log("Similar_users before match", similar_users, "matched_users", matched_users);
    while(similar_users.length > 0 )
    {
        var prospective_match = similar_users.pop();
        if( matched_users.indexOf(prospective_match) > -1 )
        {
            console.log("Cant match", prospective_match);
        }
        else
        {
            matched = prospective_match;
            break;
        }
    }
    console.log("Final match" + matched);
    
    item.matched = matched;
    var items = [];
    if (item.matched != "null")
    {
        var other_user = {
            "userId" : item.matched,
            "matched" : item.userId
        }
        items.push(other_user);
        send_sns_queue(other_user);
    }
    

    items.push(item);
    update_items(items);

};

var send_sns_queue = function(item)
{
    var sns = new AWS.SNS();
    var message = "" + item.userId + " " + item.matched;
    console.log("\nDNS DNS DNS DNS\n",message)
    console.log("sns");
    sns.publish({
            TopicArn: "arn:aws:sns:us-west-2:506733387588:LattesSnsQueue",
            Message: message
    }, function(err, data) {
    if(err) {
        console.log('error publishing to SNS');
    } else {
        console.log('message published to SNS');
    }
        });
    console.log("ssdfns");
}
