const THREE = require('three')

var SHAPES = {
  BOX: 0
}

var Random = {
  sign: function() { return Math.random() > 0.5 ? -1 : 1; }
}

export default class Builder {

    constructor() {
      this.materials = {};
      this.objects = {};
    }

    loadResources(callback) {
      var resources = [];

      var tex_loader = new THREE.TextureLoader();
      var load_texture = (function(key, path, resolve, reject) {
        var texture = tex_loader.load(path);
        this.materials[key] = new THREE.MeshBasicMaterial({map: texture, overdraw: 0.5});
        if (texture) {
          resolve("Successfully loaded texture");
        } else {
          reject(Error("Could not load texture"));
        }
      }).bind(this);

      // var manager = new THREE.LoadingManager();
      // manager.onProgress = function ( item, loaded, total ) {
      //   console.log( item, loaded, total );
      // };
      // var obj_loader = new THREE.OBJLoader(manager);
      // var mtl_loader = new THREE.MTLLoader(manager);
      // var load_object = (function(key, objpath, mtlpath, resolve, reject) {
      //   mtl_loader.load(mtlpath, (function(materials) {
      //     materials.preload();
      //     obj_loader.setMaterials(materials);
      //     obj_loader.load(path, (function(object) {
      //       this.objects[key] = object;
      //       if (object) {
      //         resolve("Successfully loaded object");
      //       } else {
      //         reject(Error("Could not load object"));
      //       }
      //     }).bind(this));
      //   }).bind(this));
      // }).bind(this);

      resources.push(new Promise(function(resolve, reject) {
        load_texture('floor', './textures/floor06.tga', resolve, reject);
      }));

      resources.push(new Promise(function(resolve, reject) {
        load_texture('skyscraper1', './textures/skyscraper1.jpg', resolve, reject);
      }));

      resources.push(new Promise(function(resolve, reject) {
        load_texture('crate', './textures/crate.png', resolve, reject);
      }));

      // resources.push(new Promise(function(resolve, reject) {
      //   load_object('ramp', './models/ramp.obj', resolve, reject);
      // }));

      return Promise.all(resources);
        // var loader = new THREE.TextureLoader();
        // var texture1 = loader.load('./textures/floor06.tga');
        // var texture2 = loader.load('./textures/crate.png');
        //
        // this.materials = {
        //     road_material: new THREE.MeshBasicMaterial({map: texture1, overdraw: 0.5}),
        //     crate_material:  new THREE.MeshBasicMaterial({map: texture2, overdraw: 0.5}),
        //  };
        //
        // var manager = new THREE.LoadingManager();
 			// 	manager.onProgress = function ( item, loaded, total ) {
 			// 		console.log( item, loaded, total );
 			// 	};
        // var obj_loader = new THREE.OBJLoader( manager );
        // var objects = {};
        // var add_object = (function(object) {
        //   this.objects['ramp'] = object;
        //   console.log(this.objects);
        // }).bind(this);
        // obj_loader.load( './models/ramp.obj', add_object);
    }

    scale(parent, sl, sw, sh) {
      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          child.l = parent.l * sl;
          child.w = parent.w * sw;
          child.h = parent.h * sh;
          return [child];
      }

      return [];
    }

    rotate(parent, rx, ry, rz) {
      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          child.rx = parent.rx + rx;
          child.ry = parent.ry + ry;
          child.rz = parent.rz + rz;
          return [child];
      }

      return [];
    }

    billboard(parent) {
      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          var sign = Random.sign();
          if (Math.random() > 0.5) {
            child.l = parent.l * 0.8;
            child.w = parent.w * 0.1;
            child.h = parent.h / 3;
            child.x = parent.x;
            child.y = parent.y + 0.5 * parent.h  - 0.1 * parent.h - 0.5 * child.h;
            child.z = parent.z + sign * 0.5 * parent.w;
          } else {
            child.l = parent.l * 0.1;
            child.w = parent.w * 0.8;
            child.h = parent.h / 3;
            child.x = parent.x + sign * 0.5 * parent.l;
            child.y = parent.y + 0.5 * parent.h  - 0.1 * parent.h - 0.5 * child.h;
            child.z = parent.z;
          }
          return [parent, child];
      }

      return [parent];
    }

    sign(parent) {
      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          var sign1 = Random.sign(); // which part face
          var sign2 = Random.sign(); // which face

          if (Math.random() > 0.5) {
            child.l = parent.w * 0.05; // sign thickness
            child.w = parent.y * 0.1; // sign wideness
            child.h = parent.h * 0.5;
            child.x = parent.x + sign1 * (0.5 * parent.l - child.l);
            child.y = parent.y;
            child.z = parent.z + sign2 * (0.5 * parent.w + 0.5 * child.w);
          } else {
            child.l = parent.y * 0.1; // sign wideness
            child.w = parent.w * 0.05; // sign thickness
            child.h = parent.h * 0.5;
            child.x = parent.x + sign2 * (0.5 * parent.l + 0.5 * child.l);
            child.y = parent.y;
            child.z = parent.z + sign1 * (0.5 * parent.w - child.w);
          }

          return [parent, child];
      }

      return [parent];
    }


    hdivide(parent) {
      switch (parent.type) {
        case SHAPES.BOX:
          var child1 = (JSON.parse(JSON.stringify(parent)));
          child1.l = parent.l / 2;
          child1.x = parent.x + parent.l / 4;

          var child2 = (JSON.parse(JSON.stringify(parent)));
          child2.l = parent.l / 2;
          child2.x = parent.x - parent.l / 4;

          return [child1, child2];
      }

      return [];
    }


    vdivide(parent) {
      switch (parent.type) {
        case SHAPES.BOX:
            var child1 = (JSON.parse(JSON.stringify(parent)));
            child1.h = parent.h / 2;
            child1.y = parent.y + (parent.h / 4);

            var child2 = (JSON.parse(JSON.stringify(parent)));
            child2.h = parent.h / 2;
            child2.y = parent.y - (parent.h / 4);

          return [child1, child2];
      }

      return [];
    }

    evalShapes(scene, shapes, pos) {
      var col = 0;
      for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        switch (shape.type) {
          case SHAPES.BOX:
            var geometry = new THREE.BoxGeometry(shape.l, shape.h, shape.w);

            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(shape.x, shape.y, shape.z));
            geometry.rotateX(shape.rx);
            geometry.rotateY(shape.ry);
            geometry.rotateZ(shape.rz);
            var material = col == 0 ? new THREE.MeshBasicMaterial({color: 0x0000ff}) :
            col == 1 ? new THREE.MeshBasicMaterial({color: 0xff0000}) :
            new THREE.MeshBasicMaterial({color: 0x00ff00});
            col = (col + 1) % 4;
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos.x, 0, pos.z);
            scene.add(mesh);
            break;
        }
      }
    }

    generateBuilding(scene, options) {
        var box_length = options.length * 2;
        var box_width = options.width * 2;
        var box_height = options.height;


        var shape = {
          type: SHAPES.BOX,
          l: options.length,
          w: options.width,
          h: options.height,
          x: 0,
          y: 0.5 * options.height,
          z: 0,
          rx: 0,
          ry: 1,
          rz: 0
        };

        var t = this.vdivide(shape);
        var s = t.pop();
        // var s = t.pop();
        var t1 = this.sign(s);
        var shapes = t.concat(t1);
        // var s1 = t1.pop();
        // var t2 = this.scale(s1, 1, 1, 1);
        // var s2 = t2.pop();
        // var t3 = this.billboard(s2);


        this.evalShapes(scene, shapes, {x: options.x, z: options.z});

        return;
    }

}
