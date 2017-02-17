const THREE = require('three')

var SHAPES = {
  BOX: 0,
  ICOSAHEDRON: 1
}

var SYMBOLS = {
  A: 0,
  C: 1,
  U: 2, // uniform middle levels
  T: 3, // top levels
  B: 4, // bottom levels
  S: 5, // side appendages
  X: 6 // terminal
}

var Random = {
  sign: function() { return Math.random() > 0.5 ? -1 : 1; }
}

export default class Builder {

    constructor() {
      this.materials = {};
      this.objects = {};
    }

    getRandomAd() {
      if (Math.random() < 0.7) {
        var c = Math.floor(Math.random() * 16777215);
        return new THREE.MeshBasicMaterial({color: c});
      } else {
        return this.materials.billboard[Math.floor(Math.random() * this.materials.billboard.length)];
      }
    }

    getRandomTicker() {
      var phrases = [
        'NASDAQ',
        '105    43   21',
        'Dow 30',
        '20,619.77',
        '-2.03 (-0.09%)',
        'S&P 500',
        'Pigeon Alert! Extreme Pigeon Danger!',
        'Lunar Eclipse Obscured By Clouds',
        'Rumor Of Kitty Kibble Shortage Causes Futures To Drop; Consumers Stockpile',
      ];

      var top_phrase = phrases[Math.floor(Math.random() * phrases.length)];
      var bot_phrase = phrases[Math.floor(Math.random() * phrases.length)];

      var w = 1024;
      var h = 256;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var context = canvas.getContext('2d');
      context.fillStyle = '#000000';
      context.fillRect(0,0,w,h);
      context.font = "bold 100px Arial";
      context.fillStyle = '#ffc935'
      context.fillText(top_phrase,128,128);
      context.fillText(bot_phrase,800,200);

      context.fillStyle = '#000000';
      context.lineWidth = 3;
      for (var i = 0; i < w; i+=10) {
          context.beginPath();
          context.moveTo(i,0);
          context.lineTo(i,h);
          context.stroke();
      }

      for (var i = 0; i < h; i+=10) {
          context.beginPath();
          context.moveTo(0,i);
          context.lineTo(w,i);
          context.stroke();
      }
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      var material  = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide
      });

      return material;
    }

    getRandomSign() {
      var c = Math.floor(Math.random() * 16777215);
      return new THREE.MeshBasicMaterial({color: c});
    }

    loadResources(callback) {
      var resources = [];

      var tex_loader = new THREE.TextureLoader();
      var load_texture = (function(set, key, path, resolve, reject) {
        var texture = tex_loader.load(path);
        if (set !== undefined) {
          if (!this.materials[set]) {
            this.materials[set] = [];
          }
          this.materials[set].push(new THREE.MeshLambertMaterial({map: texture, overdraw: 0.5}));
        } else {
          this.materials[key] = new THREE.MeshLambertMaterial({map: texture, overdraw: 0.5});
        }
        if (texture) {
          resolve("Successfully loaded texture");
        } else {
          reject(Error("Could not load texture"));
        }
      }).bind(this);

      resources.push(new Promise(function(resolve, reject) {
        load_texture('billboard', 'ad1', './textures/ad1.jpg', resolve, reject);
      }));

      resources.push(new Promise(function(resolve, reject) {
        load_texture('billboard', 'ad2', './textures/ad2.jpg', resolve, reject);
      }));

      resources.push(new Promise(function(resolve, reject) {
        load_texture('billboard', 'ad2', './textures/ad3.png', resolve, reject);
      }));

      return Promise.all(resources);
    }

    /*************************** Basic Operations *****************************/

    scale(parent, sl, sw, sh) {
      if (parent.isTerminal) {
        return [parent];
      }

      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          child.l = parent.l * sl;
          child.w = parent.w * sw;
          child.h = parent.h * sh;
          return [child];
      }

      return [parent];
    }

    rotate(parent, rx, ry, rz) {
      if (parent.isTerminal) {
        return [parent];
      }

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
      if (parent.isTerminal) {
        return [parent];
      }

      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          var sign = Random.sign();
          if (Math.random() > 0.5) {
            child.l = parent.l * 0.8;
            child.w = parent.w * 0.1;
            child.h = parent.h;
            child.x = parent.x;
            child.y = parent.y + 0.5 * parent.h  - 0.1 * parent.h - 0.5 * child.h;
            child.z = parent.z + sign * 0.5 * parent.w;
            child.material = this.getRandomAd();
            child.isTerminal = true;
          } else {
            child.l = parent.l * 0.1;
            child.w = parent.w * 0.8;
            child.h = parent.h;
            child.x = parent.x + sign * 0.5 * parent.l;
            child.y = parent.y + 0.5 * parent.h  - 0.1 * parent.h - 0.5 * child.h;
            child.z = parent.z;
            child.material = this.getRandomAd();
            child.isTerminal = true;
          }

          parent.isTerminal = true; // makes sure the sign isnt floating

          return [parent, child];
      }

      return [parent];
    }

    sign(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          var sign1 = Random.sign(); // which part face
          var sign2 = Random.sign(); // which face

          if (Math.random() > 0.5) {
            child.l = parent.w * 0.05; // sign thickness
            child.w = parent.y * 0.1; // sign wideness
            child.h = parent.h * 0.5; // sign height
            child.x = parent.x + sign1 * (0.5 * parent.l - child.l);
            child.y = parent.y;
            child.z = parent.z + sign2 * (0.5 * parent.w + 0.5 * child.w);
            child.isTerminal = true;
          } else {
            child.l = parent.y * 0.1; // sign wideness
            child.w = parent.w * 0.05; // sign thickness
            child.h = parent.h * 0.5; // sign height
            child.x = parent.x + sign2 * (0.5 * parent.l + 0.5 * child.l);
            child.y = parent.y;
            child.z = parent.z + sign1 * (0.5 * parent.w - child.w);
            child.isTerminal = true;
          }
          child.material = this.getRandomSign();
          parent.isTerminal = true; // makes sure the sign isnt floating
          return [parent, child];
      }

      return [parent];
    }

    ticker(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

      switch (parent.type) {
        case SHAPES.BOX:
          var child = (JSON.parse(JSON.stringify(parent)));
          child.l = parent.l * 1.1;
          child.w = parent.w * 1.1;
          child.h = parent.h * 0.9;
          child.material = this.getRandomTicker();
          child.isTerminal = true;

          parent.isTerminal = true; // makes sure the sign isnt floating
          return [parent, child];
      }
      return [parent];
    }


    hdivide(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

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

      return [parent];
    }

    hzdivide(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

      switch (parent.type) {
        case SHAPES.BOX:
          var child1 = (JSON.parse(JSON.stringify(parent)));
          child1.w = parent.w / 2;
          child1.z = parent.z + parent.w / 4;

          var child2 = (JSON.parse(JSON.stringify(parent)));
          child2.w = parent.w / 2;
          child2.z = parent.z - parent.w / 4;

          return [child1, child2];
      }

      return [parent];
    }


    vdivide(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

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

      return [parent];
    }

    subdivide(parent) {
      if (parent.isTerminal) {
        return [parent];
      }

      var children = [];
      var v_parts = this.vdivide(parent);
      var temp = [];
      v_parts.forEach((function(s) {
        temp.push(this.hdivide(s));
      }).bind(this));
      var h_parts = [].concat.apply([], temp);
      var temp = [];
      h_parts.forEach((function(s) {
        temp.push(this.hzdivide(s));
      }).bind(this));
      children.push([].concat.apply([], temp));

      return [].concat.apply([], children);
    }

    swap(parent, type) {
      if (parent.isTerminal) {
        return [parent];
      }

      switch (type) {
        case SHAPES.ICOSAHEDRON:
        var child = (JSON.parse(JSON.stringify(parent)));
        child.type = SHAPES.ICOSAHEDRON;
        child.detail = 1;
        child.radius = Math.min(child.l, child.w);
        return [child];
      }
      return [parent];
    }

    deleteShape(parent) {
      if (parent.isTerminal) {
        return [parent];
      }
      return [];
    }

    /************************** Composite Operations **************************/

    uniform(parent, n) {
      var children = [parent];
      for (var j = 0; j < n; j++) {
        var levels = [];
        for (var i = 0; i < children.length; i++) {
          var c = this.vdivide(children[i]);
          levels.push(c[0]);
          levels.push(c[1]);
        }
        children = levels;
      }
      return children;
    }

    huniform(parent, n) {
      var children = [parent];
      for (var j = 0; j < n; j++) {
        var levels = [];
        for (var i = 0; i < children.length; i++) {
          var c = this.hdivide(children[i]);
          levels.push(c[0]);
          levels.push(c[1]);
        }
        children = levels;
      }
      return children;
    }


    /************************** Assembly Operations ***************************/

    iterate(shape) {
      switch (shape.symbol) {
          case SYMBOLS.A:
            var r = Math.random();
            if (Math.random() < 0.7) {
              shape.symbol = SYMBOLS.C;
              return [shape];
            } else {
              var levels = this.huniform(shape, 2);
              for (var i = 0; i < levels.length; i++) {
                levels[i].symbol = SYMBOLS.C;
              }
              levels[0].symbol = SYMBOLS.S;
              levels[levels.length-1].symbol = SYMBOLS.S;
              return levels;
            }
          case SYMBOLS.C:
            if (Math.random() > 0.3) { // UNIFORM
              var levels = this.uniform(shape, 3);
              for (var i = 0; i < levels.length; i++) {
                levels[i].symbol = SYMBOLS.U;
              }
            } else { // TOP-BOTTOM
              var levels = this.uniform(shape, 3);
              for (var i = 0; i < levels.length; i++) {
                levels[i].symbol = SYMBOLS.U;
              }
              levels[0].symbol = SYMBOLS.T;
              levels[levels.length-1].symbol = SYMBOLS.B;
            }
            return levels;
          case SYMBOLS.U:
            switch (this.uparam.type) {
              case 0:
              var level = this.billboard(shape);
              level[0].symbol = SYMBOLS.X;
              level[1].symbol = SYMBOLS.X;
              break;
              case 1:
              var level = this.sign(shape);
              level[0].symbol = SYMBOLS.X;
              level[1].symbol = SYMBOLS.X;
              break;
              case 2:
              var levels = this.vdivide(shape);
              var ratio = this.uparam.r;
              var l0 = this.scale(levels[0], 1, 1, 1 + ratio);
              l0[0].symbol = SYMBOLS.X;
              var l1 = this.scale(levels[1], 0.9, 0.9, 1 - ratio);
              l1[0].symbol = SYMBOLS.X;
              var level = [l0[0], l1[0]];
              break;
            }
            return level;
          case SYMBOLS.T:
            if (Math.random() < 0.5) {
              var level = this.ticker(shape);
              level[0].symbol = SYMBOLS.X;
              level[1].symbol = SYMBOLS.X;
            } else {
              var sr = Math.random() / 2 + 0.5;
              var level = this.scale(shape, sr, sr, 1);
              level[0].symbol = SYMBOLS.X;
            }
            return level;
          case SYMBOLS.B:
            var level = this.scale(shape, 1.2, 1.2, 1);
            level[0].symbol = SYMBOLS.X;
            return level;
          case SYMBOLS.S:
            var level = this.scale(shape, 0.8, 0.8, 0.8);
            level[0].symbol = SYMBOLS.X;
            return level;
          default:
            return [shape];
      }
    }

    evalShapes(scene, shapes, pos) {
      for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        switch (shape.type) {
          case SHAPES.BOX:
            var geometry = new THREE.BoxGeometry(shape.l, shape.h, shape.w);
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(shape.x, shape.y, shape.z));
            geometry.rotateX(shape.rx);
            geometry.rotateY(shape.ry);
            geometry.rotateZ(shape.rz);
            if (shape.material) {
              var material = shape.material;
            } else {
              var material = new THREE.MeshLambertMaterial({color: this.color});
            }
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos.x, 0, pos.z);
            scene.add(mesh);
            var geo = new THREE.EdgesGeometry(mesh.geometry);
            var mat = new THREE.LineBasicMaterial( { color: 0xcccccc, linewidth: 1 } );
            var wireframe = new THREE.LineSegments(geo, mat);
            mesh.add(wireframe);

            break;
          case SHAPES.ICOSAHEDRON:
            var geometry = new THREE.IcosahedronGeometry(shape.radius, shape.detail);
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(shape.x, shape.y, shape.z));
            geometry.rotateX(shape.rx);
            geometry.rotateY(shape.ry);
            geometry.rotateZ(shape.rz);
            var c = Math.floor(Math.random() * 16777215);
            var material = new THREE.MeshBasicMaterial({color: c, wireframe: false});
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos.x, 0, pos.z);
            scene.add(mesh);
            var geo = new THREE.EdgesGeometry(mesh.geometry);
            var mat = new THREE.LineBasicMaterial( { color: 0xcccccc, linewidth: 1 } );
            var wireframe = new THREE.LineSegments(geo, mat);
            mesh.add(wireframe);

            break;
        }
      }
    }

    generateBuilding(scene, options) {
        var box_length = options.length * 2;
        var box_width = options.width * 2;
        var box_height = options.height;
        this.color = 0xA8A8A8;
        this.uparam = {
          type: Math.floor(Math.random() * 10) % 3,
          r: Math.random()
        };

        var shape = {
          symbol: SYMBOLS.A,
          type: SHAPES.BOX,
          l: options.length,
          w: options.width,
          h: options.height,
          x: 0,
          y: 0.5 * options.height,
          z: 0,
          rx: 0,
          ry: 0,
          rz: 0
        };

        var building = [shape];
        for (var i = 0; i < 3; i++) {
          var temp = [];
          building.forEach((function(shape) {
            temp.push(this.iterate(shape));
          }).bind(this));
          building = [].concat.apply([], temp);
        }

        this.evalShapes(scene, building, {x: options.x, z: options.z});
        return;
    }

}
