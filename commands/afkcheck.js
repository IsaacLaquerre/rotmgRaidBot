const Discord = require("discord.js");
const { v4: uuid } = require("uuid");
const config = require("../botConfig.json");
const utils = require("../utils.js");
const Run = require("../classes/Run.js");

module.exports.run = (client, interaction, connection) => {
    utils.checkPermission(client, interaction, this.info.restricted).then(allowed => {
        if (allowed) {
            client.guilds.fetch(interaction.guild.id).then(guild => {
                guild.members.fetch(interaction.user.id).then(member => {
                    var voiceChannel = member.voice.channel;
                    if (!voiceChannel) return utils.messages.noVoiceChannel(interaction);
                    var id = uuid();
                    var type = interaction.options.get("type").value;
                    var location = interaction.options.get("location").value;
                    connection.query("SELECT * FROM users WHERE id=\"" + interaction.user.id + "\";", (err, users) => {
                        if (err || users[0] === undefined) return utils.replyError(interaction, "Internal error. Please try again later." + (err ? "\n```" + err.message + "\n```" : ""), true);
                        client.channels.fetch(config.raidChannel).then(raidChannel => {
                            var embed = new Discord.EmbedBuilder()
                                .setColor(config.successColor)
                                .setDescription("Your run has started in " + raidChannel.toString());

                            var buttons = {
                                rows: {
                                    1: new Discord.ActionRowBuilder()
                                }
                            };
                            var buttonsArray = Array.from(client.buttons);
                            var row = 1;
                            for (button in buttonsArray) {
                                if (buttonsArray[button][1].row != row) {
                                    if (buttons.rows[buttonsArray[button][1].row] === undefined) {
                                        buttons.rows[buttonsArray[button][1].row] = new Discord.ActionRowBuilder();
                                        row = buttonsArray[button][1].row;
                                    } else {
                                        row = buttonsArray[button][1].row;
                                    }
                                }

                                buttonsArray[button][1].data.order = buttonsArray[button][1].order;
                                buttons.rows[row].addComponents(buttonsArray[button][1].data);

                                buttons.rows[row].components.sort((a, b) => a.order - b.order);
                            }

                            var rows = [];

                            Object.values(buttons.rows).forEach(actionRow => rows.push(actionRow));

                            interaction.reply({ embeds: [embed], components: rows }).then(reply => {
                                var run = new Run(id, type, location, { tag: interaction.user.tag, ign: users[0].ign }, reply.id, voiceChannel.id);
                                run.create(client, interaction, connection);
                            });
                        });
                    });
                });
            });
        } else return utils.messages.missingPermissions(interaction);
    });
};

module.exports.info = {
    name: "afkcheck",
    description: "Start an AFK check",
    options: [{
        name: "type",
        description: "The dungeon you want to start an AFK check for",
        type: 3,
        choices: [{ name: "Void", value: "void" }, { name: "Full-skip Void", value: "fullskip" }, { name: "Fungal Cavern", value: "fungal" }, { name: "Oryx Sanctuary", value: "o3" }, { name: "Cultist Hideout", value: "cult" }, { name: "Shatters", value: "shatters" }, { name: "Nest", value: "nest" }],
        required: true
    }, {
        name: "location",
        description: "The location of your run",
        type: 3,
        required: true
    }],
    usage: "afkcheck <type> <location>",
    example: "/afkcheck void use2 r",
    restricted: "Raid Leader"
};