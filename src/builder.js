const THREE = require('three')

var Identifier = function(name, partOf, isTerminal) {
    return {
        name: name,
        partOf: partOf,
        isTerminal: isTerminal
    };
}

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

    loadResources(callback) {
        var loader = new THREE.TextureLoader();
        var texture1 = loader.load('./textures/floor06.tga');
        var texture2 = loader.load('./textures/crate.png');

        this.materials = {
            road_material: new THREE.MeshBasicMaterial({map: texture1, overdraw: 0.5}),
            crate_material:  new THREE.MeshBasicMaterial({map: texture2, overdraw: 0.5}),
         }
    }

    transformShape(shape) {
        var box = new THREE.BoxGeometry(shape.geometry.parameters.width, shape.geometry.parameters.width, shape.geometry.parameters.width);
        var newshape = new Shape('T', box, {
            translation: new THREE.Vector3(0,0,shape.geometry.parameters.width),
            scale: new THREE.Vector3(0.5,0.5,0.5)
        });
        return [newshape, shape];
    }


    swap(mesh) {
        var bbox = new THREE.BoundingBoxHelper(mesh);
        console.log(bbox);
        bbox.update();
        var length = 0.71 * (bbox.box.max.y - bbox.box.min.y);
        var width  = 0.85 * (bbox.box.max.z - bbox.box.min.z);
        var height = 0.71 * (bbox.box.max.x - bbox.box.min.x);

        var material = new THREE.MeshLambertMaterial({color: 0xF7FE2E});
        var geometry = new THREE.CylinderGeometry(1, 0.95, 0.2, 4);
        var newmesh = new THREE.Mesh(geometry, material);
        newmesh.scale.set(length, width, height);
        // newmesh.rotateX(4.71238898038);
        // newmesh.rotateY(0.785);
        newmesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        newmesh.translateY(width / 2.0);
        return newmesh;
    }


    divide3(mesh) {
        var clone1 = mesh.clone();
        var clone2 = mesh.clone();

        mesh.scale.set(1,0.3333,1);
        clone1.scale.set(1,0.3333,1);
        clone2.scale.set(1,0.3333,1);

        var d2g = mesh.geometry.parameters.height / 2.0; // dist to ground
        mesh.translateY(-d2g + 0.3333 * d2g);
        clone1.translateY(0.005);
        clone2.translateY(0.6666 * d2g + 0.01)

        var offset = mesh.position.y - 0.3333 * d2g;
        mesh.translateY(-offset);
        clone1.translateY(-offset);
        clone2.translateY(-offset);

        return [mesh, clone1, clone2];
    }

    getBuildingSeed(options) {



    }

    generateBuilding(options) {
        var box_length = options.length;
        var box_width = options.width;
        var box_height = options.height;
        var material = new THREE.MeshLambertMaterial({color: 0xF7FE2E});
        var geometry = new THREE.BoxGeometry(box_length, box_height, box_width);
        var mesh = new THREE.Mesh(geometry, material);

        var meshes = this.divide3(mesh);
        var material = new THREE.MeshLambertMaterial({color: 0xC7C5C5});
        var baseGeo = new THREE.PlaneGeometry( options.square_size - 0.01, options.square_size - 0.01, 1 );
        for (var i = 0; i < meshes.length; i++) {
            var auxMesh = meshes[i];
            auxMesh.updateMatrix();
            baseGeo.merge(auxMesh.geometry, auxMesh.matrix);
        }
        var mesh = new THREE.Mesh(baseGeo, material);
        // mesh.rotateZ(Math.random());
        return mesh;

        // var half_square_size = options.square_size;
        // var box = new THREE.BoxGeometry(half_square_size-0.005,half_square_size-0.005,half_square_size-0.005);
        // var shape = new Shape('T', box, {
        //     translation: new THREE.Vector3(0,0,0),
        //     scale: new THREE.Vector3(1,1,1)
        // });
        // var building = {
        //     terminal: [],
        //     nonterminal: [shape]
        // }
        //
        // var iter = 0;
        // while (building.nonterminal.length != 0 && iter++ < 1) {
        //     var shape = building.nonterminal.pop();
        //     var newshapes = this.transformShape(shape);
        //     for (var i = 0; i < newshapes.length; i++) {
        //         var newshape = newshapes[i];
        //         if (newshape.symbol == 'T') {
        //             building.terminal.push(newshape);
        //         } else {
        //             building.nonterminal.push(newshape);
        //         }
        //     }
        // }
        //
        // var material = new THREE.MeshLambertMaterial({color: 0xF7FE2E});
        // var baseGeo = new THREE.PlaneGeometry( options.square_size - 0.01, options.square_size - 0.01, 1 );
        // for (var i = 0; i < building.terminal.length; i++) {
        //     var shape = building.terminal[i];
        //     var auxGeo = shape.geometry;
        //     var auxMesh = new THREE.Mesh(auxGeo, material);
        //     var pos = shape.attr.translation;
        //     auxMesh.position.set(pos.x, pos.y, pos.z);
        //     var sca = shape.attr.scale;
        //     auxMesh.scale.set(sca.x, sca.y, sca.z);
        //     auxMesh.updateMatrix();
        //     baseGeo.merge(auxMesh.geometry, auxMesh.matrix);
        // }
        // var mesh = new THREE.Mesh(baseGeo, material);
        // return mesh;


    }

}
