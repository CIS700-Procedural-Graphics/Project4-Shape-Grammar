const THREE = require('three')

//======================================================== SHAPE CLASS ===============================================================

export default class Shape {

	constructor(scene, meshStr, position, rotation, scale, id, mat) {
		this.scene = scene;
		this.meshString = meshStr;
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.id = id; //0;
		this.material = mat;
		this.drawable = false;
		this.expandable = true;
	}//end constructor



	renderShape(shapeList, functionID, offset, towerLength, pointsList, pointsList2, pointsList3) {

		/* PUT A BUNCH OF IF ELSES HERE DEPENDING ON ID */

		//in each of these cases, you add the resulting new Shape objects to the shapeList
		//remove current shape from list if you want as well

		//SUBDIVIDE Y RULE
		//takes in a cube and subdivides into 2 along Y
		if(functionID == 1)
		{
			var currScale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
			var currPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
			this.drawable = false;

			//EITHER: divide the scale_x of green cube's scale by 2 (this will create 2 equal width offsetted by a level)
			//OR: divide scale_x AND scale_y of blue cube by 2 (this will make it a quater of the green cube)

			//GREEN CUBE
			var newX_1 = currPos.x + (currScale.x / 4);
			var newPos1 = new THREE.Vector3(newX_1, currPos.y, currPos.z);
			var newScale1 = new THREE.Vector3(currScale.x / 2, currScale.y, currScale.z);
			var material_Cube1 = new THREE.MeshPhongMaterial( {color: 0x00ff00, wireframe: true} );
			var cube1 = new Shape(this.scene, "B", newPos1, this.rotation.clone(), newScale1, 2, material_Cube1);
			cube1.drawable = true;


			//SKY BLUE CUBE
			var newX_2 = currPos.x - (currScale.x / 4);
			var newPos2 = new THREE.Vector3(newX_2, currPos.y, currPos.z);
			var newScale2 = new THREE.Vector3(currScale.x / 2, currScale.y, currScale.z);
			var material_cube2 = new THREE.MeshPhongMaterial( {color: 0x00cccc, wireframe: true} );
			var cube2 = new Shape(this.scene, "B", newPos2, this.rotation.clone(), newScale2, 2, material_cube2);
			cube2.drawable = true;


			//add new shapes to shapes list
			shapeList.push(cube1);
			shapeList.push(cube2);

			//remove original mesh from shapes list
			var index = shapeList.indexOf(this);
			shapeList.splice(index, 1);

		}


//===============================================================================================================


		//clones the 2 cubes made above along a row, offsetted along x axis
		if(functionID == 2)
		{
			var pos = new THREE.Vector3(this.position.x - offset, this.position.y, this.position.z);
			var scale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
			this.drawable = false;

			var material = new THREE.MeshPhongMaterial( {color: 0x0000cc, wireframe: true} );
			var geom = new Shape(this.scene, "B", pos, this.rotation.clone(), scale, 1, material);
			geom.drawable = true;

			shapeList.push(geom);
		}

//===============================================================================================================

		//CREATE CYLINDER TOWER RULE
		//THIS ONE STARTS OFF ALL THE OTHER ONES
		if(functionID == 3)
		{
			//offset starting position
			// var randomVal = Math.random() * Math.random() * 20;
			// var randomTowerLength = (Math.random() * 10) + 1;
			// var currScale = new THREE.Vector3(this.scale.x * randomVal, this.scale.y * randomVal, this.scale.z * randomVal);
			// var currPos = new THREE.Vector3(this.position.x - randomVal, this.position.y, this.position.z + randomVal);
			//
			// this.createTower(currPos, currScale, randomVal, randomTowerLength, this, shapeList, true);

			//NEED TO USE SOME NOISE FUNCTION TO OFFSET THE BUILDINGS HEIGHT

			//offset starting position
		  var randomVal = (Math.random() * 20) + 1;
			var posOffset = 20;
		  var currScale = new THREE.Vector3(this.scale.x * randomVal, this.scale.y * randomVal, this.scale.z * randomVal);
		  var currPos = new THREE.Vector3(this.position.x - randomVal - posOffset, this.position.y, this.position.z + randomVal + posOffset);
			this.drawable = false;

		  //add more cylinders on top of each other according to tower length
		  var count = towerLength;
		  while(count > 0)
		  {
		    var newScale = new THREE.Vector3(currScale.x / 1.5, currScale.y / 1.5, currScale.z / 1.5);
		    var newPos = new THREE.Vector3(currPos.x, currPos.y, currPos.z);

				var toonOffset = Math.random();
				var material = toonShader(toonOffset);
		    //var material = new THREE.MeshBasicMaterial( {color: 0xcc0000, wireframe: true} );

		    var functionid = 0;
		    if(count == towerLength)	//to spawn the next tower elsewhere
		    {
		      functionid = 5;
		    }
		    if(count == 1)
		    {
		      functionid = 4;
		    }


		    var cylGeom = new Shape(this.scene, "C", newPos, this.rotation.clone(), newScale, functionid, material);
		    shapeList.push(cylGeom);

		    //set the currscale for the next iteration to be the calculated one from this iteration
		    currScale = new THREE.Vector3(newScale.x, newScale.y, newScale.z);
		    currPos = new THREE.Vector3(newPos.x, newPos.y + (currScale.y / 1.5), newPos.z);

		    count--;
		  }//end while loop

		  //remove original mesh from shapes list
		  var index = shapeList.indexOf(this);
		  shapeList.splice(index, 1);
		}

//===============================================================================================================

		//create a tower at every specified point in points list
		if(functionID == 4)
		{
			this.drawable = false;
			var randomVal = Math.random() * Math.random() * 20;
			var randomTowerLength = Math.floor((Math.random() * 10) + 3);
			//var randScaleOffset = Math.floor((Math.random() * 10) + 2);

			//console.log(randomTowerLength)

			for(var i = 0; i < pointsList.length; i++)
			{
				if(i % 10 == 0)
				{
					//var randScale = new THREE.Vector3(this.scale.x * randScaleOffset, this.scale.y * randScaleOffset, this.scale.z * randScaleOffset);
					var randScale = this.scale.clone();
					this.createTower(pointsList[i], randScale, randomVal, randomTowerLength, this, shapeList, false);
				}
			}
		}//end function id 4

//===============================================================================================================

		//create cylinder towers along another curve
		if(functionID == 5)
		{
			this.drawable = false;
			var randomVal = Math.random() * Math.random() * 20;
			var randomTowerLength = Math.floor((Math.random() * 10) + 3);

			for(var i = 0; i < pointsList2.length; i++)
			{
				if(i % 10 == 0)
				{
					var randScale = this.scale.clone();
					this.createTower(pointsList2[i], randScale, randomVal, randomTowerLength, this, shapeList, false);
				}
			}
		}


		//create an archway of hearts
		if(functionID == 6)
		{
			var currScale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
			//var currPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
			var currRot = new THREE.Vector3(this.rotation.x, this.rotation.y, this.rotation.z);
			this.drawable = false;

			for(var i = 0; i < pointsList3.length; i++)
			{
				if(i % 4 == 0)
				{
					this.createSpiralTower(pointsList3[i], currRot, currScale, 20, this, shapeList, true, 0);
				}

			}
		}

		//create a spiral tower of hearts
		if(functionID == 7)
		{
			var offset = 10;

			var currScale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
			var currPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
			var currRot = new THREE.Vector3(this.rotation.x, this.rotation.y, this.rotation.z);
			this.drawable = false;

			var xoffset = currPos.x;

			this.createSpiralTower(currPos, currRot, currScale, 20, this, shapeList, false, xoffset);
			this.createSpiralTower(currPos, currRot, currScale, 20, this, shapeList, false, -xoffset);
			this.createSubdivide(currPos, currRot, currScale, 20, this, shapeList);

			var offset = 10;
			var currScale2 = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
			var currPos2 = new THREE.Vector3(this.position.x, this.position.y, this.position.z + offset);
			var currRot2 = new THREE.Vector3(this.rotation.x, this.rotation.y, this.rotation.z);
			this.createSubdivide(currPos2, currRot2, currScale2, 20, this, shapeList);
		}


	};//end renderShapes


//===============================================================================================================

	createSubdivide(position, rotation, scale, towerlength, currShape, _shapeList)
	{
		var currScale = new THREE.Vector3(scale.x, scale.y, scale.z);
		var currPos = new THREE.Vector3(position.x, position.y, position.z);

		//GREEN CUBE
		var newX_1 = currPos.x + (currScale.x / 4);
		var newPos1 = new THREE.Vector3(newX_1, currPos.y, currPos.z);
		var newScale1 = new THREE.Vector3(currScale.x / 2, currScale.y, currScale.z);
		var material_Cube1 = new THREE.MeshPhongMaterial( {color: 0x00ff00, wireframe: true} );
		var cube1 = new Shape(this.scene, "B", newPos1, rotation.clone(), newScale1, 7, material_Cube1);


		//SKY BLUE CUBE
		var newX_2 = currPos.x - (currScale.x / 4);
		var newPos2 = new THREE.Vector3(newX_2, currPos.y, currPos.z);
		var newScale2 = new THREE.Vector3(currScale.x / 2, currScale.y, currScale.z);
		var material_cube2 = new THREE.MeshPhongMaterial( {color: 0x00cccc, wireframe: true} );
		var cube2 = new Shape(this.scene, "B", newPos2, rotation.clone(), newScale2, 7, material_cube2);


		//add new shapes to shapes list
		_shapeList.push(cube1);
		_shapeList.push(cube2);

		//remove original mesh from shapes list
		var index = _shapeList.indexOf(this);
		_shapeList.splice(index, 1);
	}


	createSpiralTower(position, rotation, scale, towerlength, currShape, _shapeList, isHeart, xoffset)
	{
		var currScale = scale;//new THREE.Vector3(scale.x, scale.y, scale.z);
		var currPos = position;//new THREE.Vector3(position.x, position.y, position.z);
		var currRot = rotation;//new THREE.Vector3(rotataion.x, rotation.y, rotation.z);

		var count = towerlength;
		// var count = Math.floor((Math.random() * 10) + 2);//towerLength;
		while(count > 0)
		{
			var newScale = new THREE.Vector3(currScale.x, currScale.y, currScale.z);
			var newRot = new THREE.Vector3(currRot.x, currRot.y + (currPos.y * (Math.PI / 12)), currRot.z);	//change currPos.y to be count and it'll create spiral
			var newPos;
			// only add count if it's hearts
			if(isHeart)
			{
				newPos = new THREE.Vector3(currPos.x, currPos.y - count, currPos.z);
			}
			else {
				newPos = new THREE.Vector3(currPos.x + xoffset, currPos.y, currPos.z);
			}


			var material;
			if(count % 2 == 0)
			{
				var toonOffset = Math.random();
				material = toonShader(toonOffset);//new THREE.MeshBasicMaterial( {color: 0xccc000, wireframe: false} );
			}
			else {
				//material = new THREE.MeshBasicMaterial( {color: 0xc00000, wireframe: false} );
				var toonOffset = Math.random();
				material = toonShader(toonOffset);
			}

			//var material = new THREE.MeshBasicMaterial( {color: 0xccc000, wireframe: true} );

			var functionid = 0;
			var geom;

			if(isHeart)
			{
				geom = new Shape(this.scene, "H", newPos, newRot, newScale, functionid, material);
			}
			else {
				geom = new Shape(this.scene, "B", newPos, newRot, newScale, functionid, material);
			}
			_shapeList.push(geom);

			//set the currscale for the next iteration to be the calculated one from this iteration
			currScale = new THREE.Vector3(newScale.x, newScale.y, newScale.z);
			currPos = new THREE.Vector3(newPos.x, newPos.y + (currScale.y), newPos.z);

			count--;
		}//end while loop

		//remove original mesh from shapes list
		var index = _shapeList.indexOf(currShape);
		_shapeList.splice(index, 1);

	};//end create spiral tower function

	createTower(_position, _scale, randomVal, towerLength, currShape, _shapeList, spawnFlag) {
		var randScaleOffset = Math.floor((Math.random() * 15) + 8);
		var currScale = new THREE.Vector3(_scale.x * randScaleOffset, _scale.y * randScaleOffset, _scale.z * randScaleOffset);
		var currPos = new THREE.Vector3(_position.x, _position.y, _position.z);

		//add more cylinders on top of each other according to tower length
		var count = Math.floor((Math.random() * 10) + 2);//towerLength;
		var topmost = count;
		while(count > 0)
		{
			// if(count == topmost)
			// {
			//
			// }


			var newScale = new THREE.Vector3(currScale.x / 1.5, currScale.y / 1.5, currScale.z / 1.5);
			var newPos = new THREE.Vector3(currPos.x, currPos.y, currPos.z);

			var material;
			if(count % 2 == 0)
			{
				var toonOffset = Math.random();
				material = toonShader(toonOffset);//new THREE.MeshBasicMaterial( {color: 0xccc000, wireframe: false} );
			}
			else {
				material = new THREE.MeshPhongMaterial( {color: 0xc00000, wireframe: false} );
			}

			var functionid = 0;
			// if(spawnFlag)
			// {
			// 	if(count == towerLength)	//to spawn the next tower elsewhere
			// 	{
			// 		functionid = 3;
			// 	}
			// 	if(count == 1)
			// 	{
			// 		functionid = 4;
			// 	}
			// }

			var cylGeom = new Shape(this.scene, "C", newPos, this.rotation.clone(), newScale, functionid, material);
			_shapeList.push(cylGeom);

			//set the currscale for the next iteration to be the calculated one from this iteration
			currScale = new THREE.Vector3(newScale.x, newScale.y, newScale.z);
			currPos = new THREE.Vector3(newPos.x, newPos.y + (currScale.y / 1.5), newPos.z);

			count--;
		}//end while loop

		//remove original mesh from shapes list
		var index = _shapeList.indexOf(currShape);
		_shapeList.splice(index, 1);

	};

}//end shape class


//defining toon shader --> NOTE: I CHANGED IT TO PHONG FOR NOW BECAUSE IT LOOKS BETTER WITH THE WATER
//offset with value between 0 and 1
function toonShader(colorOffset) {
    var toonGreenMaterial;
    var stepSize = 1.0/5.0;

    for ( var alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex ++ ) {
          var specularShininess = Math.pow(2.0 , alpha * 10.0 );

          for ( var beta = 0; beta <= 1.0; beta += stepSize ) {
              var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );

              for ( var gamma = 0; gamma <= 1.0; gamma += stepSize ) {
                  var offset = colorOffset;
                  var diffuseColor = new THREE.Color().setHSL( alpha * offset, 0.5, gamma * 0.5 ).multiplyScalar( 1.0 - beta * 0.2 );

                  toonGreenMaterial = new THREE.MeshPhongMaterial({//MeshToonMaterial( {
                        color: diffuseColor,
                        specular: specularColor,
                        reflectivity: beta,
                        shininess: specularShininess,
                        shading: THREE.SmoothShading,
												side: THREE.DoubleSide
                  } );//end var toon material
              }//end for gamma
          }//end for beta
    }//end for alpha

    return toonGreenMaterial;
}
