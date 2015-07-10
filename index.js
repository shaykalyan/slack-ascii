var express = require('express');
var Slack = require('node-slack');
var request = require('request');
var dotenv = require('dotenv');

dotenv.load();

var app = express();
var slack = new Slack(process.env.SLACK_HOOK_URL);

var asciiEmoticons = {
    "bear": "ʕ •ᴥ•ʔ",
    "diretide": "༼ つ ◕_◕ ༽つ GIVE DIRETIDE",
    "do it": "(☞ﾟヮﾟ)☞",
    "eyes": "ಠ_ಠ",
    "flip": "(╯°□°）╯︵ ┻━┻",
    "lenny": "( ͡° ͜ʖ ͡°)",
    "shades": "(⌐■_■)",
    "shrug": "¯\\_(ツ)_/¯",
    "unflip": "┬──┬◡ﾉ(° -°ﾉ)",
    "y u no": "ლ(ಠ益ಠლ)"
};

var helpResponseMessage = '';
for (emoticon in asciiEmoticons) {
    helpResponseMessage += '*' + emoticon + '*: ' + asciiEmoticons[emoticon] + '\n';
}

app.use('/', function(req, res, next) {
    if (req.query.token !== process.env.SLACK_SLASH_COMMAND_TOKEN) {
        return res.status(500).send('Cross-site request detected!');
    }
    next();
});

app.get('/', function(req, res) {
    if (req.query.text == "help") {
        return res.send(helpResponseMessage);
    }
    if (req.query.text == "image") {
         slack.respond("LOL")
         return res.send();
    }

    var userRequestUrl =
        'https://slack.com/api/users.info?' +
        'token=' + process.env.SLACK_TEAM_API_TOKEN +
        '&user=' + req.query.user_id;

    request(userRequestUrl, function (userErr, userRes, userBody) {
        if (!userErr && userRes.statusCode == 200) {
            userInfo = JSON.parse(userBody);

            if (userInfo.ok) {
                var emoticon = asciiEmoticons[req.query.text];

                if (emoticon) {
                    var payload = {
                        text: emoticon,
                        channel: req.query.channel_id,
                        username: userInfo.user.real_name,
                        icon_url: userInfo.user.profile.image_48
                    };

                    slack.send(payload);
                    res.send();
                } else {
                    res.status(404).send(' `' + req.query.text + '` not found. ' +
                        'Enter `' + req.query.command + ' help` for a list of available ASCII emoticons.');
                }
            } else {
                res.status(500).send('Error: `' + userInfo.error +'`.');
            }
        } else {
            res.status(500).send('Error: User `' + req.query.user_name +'` not found.');
        }
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));