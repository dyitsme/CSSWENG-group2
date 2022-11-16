const mongoose = require('mongoose');
const file = require('./Files.js');
const folderSchema = new mongoose.Schema({
    name: String,
    access: String,
    folders:[{
        name: String,
        access: String,
        files: [file.fileSchema],
        folders:[{
            name: String,
            access: String,
            files: [file.fileSchema],
            folders:[{}]
        }]
    }],
    files: [file.fileSchema],
});
const Folders = mongoose.model('Folders', folderSchema);
module.exports = Folders;