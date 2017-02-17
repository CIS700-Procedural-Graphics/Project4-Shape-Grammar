# three-mtl-loader


The three.js mtl loader as a module

## Usage

```javascript
var MTLLoader = require('three-mtl-loader');
var mtlLoader = new MTLLoader();
mtlLoader.setBaseUrl('/path/to/assets/');
mtlLoader.load('model.mtl', function(matl) {
  //do something with matl
});
```
