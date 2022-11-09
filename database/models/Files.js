const mongoose = require('mongoose');
const accSchema = new mongoose.Schema({
    name: String,
    access: String,
    
});
const Files = mongoose.model('Files', accSchema);
module.exports = Files;