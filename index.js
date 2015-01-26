navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var AudioContext = window.AudioContext || window.webkitAudioContext;


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

//this can be used to simply check if you can record audio
recordmic.isAvailable = Boolean( navigator.getUserMedia ) && Boolean( AudioContext );

recordmic.prototype = {

	/*****************************************/
	/*********** GET SET FUNCTIONS ***********/
	/*****************************************/
	setRecordVolume: function( volume ) {

		this.s.volume = volume;

		this.gain.gain.value = volume;

		return this;
	},

	getRecordVolume: function() {

		return this.s.volume;
	},

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

	getMono: function() {

		return this.s.mono;
	},

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
	start: function() {

		this.clear();
		window.recordmic_onaudioprocess = this.recorder.onaudioprocess = this.onAudioData.bind( this );

		return this;
	},

	stop: function() {

		this.recorder.onaudioprocess = undefined;

		return this;
	},

	clear: function() {

		this.recordingLength = 0;
		this.setMono( this.s.mono );

		return this;
	},

	destroy: function() {

		this.stop();
		this.stream.stop();
		this.stream = null; 

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
