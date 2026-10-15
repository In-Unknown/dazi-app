import template from './shell.html?raw';
export function mountShell() {
  if (!document.getElementById('app')) document.body.insertAdjacentHTML('afterbegin', template);
}
