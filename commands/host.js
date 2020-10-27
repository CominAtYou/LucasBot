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
            var color = 0xDD4814;
            var percentCPU = (os.loadavg()[0]*50).toFixed(1);
            var osIcon = "https://cdn.cominatyou.com/cc38be88.png"
        } 
        else { 
            host_os = os.version(); 
            var percentCPU = (os.loadavg()[0]*10).toFixed(1);
            if (os.version().includes('Windows')) {
                var color = 0x00BCF5;
                var osIcon = 'https://cdn.cominatyou.com/cc38be89.png';
            } else {
                var osIcon = client.user.avatarURL;
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
        else { var unit = "GB" }
        var clientUptimeSec = (client.uptime / 1000).toFixed(0);
        
        var reqEmbed = {
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            thumbnail: {url: osIcon},
            title: "**Host Stats**",
            color: color,
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
                    value: `${freeMem} ${unit} / ${(os.totalmem()/1000000000).toFixed(0)} GB`,
                    inline: true,
                }
            ],
            footer: {
                text: `Uptime: ${(clientUptimeSec / 3600).toFixed(0)} hr, ${(clientUptimeSec / 60).toFixed(0)} min, ${clientUptimeSec % 60} sec`
            },
            timestamp: new Date()
        }
        message.channel.send({embed: reqEmbed});
    }
}