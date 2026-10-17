import { compareCosts, visitMessage, quoteMessage, whatsappURL } from './site-logic.mjs';

const tourDialog = document.getElementById('tour-dialog');
const modalFrame = document.getElementById('modal-frame');
const inlineFrame = document.getElementById('inline-frame');
const inlineTour = document.getElementById('inline-tour');
const poster = document.getElementById('tour-poster');
let tourFrame = null;
let tourOpener = null;
let inlineOpener = null;
let previousTourParent = null;

function createTour() {
  if (!tourFrame) {
    tourFrame = document.createElement('iframe');
    tourFrame.title = 'Ancient Residency — scroll to explore the guided 3D tour';
    tourFrame.src = 'tour/?embedded=1';
  }
  return tourFrame;
}

function closeInline() {
  inlineTour.hidden = true;
  poster.hidden = false;
  inlineFrame.replaceChildren();
  tourFrame = null;
  inlineOpener?.focus({ preventScroll: true });
}

function openTour(event) {
  // Keep normal links as a fallback if the browser cannot show a modal.
  if (typeof tourDialog.showModal !== 'function') return;
  event.preventDefault();
  tourOpener = event.currentTarget;
  previousTourParent = tourFrame?.parentElement;
  const frame = createTour();
  // moveBefore keeps the running iframe's scroll/camera state on supporting browsers.
  if (frame.isConnected && modalFrame.moveBefore) modalFrame.moveBefore(frame, null);
  else modalFrame.append(frame);
  tourDialog.showModal();
}

document.querySelectorAll('[data-tour-open]').forEach(link => link.addEventListener('click', openTour));
document.querySelector('[data-tour-inline]').addEventListener('click', event => {
  event.preventDefault();
  inlineOpener = event.currentTarget;
  inlineTour.hidden = false;
  poster.hidden = true;
  inlineFrame.append(createTour());
  document.getElementById('inline-close').focus({ preventScroll: true });
});
document.getElementById('inline-close').addEventListener('click', closeInline);
document.getElementById('tour-close').addEventListener('click', () => tourDialog.close());
tourDialog.addEventListener('close', () => {
  if (previousTourParent === inlineFrame) {
    if (inlineFrame.moveBefore) inlineFrame.moveBefore(tourFrame, null);
    else inlineFrame.append(tourFrame);
  } else {
    modalFrame.replaceChildren();
    tourFrame = null;
  }
  previousTourParent = null;
  tourOpener?.focus({ preventScroll: true });
});
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== tourFrame?.contentWindow) return;
  if (event.data?.type !== 'residency:exit') return;
  if (tourDialog.open) tourDialog.close();
  else closeInline();
});

const photoDialog = document.getElementById('photo-dialog');
let photoOpener;
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  const photo = button.querySelector('img');
  photoOpener = button;
  document.getElementById('photo-image').src = photo.src;
  document.getElementById('photo-image').alt = photo.alt;
  document.getElementById('photo-caption').textContent = button.dataset.caption;
  photoDialog.showModal();
}));
document.getElementById('photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('close', () => photoOpener?.focus({ preventScroll: true }));
photoDialog.addEventListener('click', event => { if (event.target === photoDialog) photoDialog.close(); });

const form = document.getElementById('visit-form');
const visitOptions = document.getElementById('visit-options');
const contexts = {
  living: 'We have 2- and 3-sharing rooms at different rates. We’ll share what’s available and arrange a visit.',
  programmes: 'We’ll tell you about upcoming programmes and how to take part. You can ask a question below.',
  retreats: 'We’ll share the dates, locations and details of our retreats. Tell us anything you’d like to know.',
  'ancient-ai': 'Ancient AI brings people together for workshops, mentorship, music and retreats. You can read more or ask us a question.'
};
function updateVisit() {
  const interest = form.querySelector('[name="interest"]:checked').value;
  const living = interest === 'living';
  visitOptions.hidden = !living;
  visitOptions.disabled = !living;
  const data = new FormData(form);
  const message = visitMessage(interest, data.get('when') || '', data.has('trial'), data.get('question'));
  document.getElementById('interest-context').textContent = contexts[interest];
  document.getElementById('interest-resource').hidden = interest !== 'ancient-ai';
  document.getElementById('visit-message').textContent = message;
  document.getElementById('visit-whatsapp').href = whatsappURL(message);
}
form.addEventListener('change', updateVisit);
form.addEventListener('input', updateVisit);
form.addEventListener('submit', event => event.preventDefault());
document.querySelectorAll('[data-interest-link]').forEach(link => link.addEventListener('click', () => {
  const radio = form.querySelector(`[name="interest"][value="${link.dataset.interestLink}"]`);
  radio.checked = true;
  updateVisit();
  radio.focus({ preventScroll: true });
}));
updateVisit();

const costInputs = ['rent', 'food', 'help', 'bills', 'travel', 'appliances'].map(id => document.getElementById(id));
const roomQuote = document.getElementById('room-quote');
const newExtras = document.getElementById('new-extras');
function updateCosts() {
  const result = compareCosts(costInputs.map(input => input.value), roomQuote.value, newExtras.value);
  document.getElementById('cost-total').textContent = result.total;
  document.getElementById('quote-whatsapp').href = whatsappURL(quoteMessage(result.total));
  document.getElementById('savings-result').hidden = !result.hasQuote;
  document.getElementById('quote-prompt').hidden = result.hasQuote;
  if (!result.hasQuote) return;
  document.getElementById('savings-label').textContent = result.difference < 0 ? 'Additional cost each month' : result.difference === 0 ? 'Monthly difference' : 'You could save each month';
  document.getElementById('annual-label').textContent = result.difference < 0 ? 'Additional cost over a year' : 'Over a year';
  document.getElementById('savings-monthly').textContent = result.monthly;
  document.getElementById('savings-annual').textContent = result.annual;
  document.getElementById('cost-verdict').textContent = `Your costs here would be ${result.here} a month. ${result.verdict}`;
}
[...costInputs, roomQuote, newExtras].forEach(input => input.addEventListener('input', updateCosts));
updateCosts();
