import Framework from './Framework';

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

function main() {


  let framework = new Framework();
  window.addEventListener('load', framework.onLoad.bind(framework));
  window.addEventListener('resize', framework.onResize.bind(framework), false);

}

main();
