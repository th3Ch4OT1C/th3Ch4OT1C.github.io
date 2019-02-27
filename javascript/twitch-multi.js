var streams = [];
var mouseTimeout;

Source = function(src, id, width = 310, height = 189) {
	this.container;
	this.overlay;
	this.twitch;
	this.player;
	this.volume = 0.5;
	this.id = id;
	this.src = src;
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;

	this.clientWidth = function() {
		return($(this.container).width());
	}

	this.clientHeight = function() {
		return($(this.container).height());
	}

	this.inBox = function(x, y) {
		return (x >= this.x && x <= this.x + this.clientWidth() && y >= this.y && y <= this.y + this.clientHeight())
	}

	this.setChannel = function(channel) {
		this.src = channel;
		this.player.setChannel(channel);
	}

	this.setVolume = function(volume = null) {
		if (volume == 'mute') {
			this.player.setVolume(0.5);//0.0
		} else {
			this.player.setVolume(0.5);//this.volume
		}
	}

	this.updatePos = function() {
		this.x = this.container.getBoundingClientRect().left;
		this.y = this.container.getBoundingClientRect().top;
		if (true) {//allow disabling of snapping
			this.snap();
		}
	}

	this.updateView = function() {
		this.container.style.left = this.x + "px";
		this.container.style.top = this.y + "px";
		this.container.style.width = this.width;
		this.container.style.height = this.height;
	}

	this.snap = function() {
		if (this.x <= 5) {
			this.x = 0;
			this.container.style.left = "0px";
		}
		if (this.y <= 5) {
			this.y = 1;
			this.container.style.top = "1px";
		}
		if (this.x + this.clientWidth() > window.innerWidth) {
			this.x = window.innerWidth - this.clientWidth();
			this.container.style.left = (this.x - 2) + "px";
		}
		if (this.y + this.clientHeight() > window.innerHeight) {
			this.y = window.innerHeight - this.clientHeight();
			this.container.style.top = (this.y) + "px";
		}
	}

	this.copy = function(object) {
		this.id = object.id;
		this.x = object.x;
		this.y = object.y;
		this.width = object.width;
		this.height = object.height;
		this.container.style.left = object.x;
		this.container.style.top = object.y;
		this.container.style.width = object.width;
		this.container.style.height = object.height;

		this.updateView();
	}

	this.create = function() {
		this.container = document.createElement("div");
		this.container.id = "twitch-embed" + this.id;
		this.container.classList = this.id == 0 ? "main-container" : "sub-container";
		this.container.style.width = this.width;
		this.container.style.height = this.height;

		this.overlay = document.createElement("div");
		this.overlay.classList = "overlay";
		this.container.appendChild(this.overlay);

		document.body.appendChild(this.container);

		this.twitch = new Twitch.Embed(this.container.id, {
			width: "100%",
			height: "100%",
			channel: this.src,
			layout: "video",
			autoplay: true
		});

		this.twitch.addEventListener(Twitch.Embed.VIDEO_READY, function() {
			this.player = this.twitch.getPlayer();
			this.player.play();
			this.volume = this.player.getVolume();
			this.volume = 0.5;
			$(this.container).draggable({
				stop: function(event) {
					this.updatePos();
				}.bind(this)
			});
			$(this.container).draggable();
			if (this.id == 0) {
				$(this.container).draggable("disable");
			} else {
				this.player.setVolume(0.0);
			}
		}.bind(this));
	}

	this.create();
}

$(document).ready(function() {
	streams.push(new Source("giantwaffle", 0, "100%", "100%"));
	streams.push(new Source("sleightlymusical", 1, "32vmin", "18vmin"));
});

$(window).mousemove(function(event) {
	window.clearInterval(mouseTimeout);
	mouseTimeout = window.setTimeout(hideMouse, 750);

	let top = getHighestFromPoint(event.pageX, event.pageY);
	$(streams[top].overlay).css('cursor', 'default');
	for (let i = 0; i < streams.length; i++) {
		if (i != top) {
			streams[i].setVolume("mute");
		}
	}
	streams[top].setVolume();
});

$(window).click(function() {
	let top = getHighestFromPoint(event.pageX, event.pageY);

	if (streams[top].id != 0) {
		$(streams.find(obj => obj.id == 0).container).toggleClass("main-container sub-container").draggable("enable");
		streams.find(obj => obj.id == 0).copy(streams[top]);
		$(streams[top].container).toggleClass("main-container sub-container").draggable("disable");
		streams[top].id = 0;
		streams[top].x = 0;
		streams[top].y = 0;
		streams[top].width = "100%";
		streams[top].height = "100%";
		streams[top].updateView();
	}
});

function hideMouse() {
	$(".overlay").css('cursor', 'none');
}

function getHighestFromPoint(x, y) {
	let top = 0;
	for (let i = 0; i < streams.length; i++) {
		if (streams[i].inBox(x, y)) {
			top = streams[i].id > top ? streams[i].id : top;
		}
	}
	return streams.indexOf(streams.find(obj => obj.id == top));
}
