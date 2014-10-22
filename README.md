<a name="module_recordmic"></a>
#recordmic
**Members**

* [recordmic](#module_recordmic)
  * [recordmic~isAvailable](#module_recordmic..isAvailable)
  * [class: recordmic~recordmic](#module_recordmic..recordmic)
    * [new recordmic~recordmic(settings, callBack)](#new_module_recordmic..recordmic)
    * [recordmic.setRecordVolume(volume)](#module_recordmic..recordmic#setRecordVolume)
    * [recordmic.getRecordVolume()](#module_recordmic..recordmic#getRecordVolume)
    * [recordmic.setMono(mono)](#module_recordmic..recordmic#setMono)
    * [recordmic.getMono()](#module_recordmic..recordmic#getMono)
    * [recordmic.getChannelData()](#module_recordmic..recordmic#getChannelData)
    * [recordmic.getMonoData([mono])](#module_recordmic..recordmic#getMonoData)
    * [recordmic.getStereoData(mono)](#module_recordmic..recordmic#getStereoData)
    * [recordmic.start()](#module_recordmic..recordmic#start)
    * [recordmic.stop()](#module_recordmic..recordmic#stop)
    * [recordmic.clear()](#module_recordmic..recordmic#clear)
    * [recordmic.destroy()](#module_recordmic..recordmic#destroy)

<a name="module_recordmic..isAvailable"></a>
##recordmic~isAvailable
recordmic.isAvailable will be true when recordmic is able to record. In order for recordmic to be able
to record the browser must have getUserMedia and AudioContext.

**Scope**: inner member of [recordmic](#module_recordmic)  
**Type**: `Boolean`  
<a name="module_recordmic..recordmic"></a>
##class: recordmic~recordmic
**Members**

* [class: recordmic~recordmic](#module_recordmic..recordmic)
  * [new recordmic~recordmic(settings, callBack)](#new_module_recordmic..recordmic)
  * [recordmic.setRecordVolume(volume)](#module_recordmic..recordmic#setRecordVolume)
  * [recordmic.getRecordVolume()](#module_recordmic..recordmic#getRecordVolume)
  * [recordmic.setMono(mono)](#module_recordmic..recordmic#setMono)
  * [recordmic.getMono()](#module_recordmic..recordmic#getMono)
  * [recordmic.getChannelData()](#module_recordmic..recordmic#getChannelData)
  * [recordmic.getMonoData([mono])](#module_recordmic..recordmic#getMonoData)
  * [recordmic.getStereoData(mono)](#module_recordmic..recordmic#getStereoData)
  * [recordmic.start()](#module_recordmic..recordmic#start)
  * [recordmic.stop()](#module_recordmic..recordmic#stop)
  * [recordmic.clear()](#module_recordmic..recordmic#clear)
  * [recordmic.destroy()](#module_recordmic..recordmic#destroy)

<a name="new_module_recordmic..recordmic"></a>
###new recordmic~recordmic(settings, callBack)
recordmic can be used to record from the mic in browser via 
getUserMedia. You can pass in some settings when instantiating the recordmic.

The settings object can contain the following properties:
```javascript
{
	volume: 1, // this is the volume at which the mic will record by default this value is 1
	bufferSize: 2048, // this is the size of the buffer as its recording. Default is 2048
	mono: false // whether the mic will record in mono by default this value is false (it will record in stereo) 
				// mono can also be 'left' or 'right' to define which channel is being used.
	onSampleData: null // this is a callback if you want to access sampledata as it's being recorded. You can for instance
					   // modify data as it's being recorded.
}
```

**Params**

- settings `Object` - this is is the settings object. See above for possible values which can be passed in.  
- callBack `function` - this callback will be called once the mic has "initialized" itself and is ready to record  

**Scope**: inner class of [recordmic](#module_recordmic)  
**Returns**: `recordmic` - You can call this as a function or instantiate via new keyword. It will return an instance of recordmic  
<a name="module_recordmic..recordmic#setRecordVolume"></a>
###recordmic.setRecordVolume(volume)
Call this function to set the volume at which the microphoe will record. Usually this value will be
between 0 and 1.

**Params**

- volume `Number` - A value between 0 and 1  

<a name="module_recordmic..recordmic#getRecordVolume"></a>
###recordmic.getRecordVolume()
Volume at which we're recording between 0 and 1

**Returns**: `Number` - A volume value between 0 and 1  
<a name="module_recordmic..recordmic#setMono"></a>
###recordmic.setMono(mono)
Will set wether recordmic is recording in mono or not. If you pass in false we'll be recording in
stereo. If you pass pass in true then the right channel will be used. You can also pass in the strings
```'left'``` and ```'right'``` to define which channel is used to record when recording in mono.

**Params**

- mono `String` | `Boolean` - false will mean it's recording in stereo. true means that the right channel's data
                             will be used. ```'left'``` means the left channel will be used and ```'right'```
                             will mean that the right channel is used.  

<a name="module_recordmic..recordmic#getMono"></a>
###recordmic.getMono()
This will return wether we're recording in mono. This value can be either a boolean
or a string. If ```true``` is returned it means we're recording in mono and the right channel
is used. If ```false``` is returned then we're recording in stereo. If a string is returned and it's
value is ```'left'``` then we're recording in mono using the left channel and ```'right'`` for the 
right channel.

**Returns**: `String` | `Boolean` - value for mono either: ```true```, ```false```, ```'right'```, ```'left'```  
<a name="module_recordmic..recordmic#getChannelData"></a>
###recordmic.getChannelData()
getChannelData will return return both left and right channel data from our recording.
If we're recording in mono one of the channels will be null.

The data returned for each channel are ```Float32Array``` arrays.

**Returns**: `Object` - This object will have two variables ```left``` and ```right``` which 
                 contain the data for each channel.  
<a name="module_recordmic..recordmic#getMonoData"></a>
###recordmic.getMonoData([mono])
This will return mono data for our recording. What is returned is a ```Float32Array```.
The mono setting will determine which array will be returned. If mono is set to true
then the left channel will be returned over the right.

**Params**

- \[mono\] `String` - This is optional. either 'left' or 'right' to determine which channel will be returned.  

**Returns**: `Float32Array` - The sound data for our recording as mono  
<a name="module_recordmic..recordmic#getStereoData"></a>
###recordmic.getStereoData(mono)
getStereoData will return both the left and right channel interleaved as a ```Float32Array```.

You can also pass in a value for mono. If you do then one of the channells will be interleaved as
stereo data.

So for instance in stereo:
```[ left_data1, right_data1, left_data2, right_data2, left_data3, right_data3 ]```

And if mono is set to ```'left'```:
```[ left_data1, left_data1, left_data2, left_data2, left_data3, left_data3 ]```

**Params**

- mono `String` - If you'd like to get mono data interleaved as stereo data either pass 'left' or 'right'  

**Returns**: `Float32Array` - Sound data interleaved as a Float32Array.  
<a name="module_recordmic..recordmic#start"></a>
###recordmic.start()
When you call start you begin recording.

<a name="module_recordmic..recordmic#stop"></a>
###recordmic.stop()
Call stop to stop recording.

<a name="module_recordmic..recordmic#clear"></a>
###recordmic.clear()
This will clear any recorded data. This should be called if you're wanting to record multiple clips.

<a name="module_recordmic..recordmic#destroy"></a>
###recordmic.destroy()
Calling destroy will stop recording and clear all recorded data.

