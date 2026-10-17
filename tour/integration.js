const embedded = window.parent !== window;
const exit = () => {
  if (embedded) window.parent.postMessage({ type: 'residency:exit' }, location.origin);
  else location.href = '../#guided-tour';
};
if (!embedded) {
  const mark = document.querySelector('.mark');
  mark.href = '../#guided-tour';
  mark.setAttribute('aria-label', 'Back to the residency website');
}
addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); exit(); }
});
function unavailable() {
  const loader = document.querySelector('.loader');
  loader.classList.remove('done');
  loader.replaceChildren();
  const panel = document.createElement('div');
  panel.className = 'tour-error';
  const heading = document.createElement('h1');
  heading.textContent = 'The tour couldn’t open.';
  const text = document.createElement('p');
  text.textContent = 'You can still explore the real photographs and arrange a visit on the website.';
  const back = document.createElement('button');
  back.className = 'btn';
  back.textContent = 'Back to the website';
  back.addEventListener('click', exit);
  panel.append(heading, text, back);
  loader.append(panel);
  back.focus();
}
addEventListener('residency:load-error', unavailable);
import('./main.js').catch(unavailable);
