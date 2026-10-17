const clean = value => value.replace(/\s+/g, ' ').trim();

export function textOf(element) {
  if (!element) return '';
  if (typeof element === 'string') return clean(element);
  const copy = element.cloneNode(true);
  copy.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
  copy.querySelectorAll('br').forEach(node => node.replaceWith(' '));
  return clean(copy.textContent);
}

function copyInline(source, target) {
  target.replaceChildren();
  if (typeof source === 'string') { target.textContent = source; return; }
  if (!source) return;
  for (const node of source.childNodes) {
    if (node.nodeType === 3) target.append(target.ownerDocument.createTextNode(node.textContent));
    else if (node.nodeType === 1 && node.getAttribute('aria-hidden') !== 'true') {
      if (node.tagName === 'BR') target.append(target.ownerDocument.createElement('br'));
      else if (['EM', 'STRONG'].includes(node.tagName)) {
        const inline = target.ownerDocument.createElement(node.tagName.toLowerCase());
        copyInline(node, inline);
        target.append(inline);
      } else copyInlineChildren(node, target);
    }
  }
}
function copyInlineChildren(source, target) {
  const text = textOf(source);
  if (text) target.append(target.ownerDocument.createTextNode(text));
}

// The edited home page owns this wording. Missing source copy stays removed.
export function applyPageCopy(page, tour) {
  const amenity = icon => {
    const article = page.querySelector(`.amenity-grid use[href="#${icon}"]`)?.closest('article');
    return { title: article?.querySelector('h3'), note: article?.querySelector('p') };
  };
  const set = (key, title, note = '') => {
    const caption = tour.querySelector(`[data-copy="${key}"]`);
    const heading = caption.querySelector('[data-caption-title]');
    const detail = caption.querySelector('[data-caption-note]');
    copyInline(title, heading);
    copyInline(note, detail);
    heading.hidden = !textOf(title);
    detail.hidden = !textOf(note);
    caption.hidden = heading.hidden;
  };
  const rail = page.querySelector('.location-routes > a:nth-of-type(1)');
  const metro = page.querySelector('.location-routes > a:nth-of-type(2)');
  const hall = amenity('icon-home'), wifi = amenity('icon-wifi');
  const ac = amenity('icon-ac'), bedroom = amenity('icon-bed');
  const meals = amenity('icon-meal'), laundry = amenity('icon-washer');
  const fridge = amenity('icon-fridge'), microwave = amenity('icon-micro');
  set('intro', page.querySelector('#hero-heading'), page.querySelector('.hero-lede'));
  set('railway', rail?.querySelector('strong'), rail?.querySelector('small'));
  set('metro', metro?.querySelector('strong'), metro?.querySelector('small'));
  set('welcome', page.querySelector('.tour-poster-copy p'));
  set('hall', hall.title, hall.note);
  set('ancient-ai', page.querySelector('#about-heading'), page.querySelector('.about-layout > div > p:not(.eyebrow)'));
  set('wifi', wifi.title, wifi.note);
  set('bedroom', ac.title, ac.note);
  set('storage', bedroom.title, bedroom.note);
  set('meals', meals.title, meals.note);
  set('kitchen', [textOf(fridge.title), textOf(microwave.title)].filter(Boolean).join(' & '),
    [textOf(fridge.note), textOf(microwave.note)].filter(Boolean).join(' '));
  set('laundry', laundry.title, laundry.note);
  set('contact', page.querySelector('#contact-heading'));
  const action = textOf(page.querySelector('.header .button'));
  tour.querySelectorAll('[data-contact-action]').forEach(link => {
    link.textContent = action;
    link.hidden = !action || !page.querySelector('#contact');
  });
  for (const [route, selector] of [[rail, '.pin.stn'], [metro, '.pin.metro']]) {
    const pin = tour.querySelector(selector);
    pin.querySelector('b').textContent = textOf(route?.querySelector('strong'));
    pin.querySelector('span').textContent = textOf(route?.querySelector('small'));
    pin.hidden = !textOf(route?.querySelector('strong'));
  }
}
