/* Example of how to use the Parser class */

const Parser = require('./parser.js');
const fs = require('fs');

const file = './sample/edt.cru';

fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;

    // Create new Parser
    const parser = new Parser();
    // Parse the file
    parser.parse(data).then((isCru) => {
        // Display the result
        isCru ? console.log(`Le fichier ${file} est conforme au format CRU.`)
            : console.log(`Le fichier ${file} n\'est pas conforme au format CRU.`);
    });
});
