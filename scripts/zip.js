// scripts/zip.js
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip();

const include = [
    { disk: 'manifest.json', zip: 'manifest.json' },
    { disk: 'dist',                     zip: 'dist' },
    { disk: 'src/content_scripts',      zip: 'src/content_scripts' },
    { disk: 'src/util',                 zip: 'src/util' },
    { disk: 'src/css',                  zip: 'src/css' },
    { disk: 'src/icon.png',             zip: 'src/icon.png' },
    { disk: 'src/icon-16.png',          zip: 'src/icon-16.png' },
    { disk: 'src/icon-48.png',          zip: 'src/icon-48.png' },
    { disk: 'src/icon-128.png',         zip: 'src/icon-128.png' },
];

for (const { disk, zip: zipPath } of include) {
    if (fs.statSync(disk).isDirectory()) {
        zip.addLocalFolder(disk, zipPath);
    } else {
        zip.addLocalFile(disk, path.dirname(zipPath));
    }
}

zip.writeZip('extension.zip');
console.log('✅ extension.zip created');