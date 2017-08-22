const SlashCommands = require('../lib/slack/slashCommands');
const Conversation = require('../lib/slack/conversation');

module.exports = function (controller) {

	// handler for conversation
    controller.on('direct_message,direct_mention', function(bot, message) {
        // console.log("-------------------message command---------------");
        console.log(message);
        
		return Conversation.converse(controller.storage, bot, message);
	});
	
	// handler for slash command
    controller.on('slash_command', function(bot, message) {
        // console.log("-------------------slash command----------------");
        console.log(message);
        // bot.replyPrivate(message, "You just typed '" + message.text + "'.");

        switch(message.command) {
			case '/lookup': // change this to your command
				if(message.text === '') return bot.replyPublic(message, 'Please enter a domain');
				return SlashCommands.lookup(controller.storage, bot, message);
			case '/chat': // change this to your command
				if(message.text === '') return bot.replyPublic(message, 'Please enter a message');
				return SlashCommands.chat(controller.storage, bot, message);
			default:
				bot.replyPublic(message, `You just typed "${message.text}" using command "${message.command}"`);
        }
    });
}
