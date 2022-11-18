const mongoose = require('mongoose');
const file = require('./Files.js');
const Folders1 = require('./folder.js');
const folderSchema = new mongoose.Schema({
    name: String,
    access: String,
    folders:[//[Folders1.folderschema],
    {
        name: String,
        access: String,
        files: [file.fileSchema],
        folders:[{
            name: String,
            access: String,
            files: [file.fileSchema],
            folders:[{
                name: String,
                access: String,
                files: [file.fileSchema],
                folders:[{
                    name: String,
                    access: String,
                    files: [file.fileSchema],
                    folders:[{
                        name: String,
                        access: String,
                        files: [file.fileSchema],
                        folders:[{
                            name: String,
                            access: String,
                            files: [file.fileSchema],
                            folders:[{
                                name: String,
                                access: String,
                                files: [file.fileSchema],
                                folders:[{
                                    name: String,
                                    access: String,
                                    files: [file.fileSchema],
                                    folders:[{
                                        
                                    }]
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }],
    //     folders:[Folders1.folderschema],
     }],
    files: [file.fileSchema],
});
const Folders = mongoose.model('Folders', folderSchema);
module.exports = Folders;