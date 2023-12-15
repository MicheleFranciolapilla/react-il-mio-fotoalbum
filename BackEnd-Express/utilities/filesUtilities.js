const   fileSystem = require("fs");
const   pathLibrary = require("path");

function splitMime(fileMime)
{  
    const result = fileMime.split("/");
    return result; 
}

function fileWithExt(fileObj)
{
    const extension = splitMime(fileObj.mimetype)[1];
    fileSystem.renameSync(fileObj.path, fileObj.path.concat(".", extension));
}

function deleteFile(fileName, folderName, fileExtension)
{
    const fileToDelete = pathLibrary.resolve(__dirname, "../public/", folderName, fileName.concat(".", fileExtension));
    fileSystem.unlinkSync(fileToDelete);
}

module.exports = { splitMime, fileWithExt, deleteFile };