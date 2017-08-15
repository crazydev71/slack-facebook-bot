module.exports = function (controller) {
    controller.on('slash_command', function(bot, message) {
        console.log("-------------------slash command---------------");
        console.log(message);
        bot.reply(message, "You just typed '" + message.text + "'.");
        // bot.reply(message, 'Welcome, <@' + message.user + '>');
    });
}
