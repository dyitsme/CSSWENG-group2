const mongoose = require('mongoose');
const file = require('./Files.js');
const folderSchema = new mongoose.Schema({
    name: String,
    access: String,
    folders:[{
        name: String,
        access: String,
        files: [file.fileSchema],
    }],
    files: [file.fileSchema],
});
const Folders = mongoose.model('Folder', folderSchema);
module.exports = Folders;
module.exports.folderschema = folderSchema;