const mongoose = require('mongoose');

const accSchema = new mongoose.Schema({
    username : String,
    pass : String,
    role : String,
    
});
const Account = mongoose.model('Account', accSchema);
module.exports = Account;