const THREE = require('three')

var CTurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}

export default class CTurtle {

    constructor(w,h) {
        var startX = Math.floor(Math.random() * w);
        var startY = Math.floor(Math.random() * h);
        this.state = new CTurtleState(new THREE.Vector3(startX, startY, 0), new THREE.Vector3(1,0,0));
        this.stateStack = [];
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = '#ffffff';
        this.context.fillRect( 0, 0, w, h );

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 37),
                '-' : this.rotateTurtle.bind(this, -58),
                '*' : this.rotateTurtle.bind(this, 100),
                '/' : this.rotateTurtle.bind(this, -90),
                'M' : this.moveTurtle.bind(this, 20),
                '[' : this.saveState.bind(this),
                ']' : this.restoreState.bind(this),
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    saveState() {
        this.stateStack.push(new CTurtleState(this.state.pos, this.state.dir));
    }

    restoreState() {
        this.state = this.stateStack.pop();
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new CTurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0));
    }

    resetState() {
      var w = this.canvas.width;
      var h = this.canvas.height;
      var startX = Math.floor(Math.random() * w);
      var startY = Math.floor(Math.random() * h);
      this.state = new CTurtleState(new THREE.Vector3(startX, startY, 0), new THREE.Vector3(1,0,0));
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    // Rotate the turtle's _dir_ vector by each of the
    // Euler angles indicated by the input.
    rotateTurtle(degrees) {
      var e = new THREE.Euler(
              0,
              0,
              degrees * 3.14/180);
      this.state.dir.applyEuler(e);
    }

    moveTurtle(len) {
      var pos = this.state.pos;
      var newpos = this.state.pos.clone();
      newpos.addScaledVector(this.state.dir, len);

      var px = pos.x;
      var py = pos.y;
      var npx = newpos.x;
      var npy = newpos.y;

      if (npx < 0 || npx > this.canvas.width || npy < 0 || npy > this.canvas.height) {
        this.resetState();
        return;
      }

      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.moveTo(px, py);
      this.context.lineTo(npx,npy);
      this.context.stroke();
      this.state.pos = newpos;
    }

    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.character];
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
        return this.canvas;
    }
}
