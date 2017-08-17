
const request = require('request');
const parseDomain = require('parse-domain');
const NlpProcess = require('./nlpProcess');


function converse(storage, bot, message){
  console.log("--------------------converse------------------");

  storage.users.get(message.user,function(err, user) {
    if (err) {
      console.log("----------------err-------------------------");
      return;
    }

    if (!user) {
      console.log("----------------user not found-------------------------");
      user = {
        id: message.user,
        team: message.team
      };
      storage.users.save(user);
    }

    let prevCompany = user.previous_company || null;
    
    // Process Chat
		NlpProcess.chat(prevCompany, message.text, (err, company, response) => {

			if( !company ){
				return bot.reply(message, response);
			}

	    user.previous_company = company.domain || prevCompany || null;
	    storage.users.save(user,function(err, id) {
		  	return bot.reply(message, response);
	    });
		});
  });
}

module.exports = {
	converse
};