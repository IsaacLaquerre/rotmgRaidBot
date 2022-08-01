const Discord = require("discord.js");
const request = require("request");
const config = require("./botConfig.json");

module.exports = {
    // Staff

    checkPermission(client, interaction, roleName) {
        return new Promise((resolve, reject) => {
            client.guilds.fetch(config.guildId).then(guild => {
                var role = guild.roles.cache.find(role => role.name === roleName);
                if (role === undefined) reject(new Error("Couldn't find a role with the name \"" + roleName + "\""));
                if (interaction.member.roles.highest.comparePositionTo(role) < 0) resolve(false);
                else resolve(true);
            });
        });
    },

    log(client, message, embed = false) {
        client.guilds.fetch(config.guildId).then(guild => {
            guild.channels.fetch(config.logId).then(log => {
                if (!embed) log.send(message);
                else log.send({ embeds: [message] });
            });
        });
    },

    addReaction(reaction, message) {
        return new Promise((resolve, reject) => {
            message.react(reaction).then(() => resolve());
        });
    },

    disconnectMembers(vc) {
        vc.members.forEach(member => member.voice.disconnect());
    },

    // Interactions & messages
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
    },
    replyError(interaction, message, errorMessage) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription(message + (errorMessage != null ? "\n```\n" + errorMessage + "\n```" : ""));
        interaction.reply({ embeds: [embed], ephemeral: true });
    },
    editReplyError(interaction, message, errorMessage) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription(message + (errorMessage != null ? "\n```\n" + errorMessage + "\n```" : ""));
        interaction.editReply({ embeds: [embed] });
    },
    dmUser(user, message) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.successColor)
            .setDescription(message);
        user.send({ embeds: [embed] });
    },
    dmUserError(user, message, errorMessage) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription(message + (errorMessage != null ? "\n```\n" + errorMessage + "\n```" : ""));
        user.send({ embeds: [embed] });
    },

    // Useful

    numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    requestItems() {
        return new Promise(function(resolve, reject) {
            request("https://www.realmeye.com/s/dw/js/definition.js", {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36"
                }
            }, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    var item = body.replace("items=", "").replace(/;/g, "").replace(/e3/g, "0000");
                    item = item.replace(/-?\d+:/g, function(n) {
                        if (item[item.indexOf(n) - 1] === "\"") return n.replace(/:/g, "");
                        return "\"" + n.replace(/:/g, "") + "\":";
                    });
                    resolve(JSON.parse(item));
                } else reject(err);
            });
        });
    }
};

module.exports.messages = {
    missingPermissions(interaction) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("You do not have the required permissions to use that command.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    unknownCommand(interaction, command) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Unknown command \"" + command + "\".");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    unknownUser(interaction, user) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Couldn't find user \"" + user + "\".");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    unknownRole(interaction, role) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Couldn't find role \"" + role + "\".");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    unknownRunRl(interaction) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Couldn't find an active run that you are leading.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    unknownRun(interaction) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Couldn't find an active run with that ID.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    noArgs(interaction, arg) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Command is missing a parameter: `" + arg + "`.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    badArgument(interaction, arg, value) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Incorrect argument. Cannot use \"" + value + "\" for parameter `" + arg + "`.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    alreadyHasRole(interaction, user, role) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("User \"" + user + "\" already has the role \"" + role.toString() + "\".");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    doesntHaveRole(interaction, user, role) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("User \"" + user + "\" doesn't have the role \"" + role.toString() + "\".");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    noVoiceChannel(interaction) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription("Please join a voice channel first.");
        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    error(interaction, message) {
        var embed = new Discord.EmbedBuilder()
            .setColor(config.errorColor)
            .setDescription(message);
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

module.exports.emotes = {
    nitro: "<:nitro:935976133017612288>",
    o3: "<:oryxs:924661866192580628>",
    inc: "<:incs:924661470766194709>",
    helmetRune: "<:helms:924660982582759445>",
    swordRune: "<:swords:924661018813157417>",
    shieldRune: "<:shields:924661443918438410>",
    decaRing: "<:decas:926213789819478057>",
    void: "<:voids:899193984444940300>",
    lostHallsKey: "<:keys:899194041298735154>",
    vial: "<:vials:899194056905719808>",
    fullSkip: "<:fullskips:899241087837814846>",
    cult: "<:cults:899194002992168980>",
    shatters: "<:shattersportals:926214235103563868>",
    shattersKey: "<:shatterskeys:926214029448450078>",
    nest: "<:nestportals:926220617219465256>",
    nestKey: "<:nestkeys:926220701793386506>",
    fungal: "<:fungalportals:926224937398714408>",
    fungalKey: "<:fungalkeys:926224956675731527>",
    armorBreak: "<:armor_breaks:899194132357062697>",
    slow: "<:slows:924664614334128139>",
    curse: "<:curses:926213837248684073>",
    expose: "<:exposes:926213854625660988>",
    daze: "<:dazes:926220659124756521>",
    rangedDps: "<:rangeddpss:926214650251579482>",
    warrior: "<:warriors:899194146986795008>",
    paladin: "<:paladins:899194159330656267>",
    knight: "<:knights:899194171955482705>",
    wizard: "<:wizards:899239204796649482>",
    mystic: "<:mystics:899194190678867990>",
    priest: "<:priests:924661517822091284>",
    trickster: "<:tricksters:899194213340704799>",
    bard: "<:bards:924661492568182806>",
    marbleSeal: "<:mseals:899239186765348894>",
    ogmur: "<:ogmurs:926213812980449293>",
    qot: "<:qots:926221843269029898>",
    fungalTome: "<:fungaltomes:899239154083332156>",
    planewalker: "<:planewalkers:899194100761362512>",
    brain: "<:brains:899239133250211891>",
    startAfk: "✔️",
    openVc: "🔓",
    endAfk: "🔚",
    abortAfk: "✖️",
    endRun: "☑️",
    stars: {
        "light-blue": "<:lightbluestar:974015769459445860>",
        "blue": "<:bluestar:974015782860234863>",
        "red": "<:redstar:974015798773415987>",
        "orange": "<:orangestar:974015804964233272>",
        "yellow": "<:yellowstar:974015812836950087>",
        "white": "<:whitestar:974015821854687252>"
    }
};

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});