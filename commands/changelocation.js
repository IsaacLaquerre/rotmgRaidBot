const utils = require("../utils.js");

module.exports.run = (client, interaction, connection) => {
    utils.checkPermission(client, interaction, this.info.restricted).then(async allowed => {
        if (allowed) {
            if (!interaction.options.get("id")) {
                connection.query("SELECT * FROM runs WHERE JSON_EXTRACT(raidLeader, \"$.tag\")=\"" + interaction.user.tag + "\" AND started=0 AND ended=0 AND aborted=0;", (err, runs) => {
                    if (err || runs[0] === undefined) return utils.replyError(interaction, "Couldn't find an active run that you are leading. Please try again by provididing a run ID.");
                    if (runs[0].location === interaction.options.get("newlocation").value) return utils.replyError(interaction, "The location is already set to `" + interaction.options.get("newlocation").value + "`.");
                    client.runs.get(runs[0].id).changeLocation(client, interaction, connection, interaction.options.get("newlocation").value);
                    utils.reply(interaction, "Changed the location to `" + interaction.options.get("newlocation").value + '`', true);
                });
            } else {
                connection.query("SELECT * FROM runs WHERE id=\"" + interaction.options.get("id").value + "\" AND started=0 AND ended=0 AND aborted=0;", (err, runs) => {
                    if (err || runs[0] === undefined) return utils.replyError(interaction, "Couldn't find an active run with that ID.");
                    if (runs[0].location === interaction.options.get("newlocation").value) return utils.replyError(interaction, "The location is already set to `" + interaction.options.get("newlocation").value + "`.");
                    client.runs.get(runs[0].id).changeLocation(client, interaction, connection, interaction.options.get("newlocation").value);
                    utils.reply(interaction, "Changed the location to `" + interaction.options.get("newlocation").value + '`', true);
                });
            }
        } else return utils.messages.missingPermissions(interaction);
    });
};

module.exports.info = {
    name: "changelocation",
    description: "Change the location of a run",
    options: [{
            name: "newlocation",
            description: "The new location you want to use",
            type: 3,
            required: true
        },
        {
            name: "id",
            description: "The ID of the run that you want to change the location of",
            type: 3
        }
    ],
    usage: "changelocation <new location>",
    example: "/changelocation use r",
    restricted: "Raid Leader"
};