const Discord = require("discord.js");
const config = require("../botConfig.json");
const utils = require("../utils");

module.exports.run = (client, interaction, connection) => {
    if (interaction.channel.id != config.verificationChannel) return;
    connection.query("SELECT reqs FROM guilds WHERE id=\"" + interaction.guild.id + "\";", (err, guilds) => {
        var reqs = JSON.parse(guilds[0].reqs);
        connection.query("SELECT * FROM users WHERE id=\"" + interaction.user.id + "\";", (err, users) => {
            if (err) return utils.replyError(interaction, "Internal error. Please try again later.", err.message);
            else {
                if (users[0] === undefined) {
                    sendVerification(interaction, connection, reqs, "INSERT");
                } else if (users[0] != undefined && !users[0].verified) {
                    if (new Date() <= new Date(users[0].codeExpiration)) return utils.replyError(interaction, "You were already given a verification code! Check your DMs to continue.", null);
                    else sendVerification(interaction, connection, reqs, "UPDATE");
                } else {
                    utils.replyError(interaction, "You are already verified.", null);
                }
            }
        });
    });
};

function sendVerification(interaction, connection, reqs, type) {
    var code = interaction.guild.name.substring(0, 3) + (Math.floor(Math.random() * (999 - 100 + 1)) + 100);
    var now = new Date();
    var expires = new Date(now.setMinutes(now.getMinutes() + 15));
    var embed = new Discord.EmbedBuilder()
        .setTitle("How to verify")
        .setAuthor({ name: (interaction.guild.name + " Verification"), iconUrl: interaction.guild.iconUrl })
        .setDescription("```md\n1. Make sure your realmeye matches the server-specific requirements below.\n2. Put the code\n\n#     " + code + "     #\n\nin your realmeye description.\n3. Type your in-game name here as it appears in-game (case-sensitive).\n```")
        .addFields({ name: "\u200b", value: "**__Server-Specific Verification Requirements:__**" }, { name: "**Stars Required**", value: "```lua\n" + reqs.stars + "\n```", inline: true }, { name: "**Hidden Location Required**", value: "```\n" + reqs.privateLocation + "\n```", inline: true })
        .setColor("#FFFFFF");

    switch (type) {
        case "INSERT":
            var query = "INSERT INTO users (tag, id, code, codeExpiration, guildId, verified) VALUES (\"" + interaction.user.tag + "\", \"" + interaction.user.id + "\", \"" + code + "\", \"" + expires.getFullYear() + "-" + ("0" + (expires.getMonth() + 1)).slice(-2) + "-" + ("0" + expires.getDate()).slice(-2) + " " + ("0" + expires.getHours()).slice(-2) + ":" + ("0" + expires.getMinutes()).slice(-2) + ":" + ("0" + expires.getSeconds()).slice(-2) + "\", \"" + interaction.guild.id + "\", false)";
            break;
        case "UPDATE":
            query = "UPDATE users SET code=\"" + code + "\", codeExpiration=\"" + expires.getFullYear() + "-" + ("0" + (expires.getMonth() + 1)).slice(-2) + "-" + ("0" + expires.getDate()).slice(-2) + " " + ("0" + expires.getHours()).slice(-2) + ":" + ("0" + expires.getMinutes()).slice(-2) + ":" + ("0" + expires.getSeconds()).slice(-2) + "\" WHERE id=\"" + interaction.user.id + "\";";
            break;
    }

    connection.query(query, (err) => {
        if (err) return utils.replyError(interaction, "Internal error. Please try again later.", err.message);
        interaction.user.send({ embeds: [embed] });
        utils.reply(interaction, "Verification started, please check your DMs to continue.", true);
    });
}

module.exports.info = {
    name: "verify",
    description: "Verify your account and link it to your IGN",
    usage: "verify",
    restricted: false
};