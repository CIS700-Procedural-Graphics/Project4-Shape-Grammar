const THREE = require('three');
import { Geometry } from './ref'
import { Node } from './linkedlist'

const NUM_OCTAVES = 10;


function Lot(position, lotSize, ratios, maxHeight) {
	this.position = position;
	this.lotSize = lotSize;
	this.maxHeight = maxHeight;
	this.ratios = ratios;
}

export default class City {
	constructor() {
		this.citySize = {x: 50, z: 40};
		this.roadSize = 3;
		this.baseHeight = 2;
	}

	/**
	 * Pseudo-random noise generator
	 */
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

	/**
	 * Multi-octave noise generator
	 */
	multiOctaveNoise(x, y , z) {
		var total = 0;
		var persistence = 0.5;

		for (var i = 1; i <= NUM_OCTAVES; i++) {
			var freq = 50 * Math.pow(2, i);
			var amp = Math.pow(persistence, i);
			total += this.interp_noise(x, y, z, freq) * amp;
		}

		return total;
	}

	/**
	 * Returns the max height for a building based on its position
	 * Height calculated by multi-octave noise and location within the
	 * city (i.e. buildings toward the center are more likely to be taller)
	 */
	getMaxHeight(x, y, z) {
		var height = 5;
		var noise = this.multiOctaveNoise(x, y, z);

		var loc = 1 - Math.max(Math.abs(0.5 - x / (this.citySize.x - 1)), 
							   Math.abs(0.5 - z / (this.citySize.z - 1)));
		noise *= loc;

		return noise * height + this.baseHeight;
	}

	/**
	 * Randomly chooses a shape based on the given probabilities (ratios)
	 */
	chooseShape(ratios) {
		var rand = Math.random();
		var shapes = Object.keys(ratios);
		var rand = Math.random(); 
		var loBound, hiBound;
		for (var i = 0; i < shapes.length; i++) {	
	      var pr = ratios[shapes[i]];
	      if (i === 0) {
	        loBound = 0;
	        hiBound = pr;
	      } else {
	        loBound = hiBound;
	        hiBound += pr;
	      }

	      if (rand >= loBound && rand <= hiBound) { 
	        return shapes[i];
	      }

		}
	}

	/**
	 * Populate each Lot in lots with building nodes
	 * Every lot will have 2 rows of nodes length-wise
	 */
	renderLots(lots) {
		var buildingSize = 1.5;
		var set = new Set(); 
		for(var i = 0; i < lots.length; i++) {
			var lot = lots[i];
			var pos = lot.position;
			var isPark = Math.random() > 0.95;
			var savedOffset = null;

			// Adjust building size according to the lot's maxHeight
			var sz = buildingSize * lot.maxHeight / this.baseHeight;

			var len = lot.lotSize.x >= lot.lotSize.z ? 'x': 'z';
			var width = len == 'x' ? 'z' : 'x';

			// Scale buildings up to fill up the space in the middle of the lot
			var scale = lot.lotSize[width] * 0.5 / sz;

			for (var j = 0; j < lot.lotSize[len]; j += sz * scale) {
				var building1 = isPark ? 'PARK' : this.chooseShape(lot.ratios);
				var node1 = new Node(building1, 0);
				var building2 = isPark ? 'PARK' : this.chooseShape(lot.ratios);
				var node2 = new Node(building2, 0);

				if (isPark) {
					var n = lot.lotSize[len] / buildingSize;
					node1.scale[len] = lot.lotSize[len] / n;
					node2.scale[len] = lot.lotSize[len] / n;
					node1.scale[width] =  lot.lotSize[width] * 0.5 / buildingSize;
					node2.scale[width] =  lot.lotSize[width] * 0.5 / buildingSize;
					savedOffset = savedOffset ? savedOffset : node1.colorOffset;
					node1.colorOffset = savedOffset;
					node2.colorOffset = savedOffset;
				} else {
					node1.scale.set(scale, 1, scale);
					node2.scale.set(scale, 1, scale);
				}
				
				node1.position.set(pos.x, pos.y, pos.z);
				node1.position[len] += j;
				node1.position[width] += sz / 2;

				var lilNoise1 = this.noise(node1.position.x, node1.position.y,
					node1.position.z) ;
				node1.maxHeight = lot.maxHeight + lilNoise1;	

				
				node2.position.set(pos.x, pos.y, pos.z); 
				node2.position[len] += j;
				node2.position[width] += lot.lotSize[width] - sz / 2;

				var lilNoise2 = this.noise(node2.position.x, node2.position.y,
					node2.position.z) ;
				node2.maxHeight = lot.maxHeight + lilNoise2;

				set.add(node1);
				set.add(node2);
			}
		}
		return set;
	}

	/**
	 * Returns a set of building nodes
	 * Areas with higher density (height) will have more skyscrapers
	 */
	makeCity() {
		var apt = 'GROUND_FLOOR_APT';
		var sky = 'GROUND_FLOOR_SKY';
		var park = 'PARK';
		var lotSize = {x: 5, z: 10};

		var lots = [];


		for (var x = 0; x < this.citySize.x; x += this.roadSize + lotSize.x) {
			for (var z = 0; z < this.citySize.z; z += this.roadSize + lotSize.z) {
				var position = new THREE.Vector3(x, 0, z);
				var height = this.getMaxHeight(x, Math.random(), z);
				var ratios = {};

				ratios[sky] = 0.6 - 1 / height * 0.1;
				ratios[apt] = 1  - ratios[sky];


				var lot = new Lot(position, lotSize, ratios, height);
				lots.push(lot);
			}
		}

		var totalSet = this.renderLots(lots);
		return totalSet;
	}


}