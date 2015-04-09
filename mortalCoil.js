/**
 * main object, creating the game
 * also organizes the canvas
 * 
 * @param canvasId string, Id of the canvas
 */
function MortalCoil(pCanvasId) {
	/**
	 * saving object context
	 */
	var that = this;
	
	/**
	 * storing the canvas id
	 */
	var canvasId = pCanvasId;
	
	/**
	 * the canvas and the context to work on
	 */
	var canvas;
	var context;
	
	/**
	 * width and height of the canvas
	 */
	var width;
	var height;
	
	/**
	 * the actual level
	 */
	var levelCounter = 0;
	var level;
	
	/**
	 * the field to play on
	 */
	var field;
	
	/**
	 * called when a level is finished
	 * loads a new level
	 */
	this.finish = function() {
		window.setTimeout(function() {
			level = null;
			field = null;
			
			levelCounter++;
			levelCounter %= levels.length;
			
			if (levelCounter > getMaxLevel()) {
				var date = new Date();
				date.setFullYear(date.getFullYear() + 1); 
				document.cookie = "levelCounter=" + levelCounter + "; expires=" + date.toUTCString() + ";";
			}
			
			level = new Level(levels[levelCounter]);
			field = new Field(level, context, that);
		}, 1000);
	}
	
	/**
	 * initializes resize handler, thus opens the canvas and gets the context
	 * opens a level
	 */
	init();
	function init() {
		resize();
		window.addEventListener("resize", function() {
			resize();
		});
		
		levelCounter = getMaxLevel();
		
		level = new Level(levels[levelCounter]);
		field = new Field(level, context, that);
	}
	
	/**
	 * resizes the canvas to the full display size
	 * renews private canvas and context attributes
	 */
	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		
		canvas = document.getElementById(canvasId);
		if (canvas === null) throw new Error("Can't find canvas with id=\"" + canvasId + "\"");
		
		canvas.height = height;
		canvas.width = width;
		
		context = this.canvas.getContext("2d");
		if (context === null) throw new Error("Can't open context on canvas with id=\"" + canvasId + "\"");
		
		if (typeof(field) !== "undefined") {
			field.resize(context);
		}
	}
	
	/**
	 * get max level from cookie
	 * 
	 * @return the maximum reached level
	 */
	function getMaxLevel() {
		var cookie = document.cookie;
		cookie = cookie.split(";");
		for (var i = 0; i < cookie.length; i++) {
			if (cookie[i].indexOf("levelCounter") === 0) {
				cookie = cookie[i].split("=");
				var stored = parseInt(cookie[1]);
				if (stored >= 0 && stored < levels.length) {
					return stored;
				}
				break;
			}
		}
		
		return 0;
	}
}