import assert from 'node:assert/strict';
import { compareCosts, visitMessage, quoteMessage, whatsappURL } from '../site-logic.mjs';

const current = [18000, 9000, 2500, 2500, 1500, 1000];
assert.deepEqual(compareCosts(current), { total: '₹34,500', hasQuote: false });
for (const quote of ['', ' ', 'not a rate', Infinity, -200, 0, 0.5, 10000001]) assert.equal(compareCosts(current, quote).hasQuote, false);
const cheaper = compareCosts(current, 28000, 1000);
assert.equal(cheaper.here, '₹29,000');
assert.equal(cheaper.monthly, '₹5,500');
assert.equal(cheaper.annual, '₹66,000');
assert.match(cheaper.verdict, /save ₹5,500/);
assert.match(compareCosts([10000], 28000).verdict, /cost ₹18,000 more/);
assert.equal(compareCosts([28000], 28000).difference, 0);
assert.equal(compareCosts(['', -500, NaN, Infinity]).total, '₹0');
assert.equal(compareCosts([32000], '').hasQuote, false);
assert.match(quoteMessage('₹32,000'), /₹32,000/);

const living = visitMessage('living', 'Next week', true, 'Can I see the rooms?');
assert.match(living, /next week/);
assert.match(living, /seven-day free stay/);
assert.match(living, /\n\nCan I see the rooms\?$/);
assert.doesNotMatch(visitMessage('living'), /come by|free stay/);
assert.match(visitMessage('living', 'Let’s discuss'), /discuss a time/);
for (const interest of ['programmes','retreats','ancient-ai']) {
 const message = visitMessage(interest, 'Next week', true);
 assert.doesNotMatch(message, /room rates|come by|free stay/);
}
assert.match(visitMessage('programmes'), /programme/);
assert.match(visitMessage('retreats'), /retreats/);
assert.match(visitMessage('ancient-ai'), /know more about Ancient AI/);
assert.match(visitMessage('unknown'), /know more about Ancient AI/);
const hostile = visitMessage('living', '', false, '<script>alert(1)</script> & ?');
const link = new URL(whatsappURL(hostile));
assert.equal(link.hostname, 'wa.me');
assert.equal(link.pathname, '/919257023031');
assert.equal(link.searchParams.get('text'), hostile);
assert.equal(visitMessage('retreats', '', false, 'x'.repeat(1000)).split('\n\n')[1].length, 800);
console.log('Quote-based savings, all four enquiry types, stale visit-state exclusion and WhatsApp encoding passed.');
