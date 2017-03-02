var objdumpParser = require('../objdump-parser');
var fs = require('fs');

var dump = objdumpParser(fs.readFileSync('./symbols.txt', 'utf-8'));
var digitalOut = dump.nodes.filter(f => f.name === 'DigitalOut' && f.tag === 'subprogram' && f.children.length === 3)[0];

console.log(digitalOut);
