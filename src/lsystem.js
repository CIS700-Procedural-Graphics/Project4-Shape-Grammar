// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
//function Rule(prob, str) {
//	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
//	this.successorString = str; // The string that will replace the char that maps to this Rule
//}

//NODE
//var Node = function(){
//    var node = {};
//
//    node.name;
//    node.geometry;
//    node.position;  //this is the position of the center of the geometry
//    node.scale; 
//    node.w;         //width
//    node.h;         //height
//    node.grammar;
//    
//    return node;
//};

//LINKEDLIST
//var LinkedList = function(){
//    var list = {};
//    
//    //this should always point to the first node in the list 
//    list.head = null;
//    
//    //this should always point to the last node in the list       
//    list.tail = null;
//    
//    
//    list.linkTwoNodes = function(A,B)
//    {
//        //combine A and B: A.next = B and B.prev = A
//        A.next = B;
//        B.prev = A;
//    };
//  
//    list.addToTail = function(value, iteration)
//    {
//        var newNode = Node(value, iteration);
//      
//        if(!list.head)
//        {
//            this.head = newNode;
//            this.tail = newNode;
//        } 
//        else 
//        { 
//            //connecting the two links
//            this.tail.next = newNode;
//            this.tail.next.prev = this.tail;
//            
//            //setting the tail to the end node
//            this.tail = newNode;  
//        }
//    };
//  
//    
//    list.createLL = function(input_string, iteration)
//    {
//        for (var i=0; i < input_string.length; i++) 
//        { 
//            list.addToTail(input_string.charAt(i), iteration);
//        }
//    };
//    
//    list.iterateAndExpandLL = function(F, X, A, grammar, iteration)
//    {
//        var T_OLL_P = this.head;
//        while (!(!T_OLL_P))
//        {
//            if(T_OLL_P.value == F || T_OLL_P.value == X || T_OLL_P.value == A)
//                {
//                    //console.log(T_OLL_P.value);
//                    var T_NLL_P = new LinkedList();
//                    if(T_OLL_P.value == F)
//                    {
//                        if(Math.floor(Math.random() * 10) <= (grammar.F[0].probability * 10))
//                            T_NLL_P.createLL(grammar.F[0].successorString, iteration);
//                    }
//                    else if(T_OLL_P.value == X)
//                    {
//                        if(Math.floor(Math.random() * 10) <= (grammar.X[0].probability * 10))
//                            T_NLL_P.createLL(grammar.X[0].successorString, iteration);
//                    }
//                    else if(T_OLL_P.value == A)
//                    {
//                        if(Math.floor(Math.random() * 10) <= (grammar.A[0].probability * 10))
//                            T_NLL_P.createLL(grammar.A[0].successorString, iteration);
//                    }
//                    
//                    var T_P = T_OLL_P;
//                    T_OLL_P = T_OLL_P.next;
//                    
//                    if(T_NLL_P.head == null)
//                        {
//                            //console.log(T_OLL_P.value);
//                            continue;
//                        }
//                    
//                    //checking if T_P.prev is null
//                    if(T_P.prev == null)
//                        {
//                            this.head = T_NLL_P.head;
//                            T_NLL_P.tail.next = T_P.next;
//                            
//                            //if X is the only node
//                            if(T_P.next == null)
//                            {
//                                this.tail = T_NLL_P.tail;
//                                break;
//                            }
//                            else //there are mode nodes ahead
//                            {
//                                T_P.next.prev = T_NLL_P.tail;
//                                continue;
//                            }
//                        }
//                    
//                    //checking is T_P.next is null
//                    if(T_P.next == null)
//                        {
//                            this.tail = T_NLL_P.tail;
//                            T_NLL_P.head.prev = T_P.prev;
//                            T_P.prev.next = T_NLL_P.head;
//                            break;
//                        }
//                    
//                    //if T_P is in the middle somewhere
//                    //console.log(T_P.value);
//                    
//                    T_P.prev.next = T_NLL_P.head;
//                    T_P.next.prev = T_NLL_P.tail;
//                    T_NLL_P.head.prev = T_P.prev;
//                    T_NLL_P.tail.next = T_P.next;
//                    T_P = null;
//                    
//                    //console.log(this.makeString());
//                    
//                    continue;
//                    
//                }
//            
//            T_OLL_P = T_OLL_P.next;
//        }
//        
//        //console.log(this.tail.value);
//    };
//    
//    list.makeString = function()
//    {
//        var T_P = this.head;
//        var str = "";
//        while (!(!T_P))
//        {
//            str += T_P.value;
//            T_P = T_P.next;
//        }
//        return str;
//    };
//
//    list.getSize = function()
//    {
//        var size = 0;
//        var T_P = this.head;
//        while (!(!T_P))
//        {
//            size += 1;
//            T_P = T_P.next;
//        }
//        return size;
//    };
//    
//        
//    //Test Functions
//    list.getValue = function() //returns head node value
//    {
//        return list.head.value;
//    };
//    
//    list.getHead = function() //returns the head node
//    {
//        return list.head;
//    };
//    
//    list.getTail = function() //returns the tail
//    {
//        return list.tail;
//    };
//    
//    list.printLLVal = function() //prints all the nodes value in order first to last
//    {
//        var T_NP = list.head;
//        
//        while (!(!T_NP))
//        {
//            console.log(T_NP.value);
//            T_NP = T_NP.next;
//        }
//        
//    };
//
//    return list;
//};
//
//
//// TODO: Turn the string into linked list 
//export function StringToLinkedList(input_string, grammar, n) {
//	// ex. assuming input_string = "F+X"
//	// you should return a linked list where the head is 
//	// at Node('F') and the tail is at Node('X')
//	var ll = new LinkedList();
//    
//    for(var i = 0; i <= n ; i++)
//    {
//        
//        if(i == 0)
//        {    
//            ll.createLL(input_string); // create the LL of the axiom
//        }
//        else // replace axiom with grammar
//        {
//            replaceNode(ll, "F" , "X", "A", grammar, i);
//        }
//    }
//
//    console.log(ll.makeString());
//    return ll;
//}
//
//// TODO: Return a string form of the LinkedList
//export function linkedListToString(linkedList) {
//	// ex. Node1("F")->Node2("X") should be "FX"
//	var result = linkedList.makeString;
//	return result;
//}
//
//// TODO: Given the node to be replaced, 
//// insert a sub-linked-list that represents replacementString
//function replaceNode(linkedList, node1, node2, node3, grammar, iteration) {
//    
//    linkedList.iterateAndExpandLL(node1, node2, node3, grammar, iteration);
//    
//}

//export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
//	this.axiom = "F";
//	this.grammar = {};
//	this.grammar['F'] = [
//		new Rule(0.5, 'F[-F]F[+F][F]')
//	];
//    this.grammar['X'] = [
//		new Rule(0.5, 'X+AF+')
//	];
//    this.grammar['A'] = [
//		new Rule(0.5, '−FX−A')
//	];
//    
//	this.iterations = 0; 
//	
//	// Set up the axiom string
//	if (typeof axiom !== "undefined") {
//		this.axiom = axiom;
//	}
//
//	// Set up the grammar as a dictionary that 
//	// maps a single character (symbol) to a Rule.
//	if (typeof grammar !== "undefined") {
//		this.grammar = Object.assign({}, grammar);
//	}
//	
//	// Set up iterations (the number of times you 
//	// should expand the axiom in DoIterations)
//	if (typeof iterations !== "undefined") {
//		this.iterations = iterations;
//	}
//
//	// A function to alter the axiom string stored 
//	// in the L-system
//	this.UpdateAxiom = function(axiom) {
//		// Setup axiom
//		if (typeof axiom !== "undefined") {
//			this.axiom = axiom;
//		}
//	}
//
//    
//    this.UpdateGrammarF = function(ss_string)
//    {
//        if(typeof this.grammar.F[0] !== "undefined")
//            {
//                //console.log(ss_string);
//                this.grammar.F[0].successorString = ss_string;
//            }
//    }
//    
//    this.UpdateGrammarProbF = function(prob_F)
//    {
//        if(typeof this.grammar.F[0] !== "undefined")
//            {
//                //console.log(prob_F);
//                this.grammar.F[0].probability = prob_F;
//            }
//    }
//    
//    this.UpdateGrammarA = function(ss_string)
//    {
//        if(typeof this.grammar.A[0] !== "undefined")
//            {
//                //console.log(ss_string);
//                this.grammar.A[0].successorString = ss_string;
//            }
//    }
//    
//    this.UpdateGrammarProbA = function(prob_A)
//    {
//        if(typeof this.grammar.A[0] !== "undefined")
//            {
//                //console.log(prob_A);
//                this.grammar.A[0].probability = prob_A;
//            }
//    }
//    
//    
//    this.UpdateGrammarX = function(ss_string)
//    {
//        if(typeof this.grammar.X[0] !== "undefined")
//            {
//                //console.log(ss_string);
//                this.grammar.X[0].successorString = ss_string;
//            }
//    }
//    
//    this.UpdateGrammarProbX = function(prob_X)
//    {
//        if(typeof this.grammar.X[0] !== "undefined")
//            {
//                //console.log(prob_X);
//                this.grammar.X[0].probability = prob_X;
//            }
//    }
//    
//	// TODO
//	// This function returns a linked list that is the result 
//	// of expanding the L-system's axiom n times.
//	// The implementation we have provided you just returns a linked
//	// list of the axiom.
//	this.DoIterations = function(n) {	
//             
//		var lSystemLL = StringToLinkedList(this.axiom, this.grammar, n);
//		return lSystemLL;
//	}
//}