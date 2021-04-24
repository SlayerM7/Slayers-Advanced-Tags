"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editLastModified = void 0;
function editLastModified(guild, tag, user, db) {
    guild.id ? (guild = guild.id) : "";
    db.set(`tags_${guild}.${tag}.lastEditedBy`, user);
    db.set(`tags_${guild}.${tag}.lastEditedAt`, new Date()); //lastEditedAt
}
exports.editLastModified = editLastModified;
