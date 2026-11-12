# Smart MUET Guide · Interactive eBook (flipbook)

Open `index.html` through any web server (GitHub Pages works). Double-clicking the file also works in most browsers.

## Put it online (GitHub Pages)
1. Upload everything in this folder to a repo (e.g. `Smart-MUET-eBook`).
2. Settings > Pages > Deploy from branch > `main` / root.
3. Link: `https://juliemarlina-collab.github.io/Smart-MUET-Guidance/`

## Files
| File | What it does |
|---|---|
| `index.html` | the page |
| `style.css` | look and feel |
| `app.js` | flipbook, links, audio/video, activities, saved progress |
| `activities.js` | **all questions + settings (edit this one)** |
| `links.js` | clickable link areas on each page (taken from the eBook) |
| `pages/p-01.webp … p-53.webp` | the eBook pages |
| `lib/page-flip.browser.js` | page-turn engine (StPageFlip, MIT licence) |

## Settings (top of `activities.js`)
- `REQUIRE_COMPLETE: true` readers must finish a unit's checkpoint before going on. `false` = optional.
- `PASS_PERCENT: 0` finishing is enough. Use `60` to need 60% to unlock the next unit.

## Edit questions
Each unit has `mcq`, `tf`, `fill`, `match`. Copy an existing item and change the text.
Use `___` for the blank in `fill`; list accepted answers in `answers`.

## Add audio / video
Edit `BOOK_MEDIA` in `activities.js`. Types: `tts` (device voice), `audio` (mp3), `video` (mp4), `youtube`.
`x, y, w, h` are percentages of the page. Put your files in a `media/` folder.

## If the eBook changes
Export the pages again as WebP (or JPG, then convert), name them `p-01.webp` … and replace the files in `pages/`.

## v2 additions
Welcome screen with name + target band, greeting and streak, page-number box, thumbnail strip (🏁 = checkpoint, 🔒 = locked),
zoom, auto-flip, bookmarks (☆), share link (#p=NN), search, chapter cards with scores, confetti + sounds,
and a downloadable certificate after all 8 units. Upload everything, including the new `pages/t/` thumbnails folder.

## v16 – interactive pages
Quiz Show (pp 46–47) and quick checks (pp 8, 21, 28, 35, 42) are tappable with instant ✓/✗; tick boxes (pp 10) work; "My stars" blanks fill in automatically (incl. p50 table); p9 target lines are typeable and the target shows on p10. "Redo this page" resets a page. Upload widgets.js together with the other files.

## v17
Removed the grey shadow line that followed the page while zooming/scrolling. After the welcome screen (name + target band) a 7-step "How to use this eBook" guide opens, then the book goes to page 1. The ❓ button in the top bar reopens it any time.

## v18
New opening screen: blue gradient with floating icons, glowing cover, "what's inside" badges (53 pages, 8 chapters, 4 skills, 20+ games), band target cards, live "Hi <name>!" greeting, orange Open button that asks for a name first.

## v19
New icon set + skill banners (assets/ic-*.webp, assets/ban-*.webp) used on the welcome screen, how-to guide, practice cards, chapter list, checkpoint headers and checkpoint button.

## v20
Redesigned opening screen: glass card on a deep blue-violet gradient, centred logo, cover with skill icons below, stats strip, band cards, glossy orange Open button. Corner icons removed. Fits tablet landscape without scrolling.
