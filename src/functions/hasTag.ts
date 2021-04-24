function hasTag(guild, tagName, db) {
  if (guild.id) {
    guild = guild.id;
  }
  let result = null;
  if (db.has(`tags_${guild}.${tagName}`)) result = true;
  return result;
}

export { hasTag };
