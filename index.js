const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = 'token'

bot.on('message', function(message){
    if(message.content == 'Lucas')
    {
        message.reply("Lucas? More like Lickass")
    }
});

bot.on('message', function(message){
	if(message.content == 'lucas')
	{
		message.reply("Lucas? More like Lickass")
	}
})
// Remember the semicolon if you are adding more functions under this one; if thre are none under this one, delete it.

// These lines (apart from the ones that have remember) have been commented since my bot is not using them. If you want to use them, remove the '//' from every line EXCEPT ehe ones that have "Remember the semicolon."

// bot.on('message', function(message){
//  if(message.content == 'daunte')
//	{
//		message.reply("Daunte? More like Cuntae")
//	}
// });
// Remember the semicolon if you are adding more functions under this one; if thre are none under this one, delete it.

// bot.on('message', function(message){
//	if(message.content == 'Daunte')
//	{
//		message.reply("Daunte? More like Cuntae")
//	}
// })
// Remember the semicolon if you are adding more functions under this one; if thre are none under this one, delete it.

// bot.on('message', function(message){
//    if(message.author.username == 'Lucas')
//    {
//        message.reply("Lucas? More like Lickass")
//    }
// });
// Remember the semicolon if you are adding more functions under this one; if thre are none under this one, delete it.

//bot.on('message', function(message){
//    if(message.author.username == 'CominAtYou')
//    {
//        message.reply("I'm **cominatyou** with this message")
//    }
// })
// Remember the semicolon if you are adding more functions under this one; if thre are none under this one, delete it.

bot.login('token');
