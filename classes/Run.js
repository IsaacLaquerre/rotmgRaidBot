const Discord = require("discord.js");
const config = require("../botConfig.json");
const utils = require("../utils.js");

var runs = {
    titles: {
        void: "Void",
        fullskip: "Full-skip Void",
        cult: "Cultist Hideout",
        o3: "Oryx Sanctuary",
        shatters: "Shatters",
        fungal: "Fungal Cavern",
        nest: "Nest"
    },
    priorityReacts: {
        void: [],
        fullskip: [],
        cult: [],
        o3: [],
        shatters: [],
        fungal: [],
        nest: []
    },
    thumbnails: {
        void: "https://cdn.discordapp.com/emojis/899193984444940300.png",
        fullskip: "https://cdn.discordapp.com/emojis/899193984444940300.png",
        cult: "https://cdn.discordapp.com/attachments/896279366680584215/899192698899161098/813742136075092018.png",
        o3: "https://cdn.discordapp.com/emojis/924661866192580628.png",
        shatters: "https://cdn.discordapp.com/attachments/748200247716479159/890001562620035122/unknown.png",
        fungal: "https://i.imgur.com/K6rOQzR.png",
        nest: "https://i.imgur.com/hUWc3IV.png"
    },
    colors: {
        void: "#250BC0",
        fullskip: "#250BC0",
        cult: "#B21111",
        o3: "#FFEE59",
        shatters: "#254525",
        fungal: "#52326A",
        nest: "#F27500"
    }
};

module.exports = class Run {
    constructor(id, type, location, raidLeader, controlEmbedId, voiceChannelId) {
        this.id = id;
        this.type = type;
        this.title = runs.titles[type];
        this.location = location;
        this.raidLeader = raidLeader;
        this.players = [];
        this.priorityReacts = runs.priorityReacts[type];
        var now = new Date();
        this.startTime = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2) + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
        this.controlEmbedId = controlEmbedId;
        this.voiceChannelId = voiceChannelId;
    }

    create(client, interaction, connection) {
        var embed = new Discord.EmbedBuilder()
            .setDescription(this.raidLeader.ign + "'s " + this.title + " will start soon.")
            .setColor(runs.colors[this.type])
            .setThumbnail(runs.thumbnails[this.type]);
        client.channels.fetch(config.raidChannel).then(channel => {
            channel.send({ embeds: [embed] }).then(message => {
                this.messageId = message.id;
                connection.query("INSERT INTO runs (id, type, title, location, raidLeader, startTime, started, ended, aborted, players, priorityReacts, messageId, controlEmbedId, voiceChannelId) VALUES (\"" + this.id + "\", \"" + this.type + "\", \"" + this.title + "\", \"" + this.location + "\", '{\"tag\": \"" + this.raidLeader.tag + "\", \"ign\": \"" + this.raidLeader.ign + "\"}', \"" + this.startTime + "\", 0, 0, 0, '{\"list\": []}', '{\"list\": []}', \"" + this.messageId + "\", \"" + this.controlEmbedId + "\", \"" + this.voiceChannelId + "\");", (err) => {
                    if (err) return utils.editReplyError(interaction, "Internal error. Please try again later.", err.message);
                    client.runs.set(this.id, this);
                });
            });
        });
    }

    changeLocation(client, connection, newLocation) {
        connection.query("UPDATE runs SET location=\"" + newLocation + "\" WHERE id=\"" + this.id + "\";", (err) => {
            if (err) return;
        });
    }

    earlyReacts(client, connection) {}

    startAfk(client, connection) {
        console.log("started afk");
    }

    endAfk(client, connection) {
        console.log("ended afk");
    }

    abortAfk(client, connection) {
        connection.query("UPDATE runs SET ended=1, aborted=1 WHERE id=\"" + this.id + "\";", (err) => {
            if (err) return;
        });
    }

    start(client, connection) {
        connection.query("UPDATE runs SET started=1 WHERE id=\"" + this.id + "\";", (err) => {
            if (err) return;
        });
    }

    end(client, connection) {
        connection.query("UPDATE runs SET ended=1 WHERE id=\"" + this.id + "\";", (err) => {
            if (err) return;
        });
    }

    log(client, connection) {
        console.log("INSERT INTO logs (id, type, location, raidLeader, players, priorityReacts, time) VALUES (\"" + this.id + "\", \"" + this.type + "\", \"" + this.location + "\", \"" + this.raidLeader + "\", \"" + this.players + "\", \"" + this.priorityReacts + "\", \"" + new Date(new Date() - this.startTime) + "\");");
        /*connection.query("INSERT INTO logs (id, type, location, raidLeader, players, priorityReacts, time) VALUES (\"" + this.id + "\", \"" + this.type + "\", \"" + this.location + "\", \"" + this.raidLeader + "\", \"" + this.players + "\", \"" + this.priorityReacts + "\", \"" + new Date(new Date() - this.startTime) + "\");", (err) => {
            if (err) return;
        });*/
    }
};