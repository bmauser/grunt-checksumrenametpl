# grunt-checksumrenametpl
Renames a file with its checksum and can update template file content with the new name.
Useful for for preventing browser to cache old .js or .css files.


## Getting Started
```shell
npm install grunt-checksumrenametpl
```
Once the plugin has been installed, it may be enabled inside your `.Gruntfile` with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-checksumrenametpl');
```


## Usage example
```js
checksumrenametpl: {
  js: {
      srcFile:     'build/js/js.min.js',
      destFileTpl: 'www/scripts/js-[CHECKSUM].min.js',
      replaceFile: 'php/templates/main.tpl',
      replaceTpl:  'src="/scripts/js-[CHECKSUM].min.js"></script>',
  }
```


#### This task will:
1. Calculate md5 checksum of `build/js/js.min.js` (let's say that checksum is `ad6466b2aaf7e9c9ba0494df9c813c13`).
2. Move `build/js/js.min.js` to `www/scripts/js-ad6466b2aaf7e9c9ba0494df9c813c13.min.js`  
3. In `php/templates/main.tpl` file, replace all occurrences of  
   `<script type="text/javascript" src="/scripts/js-OLDCHECKSUM.min.js"></script>`  
   with  
   `<script type="text/javascript" src="/scripts/js-ad6466b2aaf7e9c9ba0494df9c813c13.min.js"></script>`
   OLDCHECKSUM here can be any md5 checksum which will be replaced with the new one.  
   **Note** that the file name in the HTML page must contain some checksum that will be updated. For the first time you run this task you can put any md5 checksum into the HTML.
4. Delete all files with an invalid checksum from `www/scripts/` directory.


#### Params description
* **`srcFile`** - File to be renamed.
* **`destFileTpl`** - Template string which define a new name for the `srcFile`. `[CHECKSUM]` will be replaced with md5 hash of the file.
* **`replaceFile`** - File which content needs to be updated with the new file name.
* **`replaceTpl`** - Template string which define a partition of `replaceFile` content in which `[CHECKSUM]` will be replaced with md5 hash of the file. This can be any string which contains `[CHECKSUM]`.  
This value must not start or end with `[CHECKSUM]`. This is invalid: `'[CHECKSUM].min.js'`.
