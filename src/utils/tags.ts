import { addUses } from "../functions/addUses";
import { hasTag } from "../functions/hasTag";

module.exports = (client, message, args, db, tag) => {
  let aliases = [];
  let dataBaseValues = db.values();
  dataBaseValues.map((dbv) => {
    Object.values(dbv).map(<tagInter>(dbv) => {
      if (dbv.type === "tag") {
        aliases.push(...dbv.aliases);
      }
    });
  });

  if (!hasTag(message.guild, tag, db) && !aliases.includes(tag)) return;
  if (aliases.includes(tag)) {
    let tagName;
    dataBaseValues.map((k) => {
      Object.values(k).map(<valuesInter>(k) => {
        if (k.aliases.includes(tag)) tagName = k.tagName;
      });
    });
    let data = db.get(`tags_${message.guild.id}.${tagName}`);
    message.channel.send(data.response);
    addUses(message.guild, tagName, 1, db);
  } else {
    let data = db.get(`tags_${message.guild.id}.${tag}`);
    message.channel.send(data.response);
    addUses(message.guild, tag, 1, db);
  }
  db.save();
};
