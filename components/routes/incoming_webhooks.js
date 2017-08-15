var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function(req, res) {

        // NOTE: we should enforce the token check here
        const message = req.body;
        console.log(message);
        if (message.token != process.env.verficationToken)
            return res.status(413).json({msg: 'verfication error!'});
        // respond to Slack that the webhook has been received.
        res.status(200);
        res.json({
            // "response_type": "in_channel",
            "text": "You just typed '" + message.text + "'.",
            "attachments": []
        });
        
        // Now, pass the webhook into be processed
        // controller.handleWebhookPayload(req, res);

    });

}
