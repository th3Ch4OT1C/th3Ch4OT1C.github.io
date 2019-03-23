function getCookie(cookie) {
	let split = document.cookie.split(';');
	let name = cookie + "=";
	for (let i = 0; i < split.length; i++) {
		if (split[i].indexOf(name) != -1) {
			return (split[i].replace(name, ""))
		}
	}
	return false;
}

function setCookie(name, value, expire) {
	var date = new Date();
	date.setTime(date.getTime() + (expire * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function deleteCookie(name) {
	document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}