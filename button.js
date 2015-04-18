/**
 * class for an image button
 * 
 * @param normalImage the image without mouse over it
 * @param hoverImage the image when mouse is over it
 * @param width the width of the button
 * @param height the height of the button
 * @param context the context on which the button gets drawn
 */
function Button(normalImage, hoverImage, width, height, context) {
	/**
	 * saving the context
	 */
	var that = this;
	
	/**
	 * the image to be drawn
	 */
	var img = new Image();
	img.src = normalImage;
	
	/**
	 * the mouse coordinates
	 */
	var mouseX;
	var mouseY;
	
	/**
	 * position of the button
	 */
	var x;
	var y;
	
	/**
	 * event handler for hover effect
	 */
	window.addEventListener("mousemove", hoverHandler);
	function hoverHandler(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		
		if (isOverButton()) {
			img.src = hoverImage;
		} else {
			img.src = normalImage;
		}
	}
	
	/**
	 * event handler for the clicks
	 */
	window.addEventListener("click", clickHandler);
	function clickHandler(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		
		if (isOverButton()) {
			that.click();
		}
	}
	
	/**
	 * checks whether the mouse is over the button
	 */
	function isOverButton() {
		if (!Number.isInteger(mouseX) || !Number.isInteger(mouseY)) return false;
		
		return (
			mouseX >= x &&
			mouseX <= x + width &&
			mouseY >= y &&
			mouseY <= y + height
		);
	}
	
	/**
	 * to be overwritten by each button
	 */
	this.click = function() {
		console.log("To be overwritten.");
	};
	
	/**
	 * sets x-position
	 */
	this.setX = function(xPos) {
		x = xPos;
	};
	
	/**
	 * sets y-position
	 */
	this.setY = function(yPos) {
		y = yPos;
	};
	
	/**
	 * draws the button
	 */
	this.draw = function() {
		context.drawImage(img, x, y, width, height);
	};
	
	/**
	 * removes all attached event handlers
	 */
	this.destroy = function() {
		window.removeEventListener("mousemove", hoverHandler);
		window.removeEventListener("click", clickHandler);
	};
}