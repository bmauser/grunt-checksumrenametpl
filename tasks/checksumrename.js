module.exports = function (grunt) {

    'use strict';

    grunt.registerMultiTask('checksumrenametpl', 'Rename file', function () {

        // grunt.log.writeln(JSON.stringify(this.data, null, 2));

        var checksumAlg     = 'md5'; // for crypto.createHash
        var checksumPattern = '[a-f0-9]{32}'; // for md5
        var placeholder     = '[CHECKSUM]';

        var fs = require('fs');

        // function that deleteInvalidChecksumFile files with invalid checksum in the name
        var deleteInvalidChecksumFiles = function (destFileTpl, checksumPattern, checksum, placeholder) {

            var destDirName = destFileTpl.match(/(.*)[\/\\]/)[1]||'';
            var destFileName = destFileTpl.replace(/^.*[\\\/]/, '');
            var filesInDestDir = fs.readdirSync(destDirName);

            for (var i = 0; i < filesInDestDir.length; i++){
                var destNameParts = destFileName.split(placeholder); // 'js-[CHECKSUM].min.js' => ['js-', '.min.js']
                var fileName = filesInDestDir[i];
                var filePath = destDirName + '/' + fileName;

                // try to delete all but checksum from the file name
                destNameParts.forEach(function(part) {
                    fileName = fileName.replace(part, '');
                });

                // if only checksum left from replace
                if (new RegExp(checksumPattern).test(fileName) && fileName.length == checksum.length && fileName != checksum){
                    // delete file
                    fs.unlinkSync(filePath);
                    console.log('Deleted: ' + filePath);
                }
            }
        };

        // updates replaceFile content
        var updateReplaceFile = function (replaceFile, replaceTpl, checksum, placeholder) {

            var replaceFiles = grunt.file.expand(replaceFile);

            replaceFiles.forEach (function (replaceFile) {

                // read replaceFile
                var replaceFileContent = fs.readFileSync(replaceFile).toString();
                var updateFileContent;

                var regexp = new RegExp(checksumPattern, 'g');
                var checksumPos = [];
                var res;

                // try to find all checksums inside the replaceFile
                while ((res = regexp.exec(replaceFileContent)) !== null) {
                    checksumPos.push(res.index);
                }

                if (checksumPos.length){

                    // make replacement from replaceTpl
                    var replaceStr = replaceTpl.replace(placeholder, checksum);

                    for (var i = 0; i < checksumPos.length; i++) {
                        var oldChecksum = replaceFileContent.substring(checksumPos[i], checksumPos[i] + checksum.length)
                        var oldStr = replaceTpl.replace(placeholder, oldChecksum);

                        if (replaceFileContent.indexOf(oldStr) >= 0){
                            replaceFileContent = replaceFileContent.replace(oldStr, replaceStr);
                            updateFileContent = 1;
                        }
                    }

                    // write new replaceFile content
                    if (updateFileContent){
                        fs.writeFileSync(replaceFile, replaceFileContent);
                        console.log('Updated: ' + replaceFile);
                    }
                }
            })
        };

        // custom placeholder for checksum
        if (this.data.placeholder)
            placeholder = this.data.placeholder;

        // calculate srcFile checksum
        var checksum = require('crypto')
            .createHash(checksumAlg)
            .update(fs.readFileSync(this.data.srcFile).toString(), 'utf8')
            .digest('hex');

        // get destFile name
        var destFile = this.data.destFileTpl.replace(placeholder, checksum);

        if (grunt.file.exists(destFile)){
            console.log('Done nothing. File with current checksum already exists: ' + destFile);
            return; // exit
        }

        // rename srcFile->destFile
        fs.renameSync(this.data.srcFile, destFile);
        console.log('Created: ' + destFile);

        if (this.data.replaceFile){
            // update replaceFile content
            updateReplaceFile(this.data.replaceFile, this.data.replaceTpl, checksum, placeholder);
        }

        // deletes files with invalid checksum
        deleteInvalidChecksumFiles(this.data.destFileTpl, checksumPattern, checksum, placeholder);

    });
};
