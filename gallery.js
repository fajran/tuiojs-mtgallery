var container;
var ctx;
var w = 300;
var h = 300;
var data = [];
var data_list = [];
var maxZIndex = 1;

var psize = 150;

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

function updatePosition(d) {
	d.obj.css({
		'top': d.y + 'px',
		'left': d.x + 'px'
	});
}

var touchObject = {};

var touch = {
	add: function(fid, x, y) {
		console.log('touch: add:', fid, x, y);
		var d = dataFromPoint(x, y);
		if (d) {
			touchObject[fid] = d;
			d.px = x;
			d.py = y;
			d.x0 = d.x;
			d.y0 = d.y;
			console.log(d.img.src);
			moveToTop(d);
		}
	},

	update: function(fid, x, y) {
		console.log('touch: update:', fid, x, y);
		var d = touchObject[fid];
		if (d) {
			var dx = x - d.px;
			var dy = y - d.py;
			d.x = d.x0 + dx;
			d.y = d.y0 + dy;
			updatePosition(d);
		}
	},

	remove: function(fid, x, y) {
		console.log('touch: remove:', fid, x, y);
		touchObject[fid] = undefined;
	}
};

// Mouse simulator
(function() {
var mousedown = false;
document.addEventListener('mousedown', function(e) {
 	touch.add(0, e.clientX, e.clientY);
 	mousedown = true;
}, true);
document.addEventListener('mousemove', function(e) {
	if (mousedown) {
 		touch.update(0, e.clientX, e.clientY);
	}
}, true);
document.addEventListener('mouseup', function(e) {
 	touch.remove(0, e.clientX, e.clientY);
 	mousedown = false;
}, true);
})();

