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

	this.setVolume = function(volume) {
		if (this.player) {
			if (volume) {
				this.player.setVolume(this.volume);
			} else {
				this.player.setVolume(0.0);
			}
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
		if (this.x < 1) {
			this.x = 0;
			this.container.style.left = "0px";
		}
		if (this.y < 1) {
			this.y = 0;
			this.container.style.top = "0px";
		}
		if (this.x + (this.clientWidth() + 2) > window.innerWidth) {
			this.x = window.innerWidth - (this.clientWidth() + 2);
			this.container.style.left = this.x + "px";
		}
		if (this.y + (this.clientHeight() + 2) > window.innerHeight) {
			this.y = window.innerHeight - (this.clientHeight() + 2);
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
		this.container.classList = object.container.classList;

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
			this.volume = 0.5;
			this.player.setMuted(false);//If user is logged in (muted) carries over
			//setmuted to false because I'm not enabling access to the twitch ui
			
			if (this.id != 0) {
				this.player.setVolume(0.0);
			}
		}.bind(this));
	}

	this.create();
}

Mouse = function() {
	this.isDown = false;
	this.x;
	this.y;
	this.prevX;
	this.prevY;
	this.timeout;
	this.selected;
	this.elementOffsetX;
	this.elementOffsetY;
	this.process = 'none';

	this.move = function(event) {
		window.clearInterval(this.timeout);
		this.timeout = window.setTimeout(this.hide, 750);
		this.show();

		this.prevX = this.x;
		this.prevY = this.y;
		this.x = event.clientX;
		this.y = event.clientY;

		if (this.isDown) {//adjust stream (position/size) depending on this.process
			if (this.process == 'none') {
				let top = getHighestFromPoint(event.pageX, event.pageY);

				if (streams[top].id != 0) {
					let element = streams[top];
					if (dis(this.x, this.y, element.x + element.clientWidth() + 1, element.y + element.clientHeight() + 1) < 11) {
						this.process = 'resize';
						this.selected = element;
					} else {
						this.process = 'move';
						this.selected = element;
						this.elementOffsetX = this.x - element.x;
						this.elementOffsetY = this.y - element.y;
					}
				} else {
					this.process = 'null';
				}
			} else {
				if (this.process == 'resize') {
					let minLen = $(window).width() < $(window).height() ? $(window).width() : $(window).height();
					let vmin;
					if (Math.abs(this.x - (this.selected.x + this.selected.clientWidth())) < Math.abs(this.x - (this.selected.x + this.selected.clientWidth()))) {
						vmin = Math.floor(((this.x - this.selected.x)/minLen) * 100);
					} else {
						vmin = Math.floor(((this.y - this.selected.y)/minLen) * 100);
					}
					this.selected.width = vmin * (16/9) + "vmin";
					this.selected.height = vmin + "vmin";
					this.selected.updateView();
				} else if (this.process == 'move') {
					this.selected.x += this.x - this.prevX;
					this.selected.y += this.y - this.prevY;
					this.selected.updateView();
					this.selected.snap();
				}
			}
		} else {//switch volume to stream mouse is over
			if ($("#menu").hasClass('hidden')) {
				$("#menu").toggleClass('hidden shown').animate({
					left: "10px"
				}, 500);
			}

			let top = getHighestFromPoint(this.x, this.y);
			for (let i = 0; i < streams.length; i++) {
				if (i != top) {
					streams[i].setVolume(false);
				}
			}
			streams[top].setVolume(true);

			let element = streams[top];
			if (dis(this.x, this.y, element.x + element.clientWidth() + 1, element.y + element.clientHeight() + 1) < 11) {
				element.overlay.style.cursor = 'se-resize';
			} else {
				element.overlay.style.cursor = 'auto';
			}
		}
	}

	this.down = function(event) {
		this.isDown = true;
	}

	this.up = function(event) {
		this.isDown = false;

		if (this.process == 'none') {//null means background clicked
			let top = getHighestFromPoint(this.x, this.y);
			let element = streams[top];

			if (element.id != 0) {
				streams.find(obj => obj.id == 0).copy(element);//update position and size of sources so streams don't have to reload
				element.id = 0;
				element.x = 0;
				element.y = 0;
				element.width = "100%";
				element.height = "100%";
				$(element.container).toggleClass('sub-container main-container');
				element.updateView();
			}
		} else {
			this.process = 'none';
		}
	}

	this.hide = function() {
		$(".overlay").css('cursor', 'none');

		if ($("#menu").hasClass('shown')) {
			$("#menu").toggleClass('hidden shown').animate({
				left: -($("#menu").width() + 30) + "px"
			}, 500);
		}
	}

	this.show = function() {
		$(".overlay").css('cursor', 'default');
	}
}