# Current redesign validation — 17 October 2026

Local branch: `codex/residency-tour-redesign`, based on upstream `67fdc48`. This pass supersedes the earlier fixed-price calculator and stock-photo comparison.

## Logic and source checks

- Node assertions pass for quote-free totals, positive savings, greater costs, equal amounts, monthly/yearly arithmetic and additional costs. Blank, negative, sub-rupee, invalid or excessive quotes do not produce savings. Invalid current expenses do not poison totals.
- All four enquiry types generate the appropriate WhatsApp message. Visit date and trial interest only enter accommodation messages. Optional notes are bounded to 800 characters and encoded, including markup and URL punctuation.
- JavaScript syntax and application-file whitespace checks pass. Copied Three.js vendor files retain their original upstream whitespace.
- Static validation finds unique IDs, valid internal anchors and existing local resources. No static iframe, public ₹28,000 price or stock-photo comparison remains. The tour comes immediately after the hero.

## Browser checks

- Mobile/default-width opening, rectangular model artwork, four-choice enquiry cards, context information and calculator inspected.
- Desktop review at 1280 × 900: opening artwork, pastel amenities, calculator result and enquiry cards. Responsive checks at 320 px and 390 px show document width equal to viewport width.
- The unactivated page has no iframe.
- With current monthly expenses ₹32,000, an entered quote ₹28,000 and extras ₹1,000, the browser shows ₹3,000/month and ₹36,000/year savings and correctly states total monthly costs here of ₹29,000. The entered quote is test input, not an advertised price.
- Living enquiry includes a selected next-week visit and trial interest. Switching to retreats removes both automatic accommodation fields and hides/disables their controls. Programme and Ancient AI choices generate their own messages; Ancient AI displays the official-site link.
- Typed questions remain available when switching interests. No WhatsApp message was sent.
- A retreat link in the Ancient AI section preselects the retreat enquiry and hides visit controls.
- Full-screen and inline tour entry still work. Closing the inline tour removes its iframe. No errors or warnings appeared in the inspected page console.
- A quote of ₹40,000 against ₹32,000 expenses correctly shows an additional ₹8,000 monthly cost, not savings.

## Transport and content verification

Google Maps was inspected directly in walking mode, rather than inferring times from the illustrative city model:

- Dunhill Corner, Rd Number 4, Sen Nagar, Santacruz East → Santacruz railway station: 6 minutes, 450 m via 7th Road and Road No. 6; alternate 7 minutes, 500 m.
- Dunhill Corner → Santacruz metro, Western Express Highway: 10 minutes, 750 m via 7th Road and Pandit Jawaharlal Nehru Road/Station Road; alternate 10 minutes, 700 m via Road No. 10.
- Directions are linked in the page and identified as approximate. No BKC journey time is asserted.

Building identity: https://www.lalanigroup.in/projects/dunhill-corner and Google Maps. Ancient AI activities/meaning: https://ancientai.in/. Writing review: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing, with the Humanizer skill; vague slogans and fabricated routines were replaced with concrete descriptions.

## Limits

Responsive checks use desktop-browser viewports, not physical phones. Physical Android/iPhone performance, Safari-specific behaviour and poor-network recovery remain untested. Iframe state preservation depends on browser support. The original city's model placement is illustrative and is not treated as evidence for real-world distances. Original parent Blender/tour files are unchanged. No hosting deployment was performed during validation.


## Readability pass

- Increased body copy to 18 px on desktop and 16 px on mobile. Most secondary text is 14 px or larger; route information and actions are 16 px. Display headings and the supplied copy are preserved.
- Increased button, form and integrated-tour caption sizes and darkened muted text. Small-phone enquiry choices use one column; calculator labels/inputs align within each row.
- Inspected the location section at 1280 px and 390 px. Document width matches viewport width at 320 px and 390 px; the enquiry cards use a single column on narrow phones.
- The owner removed the message-preview element. Its optional DOM reference now tolerates that removal, so initialisation continues. Verified programme selection updates the WhatsApp destination and the calculator still shows ₹3,000/month and ₹36,000/year for the earlier test inputs, with no console errors.
- Typography checks were completed before publication.


## Tour copy follows the owner’s edited page

- Removed the old complaint/strikethrough captions, community/kirtan slogans, rate block and photos-on-request pitch from the tour template.
- Scene text now comes from the matching current page elements: hero, tour welcome, hall, Ancient AI, Wi-Fi, AC, storage, meals, fridge/microwave and laundry. Railway and metro labels read the current route cards. Headline emphasis is retained.
- Missing source headings/descriptions are cleared and hidden. No old marketing text exists as a fallback. The browser regression page `/tests/tour-copy.test.html` passed, including simulated later edits and deletions in detached copies of the actual page.
- The final caption uses the page’s current enquiry heading and action. It contains no restored sharing/rate note. In an embedded tour, “Talk to us” closes the tour and returns to the page’s enquiry section; standalone links go to that section directly.
- Verified the real embedded/full-screen closing action: the tour closes, removes its iframe and focuses the enquiry heading at `#contact`. No errors or warnings appeared in the inspected console. The standalone tour also fetched the current owner headline and description.
- Interior caption text has a quiet paper backing so the owner’s words stay readable over darker model surfaces.
- The owner’s main HTML copy was not rewritten during this correction.
