"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTag = void 0;
function hasTag(guild, tagName, db) {
    if (guild.id) {
        guild = guild.id;
    }
    let result = null;
    if (db.has(`tags_${guild}.${tagName}`))
        result = true;
    return result;
}
exports.hasTag = hasTag;
