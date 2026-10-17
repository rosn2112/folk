import { applyPageCopy } from './copy.js';

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
document.querySelectorAll('[data-page-link]').forEach(link => link.addEventListener('click', event => {
  if (!embedded) return;
  event.preventDefault();
  window.parent.postMessage({ type: 'residency:navigate', hash: '#contact' }, location.origin);
}));
async function start() {
  let page;
  try { if (embedded && window.parent.location.origin === location.origin) page = window.parent.document; } catch { /* A standalone tour can also be embedded elsewhere. */ }
  if (!page?.querySelector('#main')) {
    try {
      const response = await fetch('../index.html', { cache: 'no-store' });
      if (!response.ok) throw new Error('Home page copy unavailable');
      page = new DOMParser().parseFromString(await response.text(), 'text/html');
    } catch (error) { console.warn(error); }
  }
  if (page) applyPageCopy(page, document);
  await import('./main.js');
}
start().catch(unavailable);
