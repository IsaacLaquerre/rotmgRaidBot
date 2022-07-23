const read = require("text-from-image");
const utils = require("../utils.js");

module.exports.run = async(client, interaction) => {
    utils.reply(interaction, "Reading attachment...");
    await read(interaction.options.get("attachment").attachment.url).then(text => {
        utils.editReply(interaction, text);
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
    use: "parse <attachment>",
    example: "/parse (attach a screenshot to the message)",
    restricted: "Security"
};