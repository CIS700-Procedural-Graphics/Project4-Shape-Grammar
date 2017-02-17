const THREE = require('three');
function fract(fraction)
{
  return fraction % 1;
}
function noise_gen(pos)
{
  var k = new THREE.Vector3(12.9898, 78.233, 39.73);
  return fract(Math.sin(k.dot(pos)) * 43758.545);
}

function lerp(a, b, t)
{
  return a * (1.0 - t) + b * t;
}

function cerp(a, b, t) {
  var cos_t = (1.0 - Math.cos(t * Math.PI)) * 0.5;
  return a * (1.0 - cos_t) + b * cos_t;
}

function noise_interpolate(pos, fq)
{
  pos.x *= 0.2;
  pos.y *= 0.2;
  pos.z *= 0.2;
  var a = new THREE.Vector3(Math.floor(pos.x), Math.ceil(pos.y), Math.ceil(pos.z));
  var b = new THREE.Vector3(Math.ceil(pos.x), Math.ceil(pos.y), Math.ceil(pos.z));
  var c = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.ceil(pos.z));
  var d = new THREE.Vector3(Math.ceil(pos.x), Math.floor(pos.y), Math.ceil(pos.z));

  var e = new THREE.Vector3(Math.floor(pos.x), Math.ceil(pos.y), Math.floor(pos.z));
  var f = new THREE.Vector3(Math.ceil(pos.x), Math.ceil(pos.y), Math.floor(pos.z));
  var g = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
  var h = new THREE.Vector3(Math.ceil(pos.x), Math.floor(pos.y), Math.floor(pos.z));

  var ab = cerp(noise_gen(a), noise_gen(b), fract(pos.x));
  var cd = cerp(noise_gen(c), noise_gen(d), fract(pos.x));
  var abcd = cerp(cd, ab, fract(pos.y));

  var ef = cerp(noise_gen(e), noise_gen(f), fract(pos.x));
  var gh = cerp(noise_gen(g), noise_gen(h), fract(pos.x));
  var efgh = cerp(gh, ef, fract(pos.y));

  return cerp(efgh, abcd, fract(pos.z));
}

export function pnoise(pos)
{
  var total = 0.0;

	for (var i = 0; i < 16; ++i)
	{
		var fq = Math.pow(2.0, i);
		var amplitude = Math.pow(0.59, i);

		total += noise_interpolate(pos, fq) * amplitude;
	}
  //console.log(total);
  return (total + 2) / 4;
}