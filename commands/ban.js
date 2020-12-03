const uuid = require('uuid');
module.exports = {
    name: "ban",
    execute(message, args, target, modLogChannel) {
        if (args[1] === undefined) {
            var reason = "None provided";
        }
        else {
            var reason = args.slice(1).join(" ");
        }
        target.ban({reason: reason}).then(() => {
            var successEmbed = {
                description: `${target.user.tag} was banned.\nReason: ${reason}`,
                color: 0x24ACF2
            }
            message.channel.send({embed: successEmbed});
            var logEmbed = {
                author: {
                    name: target.user.username,
                    icon_url: target.user.avatarURL()
                },
                title: "Member Banned",
                color: 0x24ACF2,
                fields: [
                    {
                    name: "Member",
                    value: target.user.tag,
                    inline: true
                    },
                    {
                        name: "Moderator",
                        value: message.author,
                        inline: true
                    },
                    {
                        name: "Reason",
                        value: reason,
                        inline: true
                    }
                ],
                footer: {
                    text: `ID: ${target.user.id} • Case ID: ${uuid.v4().slice(0, -28)}`
                },
                timestamp: new Date()
            }
            message.guild.channels.resolve('726176580405035169').send({embed: logEmbed});
        });
    }
}