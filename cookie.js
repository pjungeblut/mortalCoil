/**
 * reads a cookie as integer
 * 
 * @param name name of the cookie
 * @return the value of that cookie as int
 */
function readCookie(name) {
	var cookie = document.cookie;
	cookie = cookie.split("; ");
	for (var i = 0; i < cookie.length; i++) {
		if (cookie[i].indexOf(name) === 0 && cookie[i].charAt(name.length) === "=") {
			cookie = cookie[i].split("=");
			return parseInt(cookie[1]);
		}
	}
	return 0;
}

/**
 * sets a cookie, valid one year
 * 
 * @param name the name of the cookie
 * @param value the value of the cookie
 */
function setCookie(name, value) {
	var date = new Date();
	date.setFullYear(date.getFullYear() + 1); 
	document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";";
}