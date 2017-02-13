const THREE = require('three')


var Shape = function(symbol, geometry, attr) {
    return {
        symbol: symbol,
        geometry: geometry,
        attr: attr
    }
}

var Rule = function(symbol, geometry, attr) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z),
        ortho: new THREE.Vector3(ortho.x, ortho.y, ortho.z)
    }
}

export default class Builder {

    constructor() {}

    transformShape(shape) {
        var box = new THREE.BoxGeometry(shape.geometry.parameters.width, shape.geometry.parameters.width, shape.geometry.parameters.width);
        var newshape = new Shape('T', box, {
            translation: new THREE.Vector3(0,0,shape.geometry.parameters.width),
            scale: new THREE.Vector3(0.5,0.5,0.5)
        });
        return [newshape, shape];
    }

    generateBuilding(options) {
        var half_square_size = options.square_size;
        var box = new THREE.BoxGeometry(half_square_size-0.005,half_square_size-0.005,half_square_size-0.005);
        var shape = new Shape('T', box, {
            translation: new THREE.Vector3(0,0,0),
            scale: new THREE.Vector3(1,1,1)
        });
        var building = {
            terminal: [],
            nonterminal: [shape]
        }

        var iter = 0;
        while (building.nonterminal.length != 0 && iter++ < 1) {
            var shape = building.nonterminal.pop();
            var newshapes = this.transformShape(shape);
            for (var i = 0; i < newshapes.length; i++) {
                var newshape = newshapes[i];
                if (newshape.symbol == 'T') {
                    building.terminal.push(newshape);
                } else {
                    building.nonterminal.push(newshape);
                }
            }
        }

        var material = new THREE.MeshLambertMaterial({color: 0xF7FE2E});
        var baseGeo = new THREE.PlaneGeometry( options.square_size - 0.01, options.square_size - 0.01, 1 );
        for (var i = 0; i < building.terminal.length; i++) {
            var shape = building.terminal[i];
            var auxGeo = shape.geometry;
            var auxMesh = new THREE.Mesh(auxGeo, material);
            var pos = shape.attr.translation;
            auxMesh.position.set(pos.x, pos.y, pos.z);
            var sca = shape.attr.scale;
            auxMesh.scale.set(sca.x, sca.y, sca.z);
            auxMesh.updateMatrix();
            baseGeo.merge(auxMesh.geometry, auxMesh.matrix);
        }
        var mesh = new THREE.Mesh(baseGeo, material);
        return mesh;


    }

}
