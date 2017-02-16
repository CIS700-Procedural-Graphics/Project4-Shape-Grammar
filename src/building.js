const THREE = require('three')
/*
building - doesn't get rendered
	
	style - string name of style
		office1
		office2 - a different style of office building if we get that far
		resident1 - residential style
		resident2 - variation of residential if we get that far
		
	constraints - will be passed by routine that decides where to make a building. It will designate params
					based on context

		style-based constraints
			minFloors - use to decide when to stop subdiv in height
			minWidth, minDepth - wall units - min width/depth a building can be before stopping subdiv along width/depth
	
		location-based constraints
			startHeight - start height of the building in floors. effectively the max height
			startWidth, startDepth - starting width & depth - in wall units
				this is location-based becuase it will come from algorithm that places buildings
			orientation - vector facing from front of building, so it can face the road nicely
			center - center of building on xz plane		
	
	subunits
		- subunits of this building, so should get same architectural style
		- start with one subunit the size of startFloors & startWidth
		- for simplicity, a building is never divided into separate buildings, only into separate subunits of the same building
		each subunit gets processed for components. minimum height is one floor
		- subunits get checked for minWidth and minFloors before getting possibly div'ed again

		state
			terminated - true/false. starts false, set to true when should no longer be sub-div'ed
			onGround - true/false. if it's on the ground, it'll need a door and maybe other treatment
			height - in floors
			width/depth - in wall units
			
	operators
		checkForTerminate - check against min height/width/depth - terminate if any one of these is at/near minimum?
			maybe apply to output of a rule operation before finalizing the rule operation
			
	rules
		These can be grouped/changed based on style of building
		subdiv
			terminate - randomly choose to terminate subunit
			split vertically - randomized top/bottom ratio  - split in xz plane. top unit may be resized to be more narrow/shallow.
				Maybe check if new dim is < min for the dim. If so, set to dim and set terminate flag.
			split width - split in yz - option for how much separation between new subunits, >= 0
			split depth - split in xy
			resize height/width/depth - all in one? remember, always make smaller

	once subdiv'ing is done (all subunits are termianted), move on to component operations
		
components - objects for architectural details. do these just get rendered on top? would be easier that way

		non-terminal units: (need more processing)		
		roof / tower / dome - primitive (not ready for rendering)
		floors - do all floors in a building get same style, i.e. window/wall distribution?
				maybe first floor gets special handing, including being taller, and all others are the same

		terminal/render units: (i.e. to be rendered out)
		windows
		sills
		doors
		roof - renderable
		
		can we make these meshes children of parent mesh, and place them all relative to parent, then will
			they move along with parent if we move the parent?

		rules once subdiv's are all done:
		
		generate floors (non-terminal)
			basic floors
			floors with balconies - remember, always make things by resizing, so need to shrink floors that 	
			
		generate floor components
			make windows / wall units
			make doors / wall / windows - only for ground floor
			make sills
				only between 1st and 2nd floors or top and 2nd from top for simplicity?

		add roof
				

*/		

var buildingStyleConstraints = function( minFloors, minWidth, minDepth ){
	return {
		minFloors: minFloors,
		minWidth: minWidth,
		minDepth: minDepth
	}
}

//style test
var generateMesh_test = function( typeStr ) {
	var mesh;
	var geometry;
	var material;
	switch( typeStr ){
		case 'wall' :
			geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
			material = new THREE.MeshBasicMaterial( {color: 0x555555} );
			break;
		case 'window' :
			geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
			material = new THREE.MeshBasicMaterial( {color: 0x118811} );
			break;
		case 'door' :
			geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
			material = new THREE.MeshBasicMaterial( {color: 0x771111} );
			break;
		case 'roof' :
			geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
			material = new THREE.MeshBasicMaterial( {color: 0x888811} );
			break;

		default:
			break;
	}
	return new THREE.Mesh( geometry, material );
}

export class BuildingStyle {
	constructor( styleStr ){
	
		styleStr = styleStr; //copies
	
		//constraints
		var constraints = {}
		var generateMesh = function(){};
		var wallScaleWHD = [];
		switch( styleStr ){
			case 'test' :
				constraints = new buildingStyleConstraints( 10, 6, 6 );
				generateMesh = generateMesh_test;
				//Scale of wall units to geometry units
				//width, height, depth (x,y,z)
				wallScaleWHD = [ 2,4,1 ];
				break;
			case 'office1' :
				constraints = new buildingStyleConstraints( 5, 6, 6 );
				break;
			default: //throw an error here
				break;
		}
	}
}

export default class Building {

	//ctor
	//params are as described above in overview comments
	//style - passing style will populate style-specific constraints for the building
	// geometry objects to render
	constructor( styleStr, center/*pass new object*/, orientation/*pass new object*/, startHeight, startWidth, startDepth, scene) {
		this.startWDH = [startWidth, startDepth, startHeight];
		this.orientation = orientation; //unit 3D vector facing out from front of building in xz plane
		this.center = center;

		this.styleStr = styleStr; //copy or ref, doesn't matter
		this.style = new BuildingStyle(styleStr);
		this.scene = scene;
		
		this.WDH = [startWidth, startDepth, startHeight];
		
		this.isOnGround = false; //true/false if this unit is beneath a neither unit, i.e. shouldn't get a roof
		this.supportsRoof = false; //true if it can take a room, i.e. is on top of any other sub-units
		this.terminal = false; //Set to true when should stop sub-dividing
	}

	//generate everyhting, recursively
	//For top-level building, call this after you create the object with new.
	//sub-units will call this after they're created
	generate() {
		//subdivide
		// resize current building or generate N new buildings/units
		this.subDivide();

			  
		//If it results in a terminal building/sub-unit, flag is set,
		// and now we make the components and render objects
		if( this.terminal ){
			//generate floors, and then walls/windows/doors
			//keep track of total height, including partial-floor height for ledges or other stuff
			this.generateFloors();
			//need a roof?
			this.generateRoof();
		}
	
	}

	//Create 0 or more subunits
	//Use
	subDivide() {
		 //Test - just return original
		 this.terminal = true;
		 this.isOnGround = true;
		 this.supportsRoof = true;
		 
		 //Otherwise
		 // choose a rule
		 // change this one and/or make new subunits
		 // call generate() on any new subunits
	}

	generateFloors() {
		//start with ground floor, facing forward
		this.generateOneFloor( 0, this.isOnGround, 0 );
		for( var fl = 1; fl < this.WHD[1]; fl++ )
		  this.generateOneFloor( 1, false, fl * 90 );
	}

	generateOneFloor( floorNumber, isGroundFloor, rotation /*rotation in degrees from front orientation */ ) {
		//Four sides to a floor
		var outVector = new THREE.Vector3( this.orientation.x, this.orientation.y, this.orientation.z ); 
		for( var side = 0; side < 4; side++ ){

			//Determine floor layout
			//Call a method based on style?
			//Test:
			var layout = new [];
			//resize to width or depth
			var length = this.WDH[ side % 2 ];
			layout[ length - 1 ] = 'junk'; 
			//start by filling with walls
			layout.fill('wall');
			layout[1] = 'window'; //testing
			layout[length-2] = 'window';
			if( isGroundFloor )
				layout[ length / 2 ] = 'door'

			//Now generate geometry
			var centerIndex = layout.length / 2.0 - 0.5;
			var fwdOffset = this.WDH[ (side+1) % 2 ] / 2; //get the other dim
			layout.forEach( function(item, index) {
				//try to get offset right to align with axes
				this.generateMesh( item, index - centerIndex, fwdOffset, floorNumber, rotation )
			} );
			
		}
	}

	generateRoof() {
	
	}
	
	generateMesh( typeStr, lateralOffsetWallUnits, fwdOffsetWallUnits, heightFloorUnits, rotation ){
		var mesh = this.style.generateMesh( typeStr );
		//Scale to size
		mesh.scale.set( style.wallScaleWHD[0], style.wallScaleWHD[1], style.wallScaleWHD[2] );

		//Rotate
		mesh.rotateY( rotation / 180 * 3.141592 );
		
		//Move into position
		var x = style.wallScaleWHD[0] * lateralOffsetWallUnits;
		var y = style.wallScaleWHD[1] * (heightFloorUnits + 0.5); //move up half wall-unit to get center at center of floor height
		var z = style.wallScaleWHD[2] * fwdOffsetWallUnits;
		mesh.position.set( x, y, z);

		//add to scene
		this.scene.add( mesh );
	}
 } //end class Building