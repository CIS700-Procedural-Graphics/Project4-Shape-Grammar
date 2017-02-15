import Framework from './Framework';

window.DEBUGGING = 1;
window.mode = window.DEBUGGING;

(function main() {
  let framework = new Framework();
  window.addEventListener('load', framework.onLoad.bind(framework));
  window.addEventListener('resize', framework.onResize.bind(framework), false);
})();
