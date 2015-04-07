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
	var level;
	
	/**
	 * the field to play on
	 */
	var field;
	
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
		
		level = new Level(levels[0]);
		field = new Field(level, context);
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
}