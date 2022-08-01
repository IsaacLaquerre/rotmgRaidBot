const utils = require("../../utils.js");

module.exports = {
    data: {
        name: "endAfk"
    },
    exec(client, interaction, connection) {
        connection.query("SELECT * FROM runs WHERE controlEmbedId=\"" + interaction.message.interaction.id + "\";", (err, runs) => {
            if (err || runs[0] === undefined) return utils.replyError(interaction, "Internal error. Please try again later." + (err ? "\n```\n" + err.message + "\n```" : ""));
            else {
                client.runs.get(runs[0].id).endAfk(client, connection);
            }
        });
    }
};