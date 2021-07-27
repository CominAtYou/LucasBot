import https = require('https');
import Discord = require('discord.js');

export const name = "robloxprofile";
export const description = "";
export function execute(message: Discord.Message, args: string[], client: Discord.Client) {
    if (args[0] === '-h') {
        var reqEmbed = {
            author: {
                name: client.user.username,
                icon_url: client.user.displayAvatarURL(),
            },
            title: "Robloxprofile",
            color: 0x007ACC,
            description: "Retrieve a ROBLOX profile",
            fields: [
                {
                    name: "Syntax",
                    value: "`!robloxprofile <username>`"
                },
                {
                    name: "Arguments",
                    value: "`username`"
                },
                {
                    name: "Examples",
                    value: "!robloxprofile Builderman"
                }
            ]
        }
        message.channel.send({embed: reqEmbed});
        return;
    }
    else if (args[0] === undefined) {
        message.channel.send(":x: Please specify a user.");
        return;
    }
    function assembleEmbed(message: Discord.Message, userJSON: {Id: number, Username: string, AvatarUri: null | string, AvatarFinal: boolean, IsOnline: boolean, success: boolean, errorMessage: string}, profileJSON: {description: string, created: string, isBanned: boolean, id: number, name: string, displayName: string}) {
        const requestOptions = {
            hostname: 'api.roblox.com',
            port: 443,
            path: `/users/${userJSON.Id}/onlinestatus/`,
            method: 'GET'
        }
        const req = https.request(requestOptions, res => {
            res.on('data', d => {
                const statusJSON: {LastLocation: string} = JSON.parse(d);
                if (statusJSON.LastLocation === "Playing") {
                    var status = "In-game";
                }
                else if (statusJSON.LastLocation === "Creating") {
                    var status = "In Studio"
                }
                else {
                    var status = statusJSON.LastLocation;
                }
                var reqEmbed = {
                    author: {
                        name: "ROBLOX"
                    },
                    title: `${userJSON.Username}`,
                    url: `https://www.roblox.com/users/${userJSON.Id}/profile`,
                    thumbnail: {
                        url: `https://www.roblox.com/Thumbs/Avatar.ashx?x=500&y=500&username=${userJSON.Username}`
                    },
                    fields: [
                        {
                            name: "User ID",
                            value: userJSON.Id,
                            inline: true
                        },
                        {
                            name: "Join Date",
                            value: `<t:${Math.floor(new Date(profileJSON.created).getTime() / 1000)}:f>`,
                            inline: true
                        },
                        {
                            name: "Status",
                            value: status,
                            inline: true
                        }
                    ],
                    color: 0xDF2623,
                    description: profileJSON.description
                }
                message.channel.send({embed: reqEmbed});
            })
        });
        req.on('error', error => {
            console.error(error);
            message.channel.send(":x: There was an error contacting the HTTP endpoint. Please try again later.");
        });
        req.end();
    }
    function getProfileInfo(message: Discord.Message, userJSON: {Id: number, Username: string, AvatarUri: null | string, AvatarFinal: boolean, IsOnline: boolean, success: boolean, errorMessage: string}) {
        const requestOptions = {
            hostname: 'users.roblox.com',
            port: 443,
            path: `/v1/users/${userJSON.Id}`,
            method: 'GET'
        }
        const req = https.request(requestOptions, res => {
            res.on('data', d => {
                const profileJSON: {description: string, created: string, isBanned: boolean, id: number, name: string, displayName: string} = JSON.parse(d);
                assembleEmbed(message, userJSON, profileJSON);
            });
        });
        req.on('error', error => {
            console.error(error);
            message.channel.send(":x: There was an error contacting the HTTP endpoint. Please try again later.");
        });
        req.end();
    }

    const requestOptions = {
        hostname: 'api.roblox.com',
        port: 443,
        path: `/users/get-by-username?username=${args[0]}`,
        method: 'GET'
    }
    const req = https.request(requestOptions, res => {
        res.on('data', d => {
            const userJSON: {Id: number, Username: string, AvatarUri: null | string, AvatarFinal: boolean, IsOnline: boolean, success: boolean, errorMessage: string} = JSON.parse(d);
            if (userJSON.success === false) {
                if (userJSON.errorMessage === 'User not found' || userJSON.errorMessage === "Invalid username") {
                    message.channel.send(":x: That user does not exist!");
                    return;
                }
                else {
                    message.channel.send("There was an error.");
                    return;
                }
            } else {
                getProfileInfo(message, userJSON);
            }
        })
    });
    req.on('error', error => {
        console.error(error);
        message.channel.send(":x: There was an error contacting the HTTP endpoint. Please try again later.");
    });
    req.end();
}
