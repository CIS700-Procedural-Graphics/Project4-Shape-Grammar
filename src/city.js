const THREE = require('three');
import { Geometry } from './main'
import { Node } from './linkedlist'


export default class City {
	constructor() {

	}

	noise(x, y, z) {
		var v1 = new THREE.Vector3(x, y, z);
		var v2 = new THREE.Vector3(12.9898,78.233, 34.2838);
		var n = (Math.sin(v1.dot(v2)) * 43758.5453) % 1;
		//map to [0, 1]
		n = n / 2 + 0.5;
		return n;
	}

	cosine_interp(a, b, t) {
		var cos_t = (1 - Math.cos(t * Math.PI)) * 0.5;
		return a * (1 - cos_t) + b * cos_t;
	}

	interp_noise(x, y, z, freq) {
		var x0 = Math.floor(x * freq) / freq,
			y0 = Math.floor(y * freq) / freq,
			z0 = Math.floor(z * freq) / freq,
		 	x1 = (x0 * freq + 1) / freq,
		 	y1 = (y0 * freq + 1) / freq,
		 	z1 = (z0 * freq + 1.0) / freq;

		var p1 = this.noise(x0, y0, z0),
			p2 = this.noise(x1, y0, z0),
			p3 = this.noise(x0, y1, z0),
			p4 = this.noise(x0, y0, z1),
			p5 = this.noise(x0, y1, z1),
			p6 = this.noise(x1, y1, z0),
			p7 = this.noise(x1, y0, z1),
			p8 = this.noise(x1, y1, z1);

		var dx = (x - x0) / (x1 - x0),
			dy = (y - y0) / (y1 - y0),
			dz = (z - z0) / (z1 - z0);

		// Interpolate along x
		var a1 = this.cosine_interp(p1, p2, dx),
			a2 = this.cosine_interp(p4, p7, dx), 
			a3 = this.cosine_interp(p3, p6, dx),
			a4 = this.cosine_interp(p5, p8, dx);

		// Interpolate along y
		var b1 = this.cosine_interp(a1, a3, dy),
			b2 = this.cosine_interp(a2, a4, dy);

		// Interpolate along z
		var c = this.cosine_interp(b1, b2, dz);
		return c; 

	}

	getMaxHeight(x, y, z) {
		var height = 5;
		var baseHeight = 2;
		return this.interp_noise(x, y, z, 2) * height + baseHeight;
	}

	/**
	 * Returns a set of nodes
	 */
	makeCity() {
		var apt = 'GROUND_FLOOR_APT';
		var sky = 'GROUND_FLOOR_SKY';
		var set = new Set();
		var lot = 4;

		for (var x = 0; x < 10; x++) {
			for (var z = 0; z < 10; z++) {
				var building = Math.random() > 0.5 ? apt : sky;
				var node = new Node(building, 0);
				node.maxHeight = this.getMaxHeight(x, x * z, z);
				node.position.set(x * lot, 0, z * lot);
				set.add(node);
			}
		}
		return set;
	}


}