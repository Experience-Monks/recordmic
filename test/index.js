var recordmic = require( '../index' );

if( recordmic.isAvailable ) {

	var recorder = recordmic( { onSampleData: function( left, right ) {

		// console.log( left );
	}}, function( error ) {

		console.log( 'we\'re good', error );

		if( !error ) {
			recorder.start();

			setTimeout( function() {

				recorder.stop();

				console.log( recorder.getStereoData( 'left' ) );

			}, 3000 );
		}
	});
} else {

	throw new Error( 'not avaiable' );
}