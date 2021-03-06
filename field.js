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
	var BLOCKED_COLOR = "#AAAAAA";
	var BUTTON_BAR_COLOR = WALL_COLOR;
	
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
	var headLine = -1;
	var headCol = -1;
	var movements = [];
	var RIGHT = 0, LEFT = 1, DOWN = 2, UP = 3;
	var DELTAS = [[0, 1], [0, -1], [1, 0], [-1, 0]]; 
	
	/**
	 * button bar
	 */
	var buttonBarHeight = 50;
	var buttonBarWidth;
	
	/**
	 * restart Button
	 */
	var RESTART_NORMAL = "img/restart.png";
	var RESTART_HOVER = "img/restartHover.png";
	var restartButton = new Button(RESTART_NORMAL, RESTART_HOVER, 50, 40, context);
	restartButton.click = function() {
		level.reset();
		startLine = null;
		startCol = null;
		headLine = -1;
		headCol = -1;
		movements = [];
		gameState = SEARCHING;
		draw();
	};
	
	/**
	 * previous level button
	 */
	var PREV_NORMAL = "img/left.png";
	var PREV_HOVER = "img/leftHover.png";
	var prevButton = new Button(PREV_NORMAL, PREV_HOVER, 40, 40, context);
	prevButton.click = function() {
		finish();
		game.prev();
	};
	
	/**
	 * next level button
	 */
	var NEXT_NORMAL = "img/right.png";
	var NEXT_HOVER = "img/rightHover.png";
	var nextButton = new Button(NEXT_NORMAL, NEXT_HOVER, 40, 40, context);
	nextButton.click = function() {
		finish();
		game.next();
	};
	
	/**
	 * the timeout for the touchend
	 */
	var touchTimeout;
	
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
	function clickHandler(e) {
		//is click over field?
		if (activeLine < 0 || activeLine >= level.getHeight() || activeCol < 0 || activeCol >= level.getWidth()) {
			e.cancelBubble = true;
			e.stopPropagation();
			e.preventDefault();
			return false;
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
				var tolerance = countMoveOptions() == 1 ? 0 : 2;
				
				if (
					(headLine === activeLine && headCol < activeCol) ||
					(
						Math.abs(headLine - activeLine) <= 1 &&
						headCol + tolerance < activeCol &&
						level.getValue(headLine + DELTAS[RIGHT][0], headCol + DELTAS[RIGHT][1]) === EMPTY
					)	
				) {
					move(DELTAS[RIGHT]);
				} else if (
					(headLine === activeLine && headCol > activeCol) ||
					(
						Math.abs(headLine - activeLine) <= 1 &&
						headCol - tolerance > activeCol &&
						level.getValue(headLine + DELTAS[LEFT][0], headCol + DELTAS[LEFT][1]) === EMPTY
					)
				) {
					move(DELTAS[LEFT]);
				} else if (
					(headCol === activeCol && headLine < activeLine) ||
					(
						Math.abs(headCol - activeCol) <= 1 &&
						headLine + tolerance < activeLine &&
						level.getValue(headLine + DELTAS[DOWN][0], headCol + DELTAS[DOWN][1]) === EMPTY
					)
				) {
					move(DELTAS[DOWN]);
				} else if (
					(headCol === activeCol && headLine > activeLine) ||
					(
						Math.abs(headCol - activeCol) <= 1 &&
						headLine - tolerance > activeLine &&
						level.getValue(headLine + DELTAS[UP][0], headCol + DELTAS[UP][1]) === EMPTY
					)
				) {
					move(DELTAS[UP]);
				}
				break;
			default:
				throw new Error("Invalid game state: " + gameState + ".");
		}
		
		e.cancelBubble = true;
		e.stopPropagation();
		e.preventDefault();
		return false;
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
	 * handles the end of a touch
	 * cleares touches field after short timeout
	 */
	window.addEventListener("touchend", touchendHandler);
	function touchendHandler(e) {
		touchTimeout = window.setTimeout(function() {
			activLLine = null;
			activeCol = null;
			draw();
		}, 500);
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
		
		cellSize = getCellSize(canvasWidth, canvasHeight - buttonBarHeight);
		buttonBarWidth = level.getWidth() * (cellSize + 1) + 1;
		offset = (canvasWidth - buttonBarWidth) / 2;
		
		restartButton.setX(offset + (buttonBarWidth - 50) / 2);
		restartButton.setY(level.getHeight() * (cellSize + 1) + 6);
		
		prevButton.setX(offset + 5);
		prevButton.setY(level.getHeight() * (cellSize + 1) + 6);
		
		nextButton.setX(offset + buttonBarWidth - 45);
		nextButton.setY(level.getHeight() * (cellSize + 1) + 6);
		
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
			game.finish();
		}
	}
	
	/**
	 * signals that level is finished
	 */
	function finish() {
		level.reset();
		restartButton.destroy();
		prevButton.destroy();
		nextButton.destroy();
		window.removeEventListener("mousemove", mousemoveHandler);
		window.removeEventListener("touchmove", touchmoveHandler);
		window.removeEventListener("click", clickHandler);
		window.removeEventListener("keyup", keyupHandler);
		window.removeEventListener("touchend", touchendHandler);
		window.clearTimeout(touchTimeout);
	}
	
	/**
	 * @return the number of possible moves from the current position
	 */
	function countMoveOptions() {
		var result = 0;
		
		if (level.getValue(headLine - 1, headCol) === EMPTY) result++;
		if (level.getValue(headLine + 1, headCol) === EMPTY) result++;
		if (level.getValue(headLine, headCol - 1) === EMPTY) result++;
		if (level.getValue(headLine, headCol + 1) === EMPTY) result++;
		
		return result;
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
		drawButtonBar();
		prevButton.draw();
		restartButton.draw();
		nextButton.draw();
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
		if (headLine == -1 || headCol == -1) {
			return;
		}
		
		var x = offset + headCol * (cellSize + 1) + 1;
		var y = headLine * (cellSize + 1) + 1;
		context.fillStyle = HEAD_COLOR;
		context.fillRect(x, y, cellSize, cellSize);
	}
	
	/**
	 * draws the button bar
	 */
	function drawButtonBar() {
		context.fillStyle = BUTTON_BAR_COLOR;
		context.fillRect(offset, level.getHeight() * (cellSize + 1) + 1, buttonBarWidth, buttonBarHeight);
		
		context.strokeStyle = GRID_COLOR;
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(offset + 0.5, level.getHeight() * (cellSize + 1) + 1);
		context.lineTo(offset + 0.5, level.getHeight() * (cellSize + 1) + 1 + buttonBarHeight);
		context.lineTo(offset + buttonBarWidth - 0.5, level.getHeight() * (cellSize + 1) + 1 + buttonBarHeight);
		context.lineTo(offset + buttonBarWidth - 0.5, level.getHeight() * (cellSize + 1) + 1);
		context.stroke();
		context.closePath();
	}
}
