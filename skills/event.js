module.exports = function (controller) {
    controller.on('direct_message,direct_mention', function(bot, message) {
        console.log("-------------------message command---------------");
        console.log(message);
        console.log(bot);
        bot.reply(message, "You just typed '" + message.text + "'.");
    });
}
