var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured /slack/slashcommand url');
    webserver.post('/slack/slashcommand', function(req, res) {

        // NOTE: we should enforce the token check here
        const message = req.body;
        if (message.token != process.env.verficationToken)
            return res.status(413).json({msg: 'verfication error!'});
        // respond to Slack that the webhook has been received.
        res.status(200);
        res.json({
            // "response_type": "in_channel",
            "text": "You just typed '" + message.text + "'.",
            "attachments": []
        });
        
    });
}
