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

export class BuildingStyle {
	constructor( styleVer, probability, minWDH, roofType, roofHeight, groundLayout, upperLayout, modelWHD, colors ){
		this.styleVersion = styleVer;
		this.probability = probability;
		this.minWDH = minWDH;
		this.roofType = roofType;
		this.roofHeight = roofHeight;
		this.groundLayout = groundLayout;
		this.upperLayout = upperLayout;
		this.modelWHD = modelWHD; //scaling from wall/floor units to model units
		this.colors = colors;
	}

	generateMesh( typeStr ) {
		var mesh;
		var geometry;
		var material;
		switch( typeStr ){
			case 'wl' :
				geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
				material = new THREE.MeshLambertMaterial( {color: this.colors[0]} ); //wall
				break;
			case 'wn' :
				geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
				material = new THREE.MeshLambertMaterial( {color: this.colors[1]} );
				break;
			case 'd' :
				geometry = new THREE.PlaneGeometry(1.0, 1.0, 5, 5);
				material = new THREE.MeshLambertMaterial( {color: this.colors[2]} );
				break;
			case 'roofFlat' :
				geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
				material = new THREE.MeshLambertMaterial( {color: this.colors[3]} );
				break;
			case 'cap' :  //thin roof 
				geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
				material = new THREE.MeshLambertMaterial( {color: this.colors[0]} ); //wall color
			default:
				break;
		}
		return new THREE.Mesh( geometry, material );
	}
}

export class SubdivRule {
	constructor( probability, rule, val1, val2 ){
		this.probability = probability;
		this.rule = rule; //string
		this.val1 = val1; //contextual value
		this.val2 = val2;
	}
}

////////////// Styles /////////////////////

var g_styleRules = {};
g_styleRules['test'] = [
	//				   name      prob   minWDH  roof type & height       ground floor layout            upper floor layout    modelWHD  colors: wall, window, door,     roof
	new BuildingStyle('test.1',  0.2,  [3,3,6], 'roofFlat', 1.6, ['wl','wl','wn','d','d','wn','wl'], ['wl','wn','wn','wn', 'wn'], [ 2,4,1 ], [ 0x554444, 0x884411, 0x441155, 0x550044 ]),
	new BuildingStyle('test.2',  0.2,  [3,3,6], 'roofFlat', 0.2, ['wn','d','wn',],                   ['wn','wl'], [ 2,4.5,1 ], [ 0x484444, 0x888822, 0x111155, 0x005544 ]),
	new BuildingStyle('test.3',  0.2,  [3,3,6], 'roofFlat', 1.2, ['wl','wn','d','wn','wl'],          ['wl','wl','wn','wn'], [ 2,4.5,1 ], [ 0x484444, 0x888822, 0x111155, 0x005544 ]),
	new BuildingStyle('test.4',  0.2,  [3,3,6], 'roofFlat', 3.2, ['wn','d','d','wl','d','d'],        ['wl','wn','wl','wl','wl','wn'], [ 2,3,1 ], [ 0x00AA44, 0x888822, 0x111155, 0x005544 ]),
	new BuildingStyle('test.5',  0.2,  [3,3,6], 'roofFlat', 0.8, ['wl','d',],                        ['wn','wn','wl'], [ 2,4,1 ], [ 0xAA0044, 0x22CC22, 0x1133AA, 0x554400 ]),
];	

var g_SubdivRules = {};
g_SubdivRules['test'] = [
	new SubdivRule( 0.1, 'split', 0, 0.4 ), //splitWidth
	new SubdivRule( 0.1, 'split', 1, 0.5 ), //splitDepth (using WDH here) for val1
	new SubdivRule( 0.1, 'split', 2, 0.6 ),
	new SubdivRule( 0.1, 'scale', 0, 0.7 ),
	new SubdivRule( 0.1, 'scale', 1, 0.7 ),
	new SubdivRule( 0.1, 'scale', 2, 0.7 ),
	new SubdivRule( 0.3, 'terminate', 0, 0 )	
];

////////////////////////////////////////////


var getRandom = function( seed1, seed2 ){
   var vec = new THREE.Vector2(seed1,seed2);
   return Math.abs( ( Math.sin( vec.dot( new THREE.Vector2(12.9898,78.233))) * 43758.5453 ) % 1 );
}

export default class Building {

	//ctor
	//params are as described above in overview comments
	//style - passing style will populate style-specific constraints for the building
	// geometry objects to render
	constructor( styleStr, center/*pass new object*/, orientation/*pass new object*/, startHeight, startWidth, startDepth, scene, recursionDepth) {
		this.startWDH = [startWidth, startDepth, startHeight];
		//console.log('start WDH: ', this.startWDH);
		this.orientation = orientation; //unit 3D vector facing out from front of building in xz plane
		this.center = center;

		this.scene = scene;
		
		this.finalWDH = [startWidth, startDepth, startHeight]; //init this
		this.baseFloor = 0; //used by units that end up on top of other units
		
		this.isOnGround = false; //true/false if this unit is beneath a neither unit, i.e. shouldn't get a roof
		this.supportsRoof = false; //true if it can take a room, i.e. is on top of any other sub-units
		this.render = false; //Set to true when should stop sub-dividing and should be drawn

		this.recursionDepth = recursionDepth; //fail-safe
		
		//console.log('styleRules in ctor ', this.styleRules);

		//// Style ////
		
		//random seeds - simple for now
		//Set BEFORE calling getBuildingStyleFromRule
		this.userSeed = this.scene.stauffUserSeed; //get from user
		this.seed1 = (center.x + this.userSeed) % 83;
		this.seed2 = (center.y + this.userSeed) % 53;
		//console.log( 'ctor: seed1, seed2: ', this.seed1, this.seed2);

		this.styleStr = styleStr; //copy or ref, doesn't matter
	}

	getRule( ruleArr, extraSeed1, extraSeed2 ) {
		var rand = getRandom( this.seed1 + extraSeed1, this.seed2 + extraSeed2 ); // [0,1], hopefully nicely distributed
		//console.log( 'getRule: rand, seed1, seed2: ', rand, this.seed1, this.seed2);
		var cutoff = 0;
		var result = '';
		//console.log('getBSFR: seed1, styleRules: ', this.seed1, this.styleRules);
	
		//NOTE: don't use array.ForEach here, cuz we can't break out of that loop
		for( var i = 0; i < ruleArr.length; i++ ) {
			var element = ruleArr[i];
			cutoff += element.probability;
			if( rand <= cutoff ){
				return element;
			}
		};	
		return '';
	}

	getBuildingStyleFromRule( styleStr ) {
		var ruleArr = g_styleRules[styleStr];
		return this.getRule( ruleArr, 0 );
	}

	//generate everyhting, recursively
	//For top-level building, call this after you create the object with new.
	//sub-units will call this after they're created
	generate() {
		//console.log('generate: this: ', this);
		this.style = this.getBuildingStyleFromRule(this.styleStr);
		console.log('generate: chose style: ', this.style.styleVersion);
		
		
		this.render = true; //do this until subDivide is working
		this.isOnGround = true;
	 	this.supportsRoof = true;

		//subdivide
		// resize current building or generate N new buildings/units
		this.subDivide();
		//console.log('generate: done with subDivide');
			  
		//If it results in a terminal building/sub-unit, flag is set,
		// and now we make the components and render objects
		if( this.render ){
			//console.log('generate: is render..proceeding..');
			//generate floors, and then walls/windows/doors
			//keep track of total height, including partial-floor height for ledges or other stuff
			this.generateFloors();
			//need a roof?
			this.generateRoof();
		}
	
	}

	//split a building along a dimension
	//creates two new buildings
	split( dim, proportion /*ignoring*/){
		var newWDH = this.finalWDH.slice(); //copies
		newWDH[dim] = Math.max( newWDH[dim] / 2, this.style.minWDH[dim] );
		if( dim == 2) { //height
			//Just scale the current one and terminate it and create one on top
			this.render = true;
			this.finalWDH[2] = Math.max( this.finalWDH[2] / 2, this.style.minWDH[2] );
			this.supportsRoof = false;
			//shrink width of top
			newWDH[0] = Math.max( newWDH[0] - 2, this.style.minWDH[0] );
			var build = new Building( this.styleStr, this.center, this.orientation, newWDH[2], newWDH[0], newWDH[1], this.scene, this.recursionDepth + 1 );
			build.baseFloor = this.finalWDH[2];
			build.isOnGround = false;
			build.generate();
		} else{
			//splitting width or depth
			//create two new buildings, don't render this one
			for( var i=-1; i < 2; i+=2 ) {
				var offset=[0,0];
				offset[dim] = newWDH[dim] / 2 * i;
				var b = new Building( this.styleStr,
										new THREE.Vector3( this.center.x + (offset[0] * this.style.modelWHD[0]) , this.center.y + (offset[1] * this.style.modelWHD[2]), this.center.z ),
										this.orientation, newWDH[2], newWDH[0], newWDH[1], this.scene, this.recursionDepth + 1 );
				b.baseFloor =  this.baseFloor;
				b.isOnGround = this.isOnGround;
				b.supportsRoof = this.supportsRoof;
				b.generate();
			}
		}
	}

	//Create 0 or more subunits
	//Use
	subDivide() {
		 //Otherwise
		 // choose a rule
		 // change this one and/or make new subunits
		 // call generate() on any new subunits
		 this.finalWDH = this.startWDH;
		 
		var ruleArr = g_SubdivRules[this.styleStr];
		var date = new Date();
		var extraSeed1 = (date.getTime() % 13);
		var extraSeed2 = -(date.getTime() % 11);
		var rule = this.getRule( ruleArr, extraSeed1, extraSeed2 );
		 
		if( this.recursionDepth > 4 ){
			console.log(" ====== RECURSION DEPTH LIMIT MET ============ ");
			this.render = true;
		}
		else {
			var done = false;
			while( ! done ){
				switch( rule.rule ){
			
					default : //TESTING
						//this.split(0, 0); not quite working
						done = true; //don't continue with this one
						break;
				}
			}
		}		
		 
	}

	generateFloors() {
		//start with ground floor, facing forward
		this.generateOneFloor( 0, this.isOnGround );
		for( var fl = 1; fl < this.finalWDH[2]; fl++ )
		  this.generateOneFloor( fl, false );
	}

	generateOneFloor( floorNumber, isGroundFloor ) {
		//Four sides to a floor
		var outVector = new THREE.Vector3( this.orientation.x, this.orientation.y, this.orientation.z ); 
		for( var side = 0; side < 4; side++ ){

			//Determine floor layout
			//Call a method based on style?
			//Test:
			var layout = [];
			if( isGroundFloor)
				layout = this.style.groundLayout;
			else
				layout = this.style.upperLayout;
			//Now generate geometry
			var numUnits = this.finalWDH[ side % 2 ];
			var centerUnit = numUnits / 2.0 - 0.5;
			var fwdOffset = this.finalWDH[ (side+1) % 2 ] / 2; //get the other of width or depth
			for( var unit=0; unit < numUnits; unit++) {
				//try to get offset right to align with axes
				//console.log('calling building.generateMesh');
				var index = unit % layout.length; //layout is fixed length, so just repeat or truncate as necessary
				this.generateWallMesh( layout[index], unit - centerUnit, fwdOffset, floorNumber, side * 90 )
			};
			
		}
	}

	generateWallMesh( typeStr, lateralOffsetWallUnits, fwdOffsetWallUnits, heightFloorUnits, rotation ){
		//console.log('in generateWallMesh: ',  typeStr, lateralOffsetWallUnits, fwdOffsetWallUnits, heightFloorUnits, rotation);
		var mesh = this.style.generateMesh( typeStr );
		
		var modelWHD = this.style.modelWHD;
		//Scale to size
		mesh.scale.set( modelWHD[0], modelWHD[1], modelWHD[2] );

		//Move into position
		mesh.position.set( this.center.x, this.center.y, this.center.z );

		//Orientation
		// orient to face along building orientation (TODO)
		//Rotate into orientation for the wall that it's in
		mesh.rotateY( rotation / 180 * 3.141592 );

		//translate		
		var x = modelWHD[0] * lateralOffsetWallUnits;
		var y = modelWHD[1] * (heightFloorUnits + this.baseFloor + 0.5); //move up half wall-unit to get center at center of floor height
		var z = modelWHD[0] * fwdOffsetWallUnits; //use wall width for this
		mesh.translateX( x );
		mesh.translateY( y );
		mesh.translateZ( z );

		//add to scene
		this.scene.add( mesh );
	}

	generateRoof() {
		var roofType;
		var roofHeight;
	
		if( this.supportsRoof ) {//does it need a roof? if not, just a flat top, i.e. bottom unit of multi-unit building
		   roofType = this.style.roofType;
		   roofHeight = this.style.roofHeight;
		} else {
		   roofType = 'cap';
		   roofHeight = 0.1;
		}

		var mesh = this.style.generateMesh( roofType );
		
		//scale
		var modelWHD = this.style.modelWHD;
		mesh.scale.set( modelWHD[0] * this.finalWDH[0], modelWHD[1] * roofHeight, modelWHD[0] * this.finalWDH[1] );

		//Orient
		//TODO

		//move		
		var x = this.center.x;
		var y = this.center.y + ( this.finalWDH[2] + roofHeight / 2 ) * modelWHD[1];
		var z = this.center.z;
		mesh.translateX( x );
		mesh.translateY( y );
		mesh.translateZ( z );
		this.scene.add( mesh );
	}

 } //end class Building