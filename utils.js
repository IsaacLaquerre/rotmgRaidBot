const Discord = require("discord.js");
const config = require("./botConfig.json");

module.exports = {
    reply(interaction, message, ephemeral = false) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.successColor)
            .setDescription(message);
        interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    },
    editReply(interaction, message, ephemeral = false) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.successColor)
            .setDescription(message);
        interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
    }
};