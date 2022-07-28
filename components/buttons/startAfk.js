const Discord = require("discord.js");
const utils = require("../../utils.js");

module.exports = {
    data: {
        name: "startAfk"
    },
    init() {
        return new Promise((resolve, reject) => {
            try {
                var button = new Discord.ButtonBuilder()
                    .setCustomId("startAfk")
                    .setEmoji(utils.emotes.startAfk)
                    .setLabel("Start Afk")
                    .setStyle(Discord.ButtonStyle.Success);
                resolve(button);
            } catch (err) {
                reject(new Error("Couldn't create button \"" + this.data.name + "\"."));
            }
        });
    },
    exec(client, interaction, connection) {
        console.log(interaction.message.id);
        connection.query("SELECT * FROM runs WHERE controlEmbedId=\"" + interaction.message.id + "\";", (err, runs) => {
            if (err || runs[0] === undefined) return utils.replyError(interaction, "Internal error. Please try again later." + (err ? "\n```\n" + err.message + "\n```" : ""));
            else utils.reply(interaction, runs[0].type + " by " + runs[0].raidLeader);
        });
    }
};