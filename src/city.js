const THREE = require('three');
const MeshLine = require('three.meshline');
import ShapeGrammar, {Shape} from './shapeGrammar.js'


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function buildingShapes(shapes, geometry, offset) {
	
	var lambertGray = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
	
	var sceneShapes = new THREE.Object3D();
	var singleGeometry = new THREE.Geometry();
	
	for (var i = 0; i < shapes.length; i++) {
		
		var s = shapes[i];
		var shapeGeo = geometry[s.geometry];
		lambertGray = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
		var shapeMesh = new THREE.Mesh(shapeGeo, lambertGray);
		shapeMesh.scale.set(s.scale[0],s.scale[1],s.scale[2]);
		shapeMesh.position.set(s.position[0]+offset[0],s.position[1]+offset[1],s.position[2]+offset[2]);	
		shapeMesh.rotation.set(s.rotation[0],s.rotation[1],s.rotation[2]);
		shapeMesh.material.color.setHex( s.color );
		sceneShapes.add(shapeMesh);
	
	}
		 
	return sceneShapes;		
}

function distance3D( v1, v2 )
{
    var dx = v1[0] - v2[0];
    var dy = v1[1] - v2[1];
    var dz = v1[2] - v2[2];

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function tooCloseToRoad(roadPostions, pos) {
	
	for (var i = 0; i < roadPostions.length; i++) {

		if (distance3D(roadPostions[i], pos) < 2.0) {
			return true;
		}
		
	}
	
	return false;
}


export default function City(iterations, startingRadius) {
	
	this.radius = 10;
	this.resolution = 360;
	this.radiusIncrement = 10;
	
	var waves_amount=3;
	var wave_height=0.1*5;
	
	
	//building variables
	this.shapes = [];
	this.buildingGeometry = [];
	this.numOfBuildingsPerPoint = 3; //num of buildings between radial roads 
	this.buildingIterations = 1;
	
	this.doIterations = function(n) {
		
		var all = new THREE.Object3D();
		
		var geometry = new THREE.CircleGeometry( 50, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 0xC4B77C } );
		var circle = new THREE.Mesh( geometry, material );
		circle.rotation.set(-Math.PI/2,0,0);
		circle.position.set(0,-1,0);
		all.add(circle);
		
		
		for (var iter = 0; iter < n; iter++) {
			//console.log("do iterations road " + iter);

			var obj = new THREE.Line( new THREE.Geometry(), new THREE.LineBasicMaterial({color:0xf9f9f9, linewidth: 5}));
			
			//create radial roads
			for (var i = 0; i <= this.resolution; i++) {
				var angle = Math.PI/180.0*i;
				var radius_addon = 0;//wave_height * Math.sin(angle*waves_amount);
				var x = (this.radius+radius_addon) * Math.cos(angle);
				var z = (this.radius+radius_addon) * Math.sin(angle);
				var y=0;
				obj.geometry.vertices.push(new THREE.Vector3(x, y, z));
			}

			var line = new MeshLine.MeshLine();
			line.setGeometry( obj.geometry, function( p ) { return 1.0; } ); 
			var lineMaterial = new MeshLine.MeshLineMaterial({color : new THREE.Color( 0x564B35 ), resolution :  new THREE.Vector2(200,200)});
			var mesh = new THREE.Mesh( line.geometry, lineMaterial );
			all.add(mesh);
			//all.add(obj);
			
			if (iter == n-1)
				break;

			
			//add road segments
			var rand = getRandomInt(4*(iter+1),6*(iter+1));
			var roadPostions = [];
			var areaDivision = this.numOfBuildingsPerPoint+1; //divide area between radial roads

			for (var i = 0; i < rand; i++) {

				var p =  ((2.0 * Math.PI / rand) * i) + (2.0 * Math.PI / rand) * Math.random()/2;
				//console.log(p);
				var x = Math.cos(p) * this.radius;
				var z = Math.sin(p) * this.radius;
				var y = 0;
				var dir = new THREE.Vector3(x,y,z);
				//console.log(dir.x)

				x = Math.cos(p) * (this.radius+this.radiusIncrement);
				z = Math.sin(p) * (this.radius+this.radiusIncrement);
				var endPoint = new THREE.Vector3(x,y,z);
				//console.log(endPoint);

				var l = new THREE.Line( new THREE.Geometry(), new THREE.LineBasicMaterial({color:0xf9f9f9, linewidth: 5}));
				l.geometry.vertices.push(new THREE.Vector3(dir.x,dir.y,dir.z));
				l.geometry.vertices.push(new THREE.Vector3(endPoint.x,endPoint.y,endPoint.z));
				
			
				for (var b = 0; b < this.numOfBuildingsPerPoint; b++) {	
					var x = Math.cos(p) * (this.radius+this.radiusIncrement/areaDivision*(b+1));
					var z = Math.sin(p) * (this.radius+this.radiusIncrement/areaDivision*(b+1));
					var y = 0;
					roadPostions.push([x,y,z]);
				}
				
				var line = new MeshLine.MeshLine();
				line.setGeometry( l.geometry, function( p ) { return 0.5; } ); 
				var lineMaterial = new MeshLine.MeshLineMaterial({color : new THREE.Color( 0x564B35 ), resolution :  new THREE.Vector2(200,200)});
				var mesh = new THREE.Mesh( line.geometry, lineMaterial );
				all.add(mesh);

				//all.add(l);
			}
			
			
			
			//create buildings		
			var numBuildings = 36 * (iter+1);
			for (var j = 0; j < numBuildings; j++) {

				var point = 2.0 * Math.PI / numBuildings * j;
								
				for (var b = 0; b < this.numOfBuildingsPerPoint; b++) {
					
					var x = Math.cos(point) * (this.radius+this.radiusIncrement/areaDivision*(b+1));
					var z = Math.sin(point) * (this.radius+this.radiusIncrement/areaDivision*(b+1));
					var y = 0;

					if (!tooCloseToRoad(roadPostions, [x,y,z])) {

						var shapeGrammar = new ShapeGrammar();
						shapeGrammar.shapes = this.shapes;
						shapeGrammar.position = [x,y,z];
						shapeGrammar.cityRadius = this.radius;

						var buildingAll = buildingShapes(shapeGrammar.doIterations(this.buildingIterations), this.buildingGeometry, [x,y,z]);
						all.add(buildingAll);

					}			
					
				}
				
			}

			this.radius += this.radiusIncrement;
		}
		
		return all;
	}
}