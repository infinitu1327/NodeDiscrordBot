"use strict";

const discord = require("discord.js");
const client = new discord.Client();

let playlist = [];
let dispatcher;

let joinVoiceChannel = (msg) => {
    if (msg.member.voiceChannel) {
        if (client.voiceConnections && getVoiceChannel(msg)) {
            msg.reply("I already joined your channel!");
        } else {
            msg.member.voiceChannel.join()
                .then(connection => {
                    msg.reply("I have successfully connected to the channel!");
                })
                .catch(console.log);
        }
    }

    return getVoiceChannel(msg);
};

let leaveVoiceChannel = (msg) => {
    const voiceChannel = getVoiceChannel(msg);

    if (voiceChannel) {
        voiceChannel.disconnect();
    }
};

let getVoiceChannel = (msg) => {
    return client.voiceConnections.get(msg.member.guild.id);
};

let playSong = (msg) => {
    if (playlist.length !== 0) {
        dispatcher = getVoiceChannel(msg).playArbitraryInput(playlist[0]);

        dispatcher.on("end",
            () => {
                playNextSong(msg);
            });
    } else {
        msg.reply("Playlist empty. First add song");
        leaveVoiceChannel(msg);
    }
};

let playNextSong = (msg) => {
    playlist.shift();
    playSong(msg);
};

client.login("token");

console.log("Bot started");

client.on("message",
    msg => {
        switch (msg.content) {
        case "!resume":
            dispatcher.resume();
            msg.reply("Resumed!");
            break;
        case "!pause":
            dispatcher.pause();
            msg.reply("Song paused. Write !resume to resume.");
            break;
        case "!play":
            if (!getVoiceChannel(msg)) {
                joinVoiceChannel(msg);
            }
            playSong(msg);
            break;
        case "!skip":
            playNextSong(msg);
            break;
        default:
            if (msg.attachments && msg.cleanContent === "@jmihibot") {
                const attachment = msg.attachments.first();
                playlist.push(attachment.url);

                msg.reply("Song successfully added");
            }
            break;
        }
    });