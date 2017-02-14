const THREE = require('three')

var amplitude = 0.8;
var frequency = 2.0;
var num_octaves = 1;
var grads = [new THREE.Vector2(1,1), new THREE.Vector2(-1,1), new THREE.Vector2(1,-1), new THREE.Vector2(-1,-1)];

function hash(p) {
	return Math.floor(Math.sin(new THREE.Vector2(12.9898, 78.233).dot(p))*43758.5453) % 4;
}

function new_t(t) {
	return 6.0 * t*t*t*t*t - 15.0 * t*t*t*t + 10.0 * t*t*t;
}

function lerp(a, b, t) {
  return a * (1.0-t) + b * t;
}

function cos_lerp(a, b, t) {
  var cos_t = (1.0 - Math.cos(t * Math.PI)) * 0.5;
  return lerp(a,b,cos_t);
}

function blerp(a, b, c, d, u, v) {
	return cos_lerp(cos_lerp(a, b, u), cos_lerp(c, d, u), v);
}

function p_noise(point, freq, amp) {
	var p = point.clone().multiplyScalar(freq).divideScalar(10);
	var cube1 = p.clone().floor(); 
	var cube3 = p.clone().ceil();
	var cube2 = new THREE.Vector2(cube3.x, cube1.y); 
	var cube4 = new THREE.Vector2(cube1.x, cube3.y);
	

	var u = new_t(p.clone().sub(cube1).x);
	var v = new_t(p.clone().sub(cube1).y);

	var a = p.clone().sub(cube1).dot(grads[hash(cube1)]);
	var b = p.clone().sub(cube2).dot(grads[hash(cube2)]);
	var c = p.clone().sub(cube3).dot(grads[hash(cube3)]);
	var d = p.clone().sub(cube4).dot(grads[hash(cube4)]);

	return amp * blerp(a,b,c,d,u,v);
}

function noise(position) {
	var noise = 0;
    for (var i = 0; i < num_octaves; i++) {
    	var freq = Math.pow(frequency, i);
    	var amp = Math.pow(amplitude, i);
    	noise += p_noise(position, freq, amp);	
    }
    return noise;
}

// returns 2D perlin texture map
export function popMap(x, y) {
	var map = [];
	// debugger;
	for (var i = 0; i < x; i ++) {
		var row = [];
		for (var j = 0; j < y; j ++) {
			var pos = new THREE.Vector2(i/x, j/y);
			row.push(noise(pos));
		}

		map.push(row);
	}
    return map;
}