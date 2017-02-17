import Framework from './Framework';

window.DEMO = 1;
window.mode = window.DEMO;

(function main() {
  let framework = new Framework();
  window.addEventListener('load', framework.onLoad.bind(framework));
  window.addEventListener('resize', framework.onResize.bind(framework), false);
})();
