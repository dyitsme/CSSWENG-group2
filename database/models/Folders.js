const mongoose = require('mongoose');
const file = require('./Files.js');
const folderSchema = new mongoose.Schema({
    name: String,
    access: String,
    files: [file.fileSchema],
    parent: String,
    level: String,
});
const Folders = mongoose.model('Folders', folderSchema);
module.exports = Folders;