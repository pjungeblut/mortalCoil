/**
 * draws the field of the game
 * 
 * @param level a level object
 * @param context the context to draw on
 */
function Field(level, context) {
	/**
	 * saving the context
	 */
	var that = this;
	
	/**
	 * width and height of the canvas
	 */
	var canvasHeight;
	var canvasWidth;
	
	/**
	 * width and height of a single cell
	 * offset, for centration
	 * colors
	 */
	var cellSize;
	var offset;
	var GRID_COLOR = "#777777";
	var BG_COLOR = "#000000";
	var WALL_COLOR = "#66CC66";
	var EMPTY_COLOR = "#DDDDDD";
	
	/**
	 * mouse coordinates
	 */
	var mouseX;
	var mouseY;
	
	/**
	 * get mouse coordinates
	 */
	window.addEventListener("mousemove", function(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		getUnderlyingCell();
	});
	
	/**
	 * get touch coordinates
	 */
	window.addEventListener("touchmove", function(e) {
		mouseX = e.touches[0].clientX;
		mouseY = e.touches[0].clientY;
		e.preventDefault();
		getUnderlyingCell();
	});
	
	/**
	 * to be called by the resize method of the game
	 * 
	 * @param width the new width of the canvas
	 * @param height the new height of the canvas
	 * @param
	 */
	this.resize = function(newContext) {
		context = newContext;
		if (context.canvas === null) {
			throw new Error('Context has no attached canvas.');
		}
		
		canvasWidth = context.canvas.width;
		canvasHeight = context.canvas.height;
		
		cellSize = getCellSize(canvasWidth, canvasHeight);
		
		offset = (canvasWidth - (level.getWidth() * (cellSize + 1) + 1)) / 2;
		
		draw();
	};
	
	/**
	 * initializes cell width and cell height
	 */
	init();
	function init() {
		that.resize(context);
	}
	
	/**
	 * cells are squares
	 * 
	 * @param cWidth the width of the canvas
	 * @param cHeight the height of the canvas
	 * @return the width of a single cell
	 */
	function getCellSize(cWidth, cHeight) {
		var width = parseInt((cWidth - level.getWidth() - 1) / level.getWidth());
		var height = parseInt((cHeight - level.getHeight() - 1) / level.getHeight());
		return Math.min(width, height);	
	}
	
	/**
	 * calculates the line and column of the cell
	 * below the touch our mouse
	 * 
	 * also gives invalid cells!
	 * 
	 * @return array with line and col (in that order)
	 */
	function getUnderlyingCell() {
		var col = parseInt((mouseX - offset) / (cellSize + 1));
		var line = parseInt(mouseY / (cellSize + 1));
		
		return [line, col];
	}
	
	/**
	 * draws the field
	 */
	function draw() {
		drawBackground();
		drawGrid();
		
		for (var i = 0; i < level.getHeight(); i++) {
			for (var j = 0; j < level.getWidth(); j++) {
				var x = offset + j * (cellSize + 1) + 1;
				var y = i * (cellSize + 1) + 1;
				
				if (level.getValue(i, j) === WALL) {
					context.fillStyle = WALL_COLOR;
				} else {
					context.fillStyle = EMPTY_COLOR;
				}
				
				context.fillRect(x, y, cellSize, cellSize);
			}
		}
	}
	
	/**
	 * draws the drawBackground
	 */
	function drawBackground() {
		context.fillStyle = BG_COLOR;
		context.fillRect(0, 0, canvasWidth, canvasHeight);
	}
	
	/**
	 * draws the grid
	 */
	function drawGrid() {
		context.lineWidth = 1;
		context.lineJoin = "round";
		context.strokeStyle = GRID_COLOR;
		context.lineCap = "square";
		
		var x = offset;
		for (var i = 0; i <= level.getWidth(); i++) {
			context.beginPath();
			context.moveTo(x + 0.5, 0);
			context.lineTo(x + 0.5, level.getHeight() * (1 + cellSize) + 1);
			context.stroke();
			context.closePath();
			x += cellSize + 1;
		}
		
		var y = 0;
		for (var i = 0; i <= level.getHeight(); i++) {
			context.beginPath();
			context.moveTo(offset, y + 0.5);
			context.lineTo(offset + level.getWidth() * (1 + cellSize) + 1, y + 0.5);
			context.stroke();
			context.closePath();
			y += cellSize + 1;
		}
	}
}
