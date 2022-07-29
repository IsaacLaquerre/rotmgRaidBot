const Discord = require("discord.js");
const clear = require("clear-console");
const fs = require("fs");
const mysql = require("mysql");
const { REST, RequestManager } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fetch = require("fetch").fetchUrl;
const cheerio = require("cheerio");
const config = require("./botConfig.json");
const dbConfig = require("./dbConfig.json");
const utils = require("./utils");

const intents = [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildBans, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.DirectMessageReactions];
const partials = [Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction];

var client = new Discord.Client({ intents: intents, partials: partials });
var connection = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.pass,
    database: dbConfig.database,
    flags: "-FOUND_ROWS"
});

var TOKEN = config.token;


client.on("error", (err) => {
    return console.log(err);
});

process.on("uncaughtException", (err) => {
    return console.log(err);
});

process.on("unhandledRejection", (err) => {
    return console.log(err);
});


client.commands = new Discord.Collection();

var applicationCommands = [];

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (var file of commandFiles) {
    var command = require(`./commands/${file}`);
    client.commands.set(command.info.name, command);
    var applicationCommand = {
        name: command.info.name,
        description: command.info.description
    };
    if (command.info.options) {
        applicationCommand.options = command.info.options;
    }
    applicationCommands.push(applicationCommand);
    console.log("Loaded " + command.info.name + " command");
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.botId, config.guildId), { body: applicationCommands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const componentFolders = fs.readdirSync("./components");
for (var componentFolder of componentFolders) {
    const folder = fs.readdirSync("./components/" + componentFolder);
    for (var file of folder) {
        client[componentFolder] = new Discord.Collection();
        console.log(`./components/${componentFolder}/${file}`);
        var file = require(`./components/${componentFolder}/${file}`);
        file.init().then(component => client[componentFolder].set(file.data.name, { file: file, data: component }));
    }
}

client.runs = new Discord.Collection();

client.on("ready", () => {
    //clear({ toStart: true });
    client.user.setActivity("/help", { type: "PLAYING" });
    console.log("Bot ready");
    console.log(client.buttons)
});

client.on("messageCreate", message => {
    if (message.author.bot || message.author.id === config.botId) return;
    if (message.channel.type === 1) {
        client.guilds.fetch(config.guildId).then(guild => {
            guild.members.fetch(message.author.id).then(member => {
                if (member.roles.cache.has(config.verifiedRoleId)) return;
                connection.query("SELECT * FROM users WHERE id=\"" + message.author.id + "\"", (err, users) => {
                    if (err) return utils.dmUserError(message.author, "Internal error. Please try again later.", err.message);
                    connection.query("SELECT * FROM guilds WHERE id=\"" + users[0].guildId + "\";", (err, guilds) => {
                        if (err) return utils.dmUserError(message.author, "Internal error. Please try again later.", err.message);
                        var reqs = JSON.parse(guilds[0].reqs);
                        if (users[0] != undefined) {
                            if (users[0].verified) return;
                            if (new Date() > new Date(users[0].codeExpires)) return;
                            var embed = new Discord.EmbedBuilder()
                                .setDescription("Working...")
                                .setColor("#FFFFFF");
                            message.author.send({ embeds: [embed] }).then(() => {
                                fetch("https://www.realmeye.com/player/" + message.content, (err, meta, body) => {
                                    if (err) return utils.dmUserError(message.author, "Couldn't find RealmEye account named \"" + message.content + "\".", null);

                                    const $ = cheerio.load(body.toString());

                                    if ($(".player-not-found").length > 0) return utils.dmUserError(message.author, "Couldn't find RealmEye account named \"" + message.content + "\".");

                                    var hasCode = false;
                                    $("div.description-line").each((i, el) => {
                                        if (el.children[0] != undefined) {
                                            if (el.children[0].data.includes(users[0].code)) hasCode = true;
                                        }
                                    });

                                    var hasStars = false;
                                    if (parseInt($("div.star-container").text()) >= reqs.stars) hasStars = true;

                                    var privateLoc = false;
                                    if (($("td")[21] != undefined ? $("td")[21].children[0].data : $("td")[17]) === "hidden") privateLoc = true;
                                    if (!reqs.privateLocation) privateLoc = true;

                                    var ign = $("span.entity-name").text();

                                    embed = new Discord.EmbedBuilder();

                                    if (hasCode && hasStars && privateLoc) {
                                        connection.query("UPDATE users SET ign=\"" + message.content + "\", verified=true WHERE id=\"" + message.author.id + "\";", function(err) {
                                            if (err) return utils.dmUserError(message.author, "Verification error:\n\nInternal error, please try again in a few minutes", err.message);

                                            client.guilds.fetch(config.guildId).then(guild => {
                                                guild.members.fetch(message.author.id).then(member => {
                                                    try {
                                                        member.roles.add(guild.roles.cache.find(r => r.id === config.verifiedRoleId));
                                                        member.setNickname(ign);
                                                    } catch (error) {}
                                                    utils.dmUser(message.author, "Successfully verified under IGN `[" + ign + "]`");
                                                });
                                            });
                                        });
                                    } else utils.dmUserError(message.author, "Verification error:\n\n" + (hasCode ? "" : "Couldn't find the code in your realmeye description.\n") + (hasStars ? "" : "You do not meet the required amount of stars.\n") + (privateLoc ? "" : "You need to set your last seen location to private."), null);
                                });
                            });
                        }
                    });
                });
            });
        });
    }
});

client.on("interactionCreate", async interaction => {
    if (interaction.isChatInputCommand()) {
        var commandFile = client.commands.get(interaction.commandName.toLowerCase());
        if (commandFile) commandFile.run(client, interaction, connection);
    } else if (interaction.isButton()) {
        var button = client.buttons.get(interaction.customId);
        if (button) button.file.exec(client, interaction, connection);
    }
});

client.login(TOKEN);