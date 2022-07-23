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

const allIntents = new Discord.IntentsBitField("Guilds", "GuildMembers", "GuildBans", "GuildEmojisAndStickers", "GuildIntegrations", "GuildPresences", "GuildVoiceStates", "GuildMessages", "GuildMessagesReactions", "DirectMessages", "DirectMessageReactions");

var client = new Discord.Client({ intents: allIntents, partials: ["CHANNEL"] });
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
for (const file of commandFiles) {
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

client.on("ready", () => {
    clear({ toStart: true });
    client.user.setActivity("/help", { type: "PLAYING" });
    console.log("Bot ready");
});

client.on("interactionCreate", async interaction => {
    var commandFile = client.commands.get(interaction.commandName.toLowerCase());
    if (commandFile) commandFile.run(client, interaction);
});

client.login(TOKEN);