const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    name: String,
    access: String,
    
});
const Files = mongoose.model('Files', fileSchema);
module.exports = Files;
module.exports.fileSchema = fileSchema;