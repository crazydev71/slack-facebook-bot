/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var env = require('node-env-file');
env(__dirname + '/.env');


if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('Error: Specify clientId clientSecret and PORT in environment');
  process.exit(1);
}

if (!process.env.page_token) {
  console.log('Error: Specify a Facebook page_token in environment.');
  process.exit(1);
}

if (!process.env.verify_token) {
  console.log('Error: Specify a Facebook verify_token in environment.');
  process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
  // slack config
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  scopes: ['bot', 'command', 'incoming-webhook'],

  // facebook config
  receive_via_postback: true,
  verify_token: process.env.verify_token,
  access_token: process.env.page_token,

  studio_token: process.env.studio_token,
  studio_command_uri: process.env.studio_command_uri
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
if (process.env.MONGO_URI) {
  var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
  bot_options.storage = mongoStorage;
} else {
  bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var slack_controller = Botkit.slackbot(bot_options);
var facebook_controller = Botkit.facebookbot(bot_options);

slack_controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(slack_controller, facebook_controller);



/*----------------- Slack Configuration --------------------------------------*/

// who sign up for the app via the oauth
require(__dirname + '/components/slack_user_registration.js')(slack_controller);

require(__dirname + '/skills/slack_event.js')(slack_controller);

/*----------------- Slack Configuration --------------------------------------*/





/*----------------- Facebook Configuration -----------------------------------*/

// Tell Facebook to start sending events to this application
require(__dirname + '/components/facebook_subscribe_events.js')(facebook_controller);

// Set up Facebook "thread settings" such as get started button, persistent menu
require(__dirname + '/components/facebook_thread_settings.js')(facebook_controller);

require(__dirname + '/skills/facebook_event.js')(facebook_controller);

/*----------------- Facebook Configuration -----------------------------------*/

