"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client = new discord_js_1.Client();
const fs = require("fs");
const { slayersDB } = require("slayer.db");
let db = new slayersDB({
    saveReadable: true,
    saveInternal: {
        func: true,
        dir: "database",
    },
});
let commands = new discord_js_1.Collection();
let files = fs.readdirSync(`./dist/commands/`);
files.map((file) => {
    let pull = require(`./commands/${file}`);
    commands.set(pull.name, pull);
});
client.on("ready", () => console.log("Ready"));
client.on("message", (message) => {
    let prefix = "!";
    if (message.author.bot ||
        !message.content.startsWith(prefix) ||
        !message.guild)
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    require("./utils/tags")(client, message, args, db, command);
    if (commands.has(command)) {
        let cmd = commands.get(command);
        cmd.run(client, message, args, db);
    }
});
client.login("ODE3ODQyMTM3MTEwNTQ0NDM0.YEPY2A.3Ndn_pYID4jJabA6oYVHye2sJRE");
