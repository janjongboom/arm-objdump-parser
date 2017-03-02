# ARM Objdump Parser

Parsing C++ code is a very hard problem because C++ has an [undecidable grammar](http://www.yosefk.com/c++fqa/defective.html#defect-2). This is a pain when you want to generate wrappers based on C++ classes, like we do for the [JerryScript](http://jerryscript.net) project. Instead of parsing the code we opted for a different approach: parsing the debug information the compiler generates. This guarantees that we have a 100% accurate understanding of the application and its functions.

[**Live demo**](http://janjongboom.com/arm-objdump-parser/demo/web/objdump.html)

The ARM Objdump Parser (AOP) is a JavaScript module (for node.js and web) which takes the output of `arm-none-eabi-objdump` and creates a searchable tree. For example, here is the query and the output for the [DigitalOut](https://github.com/ARMmbed/mbed-os/blob/aff49d8/drivers/DigitalOut.h#L63) constructor in mbed OS 5:

**Query:**

```js
// children length of 3 = this (because member function) + 2 arguments
dump.nodes.filter(f => f.name === 'DigitalOut' && f.tag === 'subprogram' && f.children.length === 3)
```

**Output (filtered):**

```js
{
  name: 'DigitalOut',
  accessibility: '1\t(public)',
  type:
   { tag: 'pointer_type',
     type:
      { tag: 'class_type',
        name: 'DigitalOut' } },
  children:
   [ { tag: 'formal_parameter',
       type:
        { tag: 'typedef',
          name: 'PinName',
          type:
           { tag: 'enumeration_type',
             // drilling down this list will give you all the possible enumeration values
             children: [Object] } } },
     { tag: 'formal_parameter',
       type:
        { tag: 'base_type',
          byte_size: '4',
          name: 'int' } }
   ]
}
```

## Creating an objdump

To create an objdump that can be read out by the parser, first create a **debug** build of your application. On mbed OS 5 you can do this via:

```
$ mbed compile --profile ./mbed-os/tools/profiles/debug.json
```

This gives you an `.elf` file with the debug symbols. You can extract the symbols from the elf file via:

```
$ arm-none-eabi-objdump -Wi -g *.elf > symbols.txt
```

The symbols file can be read by AOP.

## Usage (node.js)

Add the module to your project, via:

```
$ npm install arm-objdump-parser --save
```

Then use it via:

```js
const objdumpParser = require('./arm-objdump-parser');
const fs = require('fs');

var dump = objdumpParser(fs.readFileSync('./symbols.txt', 'utf-8'));
var digitalOut = dump.nodes.filter(f => f.name === 'DigitalOut' && f.tag === 'class_type')[0];

console.log(digitalOut);
```

## Usage (web)

Download [objdump-parser.js](objdump-parser.js), and add it to your web page via:

```html
<script src="objdump-parser.js"></script>
```

Then use it via:

```js
var dump = window.objdumpParser(/* get the symbols file from somewhere */);
var digitalOut = dump.nodes.filter(f => f.name === 'DigitalOut' && f.tag === 'class_type')[0];

console.log(digitalOut);
```

## Tips

* Only functions that are *linked* into the application are available.
* Templated functions are accessible by a name which includes their template types, e.g. `Client<MQTTNetwork, Countdown, 100, 5>`.
* Enum values are accessible under the `children` property of their type.
