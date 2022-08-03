const read = require("text-from-image");
const utils = require("../utils.js");

module.exports.run = (client, interaction, connection) => {
    utils.checkPermission(client, interaction, this.info.restricted).then(async allowed => {
        if (allowed) {
            await utils.reply(interaction, "Reading attachment...");
            try {
                await read(interaction.options.get("attachment").attachment.url).then(text => {
                    return utils.editReply(interaction, text);
                }).catch(err => {
                    utils.editReplyError(interaction, "Couldn't read screenshot. Please try again on a clearer background." + (err.message != "Received one or more errors" ? "\n```\n" + err.message + "\n```" : ""));
                });
            } catch (err) {
                utils.editReplyError(interaction, "Couldn't read screenshot. Please try again on a clearer background.\n```\n" + (err.message != "Received one or more errors" ? "\n```\n" + err.message + "\n```" : ""));
            }
        } else return utils.messages.missingPermissions(interaction);
    });
};

module.exports.info = {
    name: "parse",
    description: "Parse a run",
    options: [{
        name: "attachment",
        description: "Screenshot of player list (/who, preferably over a dark background)",
        type: 11,
        required: true
    }],
    usage: "parse <attachment>",
    example: "/parse (attach a screenshot to the message)",
    restricted: "Security"
};