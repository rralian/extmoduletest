#!/usr/bin/env node

/**
 * Module dependencies/
 */
var fs = require( 'fs' ),
	targetFile = process.argv[2],
	resultFile = process.argv[3],
	Xgettext = require( 'xgettext-js' ),
	parser,
	buildStringFromProperties,
	getWordPressFunction,
	buildWordPressString;

getWordPressFunction = function( properties ) {
	var wpFunc = [ '_' ];

	if ( properties.plural ) {
		wpFunc.push( 'n' );
	}
	if ( properties.context ) {
		wpFunc.push( 'x' );
	}

	wpFunc = wpFunc.join( '' );

	if ( 1 === wpFunc.length ) {
		return '__';
	}

	return wpFunc;
};

buildWordPressString = function( properties ) {
	var wpFunc = getWordPressFunction( properties ),
	stringFromFunc = {
		'__': '\n__( ' + properties.original + ' );',
		'_x': '\n_x( ' + [ properties.original, properties.context ].join( ', ' ) + ' );',
		'_nx': '\n_nx( ' + [ properties.single, properties.plural, properties.count, properties.context ].join( ', ' ) + ' );',
		'_n': '\n_n( ' + [ properties.single, properties.plural, properties.count ].join( ', ' ) + ' );'
	};
	return stringFromFunc[ wpFunc ];
};

buildStringFromProperties = function( properties ) {
	var response = [];
	if ( properties.comment ) {
		response.push( '\n/* translators: ' + properties.comment.replace( /\*\//g, '\\\*\/' ) + ' */');
	}
	response.push( buildWordPressString( properties ) );
	return response.join( '' );
};

parser = new Xgettext( {
	keywords: {
		'translate': function( match ) {

			var finalProps = {};

			if ( ! match[ 'arguments' ].length ) {
				return;
			}

			var options = match[ 'arguments' ][0];

			if ( 'Literal' === options.type ) {

				// simple string argument
				finalProps.original = options.raw;

			} else if ( 'ObjectExpression' === options.type ) {

				// object with options
				options.properties.forEach( function( property ) {

					if ( 'Literal' === property.value.type ) {
						finalProps[ property.key.name ] = ( 'comment' === property.key.name ) ? property.value.value : property.value.raw;
					} else if ( 'ObjectExpression' === property.value.type && 'original' === property.key.name ) {
						// get pluralization strings
						property.value.properties.forEach( function( innerProp ) {
							// just use a placeholder of 1 for count, as this is just to insert the record into glotpress
							finalProps[ innerProp.key.name ] = ( 'count' === innerProp.key.name ) ? 1 : innerProp.value.raw;
						} );
					}

				} );
			}

			return buildStringFromProperties( finalProps );


		}
	}
} );

module.exports = function( inputFile, outputFile ) {

	console.log( 'Reading inputFile: ' + inputFile );
	fs.readFile( inputFile, 'utf8', function ( err, data ) {
		if ( err ) {
			return console.log( err );
		}
		var matches = parser.getMatches( data ),
		fileContents;

		matches = matches.map( function( match ) {
			return match.string;
		} );

		matches.unshift( '<?php' );

		fileContents = matches.join( '' );

		console.log( 'Writing outputFile: ' + outputFile );
		fs.writeFile( outputFile, fileContents, 'utf8', function( error ) {
			if ( error ) {
				console.log( error );
			} else {
				console.log( 'get-i18n completed' );
			}
		} );
	});
};
