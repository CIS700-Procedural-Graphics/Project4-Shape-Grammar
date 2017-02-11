var PI 3.14159265;

var amplitude = 0.8;
var frequency = 2.0;
var num_octaves = 5;
var grads = [new THREE.Vector2(1,1), new THREE.Vector2(-1,1), new THREE.Vector2(1,-1), new THREE.Vector2(-1,-1)];

function hash(vec2 p) {
	return int(mod(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453,12.0));
}

function new_t(t) {
	return 6.0 * t*t*t*t*t - 15.0 * t*t*t*t + 10.0 * t*t*t;
}

function lerp(a, b, t) {
  return a * (1.0-t) + b * t;
}

function cos_lerp(a, b, t) {
  float cos_t = (1.0 - cos(t * PI)) * 0.5;
  return lerp(a,b,cos_t);
}

function blerp(a, b, c, d, u, v) {
	return cos_lerp(cos_lerp(a, b, u), cos_lerp(c, d, u), v);
}

function p_noise(point, freq, amp, t) {
	vec3 p = freq * point/ 10.0 + vec3(t/100.0);
	vec3 cube1 = floor(p); 
	vec3 cube2 = vec3(ceil(p.x), floor(p.yz)); 
	vec3 cube3 = vec3(floor(p.x), ceil(p.y), floor(p.z));
	vec3 cube4 = vec3(ceil(p.xy), floor(p.z));
	vec3 cube5 = vec3(floor(p.xy), ceil(p.z));
	vec3 cube6 = vec3(ceil(p.x), floor(p.y), ceil(p.z));
	vec3 cube7 = vec3(floor(p.x), ceil(p.yz));
	vec3 cube8 = ceil(p);

	var u = new_t((p-cube1).x);
	var v = new_t((p-cube1).y);

	var a = dot(p - cube1, grads[hash(cube1)]);
	var b = dot(p - cube2, grads[hash(cube2)]);
	var c = dot(p - cube3, grads[hash(cube3)]);
	var d = dot(p - cube4, grads[hash(cube4)]);

	return amp * tlerp(a,b,c,d,u,v);
}

function perlin_noise(vec3 p, float freq, float amp, float t) { 
	float x0 = p_noise(p, freq,amp,t);
	float x_1 = p_noise(vec3(p.x - 1.0, p.yz), freq,amp,t);
	float x1 = p_noise(vec3(p.x + 1.0, p.yz), freq,amp,t);
	float y_1= p_noise(vec3(p.x, p.y - 1.0, p.z), freq,amp,t);
	float y1 = p_noise(vec3(p.x, p.y + 1.0, p.z), freq,amp,t);
	float z_1 = p_noise(vec3(p.xy, p.z - 1.0), freq,amp,t);
	float z1 = p_noise(vec3(p.xy, p.z + 1.0), freq,amp,t);
	return x0/4.0 + x_1/8.0 + x1/8.0 + y_1/8.0 + y1/8.0 + z_1/8.0 + z1/8.0;
}
function noise() {
	var noise = 0.0;
    for (var i = 0; i < 20; i++) {
    	if (i < num_octaves) {
    		freq = pow(frequency, float(i));
    		amp = pow(amplitude, float(i));
    		noise += p_noise(position, freq, amp, time);
    	}	
    }
    return noise;
}

export function popMap(mesh, curve, params) {
	var map[512][512];
	for (var i = 0; i < 512; i ++) {
		for (var j = 0; j < 512; j ++) {

		}
	}
    return map;
}