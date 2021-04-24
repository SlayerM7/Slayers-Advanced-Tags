function addUses(guild, tag, amount, db) {
  if (guild.id) guild = guild.id;

  if (db.has(`tags_${guild}.${tag}`)) {
    db.set(
      `tags_${guild}.${tag}.uses`,
      db.get(`tags_${guild}.${tag}.uses`) + amount
    );
  }
}

export { addUses };
