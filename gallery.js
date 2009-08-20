var container;
var ctx;
var w = 300;
var h = 300;
var data = [];
var data_list = [];

var psize = 150;

function load(d) {
	var res = {
	};

	res.loaded = false;
	res.img = new Image();
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
		'left': d.x+'px'
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

function updatePosition(d) {
	d.obj.css({
		'top': d.y + 'px',
		'left': d.x + 'px'
	});
}

var touch = {
	add: function(fid, x, y) {
		console.log('touch: add:', fid, x, y);
	},

	update: function(fid, x, y) {
		console.log('touch: update:', fid, x, y);
	},

	remove: function(fid, x, y) {
		console.log('touch: remove:', fid, x, y);
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

