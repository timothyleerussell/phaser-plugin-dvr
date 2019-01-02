/**
*
* DVR plugin idea and rough initial prototype by Timothy Lee Russell
* {@link https://snoffleware.com|Snoffleware Studios LLC}
*
* This is just an example of what we could do the MediaStreamRecorder...
* Would be cool to have a HUD with transport controls and recording management
* 
* Also, this probably makes more sense as a game plugin instead of a scene plugin
* so that we can capture scene transitions, etc...
*/

/**
* Phaser 3
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2018 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser3-plugin-template/blob/master/LICENSE|MIT License}
*/

/**
* MediaStreamRecorder
* Open-Sourced: https://github.com/streamproc/MediaStreamRecorder
*
* --------------------------------------------------
* Muaz Khan     - www.MuazKhan.com
* MIT License   - www.WebRTC-Experiment.com/licence
* --------------------------------------------------
*/


/*
//Potential Phaser events for PhaserPluginDVR to handle...just prototyping for now.
//
//The recordTestClip function records X seconds of video from the 
//scene's canvas and inserts it into the DOM to play it back after it is finished.
//
//Basically a proof of concept, currently these are fake events except for some status to the console
this.dvr.start();
this.dvr.pause();
this.dvr.resume();
this.dvr.sleep();
this.dvr.wake();
this.dvr.shutdown();
this.dvr.startRecording();
this.dvr.pauseRecording();
this.dvr.stopRecording();    		

//This does something something real.
//It starts recording a clip and when it is ready, plays it back
this.dvr.recordTestClip(sec);

//now we setup the animation and let it play for X seconds, manipulating it by tapping
//the screen, then the callback will fire. Again, just prototyping.
//
//We could build a console for it in the DOM with transport controls and a place
//to see the videos that had been captured. Since it captures the stream of the canvas,
//the transport controls probably have to be external or maybe key combos.

//Also, maybe this should be tied to another game object instead of the scene?
//It had access to the canvas which I needed to pipe into the MediaStreamRecorder
*/

//TLR: can't get "screenshot.js" to bundle. Not found error when trying to require it
//If you can figure it out, that would be cool. I'm guessing it's just a matter of wrapping
//it correctly for inclusion. Didn't have time to figure it out.
//Linking to it in the index file for now because it works -- but it should be bundled.

//var screenshot = require('./Screenshot');
var msr = require('./MediaStreamRecorder');
var recordRtc = require('./RecordRTC');

var PhaserPluginDVR = function (scene)
{
	// The Scene that owns this plugin
    this.scene = scene;

    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted)
    {
        scene.sys.events.once('boot', this.boot, this);
    }
};

//  Static function called by the PluginFile Loader.
PhaserPluginDVR.register = function (PluginManager)
{
    //  Register this plugin with the PluginManager, so it can be added to Scenes.

    //  The first argument is the name this plugin will be known as in the PluginManager. It should not conflict with already registered plugins.
    //  The second argument is a reference to the plugin object, which will be instantiated by the PluginManager when the Scene boots.
    //  The third argument is the local mapping. This will make the plugin available under `this.sys.dvr` and also `this.dvr` from a Scene if
    //  it has an entry in the InjectionMap.
    PluginManager.register('PhaserPluginDVR', PhaserPluginDVR, 'dvr');
};

PhaserPluginDVR.prototype = {
	
    //  Called when the Plugin is booted by the PluginManager.
    //  If you need to reference other systems in the Scene (like the Loader or DisplayList) then set-up those references now, not in the constructor.
    boot: function ()
    {
		var eventEmitter = this.systems.events;

		//  Listening to the following events is entirely optional, although we would recommend cleanly shutting down and destroying at least.
		//  If you don't need any of these events then remove the listeners and the relevant methods too.

		eventEmitter.on('start', this.start, this);

		eventEmitter.on('preupdate', this.preUpdate, this);
		eventEmitter.on('update', this.update, this);
		eventEmitter.on('postupdate', this.postUpdate, this);

		eventEmitter.on('pause', this.pause, this);
		eventEmitter.on('resume', this.resume, this);

		eventEmitter.on('sleep', this.sleep, this);
		eventEmitter.on('wake', this.wake, this);

		eventEmitter.on('shutdown', this.shutdown, this);
		eventEmitter.on('destroy', this.destroy, this);

		console.log('PhaserPluginDVR booting');
    },
    
    //record the output of phaser for X seconds and replace
    //the html body with the video...
    recordTestClip: function(seconds) {
    	console.log(this.systems);
			
		var canvas = this.systems.canvas;
			
		console.log(canvas);
		
  	  	var recorder = recordRtc(canvas, {
	    	type: 'canvas',
	      	showMousePointer: true
		});

		recorder.startRecording();

		setTimeout(function() {
		  recorder.stopRecording(function(url) {
		      var blob = recorder.getBlob();
		      console.log('blob', blob);

		      var video = document.createElement('video');
		      video.src = URL.createObjectURL(blob);
		      video.setAttribute('style', 'height: 50%; position: absolute; top:0; right:0; opacity:85%; border:solid 1px gray;');		          
		      var canvasParent = document.querySelector('body');
		      canvasParent.appendChild(video);
		      video.controls = true;
		      video.play();
		  });
		}, seconds * 1000);
    },
    
    startRecording: function() {
    	console.log('PhaserPluginDVR start recording');
    },
    
    pauseRecording: function() {
    	console.log('PhaserPluginDVR pause recording');
    },
    
    stopRecording: function() {
    	console.log('PhaserPluginDVR stop recording');
    },
    
    getVideos: function() {
    	console.log('PhaserPluginDVR return list of video links and metadata');
    },

    //  A test method.
    test: function (name)
    {
		console.log('PhaserPluginDVR testing');
    },

    //  Called when a Scene is started by the SceneManager. The Scene is now active, visible and running.
    start: function ()
    {
    	var self = this;
    	
    	console.log('PhaserPluginDVR starting');
		console.log('MediaStreamRecorder Init', msr);
		
		//inject some simple transport controls
		var transportControls = document.createElement('div');
		transportControls.innerHTML = '<p>Tap anywhere to float.</p></p>Tap here to record 10 seconds of Phaser output with PhaserPluginDVR.</p>';
		transportControls.id = 'PhaserPluginDVRTransport';
		transportControls.setAttribute('style', 'position:absolute; height:auto; width:150px; top:0; left:0; opacity:80%; color:red; background-color:lightgray; margin:10px;');
		
		transportControls.onclick = function() {
			self.recordTestClip(10);
			console.log('Started recording 10 second test clip.');
		};
		
		var canvasParent = document.querySelector('body');
		canvasParent.appendChild(transportControls);		
						   
    },

    //  Called every Scene step - phase 1
    preUpdate: function (time, delta)
    {
    	//console.log('PhaserPluginDVR update: ' + time + ':' + delta);
    },

    //  Called every Scene step - phase 2
    update: function (time, delta)
    {
    },

    //  Called every Scene step - phase 3
    postUpdate: function (time, delta)
    {
    },

    //  Called when a Scene is paused. A paused scene doesn't have its Step run, but still renders.
    pause: function ()
    {
    	console.log('PhaserPluginDVR paused');
    },

    //  Called when a Scene is resumed from a paused state.
    resume: function ()
    {
    	console.log('PhaserPluginDVR resumed');
    },

    //  Called when a Scene is put to sleep. A sleeping scene doesn't update or render, but isn't destroyed or shutdown. preUpdate events still fire.
    sleep: function ()
    {
    	console.log('PhaserPluginDVR sleeping');
    },

    //  Called when a Scene is woken from a sleeping state.
    wake: function ()
    {
    	console.log('PhaserPluginDVR woke');
    },

    //  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
    shutdown: function ()
    {
    	console.log('PhaserPluginDVR shutting down');
    },

    //  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
    destroy: function ()
    {
	    console.log('PhaserPluginDVR destroying');
	    this.shutdown();
	    this.scene = undefined;
    }
};

PhaserPluginDVR.prototype.constructor = PhaserPluginDVR;
module.exports = PhaserPluginDVR;