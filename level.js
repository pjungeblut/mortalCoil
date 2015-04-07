/**
 * encapsulates a level with method to get the width
 * the heigth and the value at a given position
 * 
 * @param levelDefinition the definition of the level
 */
function Level(levelDefinition) {
	/**
	 * saving the context
	 */
	var that = this;
	
	/**
	 * width and height of the level
	 */
	var width;
	var height;
	
	/**
	 * the level definition
	 */
	var definition;
	
	/**
	 * @return the height of the level
	 */
	this.getHeight = function() {
		return height;
	};
	
	/**
	 * @return the width of the level
	 */
	this.getWidth = function() {
		return width;
	};
	
	/**
	 * returns the value at the given position
	 * checks position for validity
	 * 
	 * @param line the line, 0-bases
	 * @param col the column, 0-based
	 * @return either EMPTY or WALL
	 */
	this.getValue = function(line, col) {
		if (line < 0 || line >= height || col < 0 || col >= width) {
			throw new Error("Invalid position in level: line=" + line + ", column=" + col);
		}
		
		return definition[line][col];
	};
	
	/**
	 * stores the level definition
	 * 
	 * reads width and height
	 * 
	 * checks for valid level description, that is
	 * -rectangular shape
	 * -border of WALLs
	 * -only WALLs and EMPTYs
	 */
	init();
	function init() {
		definition = levelDefinition;
		
		height = definition.length;
		if (height === 0) throw new Error("The level has height 0.");
		
		width = definition[0].length;
		if (width === 0) throw new Error("The level has width 0.");
		
		for (var i = 1; i < height; i++) {
			if (definition[i].length !== width) {
				throw new Error("The level is not rectangular. Line " + i + " is of different width than line 1.");
				break;
			}
		}
		
		for (var i = 0; i < width; i++) {
			if (definition[0][i] !== WALL || definition[height - 1][i] !== WALL) {
				throw new Error("Top or bottom border not 1 at position " + i + ".");
			}
		}
		
		for (var i = 0; i < height; i++) {
			if (definition[i][0] !== WALL || definition[i][width - 1] !== WALL) {
				throw new Error("Left or right border not 1 at position " + i + ".");
			}
		}
		
		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				if (definition[i][j] !== WALL && definition[i][j] !== EMPTY) {
					throw new Error("Invalid level description at position (" + i + "," + j + ").");
				}
			}
		}
	}
}
