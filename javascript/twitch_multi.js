var streams = [];
var mouseTimeout;
var mouse = new Mouse();

$(document).ready(function() {
	streams.push(new Source("kitboga", 0, "100%", "100%"));
	streams.push(new Source("giantwaffle", 1, "32vmin", "18vmin"));

	$("#changeSources").click(function(event) {
		$.each(streams, function() {
			
		});
	});

	$("#changeLayout").click(function(event) {
	});
});

$(window).mousemove(function(event) {
	event.preventDefault();
	event.stopPropagation();
	mouse.move(event);
});

$(window).mousedown(function(event) {
	mouse.down(event);
});

$(window).mouseup(function() {
	if ($.inArray(event.target, $('.overlay')) > -1) {
		mouse.up(event);
	} else {
		mouse.isDown = false;
	}
});

function getHighestFromPoint(x, y) {
	let top = 0;
	for (let i = 0; i < streams.length; i++) {
		if (streams[i].inBox(x, y)) {
			top = streams[i].id > top ? streams[i].id : top;
		}
	}
	return streams.indexOf(streams.find(obj => obj.id == top));
}

function dis(x0, y0, x1, y1) {
	return (Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)));
}