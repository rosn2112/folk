export const money = value => '₹' + Math.abs(value).toLocaleString('en-IN');
const amount = value => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(Math.max(0, Math.min(10000000, number))) : 0;
};

export function compareCosts(values, quote = '', extras = 0) {
  const current = values.reduce((sum, value) => sum + amount(value), 0);
  const hasQuote = String(quote).trim() !== '' && Number.isFinite(Number(quote)) && Number(quote) >= 1 && Number(quote) <= 10000000;
  if (!hasQuote) return { total: money(current), hasQuote: false };
  const here = amount(quote) + amount(extras);
  const difference = current - here;
  const verdict = difference > 0 ? `With these amounts, you’d save ${money(difference)} each month.`
    : difference < 0 ? `With these amounts, living here would cost ${money(difference)} more each month.`
      : 'Both come to the same monthly amount.';
  return { total: money(current), hasQuote: true, here: money(here), difference,
    monthly: money(difference), annual: money(difference * 12), verdict };
}

export function visitMessage(interest, when = '', trial = false, question = '') {
  const intros = {
    living: 'Hi! I’m interested in living at Ancient Residency in Santacruz East. Could you share the room rates and what’s available?',
    programmes: 'Hi! I’d like to attend an Ancient AI programme. Could you tell me what’s coming up and how to join?',
    retreats: 'Hi! I’m interested in Ancient AI retreats. Could you share the dates, locations and details?',
    'ancient-ai': 'Hi! I’d like to know more about Ancient AI and how I can get involved.'
  };
  let message = intros[interest] || intros['ancient-ai'];
  if (interest === 'living') {
    if (when === 'This week' || when === 'Next week') message += ` I could come by ${when.toLowerCase()}.`;
    if (when === 'Let’s discuss') message += ' I’d like to discuss a time to visit.';
    if (trial) message += ' I’d also like to ask about the seven-day free stay.';
  }
  const note = String(question ?? '').trim().slice(0, 800);
  return message + (note ? '\n\n' + note : '');
}

export function quoteMessage(total) {
  return `Hi! I’m interested in living at Ancient Residency in Santacruz East. My current monthly expenses come to ${total}. Could you share the room rates and what’s included?`;
}

export function whatsappURL(message) {
  return 'https://wa.me/919257023031?text=' + encodeURIComponent(message);
}
