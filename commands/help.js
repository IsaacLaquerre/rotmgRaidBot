const Discord = require("discord.js");
const config = require("../botConfig.json");
const utils = require("../utils.js");

module.exports.run = (client, interaction) => {
    if (interaction.options.get("command")) {
        try {
            var command = client.commands.find(c => c.info.name === interaction.options.get("command").value.toLowerCase()) || client.commands.find(c => c.info.aliases.includes(interaction.options.get("command").value.toLowerCase()));
        } catch (err) { utils.messages.unknownCommand(interaction, interaction.options.get("command").value); }
        if (command) {
            var fields = [{ name: "Usage", value: "/" + command.info.usage }];
            if (command.info.example) fields.push({ name: "Example", value: command.info.example });
            var embed = new Discord.EmbedBuilder()
                .setTitle(command.info.name.capitalize())
                .setColor("#FFFFFF")
                .setDescription(command.info.description);
            embed.addFields(fields);
            interaction.reply({ embeds: [embed] });
        }
    } else {
        var unrestricedCommands = [];
        var raidLeaderCommands = [];
        var securityCommands = [];
        var moderatorCommands = [];
        var verifiedRole;
        var raidLeaderRole;
        var securityRole;
        var moderatorRole;
        client.guilds.fetch(config.guildId).then(guild => {
            everyoneRole = guild.roles.cache.find(role => role.name === "Verified");
            raidLeaderRole = guild.roles.cache.find(role => role.name === "Raid Leader");
            securityRole = guild.roles.cache.find(role => role.name === "Security");
            moderatorRole = guild.roles.cache.find(role => role.name === "Moderator");

            for ([k, v] of client.commands.entries()) {
                if (!v.info.restricted) {
                    if (v.info.name != "help") unrestricedCommands.push("/" + v.info.name);
                } else {
                    switch (v.info.restricted.toLowerCase()) {
                        case "raid leader":
                            raidLeaderCommands.push("/" + v.info.name);
                            break;
                        case "security":
                            securityCommands.push("/" + v.info.name);
                            break;
                        case "moderator":
                            moderatorCommands.push("/" + v.info.name);
                            break;
                        default:
                            break;
                    }
                }
            }

            var embed = new Discord.EmbedBuilder()
                .setTitle("List of commands")
                .setColor("#FFFFFF")
                .setDescription("Use `/help <command>` for more info on a specific command")
                .addFields({ name: "Required role", value: "@everyone" }, { name: "`" + unrestricedCommands.join("`, `") + "`", value: "\u200b" }, { name: "Required role", value: securityRole.toString() }, { name: "`" + securityCommands.join("`, `") + "`", value: "\u200b" }, { name: "Required role", value: moderatorRole.toString() }, { name: "`" + moderatorCommands.join("`, `") + "`", value: "\u200b" }, { name: "`" + raidLeaderCommands.join("`, `") + "`", value: "\u200b" }, { name: "Required role", value: raidLeaderRole.toString() });
            interaction.reply({ embeds: [embed] });
        });
    }
};

module.exports.info = {
    name: "help",
    description: "List of available commands",
    options: [{
        name: "command",
        description: "The optional command you want info on",
        type: 3
    }],
    usage: "/help [command name]",
    example: "/help verify",
    restricted: false
};