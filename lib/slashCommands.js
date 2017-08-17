
const request = require('request');
const parseDomain = require('parse-domain');
const NlpProcess = require('./nlpProcess');

const databyteApiKey = 'key_OG4p5oJu2y4iz0IZ1oGf5296aVRsBBDg';


/*
  {
    token: '0lHua0MrmfyXIyiJFBKZMPsE', 
    team_id: 'T04MLP1D5', 
    team_domain: 'prospectify', 
    channel_id: 'D1G1R7Q9L', 
    channel_name: 'directmessage', 
    user_id: 'U04MLP1DD', 
    user_name: 'noah', 
    command: '/lookup', 
    text: 'domain', 
    response_url: 'https://hooks.slack.com/commands/T04MLP1D5/119876102786/38EvwVrud44uCuk5MNMhEsjw', 
    user: 'U04MLP1DD', 
    channel: 'D1G1R7Q9L', 
    type: 'slash_command'
  }
*/


function slashChat(storage, bot, message){
  NlpProcess.chat(null, message.text, (err, company, response) => {
    return bot.replyPrivate(message, response);
  });
}

function slashLookup(storage, bot, message){
  let parts = parseDomain(message.text);
  if( !parts ){
    return bot.replyPrivate(message, `Invalid domain: "${message.text}"`);
  }
  console.log(parts);
  let domain = parts.domain + '.' + parts.tld;
  let url = `https://api.databyte.io/v1/enrich/company?apikey=${databyteApiKey}&domain=${domain}`;
  console.log(url);
  callDatabyte(url, (err, company) => {
    if(company){
      console.log(company);
      // save in session ASYNC
      saveCompanyInSession(storage, message, company.domain);
      
      let payload = formatCompany(url, company);
      return bot.replyPrivate(message, payload);
    }else{
      return bot.replyPrivate(message, `Unknown domain: "${domain}"`);
    }
  });
}

function saveCompanyInSession(storage, message, domain, cb){
  storage.users.get(message.user,function(err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }
    user.previous_company = domain;
    storage.users.save(user,function(err, id) {
      if(cb) return cb(err, id);
    });
  });
}



function callDatabyte(url, cb){
  request({url:url, json:true}, function (error, response, body) {
    if(error){
      console.log(error);
    }
    if (!error && response.statusCode == 200) {
      return cb(null, body.data || null);
    }
    return cb(error, null);
  })
}

function formatCompany(url, company){
  let text = '';
  text += `Description: ${company.description} \n`;
  if( company.phone ){
    text += `Phone: ${company.phone} \n`;
  }
  if( company.company &&  company.company.foundedDate ){
    text += `Founded: ${company.company.foundedDate} \n`;
  }
  if( company.geo &&  company.geo.city ){
    text += `Location: ${company.geo.city}, ${company.geo.state} \n`;
  }
  if( company.company &&  company.company.employeesMin ){
    text += `Employees: ${company.company.employeesMin}-${company.company.employeesMax} \n`;
  }
  if( company.business_models ){
    text += `Models: ${company.business_models.join()} \n`;
  }
  
  let response = {
    "attachments": [
      {
        "fallback": text,
        "color": "#36a64f",
        "pretext": `Request for ${company.domain}`,
        "title": `Company: ${company.name}`,
        "title_link": url,
        "text": text,
        "image_url": company.logo,
        "footer": "Databyte API"
      }
    ]
  };
  return response;
}

module.exports = {
  lookup: slashLookup,
  chat: slashChat
};