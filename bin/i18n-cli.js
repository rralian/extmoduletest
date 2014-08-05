#!/usr/bin/env node

/**
 * External dependencies/
 */
var fs = require( 'fs' ),
	path = require( 'path' ),
	program = require( 'commander' );
/**
 * Internal dependencies/
 */
var i18n = require( '../index' );

program
	.version('0.0.1')
	.option( '-i, --input-file', 'file in which to search for translation methods' )
	.option( '-o, --output-file', 'output file for WP-style translation functions' )
	.usage( '[inputFile outputFile]' )
	.on( '--help', function() {
		console.log('  Examples');
		console.log('\n    $ get-i18n ./inputFile.js ./outputFile.txt' );
		console.log('    $ get-i18n -i ./inputFile.js -o ./outputFile.txt' );
	})
	.parse(process.argv);

var inputFile = program.args[0] || program.i || program.inputFile,
	outputFile = program.args[1] || program.o || program.outputFile;

if ( ! inputFile ) {
	return console.log( 'Error: You must enter the input file. Run `get-i18n -h` for examples.' );
}
if ( ! outputFile ) {
	return console.log( 'Error: You must enter the output file. Run `get-i18n -h` for examples.' );
}

// files relative to terminal location
inputFile = path.join( process.env.PWD, inputFile );
outputFile = path.join( process.env.PWD, outputFile );

if ( ! fs.existsSync( inputFile ) ) {
	return console.log( 'Error: inputFile, `' + inputFile + '`, does not exist' );
}

i18n( inputFile, outputFile );
