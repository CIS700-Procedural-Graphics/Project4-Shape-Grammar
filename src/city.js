import { Geometry } from './main'
import { Node } from './linkedlist'


export default class City {
	constructor() {

	}

	getMaxHeight() {
		// TODO: sum noisezzzessese
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
				var node = new Node(building);
				node.position.set(x * lot, 0, z * lot);
				set.add(node);
			}
		}
		return set;
	}


}