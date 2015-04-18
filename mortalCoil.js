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
	 * intervall for the slide
	 */
	var slideInterval;
	
	/**
	 * called when a level is finished
	 * loads a new level
	 */
	this.finish = function() {
		levelCounter++;
		levelCounter %= levels.length;
		
		if (levelCounter > getMaxLevel()) {
			setCookie("levelCounter", levelCounter);
		}
		
		loadNewLevel();
	};
	
	/**
	 * loads the previous level
	 */
	this.prev = function() {
		if (levelCounter > 0) {
			levelCounter--;
		}
		loadNewLevel();
	};
	
	/**
	 * loads the next level
	 */
	this.next = function() {
		if (levelCounter < getMaxLevel()) {
			levelCounter++;
		}
		loadNewLevel();
	};
	
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
		
		levelCounter = readCookie("level");
		
		loadNewLevel();
	}
	
	/**
	 * loads a new level
	 */
	function loadNewLevel() {
		slide();
		window.setTimeout(function() {
			window.clearInterval(slideInterval);
			context.globalAlpha = 1;
			level = new Level(levels[levelCounter]);
			field = new Field(level, context, that);
			setCookie("level", levelCounter);
		}, 1000);
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
		return readCookie("levelCounter");
	}
	
	/**
	 * creates the slide to the next level
	 */
	function slide() {
		var date = new Date();
		
		context.globalAlpha = 0;
		slideInterval = window.setInterval(function() {
			context.fillStyle = "black";
			context.globalAlpha += 0.02;
			context.fillRect(0, 0, canvas.width, canvas.height);
		}, 50);
	}
}