const mongoose = require('mongoose');

const accSchema = new mongoose.Schema({
    username : String,
    pass : String,
    role : String,
    folders:[{
        name: String,
        access: String,
        files:[{
            name: String,
            access: String,
        }]
    }],
    files:[{
        name: String,
        access: String,
    }]
});
const Account = mongoose.model('Account', accSchema);
module.exports = Account;