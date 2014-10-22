/** @module recordmic */

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var AudioContext = window.AudioContext || window.webkitAudioContext;

/** 
 * recordmic can be used to record from the mic in browser via 
 * getUserMedia. You can pass in some settings when instantiating the recordmic.
 *
 * The settings object can contain the following properties:
 * ```javascript
 * {
 * 	volume: 1, // this is the volume at which the mic will record by default 
 * 			   // this value is 1
 * 	bufferSize: 2048, // this is the size of the buffer as its recording. 
 * 					  // Default is 2048
 * 	mono: false // whether the mic will record in mono by default this value 
 * 				// is false (it will record in stereo) mono can also be 'left' 
 * 				// or 'right' to define which channel is being used.
 * 	onSampleData: null // this is a callback if you want to access sampledata 
 * 					   // as it's being recorded. You can for instance modify 
 * 					   // data as it's being recorded.
 * }
 * ```
 * 
 * @class
 * @param  {Object} settings this is is the settings object. See above for possible values which can be passed in.
 * @param  {Function} callBack this callback will be called once the mic has "initialized" itself and is ready to record
 * @return {recordmic} You can call this as a function or instantiate via new keyword. It will return an instance of recordmic
 */
var recordmic = function( settings, callBack ) {

	// handle instancing
	if( !( this instanceof recordmic ) )
		return new recordmic( settings, callBack );

	// setup settings
	var s = settings || {};
	s.volume = s.volume || 1;
	s.bufferSize = s.bufferSize || 2048;
	s.mono = s.mono || false;

	this.s = s;

	// do get usermedia
	if( !recordmic.isAvailable ) {

		callBack( new Error( 'getUserMedia or audioContext is not available' ) );
	} else {

		//prompt the user to allow mic
		navigator.getUserMedia( { audio: true }, this.onGetUserMedia.bind( this, callBack ), function( e ) {

			callBack( e );
		});
	}
};

/**
 * recordmic.isAvailable will be true when recordmic is able to record. In order for recordmic to be able
 * to record the browser must have getUserMedia and AudioContext.
 *
 * @var {Boolean} isAvailable
 */
recordmic.isAvailable = Boolean( navigator.getUserMedia ) && Boolean( AudioContext );

recordmic.prototype = {

	/*****************************************/
	/*********** GET SET FUNCTIONS ***********/
	/*****************************************/

	/**
	 * Call this function to set the volume at which the microphoe will record. Usually this value will be
	 * between 0 and 1.
	 * 
	 * @param {Number} volume A value between 0 and 1
	 */
	setRecordVolume: function( volume ) {

		this.s.volume = volume;

		this.gain.gain.value = volume;

		return this;
	},

	/**
	 * Volume at which we're recording between 0 and 1
	 * 
	 * @return {Number} A volume value between 0 and 1
	 */
	getRecordVolume: function() {

		return this.s.volume;
	},

	/**
	 * Will set wether recordmic is recording in mono or not. If you pass in false we'll be recording in
	 * stereo. If you pass pass in true then the right channel will be used. You can also pass in the strings
	 * 'left' and 'right' to define which channel is used to record when recording in mono.
	 * 
	 * @param {String|Boolean} mono false will mean it's recording in stereo. true means that the right channel's data
	 *                              will be used. 'left' means the left channel will be used and 'right'
	 *                              will mean that the right channel is used.
	 */
	setMono: function( mono ) {

		this.s.mono = mono;

		if( mono == 'left' ) {

			this.rightData = null;
			this.leftData = [];
		} else if( mono ) {

			this.rightData = [];
			this.leftData = null;
		} else {

			this.leftData = [];
			this.rightData = [];
		}

		return this;
	},

	/**
	 * This will return wether we're recording in mono. This value can be either a boolean
	 * or a string. If true is returned it means we're recording in mono and the right channel
	 * is used. If false is returned then we're recording in stereo. If a string is returned and it's
	 * value is 'left' then we're recording in mono using the left channel and 'right' for the 
	 * right channel.
	 * 
	 * @return {String|Boolean} value for mono either: true, false, 'right', 'left'
	 */
	getMono: function() {

		return this.s.mono;
	},

	/**
	 * getChannelData will return return both left and right channel data from our recording.
	 * If we're recording in mono one of the channels will be null.
	 *
	 * The data returned for each channel are Float32Array arrays.
	 * 
	 * @return {Object} This object will have two variables 'left' and 'right' which 
	 *                  contain the data for each channel.
	 */
	getChannelData: function() {

		var lCombined, rCombined;

		if( this.leftData ) {

			lCombined = this.getData( 'left' );
		} else {

			lCombined = null;
		}

		if( this.rightData ) {

			rCombined = this.getData( 'right' );
		}
		else {

			rCombined = null;
		}

		return {

			left: lCombined,
			right: rCombined
		};
	},

	/**
	 * This will return mono data for our recording. What is returned is a Float32Array.
	 * The mono setting will determine which array will be returned. If mono is set to true
	 * then the left channel will be returned over the right.
	 * 
	 * @param  {String} [mono] This is optional. either 'left' or 'right' to determine which channel will be returned.
	 * @return {Float32Array} The sound data for our recording as mono
	 */
	getMonoData: function( mono ) {

		var combined = null, writePos = 0, data;

		combined = new Float32Array( this.recordingLength );

		if( mono == 'left' ) {

			if( this.leftData ) {

				data = this.leftData;
			} else {

				throw new Error( 'There is nothing recorded for the left channel' );
			}
		} else if( mono == 'right' ) {

			if( this.rightData ) {

				data = this.rightData;	
			} else {

				throw new Error( 'There is nothing recorded for the right channel' );
			}
		} else {

			data = this.leftData || this.rightData;

			if( !data ) {

				throw new Error( 'There is nothing recorded' );
			}
		}

		for( var i = 0, len = data.length; i < len; i++ ) {

			for( var j = 0, lenJ = this.s.bufferSize; j < lenJ; j++ ) {

				combined[ writePos++ ] = data[ i ][ j ];
			}
		}

		return combined;
	},

	/**
	 * getStereoData will return both the left and right channel interleaved as a Float32Array.
	 *
	 * You can also pass in a value for mono. If you do then one of the channells will be interleaved as
	 * stereo data.
	 *
	 * So for instance in stereo:
	 * ```[ left_data1, right_data1, left_data2, right_data2, left_data3, right_data3 ]```
	 *
	 * And if mono is set to 'left':
	 * ```[ left_data1, left_data1, left_data2, left_data2, left_data3, left_data3 ]```
	 * 
	 * @param  {String} mono If you'd like to get mono data interleaved as stereo data either pass 'left' or 'right'
	 * @return {Float32Array} Sound data interleaved as a Float32Array.
	 */
	getStereoData: function( mono ) {

		var combined = null, writePos = 0, data;

		if( !mono && this.leftData && this.rightData ) {

			combined = new Float32Array( this.recordingLength * 2 );

			for( var i = 0, len = this.leftData.length; i < len; i++ ) {

				for( var j = 0, lenJ = this.s.bufferSize; j < lenJ; j++ ) {

					combined[ writePos++ ] = this.leftData[ i ][ j ];
					combined[ writePos++ ] = this.rightData[ i ][ j ];
				}
			}
		} else {

			combined = new Float32Array( this.recordingLength );

			if( mono == 'left' ) {

				if( this.leftData ) {

					data = this.leftData;
				} else {

					throw new Error( 'There is nothing recorded for the left channel' );
				}
			} else if( mono == 'right' ) {

				if( this.rightData ) {

					data = this.rightData;	
				} else {

					throw new Error( 'There is nothing recorded for the right channel' );
				}
			} else {

				data = this.leftData || this.rightData;

				if( !data ) {

					throw new Error( 'There is nothing recorded' );
				}
			}

			for( var i = 0, len = data.length; i < len; i++ ) {

				for( var j = 0, lenJ = this.s.bufferSize; j < lenJ; j++ ) {

					combined[ writePos++ ] = data[ i ][ j ];
					combined[ writePos++ ] = data[ i ][ j ];
				}
			}
		}

		return combined;
	},

	/*****************************************/
	/**************** METHODS ****************/
	/*****************************************/

	/**
	 * When you call start you begin recording.
	 *
	 * @chainable
	 */
	start: function() {

		this.clear();
		window.recordmic_onaudioprocess = this.recorder.onaudioprocess = this.onAudioData.bind( this );

		return this;
	},

	/**
	 * Call stop to stop recording.
	 *
	 * @chainable
	 */
	stop: function() {

		this.recorder.onaudioprocess = undefined;

		return this;
	},

	/**
	 * This will clear any recorded data. This should be called if you're wanting to record multiple clips.
	 *
	 * @chainable
	 */
	clear: function() {

		this.recordingLength = 0;
		this.setMono( this.s.mono );

		return this;
	},

	/**
	 * 
	 * Calling destroy will stop recording and clear all recorded data.
	 */
	destroy: function() {

		this.stop();

		this.recordingLength = 0;
		this.leftData = null;
		this.rightData = null;
	},

	/*****************************************/
	/*************** EVENTS ******************/
	/*****************************************/
	onGetUserMedia: function( callBack, ev ) {
		this.stream = ev;
		// initialize everything
		this.context =  new AudioContext();
		this.audioInput = this.context.createMediaStreamSource( ev );
		
		this.gain = this.context.createGain();
		this.recorder = this.context.createScriptProcessor( this.s.bufferSize, 2, 2);

		// now do everything outside of init
		this.setRecordVolume( this.s.volume );

		this.audioInput.connect( this.gain );
		this.gain.connect( this.recorder );
		this.recorder.connect( this.context.destination );

		this.setMono( this.s.mono );

		callBack( undefined, this );
	},

	onAudioData: function( ev ) {

		var left, right, leftData, rightData;

		left = ev.inputBuffer.getChannelData( 0 );
		right = ev.inputBuffer.getChannelData( 1 );


		// do the call back and send the current data
		// this allows users for instance to modify data
		// on the fly also
		if( this.s.onSampleData ) {

			this.s.onSampleData( left, right );
		}

		// now do recording
		if( this.leftData ) {

			leftData = new Float32Array( left );	

			this.leftData.push( leftData );
		}

		if( this.rightData ) {

			rightData = new Float32Array( right );
			
			this.rightData.push( rightData );	
		}
		
		this.recordingLength += this.s.bufferSize;
	}
};

module.exports = recordmic;
