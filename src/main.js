import Framework from './Framework';

(function main() {
  let framework = new Framework();
  window.addEventListener('load', framework.onLoad.bind(framework));
  window.addEventListener('resize', framework.onResize.bind(framework), false);
})();
