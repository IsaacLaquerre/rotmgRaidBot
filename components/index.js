const Discord = require("discord.js");
const utils = require("../utils.js");

module.exports.buttons = {
    startAfk: {
        init: (client, file) => {
            return new Promise((resolve, reject) => {
                try {
                    var button = new Discord.ButtonBuilder()
                        .setCustomId("startAfk")
                        .setEmoji(utils.emotes.startAfk)
                        .setLabel("Start Afk")
                        .setStyle(Discord.ButtonStyle.Secondary);

                    addToClient(client, "startAfk", { file: file, data: button, row: 1, order: 1 }, "buttons");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    },
    endAfk: {
        init: (client, file) => {
            return new Promise((resolve, reject) => {
                try {
                    var button = new Discord.ButtonBuilder()
                        .setCustomId("endAfk")
                        .setEmoji(utils.emotes.endAfk)
                        .setLabel("End Afk")
                        .setStyle(Discord.ButtonStyle.Secondary);

                    addToClient(client, "endAfk", { file: file, data: button, row: 1, order: 2 }, "buttons");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    },
    abortAfk: {
        init: (client, file) => {
            return new Promise((resolve, reject) => {
                try {
                    var button = new Discord.ButtonBuilder()
                        .setCustomId("abortAfk")
                        .setEmoji(utils.emotes.abortAfk)
                        .setLabel("Abort Afk")
                        .setStyle(Discord.ButtonStyle.Danger);

                    addToClient(client, "abortAfk", { file: file, data: button, row: 1, order: 3 }, "buttons");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    },
    openVc: {
        init: (client, file) => {
            return new Promise((resolve, reject) => {
                try {
                    var button = new Discord.ButtonBuilder()
                        .setCustomId("openVc")
                        .setEmoji(utils.emotes.openVc)
                        .setLabel("Open Vc")
                        .setStyle(Discord.ButtonStyle.Secondary);

                    addToClient(client, "openVc", { file: file, data: button, row: 2, order: 1 }, "buttons");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    },
    endRun: {
        init: (client, file) => {
            return new Promise((resolve, reject) => {
                try {
                    var button = new Discord.ButtonBuilder()
                        .setCustomId("endRun")
                        .setEmoji(utils.emotes.endRun)
                        .setLabel("End Run")
                        .setStyle(Discord.ButtonStyle.Danger);

                    addToClient(client, "endRun", { file: file, data: button, row: 2, order: 2 }, "buttons");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
};

function addToClient(client, name, component, type) {
    client[type].set(name, component);
}