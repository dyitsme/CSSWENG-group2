const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    name: String,
    access: String,
    parent: String,
    size: Number,
    date: String,
    uploader: String
});
const Files = mongoose.model('Files', fileSchema);
module.exports = Files;
module.exports.fileSchema = fileSchema;