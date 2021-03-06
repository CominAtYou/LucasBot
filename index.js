const Discord = require('discord.js');
const client = new Discord.Client();
const commands = new Discord.Collection();
const fs = require('fs');
const { prefix, token, lastChannelID, updateInProgress, lastClientMessageID } = require('./config.json');
const version = "0.31.0 - Pre-Release";
const versionDate = "27 Jul 2021";
const configFile = './config.json';
const file = require('./config.json');
const codeBlue = 0x24ACF2;
const errorRed = 0xD72D42;
const io = require('@pm2/io');

const shibeRateLimit = new Set();
const randomRateLimit = new Set();
const aboutRateLimit = new Set();
const avatarRateLimit = new Set();
const serverInfoRateLimit = new Set();
const helpRateLimit = new Set();
const robloxRateLimit = new Set();
const monkeRateLimit = new Set();

const admin = require('firebase-admin'); // quotes
const serviceAccount = require('./firebase-serviceAccount.json');
console.log("RinBot " + version);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
console.log("\x1b[32m[SUCCESS]", "\x1b[0mAuthenticated to Firebase");
const db = admin.firestore();
const invocations = io.counter({
    name: "Invocations",
    id: 'app/realtime/invocations'
});

// that one color i need: 0x395F85;

const commandFiles = fs.readdirSync('./commands/transpiled').filter(file => file.endsWith('.js')); // add command files to array as dependencies

for (const file of commandFiles) {
    const command = require(`./commands/transpiled/${file}`);
    commands.set(command.name, command);
}

client.on('guildMemberAdd', member => {
    commands.get("welcomeMessage").execute(member);
    member.guild.channels.cache.get('765695810591522836').setTopic('Say hello to our new friends! | Current member count: ' + member.guild.memberCount);
});

client.on('guildMemberRemove', member => {
    member.guild.channels.cache.get('765695810591522836').setTopic('Say hello to our new friends! | Current member count: ' + member.guild.memberCount);
});

client.ws.on("GUILD_MEMBER_UPDATE", m => {
    if (m.pending === false && !m.roles.includes("685237146193494026") && m.guild_id === "685236709277040802") {
        client.guilds.cache.get(m.guild_id).members.cache.get(m.user.id).roles.add("685237146193494026");
    }
});

client.on('guildMemberUpdate', (_om, nm) => { // prevent nickname hoisting
    if (nm.nickname !== null && nm.nickname.match(/^(!|\*|\[|\]|\_)/)) nm.setNickname("");
});

client.on('message', async message => { // fires whenever a message is sent
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm' || message.webhookID) return;
    const approvedUser = message.member.roles.cache.has('685237145052512321') /* head mods */ || message.member.roles.cache.has('769013132541558795') /* mods */ || message.member.roles.cache.has('772162214865272842') /* trial mods */ || message.member.roles.cache.has('869642565148885043') /* threads - approved */ || message.author.id === "245047280908894209";
    const args = message.content.slice(prefix.length).trim().split(/ +/); // stuff to throw arguments into an array
    const command = args.shift().toLowerCase(); // extract command from message
    invocations.inc();
    switch (command) {
        case 'rule':
            if (!approvedUser) return;
            commands.get('rule').execute(message, args, client);
            break;
        case 'userinfo':
            var mentionedUser = message.guild.member(message.mentions.users.first());
            if (args.length === 0 && message.mentions.users.first() === undefined) { // stuff for determining who's info to pull up
                mentionedUser = message.member;
                commands.get('userinfo').execute(message, args, mentionedUser, client);
            }
            else if (message.mentions.users.first() !== undefined) {
                commands.get('userinfo').execute(message, args, mentionedUser, client);
            }
            else if (args[0] === "-h") {
                commands.get('userinfo').execute(message, args, null, client);
            }
            else if (args.length === 1 && message.mentions.users.first() === undefined) {
                message.guild.members.fetch(args[0]).then(mentionedUser => commands.get('userinfo').execute(message, args, mentionedUser, client)).catch(() => { message.channel.send(":x: That user doesn't seem to exist!"); }); // this assumes that every error is a "user-does-not-exist" error so i probably should rework this
            }
            break;
        case 'serverinfo':
            if (!approvedUser) {
                if (serverInfoRateLimit.has(message.author.id)) {
                    message.channel.send(":x: Please wait 5 more seconds before doing that again!");
                    return;
                }
                serverInfoRateLimit.add(message.author.id);
                setTimeout(() => { serverInfoRateLimit.delete(message.author.id); }, 5000);
            }
            commands.get('serverinfo').execute(message, args, client);
            break;
        case 'random':
            if (!approvedUser) {
                if (randomRateLimit.has(message.author.id)) {
                    message.channel.send(":x: Please wait 3 more seconds before doing that again!");
                    return;
                }
            }
            randomRateLimit.add(message.author.id);
            setTimeout(() => { randomRateLimit.delete(message.author.id); }, 3000);
            commands.get('random').execute(message, args, client);
            break;
        case 'about':
            if (!approvedUser) {
                if (aboutRateLimit.has(message.author.id)) {
                    message.channel.send(":x: Please wait 2 more seconds before doing that again!");
                    return;
                }
                aboutRateLimit.add(message.author.id);
                setTimeout(() => { aboutRateLimit.delete(message.author.id); }, 2000);
            }
            commands.get('about').execute(message, client, version, versionDate, args);
            break;
        case 'ping':
            if (!approvedUser) return;
            commands.get('ping').execute(message, client);
            break;
        case 'host':
            commands.get('host').execute(message, client); // me only
            break;
        case 'update': {
            commands.get('update').execute(message, client, configFile, file, version);
            break;
        }
        case 'help': {
            if (!approvedUser) {
                if (helpRateLimit.has(message.author.id)) {
                    message.channel.send(":x: Please wait 5 more seconds before doing that again!");
                    return;
                }
                helpRateLimit.add(message.author.id);
                setTimeout(() => { helpRateLimit.delete(message.author.id); }, 5000);
            }
            commands.get('help').execute(message, prefix, client);
            break;
        }
        case 'execute': {
            if (message.author.id !== "245047280908894209") return;
            commands.get('execute').execute(message, args);
            break;
        }
        case 'shibe': {
            if (shibeRateLimit.has(message.author.id)) {
                message.channel.send(":x: Please wait 10 more seconds before doing that again!");
                return;
            }
            shibeRateLimit.add(message.author.id);
            setTimeout(() => { shibeRateLimit.delete(message.author.id); }, 10000); // making it this long because i don't want to bombard the endpoint

            commands.get('shibe').execute(message);
            break;
        }
        case 'avatar': {
            if (!approvedUser) {
                if (avatarRateLimit.has(message.author.id)) {
                    message.channel.send(":x: Please wait 2 more seconds before doing that again!");
                    return;
                }
                avatarRateLimit.add(message.author.id);
                setTimeout(() => { avatarRateLimit.delete(message.author.id); }, 2000);
            }
            if (args[0] === '-h') {
                commands.get('avatar').execute(message, args, null, client);
            }
            else {
                if (args[0] === 'webp' || args[0] === 'png') {
                    commands.get('avatar').execute(message, args, message.author);
                }
                if (message.mentions.users.first() !== undefined) {
                    commands.get('avatar').execute(message, args, message.mentions.users.first());
                }
                else if (message.mentions.users.first() === undefined && args.length === 0) {
                    commands.get('avatar').execute(message, args, message.author);
                }
                else if (message.mentions.users.first() === undefined && args.length > 0 && args.length <= 2 && args[0].length === 18) {
                    mentionedUser = message.guild.members.fetch(args[0]).then(mentionedUser => commands.get('avatar').execute(message, args, mentionedUser.user));
                }
                else if (args.length >= 3) {
                    var reqEmbed = {
                        color: 0xD72D42,
                        description: ":x: Too many arguments supplied."
                    };
                    message.channel.send({ embed: reqEmbed });
                }
            }
            break;
        }
        case 'kick': {
            if (!approvedUser) return;
            if (message.mentions.users.first() === undefined) {
                if (args.length === 0) {
                    message.channel.send(":no_entry: Please specify a user.");
                    return;
                }
                else {
                    message.guild.members.fetch(args[0]).then(target => commands.get('kick').execute(message, args, target, client)).catch(() => { message.channel.send({ embed: { color: 0xD72D42, description: ":x: Error when trying to kick member. Please make sure the bot has the proper permissions, and that the user specified exists." } }); }); // comment on line 58
                }
            }
            else if (message.mentions.users.first() !== undefined) {
                commands.get('kick').execute(message, args, message.guild.member(message.mentions.users.first()), client);
            }
            break;
        }
        case 'ban': {
            if (!approvedUser) return;
            if (args[0] === '-h') {
                commands.get('ban').execute(message, args, undefined, undefined, client);
            }
            else if (message.mentions.users.first() === undefined) {
                if (args.length === 0) {
                    message.channel.send(":no_entry: Please specify a user.");
                    return;
                }
                else {
                    message.guild.members.fetch(args[0]).then(target => commands.get('ban').execute(message, args, target)).catch(() => { message.channel.send({ embed: { color: 0xD72D42, description: ":x: Error when trying to ban member. Please make sure the bot has the proper permissions, and that the user specified exists." } }); }); // too lazy to copy it so go look at the comment on 58
                }
            }
            else if (message.mentions.users.first() !== undefined) { // THIS MAKES MENTIONS WORK, IT DOES NOT BAN THE SENDER OF THE MESSAGE
                commands.get('ban').execute(message, args, message.guild.member(message.mentions.users.first()), client);
            }
            break;
        }
        // case 'mute':
        //     if (!approvedUser) return;
        //     if (message.mentions.users.first() === undefined) {
        //         if (args.length === 0) {
        //             message.channel.send(":no_entry: Please specify a user.");
        //             return;
        //         }
        //         else {
        //             message.guild.members.fetch(args[0]).then(target => commands.get('mute').execute(message, args, target, modLogChannel)).catch(() => { message.channel.send(":x: That user doesn't seem to exist!") });
        //         }
        //     }
        //     else if (message.mentions.users.first() !== undefined) {
        //         var target = message.guild.member(message.mentions.users.first());
        //         commands.get('mute').execute(message, args, target, modLogChannel);
        //     }
        //     break;
        case 'robloxid': {
            if (!approvedUser) return;
            if (robloxRateLimit.has(message.author.id)) {
                message.channel.send(":x: Please wait 5 more seconds before doing that again!");
                return;
            }
            robloxRateLimit.add(message.author.id);
            setTimeout(() => { robloxRateLimit.delete(message.author.id); }, 3000);

            commands.get("robloxid").execute(message, args, client);
            break;
        }
        case 'robloxprofile': {
            if (!approvedUser) return;

            if (robloxRateLimit.has(message.author.id)) {
                message.channel.send(":x: Please wait 3 more seconds before doing that again!");
                return;
            }
            robloxRateLimit.add(message.author.id);
            setTimeout(() => { robloxRateLimit.delete(message.author.id); }, 3000);
            commands.get("robloxprofile").execute(message, args, client);
            break;
        }
        case 'details': {
            if (message.author.id !== "245047280908894209") return;
            commands.get('details').execute(message, client, versionDate, version);
            break;
        }
        case 'coinflip': {
            commands.get('coinflip').execute(message);
            break;
        }
        case 'rps': {
            commands.get('rps').execute(message, args, client);
            break;
        }
        // case 'quote':
        //     commands.get('quote').execute(message, args, client, db, prefix);
        // break;
        case 'say': {
            commands.get('say').execute(message, client, args);
            break;
        }
        case 'retrieve': {
            commands.get('retrieve').execute(message, args);
            break;
        }
        case 'monke': {
            if (monkeRateLimit.has(message.author.id)) {
                message.channel.send(":x: Please wait 5 more seconds before doing that again!");
                return;
            }
            monkeRateLimit.add(message.author.id);
            setTimeout(() => { monkeRateLimit.delete(message.author.id); }, 5000);
            message.channel.send("https://cdn.discordapp.com/attachments/604407073156890637/771883295570133003/video0_80.mp4");
            break;
        }
        case 'setactivity': {
            commands.get('setactivity').execute(message, args, client);
            break;
        }
        case 'eval': {
            require('./commands/transpiled/evaluate').execute(message, args, client); // it doesn't work the regular way for some reason
            break;
        }
    }
});

client.ws.on("INTERACTION_CREATE", async interaction => {
    commands.get('interactioninit').execute(client, interaction, db);
});
client.once("ready", () => { // bot custom status
    /* client.api.applications(client.user.id).commands.post({data: {
        name: "imagestrike",
        description: "Impose an image strike against a member.",
        type: 2,
        options: [
            {
                name: "add",
                description: "Adds a strike to a member's strike tally.",
                type: 1,
                options: [
                    {
                        name: "member",
                        description: "The member to add a strike to.",
                        type: 6,
                        required: true
                    }
                ]
            },
            {
                name: "remove",
                description: "Removes a number of strikes from a member's strike tally.",
                type: 1,
                options: [
                    {
                        name: "member",
                        description: "The member to remove from.",
                        type: 6,
                        required: true
                    },
                    {
                        name: "amount",
                        description: "The amount of strikes to remove.",
                        type: 4,
                        required: true
                    }
                ]
            },
            {
                name: "reset",
                description: "Resets a member's strike tally.",
                type: 1,
                options: [
                    {
                        name: "member",
                        description: "The member to reset.",
                        type: 6,
                        required: true
                    }
                ]
            },
            {
                name: "get",
                description: "Query the number of strikes a member has.",
                type: 1,
                options: [
                    {
                        name: "member",
                        description: "The member to query.",
                        type: 6,
                        required: true
                    }
                ]
            }
        ]
    }}); */
    console.log("\x1b[32m[READY]", "\x1b[0mLogged in as " + client.user.tag);
    client.user.setActivity("Corgi Quest 7", { type: "PLAYING" });
    if (updateInProgress === true) {
        console.log("\033[0;33m[UPDATE]\033[0m Previous update values detected, performing post-update operations");
        var reqEmbed = {
            title: "Update Complete!",
            color: 0x77B255,
            description: `:white_check_mark: Version ${version}`,
            timestamp: new Date()
        };
        client.channels.fetch(lastChannelID).then(c => c.messages.fetch(lastClientMessageID).then(m => m.delete()));
        client.channels.fetch(lastChannelID).then(c => c.send({ embed: reqEmbed }));
        file.updateInProgress = false;
        file.lastChannelID = null;
        file.lastClientMessageID = null;
        fs.writeFile(configFile, JSON.stringify(file, null, 2), (error) => {
            if (error) {
                var reqEmbed = {
                    color: 0xD72D42,
                    title: "Error Writing JSON",
                    description: "```" + error + "```",
                    timestamp: new Date()
                };
                client.channels.fetch(lastChannelID).then(channel => channel.send({ embed: reqEmbed }));
                console.error(error);
            }
            // please for the love of god add error handling here, if this fails the entire thing crashes on startup which results in pm2 having a fit
        });
        console.log("\033[0;33m[UPDATE]\033[0m Update complete, updated to " + version.replace(" - Pre-Release", ""));
    }
});


client.login(token); // makes stuff work
