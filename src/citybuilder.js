const THREE = require('three');
import ShapeGrammar from './shapegrammar.js'


class BuildingNode {
	constructor(sym, geo, pos, scale, parent) {
		this.symbol = sym;
		this.geometry = geo;
		this.position = pos;
		this.scale = scale;
		this.parent = parent;
	}
}

export default class CityBuilder {

  constructor(initial_state, generations) {
    this.uptown_buildings = [];
    this.midtown_buildings = [];
    this.downtown_buildings = [];
    this.generations = generations;

    // define base geometries
    var skyscraper = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    var skyscraper_material = new THREE.MeshLambertMaterial({color: '#841F27', side: THREE.FrontSide });
    var skyscraper_mesh = new THREE.Mesh(skyscraper, skyscraper_material);
    skyscraper_mesh.position.y = skyscraper_mesh.geometry.parameters.height / 2.0;

    this.geometries = {
      skyscraper: skyscraper_mesh,
      brownstone: null,
      condo: null
    }
    this.initialize_city(initial_state);
  }

  initialize_city(initial_state) {
    for (var i = 0; i < initial_state.length; i++) {
      switch(initial_state[i]) {
        case 'M':
          var posX = Math.random() * 10 - 5;
          var posZ = Math.random() * 8 - 4;
          var pos = new THREE.Vector3(posX, 0, posZ);
          console.log(pos);
          var scale = new THREE.Vector3(1, 1, 1);
          var building_node = new BuildingNode('M', this.geometries.skyscraper.clone(), pos, scale, null);
          this.midtown_buildings.push(building_node);
          break
        case 'U':
          break
        case 'D':
          break
      }
    }
  }

  expand_city() {
    for (var i = 0; i < this.generations; i++) {
      // uptown expansion

      // midtown expansion
      for (var j = 0; j < this.midtown_buildings.length; j++) {
        var building = midtown_buildings[j];
        
      }
      // downtown expansion
      
    }
  }

}

//class LinkedList {
//   constructor() {
//     this.head = undefined;
//     this.tail = undefined;
//   }

//   add_first(value) {
//    var node = new ShapeNode(undefined, undefined, value);
//     if (this.head === undefined) {
//       this.head = node;
//       this.tail = node;
//     }
//     else {
//       node.next = this.head;
//       this.head.prev = node;
//       this.head = node;
//     }
//   }

//   add_last(value) {
//     var node = new ShapeNode(undefined, undefined, value);
//     if (this.tail === undefined) {
//       this.head = node;
//       this.tail = node;
//     }
//     else {
//       node.prev = this.tail;
//       this.tail.next = node;
//       this.tail = node;
//     }
//   }

//   remove_first() {
//     var temp = this.head;
//     if (this.head === undefined) {
//       return;
//     }
//     else if (this.head.next === undefined) {
//       this.head = undefined;
//       this.tail = undefined;
//     }
//     else {
//       this.head.next.prev = undefined;
//       this.head = this.head.next;
//     }
//     temp.next = undefined;
//   }

//   remove_last() {
//     var temp = this.tail;
//     if (this.tail === undefined) {
//       return;
//     }
//     else if (this.head === this.tail) {
//       this.head = undefined;
//       this.tail = undefined;
//     }
//     else {
//       this.tail.prev.next = undefined;
//       this.tail = this.tail.prev;
//     }
//     temp.prev = undefined;
//   }

//   // this method will only be called on valid nodes
//   link_nodes(n1, n2) {
//     if (n1 !== undefined) {
//       n1.next = n2;
//     }
//     else {
//       this.head = n2;
//     }
//     if (n2 !== undefined) {
//       n2.prev = n1;
//     }
//     else {
//       this.tail = n1;
//     }
//   }
// }

//function stringToLinkedList(input_string) {
//     var ll = new LinkedList();
//     for (var i = 0, len = input_string.length; i < len; i++) {
//       ll.add_last(input_string[i]);
//     }
//     return ll;
// }

// function linkedListToString(linkedList) {
//   var result = "";
//   var curr = linkedList.head;
//   while (curr !== undefined) {
//     result += curr.sym;
//     curr = curr.next;
//   }
//   return result;
// }

// function print_list(linkedList) {
//   var curr = linkedList.head;
//   var res = '';
//   while (curr !== undefined) {
//     res += curr.sym;
//     curr = curr.next;
//   }
//   console.log(res);
// }





// // insert a sub-linked-list that represents replacementString
// function replaceShapeNode(linkedList, node, replacementString) {
//   var new_list = stringToLinkedList(replacementString);
//   var new_list_head = new_list.head;
//   var new_list_tail = new_list.tail;
//   // append head of new list
//   if (node === linkedList.head) {
//     linkedList.link_nodes(undefined, new_list_head);
//   }
//   else {
//     linkedList.link_nodes(node.prev, new_list_head);
//   }
//   // then do tail of new list
//   if (node === linkedList.tail) {
//     linkedList.link_nodes(new_list_tail, undefined);
//   }
//   else {
//     linkedList.link_nodes(new_list_tail, node.next);
//   }
// }