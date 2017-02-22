const THREE = require('three')


/**********************************************************************/
/**************** TREE CLASS FOR BUILDING SHAPEGRAMMAR ****************/
/**********************************************************************/

function TreeNode() {
    this.parent = null;
    this.children = new Array();
    this.position = {
        x: 0,
        y: 0, 
        z: 0
    };

    this.height = 1;
    this.childId = 0;
    this.buildFrom = 1;

    this.xyDim = 0;
    this.objType = -1; //types include: 0cube, 1cyliner, 2cone, 3ground plane. -1 means not instantiated yet so takes parent val
    this.meshAttrib = new THREE.MeshLambertMaterial({ color : fullRGBToHex(125, 125, 125) }); // can be redecl later

    this.addChild = function(child) {
        if (this.buildFrom) {
            this.children.push(child);
            child.parent = this;
        }
    }

    this.addNewChild = function() {
        if (this.buildFrom) {
            var child = new TreeNode();
            this.children.push(child);
            child.parent = this;
            return child;
        }
        return null;
    }
    
}

function Tree() {
    this.head = null;

    // assuming a and b are not null
    this.connectParentAndChild = function(a, b) {
        a.addChild(b);
    }
}

/**************** end: TREE CLASS FOR BUILDING SHAPEGRAMMAR ****************/


function copyOneStateToNew(s1) {
    return new TurtleState(s1.pos, s1.dir);
}

function rgbOneComponentToHex(rgbCol) {
    var hex = rgbCol.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function fullRGBToHex(r, g, b) {
    //console.log("INSIDE FULLRGBTOHEX: r: " + r + ", g: " + g + ", b: " + b);
    return "#" + rgbOneComponentToHex(r) + rgbOneComponentToHex(g) + rgbOneComponentToHex(b);
}

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}
  
export default class Turtle {

    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,2,0), new THREE.Vector3(0,1,0));
        this.scene = scene;

        this.prevSavedStates = [];

        this.tree = 0; // SETTING TURTLE'S CURRENT TREE STATE

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.doNothing(),//this.rotateTurtle.bind(this, 25, 0, 0),
                '-' : this.doNothing(),//this.rotateTurtle.bind(this, -25, 0, 0),
                'F' : this.doNothing(),//this.makeCylinder.bind(this, 2, 0.1), // move forward 1 step

                // the ones i added
                'X' : this.doNothing(),//this.findNewStartLocation(), // does nothing just to control curve
                'A' : this.doNothing(),
                'B' : this.doNothing(),
                'C' : this.doNothing(),
                // the ones required to implement
                '[' : this.doNothing(),//this.saveCurrState.bind(this),
                ']' : this.doNothing(),//this.goToPrevState.bind(this),
                // ENVIRONMENT CONSTRUCTION
                'D' : this.doNothing()//this.buildLandAndWater.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }

        this.color = {
            r : 30,
            g : 60,
            b : 240
        }
    }

    doNothing() {
        // NOTHING
    }

    newCubeDim(y) {
        if (y > 50) {
            return 2;
        } else if (y > 40) {
            return 4;
        } else if (y > 30) {
            return 8;
        } else if (y > 20) {
            return 16;
        } else {
            return 20;
        }
    }

    makeValBetween0and1(val) {
        if (val < 0) {
            val += 1;
        } else if (val > 1) {
            val -= 1;
        }
    }

    // website reference: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    finalTestsWithTemps(temp_1, temp_2, temp_color) {
        if (6 * temp_color < 1) {
            return temp_2 + (temp_1 - temp_2) * 6 * temp_color;
        } else if (2 * temp_color < 1) {
            return temp_1;
        } else if (3 * temp_color < 2) {
            return temp_2 + (temp_1 - temp_2) * (0.666 - temp_color) * 6;
        } else {
            return temp_2;
        }
    }


    // website references:
    //      http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    //      http://serennu.com/colour/rgbtohsl.php
    calcColorCompl(currR, currG, currB) {
        // first converting to HSL

        var divR = currR / 255;
        var divG = currG / 255;
        var divB = currB / 255;

        var max = Math.max(divR, divG, divB);
        var min = Math.min(divR, divG, divB);

        var h = 0;
        var s = 0;
        var l = (max + min) / 2;

        var d = max - min;

        if (max == min) {
            h = 0;
            s = 0;
        } else {
            if (l > 0.5) {
                s = d / (2 - max - min);
            } else {
                s = d / (max + min);
            }
        }

        switch (max) {
            case divR: h = (divG - divB) / d; break;
            case divG: h = (divB - divR) / d + 2; break;
            case divB: h = (divR - divG) / d + 4; break;
        }

        h *= 60; // convert to deg on colored circle
        // keeping within 0 to 360
        if ( h < 0 ) { 
            h += 360;
        }
        // now have HSL values 

        // - find complement now so add 180 to h [rot on the color wheel]
        h += 180;
        // keeping within 0 to 360
        if (h > 360) {
            h -= 360;
        }

        // now convert back to rgb

        // no saturation (S)
        if (s == 0) {
            // then only luminance
            return new THREE.Vector3(l*255, l*255, l*255);
        }

        // otherwise continue with modifications for saturation
        // working with luminance
        var temp_1 = 0;
        if (l < 0.5) {
            temp_1 = l * (1.0 + s);
        } else if (l >= 0.5) {
            temp_1 = l + s - l * s;
        }
        var temp_2 = 2 * l - temp_1;

        // convert hue angle back to 1 (divide by 360)
        h /= 360;

        // temp r g b values based on hue
        var temp_R = h + 0.333;
        var temp_G = h = 0.536;
        var temp_B = h - 0.333;

        // temp colors need to be between 0 and 1
        this.makeValBetween0and1(temp_R);
        this.makeValBetween0and1(temp_G);
        this.makeValBetween0and1(temp_B);

        var working_R = this.finalTestsWithTemps(temp_1, temp_2, temp_R);
        var working_G = this.finalTestsWithTemps(temp_1, temp_2, temp_G);
        var working_B = this.finalTestsWithTemps(temp_1, temp_2, temp_B);

        // multiply by 255 to convert to 8 bit [hex]
        working_R *= 255;
        working_G *= 255;
        working_B *= 255;

        //console.log("IN COLOR: r:" + currR + " g:" + currG+" + b:" + currB);
        //console.log("COMPL COLOR: r:" + working_R + " g:" + working_G+" + b:" + working_B);

        return new THREE.Vector3(Math.floor(working_R), Math.floor(working_G), Math.floor(working_B));
    }

    goToPrevState() {
        var test = this.prevSavedStates.pop();

        if (test != null) {
            this.state = copyOneStateToNew(test); 
        }
    }

    saveCurrState() {
        //this.makeCylinder.bind(this, 1, 0.8);
        this.prevSavedStates.push( new TurtleState( new THREE.Vector3(this.state.pos.x, this.state.pos.y, this.state.pos.z ), 
                                                    new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z ) ));
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));        
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var fullTree = this.buildTree(linkedList);

        this.renderTree(fullTree);
    }

    renderObject(treeNode, xPos, yPos, zPos, width, height) {
        console.log("");
        console.log("RENDERING OBJECT");
        console.log("");

        if (treeNode.parent == null) {
            treeNode.objType == 3;
        }

        // CUBE
        var geometry = new THREE.BoxGeometry( width, width, height);
        // CYLINDER
        if (treeNode.objType == 1) {
            geometry = new THREE.CylinderGeometry( width*4/5, width*4/5, height);
            //geometry = new THREE.CylinderGeometry( width/2, width/2, height);
        // CONE
        } else if (treeNode.objType == 2) {
            geometry = new THREE.CylinderGeometry( width*2/5, width*4/5, height);
            //geometry = new THREE.CylinderGeometry( width/4, width/2, height);
        // BASE PLANE
        } else if (treeNode.objType == 3) {
            geometry = new THREE.PlaneGeometry( width*5, width*5, height);
        }

        var material = treeNode.meshAttrib;
        material.side = THREE.DoubleSide;
        var cube = new THREE.Mesh( geometry, material );

        // TO MAKE SURE FACING PROPER AXIS DIRECTION [different for cylinders and cones]
        if (treeNode.objType != 1 && treeNode.objType != 2) {
            var quat = new THREE.Quaternion();
            quat.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1));
            var mat4 = new THREE.Matrix4();
            mat4.makeRotationFromQuaternion(quat);
            cube.applyMatrix(mat4);
        }

        cube.position.x = xPos;
        cube.position.y = yPos;// + cubeShift; // at top of parent plus shift for current height
        cube.position.z = zPos;

        this.scene.add(cube);
    }

    renderTree(treeNode) {
        if (treeNode != null) {
            var parentY = 0;
            var parentX = 0;
            var parentZ = 0;
            var parentWidth = 0;
            var parentHeight = 0;

            var numParentIterating = 0;

            //console.log(treeNode.parent);
            if (treeNode.parent != null) {
                //console.log("getting in the parent's shift");
                parentY = treeNode.parent.position.y; //treeNode.parent.height/2; // at top of parent
                parentX = treeNode.parent.position.x;
                parentZ = treeNode.parent.position.z;
                parentWidth = treeNode.parent.xyDim;
                parentHeight = treeNode.parent.height;//treeNode.parent.height;
                if (treeNode.parent.objType == 3 /* so on base */) {
                    parentHeight = 0;
                }

                parentY += parentHeight/2;

                numParentIterating = treeNode.parent.children.length;
                if (numParentIterating > 6) {
                    numParentIterating = 6;
                }

                treeNode.xyDim = parentWidth/(numParentIterating+1);
            } else {
                //console.log("DID NOT: get in the parent's shift");
            }
            

            //var locY = treeNode.position.y; // treeNode.height/2 = cubeShift
            treeNode.height = this.newCubeDim(parentY);
            console.log("treeNode.height: " + treeNode.height);
            treeNode.position.y = parentY + treeNode.height/2; //this.newCubeDim(parentY)/2;// + treeNode.height/2; //+ treeNode.height/2; // parentY = at top of parent
            var locY = treeNode.position.y; // treeNode.height/2 = cubeShift

            console.log("currY: " + treeNode.position.y + " parentY: " + parentY);

            console.log("CHECKING POS VALUES FOR MULTIPLE CHILDREN");
            console.log("treeNode.childId : " + (treeNode.childId + 1) + ", numParentIterating: " + numParentIterating);

            var locX = parentX;
            if (numParentIterating > 1) {
                var locAdj = parentWidth/3.5 * Math.cos(2*Math.PI * (treeNode.childId + 1) / numParentIterating);
                //console.log("parentWidth/2: " + (parentWidth/2) + " * cos(" + (2*Math.PI * (treeNode.childId + 1) / numParentIterating) + ")");
                locX += locAdj;
                //console.log("xPos with more than 1 on shared plane: " + locX);
            }
            treeNode.position.x = locX;

            var locZ = parentZ;
            if (numParentIterating > 1) {
                var locAdj = parentWidth/3.5 * Math.sin(2*Math.PI * (treeNode.childId + 1) / numParentIterating);
                //console.log("parentWidth/2: " + (parentWidth/2) + " * sin(" + (2*Math.PI * (treeNode.childId + 1) / numParentIterating) + ")")
                locZ += locAdj;
                //console.log("zPos with more than 1 on shared plane: " + locZ);
            }
            treeNode.position.z = locZ;

            //console.log("RENDERING PARENT:");
            //console.log("parent height: " + treeNode.height + " parent.y: " + treeNode.position.y);

            // max render height to use
            if (locZ < 500) {
                this.renderObject(treeNode, locX, locY, locZ, treeNode.xyDim, treeNode.height);
            }

            // TO DO:
            // BASED ON NUMBER OF CHILDREN - ALLOCATE THEIR X,Y POSITIONS AND XYWIDTHS BASED
            //      ON NUM OF TOTAL CHILREN

            // console.log("rendering");
            var numIterating = treeNode.children.length;
            if (numIterating > 6) {
                numIterating = 6;
            }
            console.log("numChildren: numIterating: " + numIterating);

            // NOTE: IF CHILDREN > 6 IGNORING THOSE
            for (var i =0; i<numIterating; i++) {
                this.renderTree(treeNode.children[i]);                
            }
        }//end: if (tree!=null);

    }

    buildTree(list) {
        var t = new TreeNode();
        t.position.x = 0;
        t.position.y = 0;
        t.position.z = 0;

        // NOTE: ASSUMING NOT GIVING EMPTY LIST : BASE ALWAYS HAS D AT LEAST FOR BASE ENVIRONMENT
        var onElement = list.head;
        var onT = t;
        while (onElement != null) {
            // ADDING A CHILD
            if (onElement.character == '[') {
                var addingTree = new TreeNode();
                addingTree.childId = onT.children.length;
                onT.addChild(addingTree);
                onT = addingTree;

            // ENDING CHILD'S BUILD AND SWITCHING TO DIFF CHILD'S BUILD    
            } else if (onElement.character == ']') {
                if (onT.parent != null && onT.parent.parent != null) {
                    onT = onT.parent;
                } else if (onT.childId != 0) {
                    // choose different child
                    onT = onT.parent.children[Math.floor(Math.random()*onT.parent.children.length)];
                }

            // SWITCHING TO PARENT'S PARENT
            } else if (onElement.character == 'X') {
                if (onT.parent != null) {
                    if (onT.parent.parent != null && onT.parent.parent.parent != null) {
                        onT = onT.parent.parent;
                    } else {
                        onT = onT.parent;
                    }
                } // else do nothing stay on same

            // SETTING MATERIAL OF CURRENT TO RANDOM POSSIBLE COLOR
            } else if (onElement.character == 'A') {
                if (onT.children.length == 0) {
                    var addingTree = onT.addNewChild();
                    if (addingTree != null) {
                        onT = addingTree;
                    }
                }
                // sets material of current thing to something different

                onT.meshAttrib = new THREE.MeshLambertMaterial({ color : fullRGBToHex(Math.floor(Math.random()*255),
                                                                                      Math.floor(Math.random()*100),
                                                                                      Math.floor(Math.random()*255)) });

            // SETTING OBJ BEING CONSTRUCTED TO RANDOM POSSIBLE GEOMETRY
            } else if (onElement.character == 'B') {
                if (onT.children.length == 0) {
                    var addingTree = onT.addNewChild();
                    if (addingTree != null) {
                        onT = addingTree;
                    }
                }

                var rand = Math.floor((Math.random() * 3) % 3);
                onT.objType = rand;

            // SET MATERIAL TO SHINY MATERIAL: PHONG
            } else if (onElement.character == 'C') {
                var r = Math.floor(Math.random()*255);
                var g = Math.floor(Math.random()*100);
                var b = Math.floor(Math.random()*255);
                var compl = new THREE.Vector3(0, 0, 0);
                compl = this.calcColorCompl(r, g, b);
                onT.meshAttrib = new THREE.MeshPhongMaterial({ color : fullRGBToHex(r,
                                                                                    g,
                                                                                    b) },
                                                                    { specular: fullRGBToHex(compl.x,
                                                                                              compl.y,
                                                                                              compl.z) }
                                                                    );

            // BUILDING INITIAL ENVIRONMENT
            } else if (onElement.character == 'D') {
                var texture = new THREE.ImageUtils.loadTexture( '/img/dirtTerrain.jpeg' );
                texture.wrapS =  THREE.RepeatWrapping; 
                texture.wrapT =  THREE.RepeatWrapping;
                texture.repeat.set( 1, 1 ); 
               // texture.

                onT.objType = 3;

                onT.meshAttrib = new THREE.MeshLambertMaterial({ map : texture });
                onT.position.y = 1;
                onT.height = 0;
                onT.xyDim = 200;

                var first = onT.addNewChild();

                onT = first;

            } else {
                console.log("WHAT HAPPENED?!!! : FOUND UNKNOWN CHARACTER : " + onElement.character);
            }


            onElement = onElement.next;
        }//end: while(onElement != null)

        return t;
    }//end: buildTree(list) method



} // end: turtle object