const { execute } = require("./random");

module.exports = {
    name: "host",
    description: "get information about the host server.",
    execute(message, args, os, client) {
        if (message.author.id !== '245047280908894209') {
            var reqEmbed = {
                color: 0xD72D42,
                description: ":x: You don't have permission to do that.",
            }
            message.channel.send({embed: reqEmbed});
            return;
        }
        if (!os.version().includes("Windows")) { 
            var host_os = 'Ubuntu 20.04.1'; 
            var percentCPU = (os.loadavg()[0]).toFixed(2);
            var thumbnailIcon = "https://cdn.cominatyou.com/cc38be88.png"
        } 
        else { 
            host_os = os.version(); 
            var percentCPU = (os.loadavg()[0]*10).toFixed(1);
            if (os.version().includes('Windows')) {
                var thumbnailIcon = 'https://cdn.cominatyou.com/cc38be89.png';
            } else {
                var thumbnailIcon = client.user.avatarURL;
            }
        }
        freeMem = (os.freemem().toString() / 1000000000).toFixed(2)
        if (Number.parseInt(os.freemem().toString()) < 1000000000) {
            var unit = 'MB'
            if (host_os = 'Ubuntu 20.04.1') {
                var freeMem = (os.freemem().toString() / 1000000).toFixed(0)
            } else if (os.version().includes("Windows")) {
                var freeMem = (os.freemem().toString() / 1000000000).toFixed(0)
            }
        } 
        else { var unit = 'GB' }
        var reqEmbed = {
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            thumbnail: {url: thumbnailIcon},
            title: "Host Stats",
            fields: [
                {
                    name: "Current OS",
                    value: host_os,
                    inline: true,
                },
                {
                    name: "Load Average",
                    value: `${percentCPU}%`,
                    inline: true,
                },
                {
                    name: "Free Memory",
                    value: `${freeMem} ${unit}`,
                    inline: true,
                }
            ],
            timestamp: new Date()
        }
        message.channel.send({embed: reqEmbed});
    }
}