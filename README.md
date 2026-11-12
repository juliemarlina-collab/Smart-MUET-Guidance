# Smart MUET Guide · Interactive eBook (flipbook)

Open `index.html` through any web server (GitHub Pages works). Double-clicking the file also works in most browsers.

## Put it online (GitHub Pages)
1. Upload everything in this folder to a repo (e.g. `Smart-MUET-eBook`).
2. Settings > Pages > Deploy from branch > `main` / root.
3. Link: `https://juliemarlina-collab.github.io/Smart-MUET-eBook/`

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
