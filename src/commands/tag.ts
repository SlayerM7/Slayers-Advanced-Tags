import { MessageEmbed } from "discord.js";
import { hasTag } from "../functions/hasTag";
import moment from "moment";
import { editLastModified } from "../functions/editLastModified";
import { options as operations } from "../utils/tag-operations";

module.exports = {
  name: "tag",
  run: (client, message, args, db) => {
    let func = args[0];
    if (!func) return message.channel.send("No operation was given");
    if (!operations.includes(func))
      return message.channel.send("Invalid operation given");
    if (func === "create") {
      let name = args[1];
      let msg = args.slice(2).join(" ");
      if (!name || !msg)
        return message.channel.send("No name or response was given");
      if (db.has(`tags_${message.guild.id}.${name}`))
        return message.channel.send("That tag name already exists");
      db.set(`tags_${message.guild.id}.${name}`, {
        createdAt: new Date(),
        lastEditedAt: new Date(),
        type: "tag",
        creator: message.author,
        lastEditedBy: message.author,
        response: msg,
        tagName: name,
        uses: 0,
        aliases: [],
        server: message.guild,
        lastEditedDone: "Create tag",
      });
      db.save();
      message.channel.send(`Tag **${name}** has been created`);
    } else if (func === "delete") {
      let name = args[0];
      if (!name) return message.channel.send("No tag name was given");
      if (!hasTag(message.guild, name, db))
        return message.channel.send("That tag does not exist");
      db.delete(`tags_${message.guild.id}.${name}`);
      db.save();
      message.channel.send("The tag has been deleted");
    } else if (func === "info") {
      let name = args[1];
      if (!name) return message.channel.send("No name was given");
      let data = db.get(`tags_${message.guild.id}.${name}`);
      if (!data) return message.channel.send("That tag does not exist");

      // console.log(`
      // ${name}\n${data.creator.username}\n${data.aliases.join(" ")}\n${
      //   data.server.name
      // }\n${data.uses}`);

      const embed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(
          message.author.username,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .addField("❯ Name", name)
        .addField("❯ Creator", `${data.creator.username} (${data.creator.id})`)
        .addField(
          "❯ Aliases",
          data.aliases.length ? data.aliases.join(", ") : "None"
        )
        .addField("❯ Server", data.server.name)
        .addField("❯ Uses", data.uses)
        .addField("❯ Created", moment(data.createdAt).fromNow())
        .addField("❯ Last modified", moment(data.lastEditedAt).fromNow())
        .addField(
          "❯ Last modified by",
          `${data.lastEditedBy.username} (${data.lastEditedBy.id})`
        )
        .addField("Last action done", data.lastEditedDone);
      message.channel.send(embed);
    } else if (func === "add-alias") {
      let tagName = args[1];
      let alias = args[2];
      if (!tagName) return message.channel.send("No tag name was given");
      if (!alias) return message.channel.send("No alias name was given");
      if (!hasTag(message.guild, tagName, db))
        return message.channel.send("That tag does not exist");
      let oldArray = db.get(`tags_${message.guild.id}.${tagName}.aliases`);
      oldArray.push(alias);
      db.set(`tags_${message.guild.id}.${tagName}.aliases`, oldArray);
      editLastModified(message.guild, tagName, message.author, db);
      db.set(`tags_${message.guild.id}.${tagName}.lastEditedDone`, "Add alias");
      db.save();
      message.channel.send("The alias has been added");
    } else if (func === "remove-alias" || func === "del-alias") {
      let tagName = args[1];
      let alias = args[2];
      if (!tagName) return message.channel.send("No tag name was given");
      if (!alias) return message.channel.send("No alias name was given");
      if (!hasTag(message.guild, tagName, db))
        return message.channel.send("That tag does not exist");
      let oldArray = db.get(`tags_${message.guild.id}.${tagName}.aliases`);

      oldArray = oldArray.filter((x) => x !== alias);

      db.set(`tags_${message.guild.id}.${tagName}.aliases`, oldArray);
      db.set(
        `tags_${message.guild.id}.${tagName}.lastEditedDone`,
        "Remove alias"
      );
      editLastModified(message.guild, tagName, message.author, db);

      db.save();
      message.channel.send("The alias has been removed");
    } else if (func === "list") {
      let user = message.mentions.users.first();
      let tagsArray = [];
      let values = db.values();
      values.forEach((val) => {
        if (!user) {
          Object.values(val).map(<niks>(value) => {
            if (value.server) {
              if (value.server.id === message.guild.id)
                tagsArray.push(value.tagName);
            }
          });
        } else {
          Object.values(val).map(<niks>(value) => {
            if (value.server) {
              if (value.server.id === message.guild.id) {
                if (value.creator) {
                  if (value.creator.id === user.id)
                    tagsArray.push(value.tagName);
                }
              }
            }
          });
        }
      });

      let embed = new MessageEmbed()
        .setColor("RED")
        .setAuthor(
          message.author.username,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setDescription(tagsArray.join(", "));
      message.channel.send(embed);
    } else if (func === "edit") {
      let tagName = args[1];
      if (!tagName) return message.channel.send("No tag name was given");
      if (!hasTag(message.guild, tagName, db))
        return message.channel.send("That tag does not exist");
      let data = db.get(`tags_${message.guild.id}.${tagName}`);
      let newResponse = args.slice(2).join(" ");
      if (!newResponse)
        return message.channel.send("No new response was given");
      if (
        data.creator.id !== message.author.id &&
        !message.member.hasPermission("MANAGE_GUILD")
      )
        return message.channel.send("You can only edit tags made by you");
      db.set(`tags_${message.guild.id}.${tagName}.response`, newResponse);
      db.set(
        `tags_${message.guild.id}.${tagName}.lastEditedDone`,
        "Changed response"
      );
      db.save();
      message.channel.send("Edited tag response!");
    } else if (func === "del-all" || func === "clear") {
      db.delete(`tags_${message.guild.id}`);
      db.save();
      message.channel.send("All tags have been cleared");
    } else if (func === "search") {
      let search = args[1];
      let arr = [];
      if (!search) return message.channel.send("No search given");
      let guildTags = db.get(`tags_${message.guild.id}`);
      Object.keys(guildTags).map((key) => {
        if (key.includes(search)) arr.push(key);
      });
      message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setAuthor(
            message.author.username,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(arr.join(", "))
      );
    }
  },
};
