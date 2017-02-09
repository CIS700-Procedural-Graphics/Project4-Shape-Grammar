'use strict';

var _lsystemJs = require('./lsystem.js');

var list = new _lsystemJs.LinkedList();
list.add(new _lsystemJs.ListNode(0));
list.add(new _lsystemJs.ListNode(1));
list.add(new _lsystemJs.ListNode(2));

console.log(list.getAt(2));
console.log(list.size());