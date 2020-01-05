var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

// config:
app.set('port', (process.env.PORT || 6000));

// middlewares:
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true  })); 

// routes
app.post('/hook/*', function (req, res) {
    var data = req.body;
    var slackHook = req.params['0'];
    console.log('heroku hook body: ', h);
    console.log('target slack webhook url: ', slackHook);

    var slack = {
        attachments: [
            {
                fallback: "Required plain-text summary of the attachment.",
                color: "#36a64f",
                author_name: data.data.app.name,
                author_link: data.data.app.name,
                title: "Heroku " + data.data.resource.toUpperCase(),
                text: "Optional text that appears within the attachment",
                fields: [
                    {
                        title: "Priority",
                        value: "High",
                        short: false
                    }
                ],
                footer: "Heroku Notification",
                ts: Date.now()
            }
        ],
        username: 'heroku-bot',
        icon_emoji: ':space_invader:'
    };

    console.log(util.format('sending to slack webhook: \n%j\n', slack));

    request.post({
        url: slackHook,
        form: {
            payload: JSON.stringify(slack)
        }},
        function(err, httpResponse, body) {
            console.log('slack response:');
            if (err) {
                console.error(err);
                res.status(400).send('oops');
                return;
            }

            console.log(body);
            res.send('thanks!');
        }
    );

});

// serve:
var server = app.listen(app.get('port'), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('listening at http://%s:%s', host, port);
});

