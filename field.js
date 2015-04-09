/**
 * draws the field of the game
 * 
 * @param level a level object
 * @param context the context to draw on
 * @param game back reference to the main game
 */
function Field(level, context, game) {
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
	var WALL_COLOR = "#55BB55";
	var EMPTY_COLOR = "#DDDDDD";
	var ACTIVE_COLOR = "#AAAAAA";
	var HEAD_COLOR = "#DD8888";
	var TAIL_COLOR = HEAD_COLOR;
	var BLOCKED_COLOR = "#CCCCCC";
	
	/**
	 * mouse coordinates
	 */
	var mouseX;
	var mouseY;
	
	/**
	 * the line and column below the mouse ot touch
	 */
	var activeLine;
	var activeCol;
	
	/**
	 * states, the game can be in
	 * -searching for start point
	 * -moving
	 */
	var SEARCHING = 0, MOVING = 1;
	var gameState;
	
	/**
	 * the game history
	 * -start point
	 * -head point
	 * -movements with deltas
	 */
	var startLine;
	var startCol;
	var headLine;
	var headCol;
	var movements = [];
	var RIGHT = 0, LEFT = 1, DOWN = 2, UP = 3;
	var DELTAS = [[0, 1], [0, -1], [1, 0], [-1, 0]]; 
	
	/**
	 * image for the restart button
	 */
	var RESTART_NORMAL = "img/restart.png";
	var RESTART_HOVER = "img/restartHover.png";
	var restartImg = new Image();
	restartImg.src = RESTART_NORMAL;
	
	/**
	 * get mouse coordinates
	 */
	window.addEventListener("mousemove", mousemoveHandler);
	function mousemoveHandler(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		getUnderlyingCell();
	}
	
	/**
	 * get touch coordinates
	 */
	window.addEventListener("touchmove", touchmoveHandler);
	function touchmoveHandler(e) {
		mouseX = e.touches[0].clientX;
		mouseY = e.touches[0].clientY;
		e.preventDefault();
		getUnderlyingCell();
	}
	
	/**
	 * get clicks
	 */
	window.addEventListener("click", clickHandler);
	function clickHandler() {
		if (activeLine < 0 || activeLine >= level.getHeight() || activeCol < 0 || activeCol >= level.getWidth()) {
			return;
		}
		
		//restart
		if (activeLine === level.getHeight() - 1 && activeCol === 0) {
			level.reset();
			startLine = null;
			startCol = null;
			movements = [];
			gameState = SEARCHING;
			draw();
			return;
		}
		
		switch (gameState) {
			case SEARCHING:
				if (level.getValue(activeLine, activeCol) === EMPTY) {
					startLine = activeLine;
					startCol = activeCol;
					headLine = startLine;
					headCol = startCol;
					movements = [[startLine, startCol]];
					level.setBlocked(startLine, startCol);
					gameState = MOVING;
				}
				break;
			case MOVING:
				if (headLine === activeLine && headCol < activeCol) {
					move(DELTAS[RIGHT]);
				} else if (headLine === activeLine && headCol > activeCol) {
					move(DELTAS[LEFT]);
				} else if (headCol === activeCol && headLine < activeLine) {
					move(DELTAS[DOWN]);
				} else if (headCol === activeCol && headLine > activeLine) {
					move(DELTAS[UP]);
				}
				break;
			default:
				throw new Error("Invalid game state: " + gameState + ".");
		}
	}
	
	/**
	 * get keyboard events
	 */
	window.addEventListener("keyup", keyupHandler);
	function keyupHandler(e) {
		if (!e) {
			e = window.event;
		}
		
		if (e.which) {
			var key = e.which;
		} else if (e.keyCode) {
			var key = e.keyCode;
		}
		
		if (typeof(startLine) !== "undefined" && typeof(startCol) !== "undefined") {
			switch (key) {
				case 37:
					move(DELTAS[LEFT]);
					break;
				case 38:
					move(DELTAS[UP]);
					break;
				case 39:
					move(DELTAS[RIGHT]);
					break;
				case 40:
					move(DELTAS[DOWN]);
					break;
			}
		}
		
		if (key >= 37 && key <= 40) {
			e.cancelBubble = true;
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	}
	
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
		gameState = SEARCHING;
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
	 * result stored in activeLine, activeCol
	 */
	function getUnderlyingCell() {
		var col = parseInt((mouseX - offset) / (cellSize + 1));
		var line = parseInt(mouseY / (cellSize + 1));
		
		var doDraw = false;
		if (line != activeLine || col != activeCol) {
			doDraw = true;
		}
		
		activeLine = line;
		activeCol = col;
		
		if (activeLine === level.getHeight() - 1 && activeCol === 0) {
			restartImg.src = RESTART_HOVER;
		} else {
			restartImg.src = RESTART_NORMAL;
		}
		
		if (doDraw) {
			draw();
		}
	}
	
	/**
	 * does a movement in direction dx, dy
	 * 
	 * @param delta direction to move
	 */
	function move(delta) {
		var dy = delta[0];
		var dx = delta[1];
		
		var nextLine = headLine + dy;
		var nextCol = headCol + dx;
		
		if (level.getValue(nextLine, nextCol) === EMPTY) {
			while (level.getValue(nextLine, nextCol) === EMPTY) {
				headLine = nextLine;
				headCol = nextCol;
				
				movements.push([headLine, headCol]);
				level.setBlocked(headLine, headCol);
				
				nextLine = headLine + dy;
				nextCol = headCol + dx;
			}
		} else if (level.getValue(nextLine, nextCol) === BLOCKED) {
			while (level.getValue(nextLine, nextCol) === BLOCKED) {
				var toppest = movements.pop();
				level.setEmpty(toppest[0], toppest[1]);
				
				var top = movements[movements.length - 1];
				
				if (top[0] === nextLine && top[1] === nextCol) {
					headLine = nextLine;
					headCol = nextCol;
					
					nextLine = headLine + dy;
					nextCol = headCol + dx;
				} else {
					movements.push(toppest);
					level.setBlocked(toppest[0], toppest[1]);
					break;
				}
			}
		}
		
		draw();
		
		if (level.isFinished()) {
			finish();
		}
	}
	
	/**
	 * signals that level is finished
	 */
	function finish() {
		window.removeEventListener("mousemove", mousemoveHandler);
		window.removeEventListener("touchmove", touchmoveHandler);
		window.removeEventListener("click", clickHandler);
		window.removeEventListener("keyup", keyupHandler);
		game.finish();
	}
	
	/**
	 * draws the field
	 */
	function draw() {
		drawBackground();
		drawGrid();
		drawCells();
		drawPath();
		drawHead();
		drawRestart();
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
	
	/**
	 * draws the cells
	 */
	function drawCells() {
		for (var i = 0; i < level.getHeight(); i++) {
			for (var j = 0; j < level.getWidth(); j++) {
				var x = offset + j * (cellSize + 1) + 1;
				var y = i * (cellSize + 1) + 1;
				
				switch(level.getValue(i, j)) {
					case WALL:
						context.fillStyle = WALL_COLOR;
						break;
					case EMPTY:
						if (i === activeLine && j === activeCol) {
							context.fillStyle = ACTIVE_COLOR;
						} else {
							context.fillStyle = EMPTY_COLOR;
						}
						break;
					case BLOCKED:
						context.fillStyle = BLOCKED_COLOR;
						break;
					default:
						throw new Error("Invalid level state at line=" + i + ", column=" + j +  ".");
				}
				
				context.fillRect(x, y, cellSize, cellSize);
			}
		}
	}
	
	/**
	 * draws the path
	 */
	function drawPath() {
		if (movements.length < 2) return;
		
		for (var i = 1; i < movements.length; i++) {
			var xFrom = offset + movements[i - 1][1] * (cellSize + 1) + (cellSize / 2) + 1;
			var yFrom = movements[i - 1][0] * (cellSize + 1) + (cellSize / 2) + 1;
			
			var xTo = offset + movements[i][1] * (cellSize + 1) + (cellSize / 2) + 1;
			var yTo = movements[i][0] * (cellSize + 1) + (cellSize / 2) + 1;
			
			context.lineWidth = 5;
			context.strokeStyle = TAIL_COLOR;
			context.beginPath();
			context.moveTo(xFrom, yFrom);
			context.lineTo(xTo, yTo);
			context.stroke();
			context.closePath();
		}
	}
	
	/**
	 * draws the head
	 */
	function drawHead() {
		var x = offset + headCol * (cellSize + 1) + 1;
		var y = headLine * (cellSize + 1) + 1;
		context.fillStyle = HEAD_COLOR;
		context.fillRect(x, y, cellSize, cellSize);
	}
	
	/**
	 * draws restart button
	 */
	function drawRestart() {
		var x = offset + 0.1 * cellSize;
		var y = (level.getHeight() - 1) * (cellSize + 1) + 0.2 * cellSize;
		
		context.drawImage(restartImg, x, y, 0.9 * cellSize, 0.7 * cellSize);
	}
}
