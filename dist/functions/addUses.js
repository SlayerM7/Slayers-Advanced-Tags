"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUses = void 0;
function addUses(guild, tag, amount, db) {
    if (guild.id)
        guild = guild.id;
    if (db.has(`tags_${guild}.${tag}`)) {
        db.set(`tags_${guild}.${tag}.uses`, db.get(`tags_${guild}.${tag}.uses`) + amount);
    }
}
exports.addUses = addUses;
