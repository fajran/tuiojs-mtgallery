var container;
var ctx;
var w = 300;
var h = 300;
var data = [];
var data_list = [];
var maxZIndex = 1;

(function() {
if (!this.console || !this.console.log) {
	this.console = {
		log: function() { }
	};
}
})();

var psize = 300;

function load(d) {
	var res = {
	};

	res.loaded = false;
	res.img = new Image();
	res.z = maxZIndex++;
	res.img.onload = function() {
		res.x = Math.floor(Math.random() * w);
		res.y = Math.floor(Math.random() * h);
		var iw = res.img.width;
		var ih = res.img.height;
		if (iw > ih) {
			res.w = psize;
			res.h = ih / iw * psize;
			res.scale = psize / iw;
		}
		else {
			res.w = iw / ih * psize;
			res.h = psize;
			res.scale = psize / ih;
		}
		res.rotate = (Math.random() * 90 - 45) * Math.PI / 180;
		res.loaded = true;

		data_list.push(res);
		res.id = 'item-' + data_list.length;

		initItem(res);
	};

	res.img.src = d;

	return res;
}

function loadData() {
	var i, size = input.length;
	for (i=0; i<size; i++) {
		data[i] = load(input[i]);
	}
}

function initItem(d) {
	var html = '<div id="'+d.id+'" class="item"><img src="'+d.img.src+'"/></div>';
	container.append(html);
	d.obj = $('#' + d.id);
	d.obj.data('data', d);
	d.obj.css({
		'top': d.y+'px',
		'left': d.x+'px',
		'z-index': d.z
	});
	d.imgobj = $('#'+d.id+' img');
	d.imgobj.css({
		'width': d.w+'px',
		'height': d.h+'px',
	});
	d.obj.mousedown(function(e) { return false; });
	d.obj.mousemove(function(e) { return false; });
	d.obj.mouseup(function(e) { return false; });
}

function init() {
	container = $('#c');
	loadData();
}

$(document).ready(init);

function dataFromPoint(x, y) {
	var el = document.elementFromPoint(x, y);
	var o = $(el);
	if (el.tagName == 'IMG') {
		o = o.parent();
	}
	var d = o.data('data');
	if (d) { return d; }
	else { return undefined; }
}

function moveToTop(d) {
	d.z = maxZIndex++;
	updateOrder(d);
}

function updateOrder(d) {
	d.obj.css({
		'z-index': d.z
	});
}

function normalizeOrder(d) {
	var arr = [];
	var i, size = data.length;

	for (i=0; i<size; i++) {
		arr[i] = data[i];
	}

	arr.sort(function(a, b) { a.z - b.z });
	
	for (i=0; i<size; i++) {
		data[i].z = i+1;
	}
}

function updatePosition(d) {
	d.obj.css({
		'top': d.y + 'px',
		'left': d.x + 'px'
	});
}

function updateScaleRotate(d) {
	d.imgobj.css({
		'width': d.w+'px',
		'height': d.h+'px',
	});
	d.obj.css({
		'-webkit-transform': 'rotate(' + d.rotate + 'rad)',
		'-moz-transform': 'rotate(' + d.rotate + 'rad)',
	});
}

var touchObject = {};
var touches = {};
var touchesTarget = {};

function addTouch(d, t) {
	touches[t.fid] = t;
	touchObject[t.fid] = d;

	if (touchesTarget[d] == undefined) {
		touchesTarget[d] = [];
	}

	touchesTarget[d].push(t.fid);
	console.log(touchesTarget[d].toString());
}

function updateTouch(d, t) {
	touches[t.fid] = t;
}

function removeTouch(t) {
	var d = touchObject[t.fid];
	if (!d) { return; }
	touchObject[t.fid] = undefined;

	var i, size = touchesTarget[d].length;
	for (i=0; i<size; i++) {
		if (touchesTarget[d][i] == t.fid) {
			touchesTarget[d] = touchesTarget[d].slice(0, i).concat(touchesTarget[d].slice(i+1));
			break;
		}
	}
}

var move = {
	start: function(d) {
		var t = touches[touchesTarget[d][0]];
		d._move = {
			dx: d.x - t.nx,
			dy: d.y - t.ny
		}
	},

	update: function(d) {
		var t = touches[touchesTarget[d][0]];
		d.x = t.nx + d._move.dx;
		d.y = t.ny + d._move.dy;
		updatePosition(d);
	},

	finish: function(d, x, y) {

	}
};

function getDistance(t1, t2) {
	var dx = t2.x - t1.x;
	var dy = t2.y - t1.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function getAngle(t1, t2) {
	var dx = t2.x - t1.x;
	var dy = t2.y - t1.y;
	return Math.atan(dy/dx);
}

var gesture = {
	start: function(d, x, y) {
		var t1 = touches[touchesTarget[d][0]];
		var t2 = touches[touchesTarget[d][1]];

		d._gesture = {
			d0: getDistance(t1, t2),
			r0: getAngle(t1, t2)
		}
	},

	update: function(d, x, y) {
		var t1 = touches[touchesTarget[d][0]];
		var t2 = touches[touchesTarget[d][1]];

		var distance = getDistance(t1, t2);

		var scale = distance / d._gesture.d0;

		d.scale = d.scale * scale;
		var w = d.w * scale;
		var h = d.h * scale;
		var dw = w - d.w;
		var dh = h - d.h;
		d.w = w;
		d.h = h;
		d.x -= dw/2;
		d.y -= dh/2;

		var angle = getAngle(t1, t2);
		var rotate = angle - d._gesture.r0;
		d.rotate += rotate;

		d._gesture = {
			d0: distance,
			r0: angle
		}

		updatePosition(d);
		updateScaleRotate(d);
	},

	finish: function(d, x, y) {

	}
};

var touch = {
	add: function(t) {
		var d = dataFromPoint(t.nx, t.ny);
		if (d) {
			addTouch(d, t);
			moveToTop(d);

			var n = touchesTarget[d].length;
			console.log('n:', n);
			if (n == 1) { move.start(d); }
			else if (n == 2) { gesture.start(d); }
		}
	},

	update: function(t) {
		var d = touchObject[t.fid];
		if (d) {
			updateTouch(d, t);

			var n = touchesTarget[d].length;
			console.log('n:', n);
			if (n == 1) { move.update(d); }
			else if (n == 2) { gesture.update(d); }
		}
	},

	remove: function(t) {
		removeTouch(t);
	}
};

// Mouse simulator
(function() {
var mousedown = false;
document.addEventListener('mousedown', function(e) {
	var x = e.clientX / window.innerWidth;
	var y = e.clientY / window.innerHeight;
 	touch.add({ fid: 0, x: x, y: y, nx: e.clientX, ny: e.clientY });
 	mousedown = true;
}, true);
document.addEventListener('mousemove', function(e) {
	if (mousedown) {
		var x = e.clientX / window.innerWidth;
		var y = e.clientY / window.innerHeight;
 		touch.update({ fid: 0, x: x, y: y, nx: e.clientX, ny: e.clientY });
	}
}, true);
document.addEventListener('mouseup', function(e) {
 	touch.remove({ fid: 0 });
 	mousedown = false;
}, true);
})();

function normalizePos(t) {
	t.nx = parseInt(t.x * window.innerWidth);
	t.ny = parseInt(t.y * window.innerHeight);
	return t;
}

var listener = new tuio.Listener({
	cursor_add:    function(t) { touch.add(normalizePos(t)); },
	cursor_update: function(t) { touch.update(normalizePos(t)); },
	cursor_remove: function(t) { touch.remove(normalizePos(t)); }
});

$(document).ready(function() {
	tuio.addListener(listener);
	tuio.start();
});

