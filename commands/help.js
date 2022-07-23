const utils = require("../utils.js");

module.exports.run = (client, interaction) => {
    utils.reply(interaction, "no.", true);
};

module.exports.info = {
    name: "help",
    description: "List of available commands",
    options: [{
        name: "command",
        description: "The optional command you want info on",
        type: 3
    }],
    use: "/help [command name]",
    example: "/help verify",
    restricted: false
};