const THREE = require('three')
import Lsystem, {linkedListToString} from './lsystem.js'

var ParserState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}

function getSign()
{
    if (Math.random() < 0.5)
    {
        return -1;
    }

    else
    {
        return 1;
    }
}
  
export default class Parser {
    
    constructor(scene, iterations, grammar) {
        this.state = new ParserState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
        this.scene = scene;

        this.window = false;
        this.chimney = false;
        this.l = false;
        this.roofMaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );

        if (iterations)
        {
            this.totalIter = iterations;
        }

        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                'L' : this.increaseLevel.bind(this),
                'C' : this.addChimney.bind(this),
                'S' : this.makeL.bind(this),
                'Y' : this.strawRoof.bind(this),
                'B' : this.woodRoof.bind(this),
                'K' : this.makeGeom.bind(this),
                'E' : this.makeGeom.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    clear() {
        this.state = new ParserState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));        
        this.window = false;
        this.chimney = false;
        this.l = false;
        this.scale = new THREE.Vector3(1.0, 1.0, 1.0);
        this.roofMaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );
        this.totalIter = 0;
    }

    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    increaseLevel()
    {
        this.scale.y += 1.0;
    }

    addWindow()
    {
        this.window = true;
    }

    addChimney()
    {
        this.chimney = true;
    }

    makeL()
    {
        this.l = true;
    }

    strawRoof()
    {
        this.roofMaterial.color = new THREE.Color(1, 0.95, 0.3);
    }

    woodRoof()
    {
        this.roofMaterial.color = new THREE.Color(0.19, 0.11, 0.03);
    }

    makeGeom()
    {
        //make box
        var dim = new THREE.Vector3(3, 2, 5);
        if (this.position.x < 0)
        {
            dim.y *= 2;
        }
        dim.y *= this.scale.y;
        var geometry = new THREE.BoxGeometry(dim.x, dim.y, dim.z);
        var material = new THREE.MeshPhongMaterial( {color: 0xD3D3D3} );
        var mesh1 = new THREE.Mesh( geometry, material );
        mesh1.position.set(this.position.x, this.position.y + (dim.y / 2), this.position.z);
        this.scene.add(mesh1);

        if(this.l)
        {
            var dimL = new THREE.Vector3(2, 2, 2);
            var geomL = new THREE.BoxGeometry(dimL.x, dim.y, dimL.z);
            var meshL = new THREE.Mesh( geomL, material );
            var offSetX = getSign() * 0.75 * dim.x;
            var offSetZ = getSign() * 0.75 * dimL.z;
            meshL.position.set(mesh1.position.x + offSetX, mesh1.position.y, mesh1.position.z + offSetZ);
            this.scene.add(meshL);
        }

        if(this.chimney)
        {
            var dimC = new THREE.Vector3(1, 2, 1);
            var geomC = new THREE.BoxGeometry(dimC.x, 3, dimC.z);
            var matC = new THREE.MeshPhongMaterial( {color: 0x303030} );
            var meshC = new THREE.Mesh( geomC, matC );
            var offSetX = getSign() * 0.25 * dim.x;
            var offSetZ = getSign() * 0.25 * dim.z;
            meshC.position.set(mesh1.position.x + offSetX, mesh1.position.y + (dim.y / 2) + 1.5, mesh1.position.z + offSetZ);
            this.scene.add(meshC);
        }

        //add roof
        var dimR1 = new THREE.Vector3(2, 2, 2);
        var geomR1 = new THREE.BoxGeometry(dim.x, 1, dim.z);
        var meshR1 = new THREE.Mesh( geomR1, this.roofMaterial );
        meshR1.position.set(mesh1.position.x, mesh1.position.y + dim.y / 2 + 0.5, mesh1.position.z);
        this.scene.add(meshR1);

        if (this.l)
        {
            var dimR2 = new THREE.Vector3(2, 2, 2);
            var geomR2 = new THREE.BoxGeometry(dimL.x, 1, dimL.z);
            var meshR2 = new THREE.Mesh(geomR2, this.roofMaterial);
            meshR2.position.set(meshL.position.x, meshL.position.y + dim.y / 2 + 0.5, meshL.position.z);
            this.scene.add(meshR2);
        }

    }

    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.symbol];
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        this.scale = linkedList.scale;
        this.position = linkedList.position;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) 
        {
            this.renderSymbol(currentNode);
            linkedList.scale = this.scale;
        }
    }
}