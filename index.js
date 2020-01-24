var util = require("util");
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");

var app = express();

// config:
app.set("port", process.env.PORT || 6000);

// middlewares:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.post("/hook/*", function(req, res) {
  var data = req.body;
  var slackHook = req.params["0"];
  console.log("heroku hook body: ", data);
  console.log("target slack webhook url: ", slackHook);

  var slack = {
    attachments: [
      {
        fallback: "Required plain-text summary of the attachment.",
        color: "#36a64f",
        author_name: data.data.app.name,
        title:
          "Heroku Event '" +
          data.resource[0].toUpperCase() +
          data.resource.slice(1) +
          "'",
        title_link: "https://dashboard.heroku.com/apps/" + data.data.app.name,
        text: "Initiated by " + data.actor.email,
        fields: [
          {
            title: "Event ID",
            value: data.data.id,
            short: true
          }
        ],
        footer: "Heroku Notification",
        ts: Math.floor(Date.now() / 1000)
      }
    ],
    username: "heroku-bot",
    icon_emoji: ":space_invader:"
  };

  if (data.data.state) {
    slack.attachments[0].fields.push({
      title: "App State",
      value: data.data.state,
      short: true
    });
  }
  if (data.data.description) {
    slack.attachments[0].fields.push({
      title: "Description",
      value: data.data.description,
      short: true
    });
  }
  if (data.data.output_stream_url) {
    slack.attachments[0].fields.push({
      title: "Message Stream",
      value: "<" + data.data.output_stream_url + "|Log URL>",
      short: true
    });
  }
  console.log(util.format("sending to slack webhook: \n%j\n", slack));

  request.post(
    {
      url: slackHook,
      form: {
        payload: JSON.stringify(slack)
      }
    },
    function(err, httpResponse, body) {
      console.log("slack response:");
      if (err) {
        console.error(err);
        res.status(400).send("oops");
        return;
      }

      console.log(body);
      res.send("thanks!");
    }
  );
});

// serve:
var server = app.listen(app.get("port"), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("listening at http://%s:%s", host, port);
});
