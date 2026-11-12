/* =====================================================================
   SMART MUET GUIDE · Interactive eBook  (flipbook engine + activities)
   Uses StPageFlip (MIT) for the page-turn animation.
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.BOOK_CONFIG, UNITS = window.BOOK_UNITS, MEDIA = window.BOOK_MEDIA || [], LINKS = window.BOOK_LINKS || {}, MINIS = window.BOOK_MINIS || [];
  const CARD = { clue: "3.2 · Try CLUE", clue2: "3.3 · Try it first: only one is chosen", prep: "4.2 · Build the PREP", speak: "4.4 · Speak now", scan: "5.2 · Find the evidence", peel: "6.3 · Build a PEEL paragraph", self: "1.6 · Where am I now?", c34: "3.4 · Catch the clue", c35: "3.5 · Spot the trap: word-match", p43: "4.3 · Try it first: build the PREP", p45: "4.5 · Spot the trap: script-reader freeze", s53: "5.3 · Try it first: find it, then confirm it", s54: "5.4 · Find the evidence" };

  const N = CFG.totalPages;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, "0");
  const imgSrc = n => CFG.pagePattern.replace("{nn}", pad(n));
  const h = (t, a = {}, ...c) => {
    const e = document.createElement(t);
    for (const k in a) {
      if (k === "class") e.className = a[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), a[k]);
      else if (k === "html") e.innerHTML = a[k];
      else if (a[k] !== false && a[k] != null) e.setAttribute(k, a[k]);
    }
    c.flat().forEach(x => { if (x != null && x !== false) e.append(x.nodeType ? x : document.createTextNode(x)); });
    return e;
  };
  const mi = (name, cls) => h("img", { class: "mot " + (cls || ""), src: "assets/ic-" + name + ".webp", alt: "", width: 56, height: 56, draggable: "false" });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- saved progress ---------------- */
  let state = { units: {}, last: 0, sound: true, hinted: false, name: "", goal: "", skipped: false, marks: [], streak: { day: "", n: 0 }, drafts: {}, mini: {}, free: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(state)); } catch (e) {} };
  const isComplete = u => !!(state.units[u.id] && state.units[u.id].complete);
  const unitScore = u => state.units[u.id] && state.units[u.id].best;
  const firstIncomplete = () => UNITS.find(u => !isComplete(u));
  const guided = () => false;   // nothing is locked: every page is open, checkpoints are optional
  const nm = () => (state.name || "").trim();
  const you = (pre = "", post = "") => nm() ? pre + nm() + post : "";
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const thumbSrc = n => "pages/t/t-" + pad(n) + ".webp";
  const unitOfPage = p => UNITS.find(u => p >= u.from && p <= u.end);

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(msg, ms = 3200) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms);
  }

  /* ---------------- on-page widgets (quiz taps, ticks, stars, typing) ---------------- */
  const WID = window.BOOK_WIDGETS || {};
  state.wd = state.wd || {};
  const wd = state.wd;
  const WALL = [];            // every widget spec, for scoring
  Object.keys(WID).forEach(p => WID[p].forEach(w => { w.p = +p; WALL.push(w); }));
  const wOkCount = prefixes => WALL.filter(w => w.t === "c" && prefixes.some(x => w.id.indexOf(x) === 0) && wd[w.id] === w.ans).length;
  const bonusOf = id => { const b = (state.mini[id] && state.mini[id].data && state.mini[id].data.bonusBest) || 0; return id === "c34" ? Math.min(10, b * 2) : Math.min(6, b); };
  const rollOf = id => wd[id] || 0;
  const wScoreOf = s => {
    let n = 0;
    if (s.from) n += wOkCount(s.from);
    if (s.bonus) n += bonusOf(s.bonus[0]);
    if (s.extra) n += s.extra.reduce((a, id) => a + rollOf(id), 0);
    return n;
  };
  const rowScore = k => ({ "8": () => wOkCount(["8."]), p21: () => wOkCount(["21."]) + bonusOf("c34"), p28: () => wOkCount(["28."]) + rollOf("28.roll"), p35: () => wOkCount(["35."]) + bonusOf("s54"), p42: () => wOkCount(["42."]), q: () => wOkCount(["q."]) }[k] || (() => 0))();
  const anyOn = pfx => WALL.some(w => w.id && pfx.some(x => w.id.indexOf(x) === 0) && wd[w.id] != null);
  const pct = (v, t) => (v / t * 100).toFixed(3) + "%";
  const pos = (e, x, y, w, hh) => { e.style.cssText += `;left:${pct(x, 1000)};top:${pct(y, 1417)};width:${pct(w, 1000)};height:${pct(hh, 1417)}`; return e; };
  const wRefs = [];           // redraw functions
  function buildWidgets(page, pn, list) {
    const L = h("div", { class: "wl" }); page.append(L);
    const pageHasData = () => list.some(w => w.id && wd[w.id] != null);
    const reset = h("button", { type: "button", class: "wreset", hidden: true, onclick: ev => { ev.stopPropagation(); list.forEach(w => { if (w.id && w.t !== "i") delete wd[w.id]; }); save(); redrawAll(); } }, "↺ Redo this page");
    L.append(reset);
    list.forEach(w => {
      if (w.t === "c") {
        w.els = w.o.map(o => {
          const b = pos(h("button", { type: "button", class: "wo" + (w.small ? " sm" : "") + (w.pill ? " pl" : ""), "aria-label": "Answer " + o[0] }), o[1], o[2], o[3], o[4]);
          b.onclick = ev => { ev.stopPropagation(); if (wd[w.id] != null) return; wd[w.id] = o[0]; save(); (o[0] === w.ans ? chimeOk : chimeBad)(); redrawAll(); };
          L.append(b); return b;
        });
        w.draw = () => w.els.forEach((b, i) => {
          const k = w.o[i][0], a = wd[w.id];
          b.className = b.className.replace(/ (ok|bad|reveal)/g, "");
          if (a != null) { if (k === a) b.className += k === w.ans ? " ok" : " bad"; else if (k === w.ans) b.className += " reveal"; }
          b.textContent = a != null && k === a ? (k === w.ans ? "✓" : "✗") : (a != null && k === w.ans ? "✓" : "");
        });
      } else if (w.t === "k") {
        const b = pos(h("button", { type: "button", class: "wo wk", "aria-label": "Tick" }), w.x, w.y, w.w, w.h);
        b.onclick = ev => { ev.stopPropagation(); if (wd[w.id]) delete wd[w.id]; else { wd[w.id] = 1; chimeOk(); } save(); redrawAll(); };
        L.append(b); w.draw = () => { b.classList.toggle("on", !!wd[w.id]); b.textContent = wd[w.id] ? "✓" : ""; };
      } else if (w.t === "i") {
        const inp = pos(h("input", { type: "text", class: "wi", maxlength: 40, autocomplete: "off", placeholder: "type here…" }), w.x, w.y, w.w, w.h);
        inp.value = wd[w.id] || "";
        inp.oninput = () => { wd[w.id] = inp.value; if (w.id === "target") state.goal = inp.value; save(); redrawAll(); };
        ["pointerdown", "touchstart", "mousedown"].forEach(ev => inp.addEventListener(ev, e => e.stopPropagation()));
        L.append(inp); w.draw = () => { if (document.activeElement !== inp) inp.value = wd[w.id] || ""; };
      } else if (w.t === "v") {
        const v = pos(h("div", { class: "wv" }), w.x, w.y, w.w, w.h); v.style.background = w.bg;
        L.append(v); w.draw = () => { v.textContent = wd.target || state.goal || ""; v.hidden = !(wd.target || state.goal); };
      } else if (w.t === "r") {
        const box = pos(h("div", { class: "wr" }), w.x, w.y, w.w, w.h); const st = [];
        for (let i = 0; i < w.n; i++) { const b = h("button", { type: "button", class: "wo wst", "aria-label": "Star " + (i + 1) }, "☆"); b.onclick = ev => { ev.stopPropagation(); wd[w.id] = (wd[w.id] === i + 1 ? i : i + 1); if (wd[w.id]) chimeOk(); save(); redrawAll(); }; st.push(b); box.append(b); }
        L.append(box); w.draw = () => st.forEach((b, i) => { const on = i < (wd[w.id] || 0); b.textContent = on ? "★" : "☆"; b.classList.toggle("on", on); });
      } else if (w.t === "s" || w.t === "tally") {
        const v = pos(h("div", { class: "wsn" }), w.x, w.y, w.w, w.h); v.style.background = w.bg; L.append(v);
        w.draw = () => {
          let n, any;
          if (w.page) { n = w.total ? ["8", "p21", "p28", "p35", "p42", "q"].reduce((a, k) => a + rowScore(k), 0) : rowScore(w.page); any = w.total ? n > 0 : n > 0; }
          else { n = w.t === "tally" ? wOkCount(w.from) : wScoreOf(w); any = n > 0 || (w.from && anyOn(w.from)); }
          v.hidden = !any; v.textContent = w.t === "tally" ? (w.label ? `⭐ Quiz Show stars: ${n} / ${w.of}` : `⭐ ${n} / ${w.of}`) : String(n); v.classList.toggle("tl", w.t === "tally"); v.classList.toggle("tb", pn === 50);
        };
      }
    });
    page._wdraw = () => { reset.hidden = !pageHasData() || !list.some(w => w.t === "c" || w.t === "k" || w.t === "r"); list.forEach(w => w.draw && w.draw()); };
    wRefs.push(page._wdraw); page._wdraw();
  }
  function redrawAll() { wRefs.forEach(f => f()); }

  /* ---------------- build pages ---------------- */
  const bookEl = $("#book");
  const imgs = [];
  const pageEls = [];
  for (let i = 1; i <= N; i++) {
    const page = h("div", { class: "page", "data-density": i === 1 ? "hard" : "soft" });
    const img = h("img", { class: "pg", alt: "Page " + i, draggable: "false", decoding: "async" });
    img.dataset.src = imgSrc(i);
    page.append(img);
    (LINKS[i] || []).forEach(l => {
      const px = 0.6, py = 0.55;
      const a = h("a", { class: "hot", href: l.url || "#", role: "link", "aria-label": l.url ? "Open link" : "Go to page " + l.page });
      a.style.cssText = `left:${Math.max(0, l.x - px)}%;top:${Math.max(0, l.y - py)}%;width:${l.w + px * 2}%;height:${l.h + py * 2}%`;
      if (l.page) a.dataset.page = l.page; else a.dataset.url = l.url;
      page.append(a);
    });
    MEDIA.filter(m => m.page === i).forEach((m, k) => {
      const b = h("button", { class: "hot media", type: "button", "data-media": MEDIA.indexOf(m) }, m.label || "▶ Play");
      b.style.cssText = `left:${m.x}%;top:${m.y}%;width:${m.w}%;height:${m.h}%`;
      page.append(b);
    });
    if (WID[i]) buildWidgets(page, i, WID[i]);
    imgs.push(img); pageEls.push(page); bookEl.append(page);
  }
  function ensureImages(center) {
    for (let i = Math.max(0, center - 3); i <= Math.min(N - 1, center + 7); i++)
      if (!imgs[i].src) imgs[i].src = imgs[i].dataset.src;
  }
  ensureImages(state.last || 0);

  function hashStart() { const m = /[#&]p=(\d+)/.exec(location.hash || ""); if (!m) return 0; const p = Math.max(1, Math.min(N, +m[1])); return p <= 1 ? 0 : (p % 2 === 1 ? p - 1 : p - 2) ; }
  /* ---------------- flipbook ---------------- */
  /* A blank page sits in front of the cover so the cover is the RIGHT page of the first spread.
     That makes the cover turn like a real book (no re-centring jump). Our own page numbers stay the same. */
  const raw = new St.PageFlip(bookEl, {
    width: 500, height: 707, size: "stretch",
    minWidth: 240, maxWidth: 760, minHeight: 340, maxHeight: 1075,
    showCover: true, maxShadowOpacity: 0.45, drawShadow: true, flippingTime: 800,
    usePortrait: true, mobileScrollSupport: false, swipeDistance: 22,
    clickEventForward: true, useMouseEvents: true, startPage: Math.min(hashStart() || state.last || 0, N - 1), autoSize: true
  });
  raw.loadFromHTML(pageEls);
  const stageEl = $("#stage") || bookEl.parentElement;
  // The cover never "curls": it fades into the first spread (cleaner than a flip on a single centred page).
  function fadeTo(m) {
    stageEl.classList.add("xfade"); playFlip();
    setTimeout(() => { raw.turnToPage(m); setTimeout(() => stageEl.classList.remove("xfade"), 80); }, 230);
  }
  const pf = {
    getCurrentPageIndex: () => raw.getCurrentPageIndex(),
    getOrientation: () => raw.getOrientation(),
    turnToPage(m) { raw.turnToPage(m); },
    flip(m) { if (raw.getCurrentPageIndex() === 0 || m === 0) fadeTo(m); else raw.flip(m); },
    flipNext() { if (raw.getCurrentPageIndex() === 0) fadeTo(1); else raw.flipNext(); },
    flipPrev() { if (raw.getCurrentPageIndex() === 1) fadeTo(0); else raw.flipPrev(); },
    on(ev, fn) { raw.on(ev, fn); }, update() { raw.update(); }
  };
  const portrait = () => pf.getOrientation() === "portrait";
  const leftOf = idx => (portrait() || idx === 0) ? idx : (idx % 2 === 1 ? idx : idx - 1);
 
  function centreCover() {}
  const visible = cur => { if (portrait() || cur === 0) return [cur]; return cur + 1 < N ? [cur, cur + 1] : [cur]; };

  /* ---------------- navigation with unit gating ---------------- */
  function gate(targetIdx) {          // returns the unit that blocks, or null
    if (!guided()) return null;
    const u = firstIncomplete();
    if (u && leftOf(targetIdx) > u.end - 1) return u;
    return null;
  }
  function goTo(pageNum, opts = {}) {
    let idx = Math.max(0, Math.min(N - 1, pageNum - 1));
    const blocker = gate(idx);
    if (blocker) {
      toast(`Finish the “${blocker.title}” checkpoint to keep going.`);
      idx = blocker.end - 1;
      setTimeout(() => openUnit(blocker), 450);
    }
    const cur = pf.getCurrentPageIndex();
    ensureImages(idx);
    if (Math.abs(leftOf(idx) - cur) > 3 || opts.jump) pf.turnToPage(leftOf(idx)); else pf.flip(leftOf(idx));
  }
  function step(dir) {
    const cur = pf.getCurrentPageIndex();
    const span = portrait() ? 1 : (cur === 0 && dir > 0 ? 1 : 2);
    const target = dir > 0 ? cur + span : cur - 1;
    if (dir > 0) {
      const b = gate(portrait() ? target : target);
      if (b) { toast(`Finish the “${b.title}” checkpoint to keep going.`); openUnit(b); return; }
      if (cur >= N - 1 || (!portrait() && cur + 1 >= N - 1 && cur !== 0)) { if (visible(cur).includes(N - 1)) return; }
      pf.flipNext();
    } else pf.flipPrev();
  }
  $("#btnNext").onclick = () => step(1);
  $("#btnNext2").onclick = () => step(1);
  $("#btnPrev2").onclick = () => step(-1);
  $("#pageIn").addEventListener("change", e => { const v = Math.max(1, Math.min(N, parseInt(e.target.value, 10) || 1)); goTo(v); });
  $("#pageIn").addEventListener("focus", e => e.target.select());
  $("#btnPrev").onclick = () => step(-1);
  $("#btnFirst").onclick = () => goTo(1, { jump: true });
  $("#btnLast").onclick = () => goTo(N, { jump: true });
  $("#slider").addEventListener("input", e => { $("#pageLbl").textContent = "Page " + e.target.value; });
  $("#slider").addEventListener("change", e => goTo(+e.target.value));
  document.addEventListener("keydown", e => {
    if (!$("#modal").hidden || !$("#mediaModal").hidden || !$("#miniModal").hidden) { if (e.key === "Escape") { closeModal(); closeMedia(); closeMini(); } return; }
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.type !== "range") return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "Escape") { closeDrawer(); $("#search").hidden = true; }
  });

  /* ---------------- UI refresh ---------------- */
  let lastPrompted = null;
  function onFlip() {
    const cur = pf.getCurrentPageIndex();
    // swipe/drag past an unfinished unit → bounce back
    const b = gate(cur);
    if (b) { toast(`Finish the “${b.title}” checkpoint to keep going.`); setTimeout(() => { pf.turnToPage(leftOf(b.end - 1)); openUnit(b); }, 250); return; }
    state.last = cur; save();
    ensureImages(cur);
    refresh();
    // checkpoint auto-prompt (once per unit per visit)
    const vis = visible(cur);
    const u = UNITS.find(x => vis.includes(x.end - 1));
    if (u && guided() && !isComplete(u) && lastPrompted !== u.id) { lastPrompted = u.id; setTimeout(() => { if (modalClosed()) openUnit(u); }, 900); }
  }
  pf.on("flip", onFlip);
  pf.on("changeOrientation", () => { refresh(); });
  window.addEventListener("resize", () => setTimeout(centreCover, 120));
  pf.on("changeState", e => { if (e.data === "flipping") playFlip(); });

  function pageLabel(cur) {
    const v = visible(cur);
    if (v.length === 1) return v[0] === 0 ? "Cover" : "Page " + (v[0] + 1);
    return "Pages " + (v[0] + 1) + "–" + (v[1] + 1);
  }
  function refresh() {
    const cur = pf.getCurrentPageIndex(), v = visible(cur);
    $("#pageLbl").textContent = pageLabel(cur);
    $("#slider").value = v[0] + 1;
    $("#btnPrev").disabled = cur === 0;
    $("#btnNext").disabled = v.includes(N - 1);
    pageEls.forEach((pe, i) => pe.classList.toggle("vis", v.includes(i))); centreCover();
    $("#btnNext2").disabled = v.includes(N - 1); $("#btnPrev2").disabled = cur === 0;
    $("#pageIn").value = v[0] + 1; $("#pgTot").textContent = "/ " + N;
    const mk = $("#btnMark"); const marked = v.some(x => state.marks.includes(x + 1)); mk.textContent = marked ? "⭐" : "☆"; mk.classList.toggle("on", marked);
    renderStrip(); markStrip(v.map(x => x + 1)); if (typeof refreshMinis === 'function') refreshMinis();
    const done = UNITS.filter(isComplete).length;
    $("#progTxt").textContent = `${done} / ${UNITS.length} units`;
    $("#progBar").style.width = (done / UNITS.length * 100) + "%";
    const u = UNITS.find(x => v.includes(x.end - 1)), cp = $("#cpBtn");
    if (u) {
      cp.hidden = false; cp.classList.toggle("done", isComplete(u));
      cp.textContent = ""; cp.append(mi(isComplete(u) ? "trophy" : "check", isComplete(u) ? "pop" : "wob"), isComplete(u) ? `Unit ${u.id} checkpoint done · Review` : `Unit ${u.id} checkpoint · optional`);
      cp.onclick = () => openUnit(u);
    } else cp.hidden = true;
    renderToc(); markThumbs(cur);
  }

  /* ---------------- page clicks (links / media / jumps) ---------------- */
  let lastClick = 0;
  bookEl.addEventListener("click", e => {
    const a = e.target.closest(".hot"); if (!a) return;
    e.preventDefault();
    const now = Date.now(); if (now - lastClick < 350) return; lastClick = now;
    if (a.dataset.mini) return openMini(MINIS.find(x => x.id === a.dataset.mini));
    if (a.dataset.media != null) return playMedia(MEDIA[+a.dataset.media], a);
    if (a.dataset.page) return goTo(+a.dataset.page);
    const url = a.dataset.url || "";
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/);
    if (yt) return openMedia({ type: "youtube", id: yt[1], url });
    window.open(url, "_blank", "noopener");
  });
  // some touch browsers swallow click on page children → also listen for pointerup on hotspots
  bookEl.addEventListener("pointerup", e => {
    if (e.pointerType !== "touch") return;
    const a = e.target.closest(".hot"); if (!a) return;
    setTimeout(() => { if (Date.now() - lastClick > 350) a.click(); }, 60);
  });

  /* ---------------- drawer ---------------- */
  const drawer = $("#drawer"), scrim = $("#scrim");
  function openDrawer() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; renderToc(); renderThumbs(); }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; }
  $("#btnToc").onclick = openDrawer; $("#btnCloseDrawer").onclick = closeDrawer; scrim.onclick = closeDrawer;
  $$(".tab").forEach(t => t.onclick = () => {
    $$(".tab").forEach(x => x.classList.toggle("on", x === t));
    $("#tocPane").hidden = t.dataset.tab !== "toc"; $("#pagesPane").hidden = t.dataset.tab !== "pages"; $("#savedPane").hidden = t.dataset.tab !== "saved";
    if (t.dataset.tab === "saved") renderSaved();
  });
  function renderSaved() {
    const box = $("#savedPane"); box.textContent = "";
    if (!state.marks.length) return box.append(h("p", { class: "empty" }, "No saved pages yet. Tap ☆ at the top to save the page you are on, so you can come back to it fast."));
    state.marks.slice().sort((a, b) => a - b).forEach(p => {
      const u = unitOfPage(p);
      box.append(h("div", { class: "saved-row" },
        h("button", { class: "saved-go", onclick: () => { closeDrawer(); goTo(p); } }, h("img", { src: thumbSrc(p), alt: "" }), h("span", {}, h("b", {}, "Page " + p), h("small", {}, u ? `Unit ${u.id} · ${u.title}` : "Intro"))),
        h("button", { class: "ico", "aria-label": "Remove", onclick: () => { state.marks = state.marks.filter(x => x !== p); save(); renderSaved(); refresh(); } }, "✕")));
    });
  }
  $("#btnMark").onclick = () => {
    const v = visible(pf.getCurrentPageIndex()).map(x => x + 1), p = v[0];
    if (v.some(x => state.marks.includes(x))) { state.marks = state.marks.filter(x => !v.includes(x)); toast("Bookmark removed."); }
    else { state.marks.push(p); toast(`⭐ Saved page ${p}. Find it under Contents › Saved.`); }
    save(); refresh();
  };
  function renderToc() {
    const box = $("#tocPane"); box.textContent = "";
    const cur = visible(pf.getCurrentPageIndex()).map(x => x + 1);
    const first = firstIncomplete();
    const head = h("div", { class: "tochead" }, h("b", {}, nm() ? `Hi ${nm()} 👋` : "Your chapters"), h("small", {}, `${UNITS.filter(isComplete).length} of ${UNITS.length} units done` + (state.goal ? ` · target ${state.goal}` : "")));
    box.append(head);
    const pr = (ic, title, sub, page) => h("button", { class: "toc-mini" + (cur.includes(page) ? " cur" : ""), onclick: () => { closeDrawer(); goTo(page); } }, h("span", {}, ic + " " + title), h("small", {}, sub));
    box.append(h("div", { class: "toc-sec" }, "Start here"));
    box.append(pr("📕", "Cover", "1", 1), pr("📑", "Contents", "2", 2), pr("🚀", "Start here", "3", 3));
    box.append(h("div", { class: "toc-sec" }, "Units + checkpoints"));
    UNITS.forEach(u => {
      const sc = unitScore(u), isCur = cur.some(p => p >= u.from && p <= u.end);
      const locked = guided() && first && u.id > first.id;
      const st = isComplete(u) ? h("span", { class: "toc-st ok" }, Math.round(sc.score / sc.total * 100) + "%")
        : locked ? h("span", { class: "toc-st lock" }, "🔒") : h("span", { class: "toc-st todo" }, "To do");
      const card = h("div", { class: "unit-card" + (isCur ? " cur" : "") + (isComplete(u) ? " done" : "") },
        h("button", { class: "unit-main", onclick: () => { closeDrawer(); goTo(u.from); } },
          h("span", { class: "unit-num", style: "color:" + u.color }, pad(u.id)),
          h("span", { class: "unit-t" }, h("b", {}, u.title), h("small", {}, `Pages ${u.from}–${u.end} · ${u.icon} checkpoint at p. ${u.end}`)), st),
        h("button", { class: "link", onclick: () => { closeDrawer(); openUnit(u); } }, isComplete(u) ? "Review checkpoint →" : "Open checkpoint →"));
      box.append(card);
    });
    $("#btnCert").hidden = !UNITS.every(isComplete);
  }
  function renderThumbs() {
    const box = $("#pagesPane"); if (box.childElementCount) return;
    const g = h("div", { class: "thumbs" });
    for (let i = 1; i <= N; i++) {
      const im = h("img", { alt: "Page " + i, loading: "lazy", src: thumbSrc(i) });
      g.append(h("button", { class: "thumb", "data-p": i, onclick: () => { closeDrawer(); goTo(i); } }, im, "p. " + i));
    }
    box.append(g); markThumbs(pf.getCurrentPageIndex());
  }
  function markThumbs(cur) { const v = visible(cur).map(x => x + 1); $$(".thumb").forEach(t => t.classList.toggle("cur", v.includes(+t.dataset.p))); }
  $("#btnReset").onclick = () => {
    if (confirm("Reset all checkpoint scores and your saved page on this device?")) {
      state.units = {}; state.last = 0; save(); lastPrompted = null; refresh(); goTo(1, { jump: true }); closeDrawer(); toast("Progress reset.");
    }
  };


  /* ---------------- thumbnail strip ---------------- */
  let stripBuilt = false;
  function renderStrip() {
    const box = $("#strip"), first = firstIncomplete();
    if (!stripBuilt) {
      stripBuilt = true;
      for (let i = 1; i <= N; i++) {
        const u = UNITS.find(x => x.end === i);
        box.append(h("button", { class: "st", "data-p": i, "aria-label": "Page " + i, onclick: () => goTo(i) },
          h("img", { src: thumbSrc(i), alt: "", loading: "lazy", draggable: "false" }), h("em", {}, i), u ? h("i", { class: "flag" }, "🏁") : null));
      }
    }
    $$(".st", box).forEach(b => { const p = +b.dataset.p; b.classList.toggle("lock", !!(guided() && first && p > first.end)); });
  }
  function markStrip(pages) {
    const box = $("#strip"); let cur = null;
    $$(".st", box).forEach(b => { const on = pages.includes(+b.dataset.p); b.classList.toggle("cur", on); if (on && !cur) cur = b; });
    if (cur) box.scrollTo({ left: cur.offsetLeft - box.clientWidth / 2 + cur.clientWidth / 2, behavior: "smooth" });
  }

  /* ---------------- zoom ---------------- */
  let zoom = 1, zoomWas = 1;
  function setZoom(z, free) {
    zoom = Math.max(1, Math.min(2.5, free ? z : Math.round(z * 4) / 4));
    const stg = $("#stage"), rx = stg.scrollWidth ? (stg.scrollLeft + stg.clientWidth / 2) / stg.scrollWidth : .5, ry = stg.scrollHeight ? (stg.scrollTop + stg.clientHeight / 2) / stg.scrollHeight : .5;
    const b = $("#book"); b.style.width = (zoom * 100) + "%"; b.style.height = (zoom * 100) + "%";
    const keep = zoom > 1 ? (zoomWas > 1 ? [rx, ry] : [.5, .5]) : null; zoomWas = zoom;
    if (keep) { stg.scrollLeft = keep[0] * stg.scrollWidth - stg.clientWidth / 2; stg.scrollTop = keep[1] * stg.scrollHeight - stg.clientHeight / 2; }
    $("#stage").classList.toggle("zoomed", zoom > 1); $("#zLbl").textContent = Math.round(zoom * 100) + "%";
    setTimeout(() => { window.dispatchEvent(new Event("resize")); try { pf.update(); } catch (e) {} if (zoom > 1) { stg.scrollLeft = (keep ? keep[0] : .5) * stg.scrollWidth - stg.clientWidth / 2; stg.scrollTop = (keep ? keep[1] : .5) * stg.scrollHeight - stg.clientHeight / 2; } }, 80);
  }
  /* pinch to zoom + one-finger pan when zoomed (tablet / phone) */
  (function () {
    const st = $("#stage"); let d0 = 0, z0 = 1, pan = null, pinching = false, wasPinch = false, idx0 = 0, lastApply = 0;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    st.style.touchAction = "pan-x pan-y";
    st.addEventListener("touchstart", e => {
      if (e.touches.length === 2) { pinching = true; wasPinch = true; idx0 = (wasPinch && idx0 !== undefined && st.classList.contains("gest")) ? idx0 : pf.getCurrentPageIndex(); st.classList.add("gest"); d0 = dist(e.touches); z0 = zoom; pan = null; e.stopPropagation(); }
      else if (e.touches.length === 1 && zoom > 1 && !e.target.closest("button,input,.hot,.mcard,.cp,.wl")) { pan = { x: e.touches[0].clientX, y: e.touches[0].clientY, l: st.scrollLeft, t: st.scrollTop, m: false }; e.stopPropagation(); }
    }, { capture: true, passive: true });
    st.addEventListener("touchmove", e => {
      if (pinching && e.touches.length === 2) {
        e.preventDefault(); e.stopPropagation();
        const now = Date.now(); if (now - lastApply < 40) return; lastApply = now;
        setZoom(z0 * dist(e.touches) / d0, true);
      } else if (pan && e.touches.length === 1) {
        e.preventDefault(); e.stopPropagation();
        if (!pan.m && Math.hypot(e.touches[0].clientX - pan.x, e.touches[0].clientY - pan.y) > 8) { pan.m = true; st.classList.add("gest"); }
        st.scrollLeft = pan.l - (e.touches[0].clientX - pan.x); st.scrollTop = pan.t - (e.touches[0].clientY - pan.y);
      }
    }, { capture: true, passive: false });
    const end = e => {
      if (wasPinch) e.stopPropagation();   // keep the page-flip library from reading the pinch as a swipe
      if (pinching && e.touches.length < 2) { pinching = false; setZoom(zoom, true); }
      if (!e.touches.length) {
        pan = null;
        if (wasPinch) { wasPinch = false; const back = () => { if (pf.getCurrentPageIndex() !== idx0) pf.turnToPage(idx0); }; setTimeout(back, 80); setTimeout(back, 1000); }
        setTimeout(() => { if (!pinching && !pan) st.classList.remove("gest"); }, 350);
      }
    };
    st.addEventListener("touchend", end, { capture: true, passive: true });
    st.addEventListener("touchcancel", end, { capture: true, passive: true });
  })();
  $("#zIn").onclick = () => setZoom(zoom + 0.25); $("#zOut").onclick = () => setZoom(zoom - 0.25);
  $("#zLbl").onclick = () => setZoom(1);

  /* ---------------- auto-flip (slideshow) ---------------- */
  let autoT = null;
  function stopAuto(msg) { if (autoT) { clearInterval(autoT); autoT = null; } const b = $("#btnPlay"); b.textContent = "▶"; b.classList.remove("on"); if (msg) toast(msg, 2200); }
  $("#btnPlay").onclick = () => {
    if (autoT) return stopAuto("Auto-flip stopped.");
    const b = $("#btnPlay"); b.textContent = "⏸"; b.classList.add("on"); toast("Auto-flip on. Tap ⏸ to pause.", 2200);
    autoT = setInterval(() => {
      if (!modal.hidden || !$("#mediaModal").hidden || !$("#miniModal").hidden || speaking) return;
      const cur = pf.getCurrentPageIndex();
      if (visible(cur).includes(N - 1)) return stopAuto("You reached the end 🎉");
      if (gate(portrait() ? cur + 1 : cur + (cur === 0 ? 1 : 2))) return stopAuto("Auto-flip paused at your checkpoint.");
      pf.flipNext();
    }, 6000);
  };

  /* ---------------- share link ---------------- */
  $("#btnShare").onclick = async () => {
    const p = visible(pf.getCurrentPageIndex())[0] + 1;
    const url = location.href.split("#")[0] + "#p=" + p;
    try { if (navigator.share) { await navigator.share({ title: CFG.title, text: "Smart MUET Guide, page " + p, url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast("🔗 Link to page " + p + " copied."); } catch (e) { prompt("Copy this link:", url); }
  };

  /* ---------------- search ---------------- */
  const KEYS = [
    ["PREP", "Speaking technique: Point, Reason, Example, Point", 24], ["PEEL", "Writing technique: Point, Explain, Example, Link", 38],
    ["SCAN", "Reading technique for finding answers fast", 31], ["CLUE", "Listening technique", 17],
    ["Band", "How MUET bands and scores work", 8], ["Exam slip", "Check your MUET exam slip online", 13], ["Results", "Check your MUET result", 13],
    ["Registration", "How to register for MUET", 13], ["Fees", "MUET test fees (kadar bayaran)", 13], ["Calendar", "MUET 2027 calendar and dates", 12],
    ["Validity", "How long your MUET result is valid", 5], ["CEFR", "Score and CEFR level", 51]
  ];
  function searchIndex() {
    const out = [];
    KEYS.forEach(k => out.push({ t: k[0], d: k[1], p: k[2], hay: (k[0] + " " + k[1]).toLowerCase() }));
    UNITS.forEach(u => out.push({ t: `Unit ${u.id} · ${u.title}`, d: `Pages ${u.from}–${u.end}`, p: u.from, hay: (u.title + " unit " + u.id).toLowerCase() }));
    return out;
  }
  function doSearch(q) {
    q = q.trim().toLowerCase(); const box = $("#sRes"); box.textContent = "";
    const num = parseInt(q, 10);
    let res = [];
    if (q && !isNaN(num) && num >= 1 && num <= N) res.push({ t: "Go to page " + num, d: "Jump straight there", p: num });
    if (q) res = res.concat(searchIndex().filter(x => x.hay.includes(q)));
    if (q) UNITS.forEach(u => {
      const pool = [].concat(u.mcq.map(x => x.q), u.tf.map(x => x.q), u.fill.map(x => x.q), u.match.pairs.map(x => x[0] + " " + x[1]));
      const hit = pool.find(x => x.toLowerCase().includes(q));
      if (hit && !res.some(r => r.p === u.from && r.t.startsWith("Unit"))) res.push({ t: `Unit ${u.id} · ${u.title}`, d: "“…" + hit.slice(0, 70) + "…”", p: u.from });
    });
    if (!q) { box.append(h("p", { class: "empty" }, "Type a topic, a technique (PREP, PEEL, SCAN, CLUE) or a page number.")); return; }
    if (!res.length) { box.append(h("p", { class: "empty" }, `Nothing found for “${q}”. Try a shorter word.`)); return; }
    res.slice(0, 12).forEach(r => box.append(h("button", { class: "sr", onclick: () => { $("#search").hidden = true; goTo(r.p); } }, h("b", {}, r.t), h("small", {}, r.d), h("span", {}, "p. " + r.p))));
  }
  $("#btnSearch").onclick = () => { $("#search").hidden = false; $("#sInput").value = ""; doSearch(""); setTimeout(() => $("#sInput").focus(), 50); };
  $("#sClose").onclick = () => ($("#search").hidden = true);
  $("#search").addEventListener("click", e => { if (e.target.id === "search") $("#search").hidden = true; });
  $("#sInput").addEventListener("input", e => doSearch(e.target.value));

  /* ---------------- confetti + chimes ---------------- */
  function confetti(n = 90) {
    const box = $("#confetti"), cols = ["#FF751F", "#FFD919", "#3542E8", "#00A88E", "#C80DA0", "#fff"];
    for (let i = 0; i < n; i++) {
      const p = h("i", {}); const sz = 6 + Math.random() * 8;
      p.style.cssText = `left:${Math.random() * 100}%;width:${sz}px;height:${sz * 1.6}px;background:${pick(cols)};animation-duration:${1.8 + Math.random() * 1.8}s;animation-delay:${Math.random() * .5}s;transform:rotate(${Math.random() * 360}deg)`;
      box.append(p); setTimeout(() => p.remove(), 4200);
    }
  }
  function tone(freqs, dur = 0.14) {
    if (!state.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = f;
        const t = ac.currentTime + i * dur; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.12); });
    } catch (e) {}
  }
  const chimeOk = () => { tone([660, 880]); try { navigator.vibrate && navigator.vibrate(15); } catch (e) {} };
  const chimeBad = () => { tone([300, 240], 0.12); try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch (e) {} };
  const chimeWin = () => tone([523, 659, 784, 1047], 0.13);

  /* ---------------- certificate ---------------- */
  function certificate() {
    const c = document.createElement("canvas"); c.width = 1754; c.height = 1240; const g = c.getContext("2d");
    const grd = g.createLinearGradient(0, 0, 0, 1240); grd.addColorStop(0, "#3542E8"); grd.addColorStop(1, "#1d2160"); g.fillStyle = grd; g.fillRect(0, 0, 1754, 1240);
    g.fillStyle = "#fff"; g.beginPath(); g.roundRect(70, 70, 1614, 1100, 36); g.fill();
    g.strokeStyle = "#FF751F"; g.lineWidth = 8; g.beginPath(); g.roundRect(100, 100, 1554, 1040, 24); g.stroke();
    g.textAlign = "center"; g.fillStyle = "#17151E";
    g.font = "800 30px Arial"; g.fillText("SMART MUET GUIDE · BAND UP! 2027", 877, 210);
    g.font = "900 96px Arial"; g.fillStyle = "#3542E8"; g.fillText("Certificate of Completion", 877, 360);
    g.fillStyle = "#5E5868"; g.font = "400 36px Arial"; g.fillText("This certifies that", 877, 470);
    g.fillStyle = "#17151E"; g.font = "900 120px Arial";
    let nameTxt = nm() || "Smart MUET Learner"; let fs = 120; while (g.measureText(nameTxt).width > 1300 && fs > 50) { fs -= 6; g.font = `900 ${fs}px Arial`; }
    g.fillText(nameTxt, 877, 620);
    g.fillStyle = "#FF751F"; g.fillRect(527, 660, 700, 6);
    const tot = UNITS.reduce((a, u) => [a[0] + (unitScore(u) ? unitScore(u).score : 0), a[1] + (unitScore(u) ? unitScore(u).total : 0)], [0, 0]);
    g.fillStyle = "#17151E"; g.font = "400 38px Arial";
    g.fillText(`has completed all ${UNITS.length} units and checkpoints of the interactive eBook`, 877, 760);
    g.fillText(`with an overall best score of ${tot[0]} / ${tot[1]} (${Math.round(tot[0] / (tot[1] || 1) * 100)}%)` + (state.goal ? ` · target ${state.goal}` : ""), 877, 820);
    g.font = "400 30px Arial"; g.fillStyle = "#5E5868";
    g.fillText(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), 877, 930);
    g.fillText("English Language Unit, Jabatan Pengajian Am · Politeknik Port Dickson", 877, 1020);
    g.font = "800 28px Arial"; g.fillStyle = "#3542E8"; g.fillText("Keep practising. You are ready to band up!", 877, 1085);
    const a = document.createElement("a"); a.download = "Smart_MUET_Certificate" + (nm() ? "_" + nm().replace(/\W+/g, "_") : "") + ".png"; a.href = c.toDataURL("image/png"); document.body.append(a); a.click(); a.remove();
    toast("🎓 Certificate saved to your downloads.");
  }
  $("#btnCert").onclick = certificate;
  $("#btnName").onclick = () => { closeDrawer(); showWelcome(true); };


  /* ---------------- how-to-use guide ---------------- */
  const GSTEPS = () => [
    ["📖", `Welcome${you(", ")}!`, `<p><b>Smart MUET Guide · Band Up! 2027</b> is your interactive MUET workbook: ${N} pages, ${UNITS.length} chapters, and you can tap, tick and type right on the pages.</p><p>Each chapter teaches one skill, then lets you practise it:</p><div class="chs">${UNITS.map(u => `<span><b>${u.id}.</b> ${u.title}</span>`).join("")}</div>`],
    ["👆", "1 · Turn the pages", `<ul><li><b>Swipe</b> or drag a page corner to turn.</li><li>Tap the big <b>‹ ›</b> arrows, or type a page number in the box at the bottom.</li><li>Drag the <b>orange slider</b> to jump far, or tap any <b>small page picture</b> under the book.</li><li><b>☰ Contents</b> (top left) opens the chapter list.</li></ul>`],
    ["🔍", "2 · Make it bigger", `<ul><li><b>Pinch</b> with two fingers to zoom in on small text. Drag with one finger to move around.</li><li>Or use the <b>− 100% +</b> buttons at the top. Set it back to 100% to turn pages again.</li><li>Tap <b>⛶</b> for full screen.</li></ul>`],
    ["🔗", "3 · Tap the links and buttons", `<ul><li><b>Blue underlined text</b> jumps to another page.</li><li><b>Coloured pill buttons</b> (Listening, Speaking, Reading, Writing) open the practice pages.</li><li><b>🔊 / ▶ Play</b> buttons play the dialogue or audio.</li><li>Not sure what is tappable? Press <b>🔗</b> at the top to highlight everything.</li></ul>`],
    ["✅", "4 · Answer right on the page", `<ul><li>Tap <b>A / B / C</b> (or FACT / CAP) to answer. You see <span class="tag">✓</span> or <span class="tag">✗</span> straight away, with the correct answer.</li><li>Tap the <b>☐ boxes</b> on “Where am I now?” to tick what you can do.</li><li>On page 9, <b>type</b> your required band, target band and next step.</li><li>Your <b>⭐ stars fill in by themselves</b>. Press <b>↺ Redo this page</b> to try again.</li></ul>`],
    ["🏁", "5 · Chapter checkpoints", `<ul><li>Tap the orange <b>checkpoint</b> button at the bottom to play a short quiz for that chapter.</li><li>It is <b>optional</b> and nothing is locked. Score ${CFG.PASS_PERCENT || 60}% to complete a chapter. Retry any time.</li><li>The small card on the right opens quick games for the page you are on.</li></ul>`],
    ["💾", "6 · Save and come back", `<ul><li>Your name, answers, stars and scores <b>save automatically on this device</b>, so use the same browser each time.</li><li><b>☆</b> bookmarks a page. <b>📤</b> copies a link to the page.</li><li>The top bar shows how many chapters you completed. Tap <b>❓</b> any time to see this guide again.</li></ul>`],
    ["🚀", `Ready${you(", ")}?`, `<p>Your goal: <span class="tag">${state.goal || "your best band"}</span>. Take it one page at a time.</p><p>Start with <b>Chapter 1</b> to know the test, set your goal, and begin practising.</p>`]
  ];
  let gI = 0;
  function showGuide(i) {
    const S = GSTEPS(); gI = Math.max(0, Math.min(S.length - 1, i)); const s = S[gI];
    $("#guide").hidden = false;
    $("#gStep").textContent = gI === 0 ? "How to use this eBook" : `Step ${gI} of ${S.length - 2}`;
    if (gI === S.length - 1) $("#gStep").textContent = "All set";
    $("#gBody").innerHTML = `<div class="big">${s[0]}</div><h2>${s[1]}</h2>${s[2]}`; $("#gBody").scrollTop = 0;
    $("#gDots").innerHTML = S.map((x, k) => `<i class="${k === gI ? "on" : ""}"></i>`).join("");
    $("#gBack").style.visibility = gI ? "visible" : "hidden";
    $("#gNext").textContent = gI === S.length - 1 ? "Start reading ›" : (gI === 0 ? "Show me how ›" : "Next ›");
  }
  function closeGuide() { $("#guide").hidden = true; if (!state.guideSeen) { state.guideSeen = true; save(); try { goTo(1, { jump: true }); } catch (e) {} } }
  $("#gNext").onclick = () => { if (gI >= GSTEPS().length - 1) closeGuide(); else showGuide(gI + 1); };
  $("#gBack").onclick = () => showGuide(gI - 1);
  $("#gX").onclick = closeGuide;
  $("#btnGuide").onclick = () => showGuide(0);

  /* ---------------- welcome (personal touch) ---------------- */
  let wGoal = state.goal || "", wMode = "free"; state.free = true;
  function paintGreet() { $("#greet").textContent = nm() ? `Hi ${nm()} 👋 · Band Up! 2027` : "Band Up! 2027 · Interactive eBook"; }
  function showWelcome(edit) {
    $("#welcome").hidden = false; $("#wName").value = nm(); wGoal = state.goal || "";
    $$("#wGoal button").forEach(b => b.classList.toggle("on", b.dataset.g === wGoal));
    wMode = "free"; $$("#wMode button").forEach(b => b.classList.toggle("on", b.dataset.m === wMode));
    $("#wGo").textContent = edit ? "Save ›" : "Open the book ›"; wLive(); setTimeout(() => $("#wName").focus(), 300);
  }
  $$("#wGoal button").forEach(b => b.onclick = () => { wGoal = wGoal === b.dataset.g ? "" : b.dataset.g; $$("#wGoal button").forEach(x => x.classList.toggle("on", x.dataset.g === wGoal)); });
  function closeWelcome(save_) {
    if (save_) { state.name = $("#wName").value.trim(); state.goal = wGoal; state.free = wMode === "free"; } else state.skipped = true;
    save(); $("#welcome").hidden = true; paintGreet(); refresh(); if (!state.guideSeen) setTimeout(() => showGuide(0), 500);
    if (save_ && nm()) { toast(`Hello ${nm()}! Let’s get you to ${state.goal || "your best band"} 💪`, 3600); confetti(40); }
  }
  $$("#wMode button").forEach(b => b.onclick = () => { wMode = b.dataset.m; $$("#wMode button").forEach(x => x.classList.toggle("on", x === b)); });
  const wLive = () => {
    const n = $("#wName").value.trim(), g = wGoal;
    $("#wHi").textContent = n ? `Hi ${n}! 👋` : "Ready to Band Up?";
    $("#wGo").classList.toggle("wait", !n);
    $("#wNote").textContent = !n ? "Type your name to start" : (g ? `Great, ${n}. Let's aim for ${g}!` : `Now pick your target band, ${n}.`);
  };
  $("#wName").addEventListener("input", wLive);
  $$("#wGoal button").forEach(b => b.addEventListener("click", wLive));
  $("#wGo").onclick = () => { if (!$("#wName").value.trim() && !$("#welcome").dataset.edit) { $("#wName").focus(); $("#wNote").textContent = "Please type your first name 😊"; return; } closeWelcome(true); };
  $("#wSkip").onclick = () => closeWelcome(false);
  $("#wName").addEventListener("keydown", e => { if (e.key === "Enter") closeWelcome(true); });

  /* ---------------- header buttons ---------------- */
  $("#btnLinks").onclick = e => { document.body.classList.toggle("show-hots"); e.currentTarget.classList.toggle("on"); };
  const sndBtn = $("#btnSound");
  const paintSnd = () => { sndBtn.textContent = state.sound ? "🔊" : "🔇"; };
  sndBtn.onclick = () => { state.sound = !state.sound; save(); paintSnd(); };
  paintSnd();
  function focusMode(on) {
    document.body.classList.toggle("focus", on); $("#btnExit").hidden = !on;
    try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
          if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
  }
  $("#btnFocus").onclick = () => focusMode(!document.body.classList.contains("focus"));
  $("#btnExit").onclick = () => focusMode(false);
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && document.body.classList.contains("focus")) focusMode(false); });

  /* ---------------- page-turn sound (WebAudio, no files needed) ---------------- */
  let ac;
  let lastFlipSnd = 0;
  function playFlip() {
    if (!state.sound) return;
    const now = Date.now(); if (now - lastFlipSnd < 450) return; lastFlipSnd = now;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.42, len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 1.6); }
      const s = ac.createBufferSource(); s.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.9;
      f.frequency.setValueAtTime(700, ac.currentTime); f.frequency.exponentialRampToValueAtTime(2200, ac.currentTime + dur * 0.55); f.frequency.exponentialRampToValueAtTime(900, ac.currentTime + dur);
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      const g = ac.createGain(); g.gain.value = 0.22;
      s.connect(f); f.connect(lp); lp.connect(g); g.connect(ac.destination); s.start();
      // soft landing "tap" when the page settles
      const t0 = ac.currentTime + 0.78, o = ac.createOscillator(), og = ac.createGain(); o.type = "sine"; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(70, t0 + 0.09);
      og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      o.connect(og); og.connect(ac.destination); o.start(t0); o.stop(t0 + 0.14);
    } catch (e) {}
  }


  /* ---------------- text-to-speech (device voice) ---------------- */
  let speaking = null;
  function stopSpeak() { try { speechSynthesis.cancel(); } catch (e) {} if (speaking) { speaking.btn && speaking.btn.classList.remove("playing"); speaking = null; } }
  function speak(lines, times, btn) {
    if (!("speechSynthesis" in window)) return toast("Audio voice is not supported on this device.");
    if (speaking && speaking.btn === btn) return stopSpeak();
    stopSpeak();
    const voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    const pref = voices.filter(v => /en[-_](GB|MY|SG|AU|IN)/i.test(v.lang)).concat(voices);
    const who = {}; let k = 0;
    const seq = []; for (let r = 0; r < (times || 1); r++) lines.forEach(l => seq.push([l, r]));
    speaking = { btn }; btn && btn.classList.add("playing");
    let i = 0;
    const next = () => {
      if (!speaking || speaking.btn !== btn) return;
      if (i >= seq.length) return stopSpeak();
      const [[name, text], round] = seq[i++];
      if (name && !(name in who)) who[name] = k++;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB"; u.rate = 0.92;
      const idx = name ? who[name] : 0;
      if (pref.length) u.voice = pref[(idx % 2 === 1 && pref.length > 1) ? 1 : 0];
      u.pitch = idx % 2 === 1 ? 0.8 : 1.15;
      u.onend = () => setTimeout(next, (i < seq.length && seq[i][1] !== round) ? 1800 : 350);
      u.onerror = () => stopSpeak();
      speechSynthesis.speak(u);
    };
    next();
  }
  if ("speechSynthesis" in window) speechSynthesis.getVoices();

  /* ---------------- media (audio / video / YouTube / tts) ---------------- */
  function playMedia(m, btn) {
    if (m.type === "tts") return speak(m.lines, m.times, btn);
    openMedia(m);
  }
  function openMedia(m) {
    const sh = $("#mediaSheet"); sh.textContent = "";
    sh.append(h("div", { class: "mhead", style: "background:#17151E" }, h("span", { class: "em" }, "🎬"),
      h("div", {}, h("h2", {}, m.label ? m.label.replace(/^[▶🔊\s]+/, "") : "Media"), h("small", {}, "Plays inside the eBook")),
      h("button", { class: "x", onclick: closeMedia, "aria-label": "Close" }, "✕")));
    const body = h("div", { class: "mbody" });
    if (m.type === "youtube") {
      body.append(h("iframe", { src: `https://www.youtube-nocookie.com/embed/${m.id}?rel=0&autoplay=1`, allow: "autoplay; encrypted-media; picture-in-picture", allowfullscreen: "", title: "Video" }));
      sh.append(body, h("div", { class: "mfoot" }, h("span", { class: "note" }, "Video not showing?"),
        h("a", { class: "btn alt", href: m.url || `https://youtu.be/${m.id}`, target: "_blank", rel: "noopener" }, "Open on YouTube")));
    } else if (m.type === "video") { body.append(h("video", { src: m.src, controls: "", autoplay: "", playsinline: "" })); sh.append(body); }
    else { body.append(h("audio", { src: m.src, controls: "", autoplay: "" })); sh.append(body); }
    $("#mediaModal").hidden = false;
  }
  function closeMedia() { $("#mediaModal").hidden = true; $("#mediaSheet").textContent = ""; }
  $("#mediaModal").addEventListener("click", e => { if (e.target.id === "mediaModal") closeMedia(); });

  /* =====================================================================
     CHECKPOINT ACTIVITIES
     ===================================================================== */
  const ALL_STEPS = [
    { key: "mcq", label: "Multiple choice", icon: "🔘" },
    { key: "tf", label: "True / False", icon: "✅" },
    { key: "fill", label: "Fill in the blank", icon: "✏️" },
    { key: "match", label: "Matching", icon: "🔗" }
  ];
  let STEPS = ALL_STEPS;
  let S = null;                         // current session
  const modal = $("#modal"), sheet = $("#sheet");
  const modalClosed = () => modal.hidden;
  function closeModal() { modal.hidden = true; stopSpeak(); }
  modal.addEventListener("click", e => { if (e.target === modal && !(CFG.REQUIRE_COMPLETE && S && !isComplete(S.u) && false)) closeModal(); });

  const idxs = n => shuffle(Array.from({ length: n }, (_, i) => i));
  function buildSession(u, sv) {
    STEPS = ALL_STEPS.filter(s => s.key === "mcq" ? u.mcq.length : s.key === "tf" ? u.tf.length : s.key === "fill" ? u.fill.length : u.match.pairs.length);
    const P = sv ? sv.P : { mcq: idxs(u.mcq.length), tf: idxs(u.tf.length), fill: idxs(u.fill.length), right: idxs(u.match.pairs.length) };
    const uu = Object.assign({}, u, { mcq: P.mcq.map(i => u.mcq[i]), tf: P.tf.map(i => u.tf[i]), fill: P.fill.map(i => u.fill[i]) });
    if (!P.opts) P.opts = uu.mcq.map(q => idxs(q.options.length));
    const g = k => (sv && sv[k]) || {};
    return {
      u: uu, base: u, P, tab: sv ? sv.tab : 0,
      mcq: { order: uu.mcq.map((q, qi) => P.opts[qi].map(i => ({ t: q.options[i], i }))), picked: g("mcq").picked || [], done: !!g("mcq").done },
      tf: { picked: g("tf").picked || [], done: !!g("tf").done },
      fill: { vals: g("fill").vals || [], res: g("fill").res || [], done: !!g("fill").done },
      match: { right: P.right, map: g("match").map || {}, sel: null, res: g("match").res || null, done: !!g("match").done }
    };
  }
  function saveDraft() {
    if (!S || S.tab >= STEPS.length) return;
    state.drafts[S.u.id] = { P: S.P, tab: S.tab, mcq: { picked: S.mcq.picked, done: S.mcq.done }, tf: { picked: S.tf.picked, done: S.tf.done },
      fill: { vals: S.fill.vals, res: S.fill.res, done: S.fill.done }, match: { map: S.match.map, res: S.match.res, done: S.match.done } };
    save();
  }
  function openUnit(u, force) {
    if (!modal.hidden && S && S.u.id === u.id && !force) return;
    stopSpeak();
    const base = UNITS.find(x => x.id === u.id), sv = force ? null : state.drafts[u.id];
    if (force) delete state.drafts[u.id];
    S = buildSession(base, sv); modal.hidden = false; renderSheet();
    if (sv) toast("Continuing where you left off 👍", 2200);
  }
  const scoreOf = (k) => {
    const u = S.u;
    if (k === "mcq") return [S.mcq.picked.filter((p, i) => p === u.mcq[i].answer).length, u.mcq.length];
    if (k === "tf") return [S.tf.picked.filter((p, i) => p === u.tf[i].answer).length, u.tf.length];
    if (k === "fill") return [S.fill.res.filter(Boolean).length, u.fill.length];
    return [S.match.res ? S.match.res.filter(Boolean).length : 0, u.match.pairs.length];
  };
  const totals = () => STEPS.reduce((a, s) => { const [x, y] = scoreOf(s.key); return [a[0] + x, a[1] + y]; }, [0, 0]);
  const allDone = () => STEPS.every(s => S[s.key].done);

  function renderSheet() {
    saveDraft();
    const u = S.u, onResult = S.tab === STEPS.length;
    sheet.textContent = "";
    sheet.append(h("div", { class: "mhead", style: "background:" + u.color },
      h("span", { class: "em" }, u.icon),
      h("div", {}, h("h2", { id: "mTitle" }, `Unit ${u.id} checkpoint`), h("small", {}, u.title)),
      h("button", { class: "x", onclick: closeModal, "aria-label": "Close" }, "✕")));
    sheet.append(h("div", { class: "steps" }, STEPS.map((s, i) =>
      h("button", { class: "step" + (S.tab === i ? " cur" : "") + (S[s.key].done ? " done" : ""),
        onclick: () => { if (canVisit(i)) { S.tab = i; renderSheet(); } } }, h("span", {}, S[s.key].done ? "✔" : s.icon), s.label))));
    const body = h("div", { class: "mbody" });
    const foot = h("div", { class: "mfoot" });
    sheet.append(body, foot);
    if (onResult) return renderResult(body, foot);
    const key = STEPS[S.tab].key;
    ({ mcq: rMcq, tf: rTf, fill: rFill, match: rMatch })[key](body, foot);
  }
  const canVisit = i => !CFG.REQUIRE_COMPLETE || i <= S.tab || STEPS.slice(0, i).every(s => S[s.key].done);

  function footer(foot, doneKey, extra) {
    const [x, y] = scoreOf(doneKey);
    const last = S.tab === STEPS.length - 1;
    foot.append(
      h("span", { class: "sc" }, S[doneKey].done ? `Score: ${x} / ${y}` : `Answer all ${y} to continue`),
      h("div", { style: "display:flex;gap:8px" },
        S.tab > 0 ? h("button", { class: "btn alt", onclick: () => { S.tab--; renderSheet(); } }, "‹ Back") : null,
        extra,
        h("button", { class: "btn go", disabled: !S[doneKey].done && CFG.REQUIRE_COMPLETE, onclick: () => { S.tab++; renderSheet(); } }, last ? "See my results ›" : "Next ›")));
  }
  const sayBtn = (lines) => h("button", { class: "say", type: "button", onclick: e => speak(lines, 1, e.currentTarget) }, "🔊 Listen");

  /* ---- 1 · multiple choice ---- */
  function rMcq(body, foot) {
    const u = S.u, st = S.mcq;
    body.append(h("p", { class: "intro" }, "Tap the best answer. You get feedback straight away."));
    u.mcq.forEach((q, qi) => {
      const card = h("div", { class: "q" });
      card.append(h("div", { class: "qt" }, h("i", {}, (qi + 1) + "."), q.q));
      if (q.say) card.append(sayBtn(q.say));
      const box = h("div", { class: "opts" });
      st.order[qi].forEach((o, oi) => {
        const picked = st.picked[qi] !== undefined, isPick = st.picked[qi] === o.i, isAns = o.i === q.answer;
        box.append(h("button", { class: "opt" + (picked ? (isAns ? " ok" : isPick ? " bad" : "") : ""), disabled: picked,
          onclick: () => { st.picked[qi] = o.i; (o.i === q.answer ? chimeOk : chimeBad)(); if (st.picked.filter(x => x !== undefined).length === u.mcq.length) { st.done = true; recordPartial(); } renderSheet(); } },
          h("b", {}, "ABCDEF"[oi]), o.t));
      });
      card.append(box);
      if (st.picked[qi] !== undefined) card.append(h("div", { class: "why " + (st.picked[qi] === q.answer ? "ok" : "bad") }, (st.picked[qi] === q.answer ? pick(["✔ Mantap! ", "✔ Spot on! ", "✔ Well done! ", "✔ Nice one! "]) : pick(["✖ Almost! ", "✖ Not quite. ", "✖ Good try. "])) + q.why));
      body.append(card);
    });
    footer(foot, "mcq");
  }
  /* ---- 2 · true / false ---- */
  function rTf(body, foot) {
    const u = S.u, st = S.tf;
    body.append(h("p", { class: "intro" }, "Is each statement true or false?"));
    u.tf.forEach((q, qi) => {
      const p = st.picked[qi], answered = p !== undefined;
      const card = h("div", { class: "q" }, h("div", { class: "qt" }, h("i", {}, (qi + 1) + "."), q.q));
      const row = h("div", { class: "tfrow" });
      [true, false].forEach(v => row.append(h("button", { class: "opt" + (answered ? (v === q.answer ? " ok" : p === v ? " bad" : "") : ""), disabled: answered,
        onclick: () => { st.picked[qi] = v; (v === q.answer ? chimeOk : chimeBad)(); if (st.picked.filter(x => x !== undefined).length === u.tf.length) { st.done = true; recordPartial(); } renderSheet(); } }, v ? "👍 True" : "👎 False")));
      card.append(row);
      if (answered) card.append(h("div", { class: "why " + (p === q.answer ? "ok" : "bad") }, (p === q.answer ? pick(["✔ Mantap! ", "✔ Spot on! ", "✔ Well done! "]) : pick(["✖ Almost! ", "✖ Good try. "])) + q.why));
      body.append(card);
    });
    footer(foot, "tf");
  }
  /* ---- 3 · fill in the blank ---- */
  const norm = s => String(s).toLowerCase().replace(/[“”"'’.,]/g, "").replace(/\s+/g, " ").trim();
  function rFill(body, foot) {
    const u = S.u, st = S.fill;
    body.append(h("p", { class: "intro" }, "Type the missing word or number, then press “Check answers”."));
    const inputs = [];
    u.fill.forEach((q, qi) => {
      const parts = q.q.split("___");
      const inp = h("input", { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Answer " + (qi + 1), value: st.vals[qi] || "" });
      if (st.done) { inp.disabled = true; inp.classList.add(st.res[qi] ? "ok" : "bad"); }
      inp.addEventListener("input", () => { st.vals[qi] = inp.value; saveDraft(); });
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); (inputs[qi + 1] || inp).focus(); } });
      inputs.push(inp);
      const card = h("div", { class: "q" }, h("div", { class: "qt fillq" }, h("i", {}, (qi + 1) + "."), parts[0], inp, parts[1] || ""));
      if (st.done) card.append(h("div", { class: "why " + (st.res[qi] ? "ok" : "bad") },
        (st.res[qi] ? "✔ Correct. " : `✖ Answer: ${q.answers[0]}. `) + q.why));
      body.append(card);
    });
    const check = h("button", { class: "btn", disabled: st.done, onclick: () => {
      st.res = u.fill.map((q, i) => q.answers.some(a => norm(a) === norm(st.vals[i] || "")));
      st.done = true; recordPartial(); renderSheet();
    } }, "Check answers");
    footer(foot, "fill", st.done ? null : check);
  }
  /* ---- 4 · matching (tap a left item, then its partner) ---- */
  function rMatch(body, foot) {
    const u = S.u, st = S.match, pairs = u.match.pairs;
    body.append(h("p", { class: "intro" }, u.match.title + ". Tap an item on the left, then tap its partner on the right. Tap again to undo."));
    const g = h("div", { class: "mt" }, h("h4", {}, "Items"), );
    g.firstChild.style.gridColumn = "1"; g.append(h("h4", { style: "grid-column:2" }, "Partners"));
    const colorOfRight = {}; Object.keys(st.map).forEach(l => { colorOfRight[st.map[l]] = +l; });
    const L = h("div", { style: "display:grid;gap:10px" }), R = h("div", { style: "display:grid;gap:10px" });
    pairs.forEach((p, i) => {
      const paired = st.map[i] !== undefined;
      const cls = "mi" + (st.sel === i ? " sel" : "") + (paired ? " c" + (i % 6) : "") + (st.res ? (st.res[i] ? " ok" : " bad") : "");
      const b = h("button", { class: cls, disabled: st.done, onclick: () => {
        if (paired) { delete st.map[i]; st.sel = i; } else st.sel = (st.sel === i ? null : i);
        renderSheet();
      } }, p[0]);
      if (st.res && !st.res[i]) b.append(h("em", {}, "✖ Correct: " + pairs[i][1]));
      L.append(b);
    });
    st.right.forEach(ri => {
      const owner = colorOfRight[ri], paired = owner !== undefined;
      const resOk = st.res && paired ? st.res[owner] : null;
      const b = h("button", { class: "mi" + (paired ? " c" + (owner % 6) : "") + (resOk === true ? " ok" : resOk === false ? " bad" : ""), disabled: st.done, onclick: () => {
        if (paired) { delete st.map[owner]; st.sel = owner; renderSheet(); return; }
        if (st.sel == null) return toast("Tap an item on the left first.", 1800);
        st.map[st.sel] = ri; st.sel = null; renderSheet();
      } }, pairs[ri][1]);
      R.append(b);
    });
    g.append(L, R); body.append(g);
    const ready = Object.keys(st.map).length === pairs.length;
    const check = h("button", { class: "btn", disabled: !ready || st.done, onclick: () => {
      st.res = pairs.map((p, i) => st.map[i] === i); st.done = true; st.sel = null; recordPartial(); renderSheet();
    } }, "Check matches");
    if (st.done) body.append(h("div", { class: "why " + (st.res.every(Boolean) ? "ok" : "bad") }, st.res.every(Boolean) ? "✔ Perfect match!" : "Review the correct partners shown in red, then continue."));
    footer(foot, "match", st.done ? null : check);
  }

  /* ---- results + saving ---- */
  function recordPartial() { /* hook: could save per-step progress */ }
  function medal(p) { return p >= 90 ? ["🥇", "Gold!"] : p >= 70 ? ["🥈", "Silver!"] : p >= 50 ? ["🥉", "Bronze!"] : ["💪", "Keep going!"]; }
  function renderResult(body, foot) {
    const u = S.u, [x, y] = totals(), p = Math.round(x / y * 100);
    const pass = p >= (CFG.PASS_PERCENT || 0);
    delete state.drafts[u.id]; save();
    const prev = unitScore(u);
    if (pass) {
      const wasDone = isComplete(u);
      if (!prev || x / y >= prev.score / prev.total) state.units[u.id] = { complete: true, best: { score: x, total: y } };
      else state.units[u.id].complete = true;
      save(); refresh();
      if (!wasDone && state.units[u.id].complete) setTimeout(() => toast(`🎉 Unit ${u.id} complete${you(", ")}! Keep turning pages.`), 300);
      if (p >= 70) { confetti(p >= 90 ? 140 : 80); chimeWin(); } else tone([440, 523], 0.12);
      if (UNITS.every(isComplete)) setTimeout(() => toast(`🏆 ${you("", ", ")}you finished the whole guide! Your certificate is under Contents.`, 5000), 1400);
    }
    const [m, mt] = medal(p);
    body.append(h("div", { class: "result" },
      h("div", { class: "medal" }, pass ? mi("trophy", "pop big") : "🔁"),
      h("h3", {}, pass ? `${you("", ", ")}${p >= 90 ? "you nailed it" : p >= 70 ? "great job" : p >= 50 ? "good effort" : "nice try"}! ${mt} ${x} / ${y} (${p}%)` : `${you("", ", ")}${p >= 40 ? "so close" : "not yet"}! ${x} / ${y} (${p}%). Get ${CFG.PASS_PERCENT}% to complete this checkpoint — you can retry anytime.`),
      h("div", { class: "bk" }, STEPS.map(s => { const [a, b] = scoreOf(s.key); return h("div", {}, h("span", {}, s.icon + " " + s.label), h("span", {}, a + " / " + b)); })),
      UNITS.every(isComplete) ? h("button", { class: "btn go", style: "margin:6px auto 4px", onclick: certificate }, "🎓 Download my certificate") : null,
      h("p", { class: "note" }, pass ? "Your best score is saved on this device. You can retry any time to improve it." : "No stress. Read the unit pages again, then try once more. The questions come in a new order each time.")));
    foot.append(
      !pass ? h("button", { class: "btn alt", onclick: () => { closeModal(); goTo(u.from); } }, `📖 Read pages ${u.from}–${u.end}`) : null,
      h("button", { class: "btn alt", onclick: () => { openUnit(u, true); } }, "↻ Try again"),
      h("button", { class: "btn go", disabled: !pass, onclick: () => { closeModal(); const cur = pf.getCurrentPageIndex(); if (visible(cur).includes(u.end - 1) && !visible(cur).includes(N - 1)) setTimeout(() => step(1), 250); } },
        u.id === UNITS.length ? "Finish ✔" : "Continue reading ›"));
  }


  /* =====================================================================
     MINI ACTIVITIES on the pages  (Try → Explain → Check → Improve → Save)
     ===================================================================== */
  const miniModal = $("#miniModal"), msheet = $("#miniSheet");
  let M = null, rec = null, planT = null;
  const AUD = {
    open() { return new Promise((res, rej) => { const r = indexedDB.open("smartMuetAudio", 1); r.onupgradeneeded = () => r.result.createObjectStore("a"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
    async put(k, v) { try { const d = await this.open(); return await new Promise(res => { const t = d.transaction("a", "readwrite"); t.objectStore("a").put(v, k); t.oncomplete = () => res(true); t.onerror = () => res(false); }); } catch (e) { return false; } }
  };
  const miniData = id => (state.mini[id] = state.mini[id] || { data: {} });
  function refreshMinis() {
    const dock = $("#miniDock"); if (!dock) return;
    const cur = pf.getCurrentPageIndex(), v = visible(cur).map(x => x + 1);
    dock.textContent = "";
    MINIS.filter(m => v.includes(m.page)).forEach(m => {
      const done = state.mini[m.id] && state.mini[m.id].done;
      const b = h("button", { class: "mcard" + (done ? " done" : ""), type: "button", style: "--mc:" + m.color, onclick: () => openMini(m) },
        h("span", { class: "mic" }, mi(done ? "trophy" : (m.type === "self" ? "check" : /^(scan|s53|s54|clue2)$/.test(m.id) ? "scan" : "puzzle"), done ? "pop" : "wig")),
        h("span", { class: "mtx" }, h("b", {}, (done ? "Done " : "Play ") + (CARD[m.id] || m.label)), h("small", {}, done ? "Tap to review or try again" : "Tap to answer and score")));
      dock.append(b);
    });
  }
  function freshSt(def) { const st = {}; if (def.type === "quiz") { st.ans = {}; st.mode = "practice"; st.played = 0; } return st; }
  function openMini(def) {
    stopSpeak(); const saved = (miniData(def.id).data) || {};
    const sess = miniData(def.id).sess;
    if (sess && def.type !== "speak") { M = { def, st: Object.assign(freshSt(def), JSON.parse(JSON.stringify(saved)), sess.st), checked: !!sess.checked, step: sess.step || 0, revise: !!sess.revise, bonus: !!sess.bonus }; if (def.type === "quiz") M.st.played = 0; }
    else { M = { def, st: Object.assign(freshSt(def), JSON.parse(JSON.stringify(saved))), checked: false, step: 0 }; if (def.type === "quiz") { M.st.ans = {}; M.st.played = 0; } }
    miniModal.hidden = false; renderMini();
  }
  function closeMini() { stopRecording(); clearInterval(planT); miniModal.hidden = true; stopSpeak(); M = null; refreshMinis(); }
  miniModal.addEventListener("click", e => { if (e.target === miniModal) closeMini(); });
  function finishMini(extra) {
    const d = miniData(M.def.id); d.done = true; d.at = Date.now();
    const keep = Object.assign({}, M.st, extra || {}); delete keep.played; delete keep.urls; delete keep.ans; delete keep.qi; d.data = Object.assign(d.data || {}, keep, extra || {});
    save(); refreshMinis();
  }
  function renderMini() {
    const def = M.def; msheet.textContent = "";
    msheet.append(h("div", { class: "mhead", style: "background:" + def.color }, h("span", { class: "em" }, def.icon),
      h("div", {}, h("h2", {}, def.title), h("small", {}, "Try → Check → Improve → Save")),
      h("button", { class: "x", onclick: closeMini, "aria-label": "Close" }, "✕")));
    const body = h("div", { class: "mbody" }), foot = h("div", { class: "mfoot" });
    msheet.append(body, foot);
    (M.bonus ? mMatch : { quiz: mQuiz, prep: mPrep, speak: mSpeak, peel: mPeel, self: mSelf }[def.type])(body, foot);
    saveSess();
  }
  function saveSess() {
    if (!M || M.def.type === "speak") return;
    const st = Object.assign({}, M.st); delete st.urls;
    miniData(M.def.id).sess = JSON.parse(JSON.stringify({ st, step: M.step, checked: M.checked, revise: !!M.revise, bonus: !!M.bonus })); save();
  }
  function syncCheck(ok) {
    const b = msheet.querySelector(".mfoot .btn"), l = msheet.querySelector(".mfoot .sc");
    if (b && !M.checked) { b.disabled = !ok; if (l) l.textContent = ok ? "Ready to check" : "Finish the task to check"; }
  }
  function miniFoot(foot, canCheck, onCheck, label) {
    const left = h("span", { class: "sc" }, M.checked ? "✓ Saved on this device" : (canCheck ? "Ready to check" : "Finish the task to check"));
    const btns = h("div", { style: "display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end" });
    if (!M.checked) btns.append(h("button", { class: "btn", disabled: !canCheck, onclick: onCheck }, label || "Check my answer"));
    else btns.append(h("button", { class: "btn alt", onclick: () => { const dd = miniData(M.def.id); delete dd.sess; ["f", "v2", "si", "pi", "ticks", "qi"].forEach(k => delete dd.data[k]); M.st = freshSt(M.def); M.checked = false; M.step = 0; M.revise = false; renderMini(); } }, "↻ Try again"),
      h("button", { class: "btn go", onclick: closeMini }, "Back to my page ›"));
    foot.append(left, btns); return btns;
  }
  const wc = t => (String(t || "").trim().match(/\S+/g) || []).length;
  const tick = (arr, st) => h("div", { class: "ticks" }, arr.map((t, i) => h("label", { class: "tick" }, h("input", { type: "checkbox", checked: !!(st.ticks && st.ticks[i]), onchange: e => { st.ticks = st.ticks || []; st.ticks[i] = e.target.checked; const d = miniData(M.def.id); d.data = Object.assign(d.data || {}, { ticks: st.ticks }); save(); } }), t)));
  const autosave = (st, extra) => { const d = miniData(M.def.id); d.data = Object.assign(d.data || {}, extra); save(); };

  function mMatch(body, foot) {
    const def = M.def, g = def.bonus, st = M.st;
    if (!st.mm) { st.mm = { pick: {}, done: false, opts: shuffle(g.pairs.map(p => p[1])) }; }
    const mm = st.mm;
    body.append(h("p", { class: "intro" }, "🎮 Bonus game · ", h("b", {}, g.title), " (optional, no pressure)"));
    g.pairs.forEach((p, i) => {
      const sel = h("select", { class: "msel", disabled: mm.done, onchange: e => { mm.pick[i] = e.target.value; saveSess(); { const ok = g.pairs.every((x, k) => mm.pick[k]), b = msheet.querySelector(".mfoot .btn"), l = msheet.querySelector(".mfoot .sc"); if (b && !mm.done) { b.disabled = !ok; if (l) l.textContent = ok ? "Ready to check" : "Match them all to check"; } } } },
        h("option", { value: "" }, "Choose…"), mm.opts.map(o => h("option", { value: o, selected: mm.pick[i] === o }, o)));
      const ok = mm.done && mm.pick[i] === p[1];
      body.append(h("div", { class: "mrow" + (mm.done ? (ok ? " ok" : " bad") : "") }, h("b", {}, p[0]), sel, mm.done ? h("span", { class: "mk" }, ok ? "✓" : "✗ " + p[1]) : null));
    });
    if (mm.done) { const n = g.pairs.filter((p, i) => mm.pick[i] === p[1]).length; body.append(h("div", { class: "why " + (n === g.pairs.length ? "ok" : "bad") }, `⭐ ${n} / ${g.pairs.length} correct. ${n === g.pairs.length ? "Perfect match!" : "Check the red ones, then try again."}`)); }
    const btns = h("div", { style: "display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end" });
    foot.append(h("span", { class: "sc" }, mm.done ? "Bonus game" : (g.pairs.every((x, k) => mm.pick[k]) ? "Ready to check" : "Match them all to check")), btns);
    if (!mm.done) btns.append(h("button", { class: "btn", disabled: !g.pairs.every((x, k) => mm.pick[k]), onclick: () => { mm.done = true; const nOk = g.pairs.filter((p, i) => mm.pick[i] === p[1]).length; const dd = miniData(def.id); dd.data = dd.data || {}; dd.data.bonusBest = Math.max(dd.data.bonusBest || 0, nOk); save(); (nOk === g.pairs.length ? chimeWin : chimeBad)(); renderMini(); } }, "Check my answers"));
    else btns.append(h("button", { class: "btn alt", onclick: () => { delete st.mm; renderMini(); } }, "Play again"));
    btns.append(h("button", { class: "btn" + (mm.done ? " go" : " alt"), onclick: () => { M.bonus = false; renderMini(); } }, "‹ Back to results"), h("button", { class: "btn go", onclick: closeMini }, "Back to my page ›"));
  }
  function mQuiz(body, foot) {
    const def = M.def, st = M.st;
    body.append(h("p", { class: "intro" }, def.intro));
    if (def.audio) {
      body.append(h("div", { class: "chips light" }, [["practice", "Practice · replay any time"], ["challenge", "Challenge · play once"]].map(([k, l]) => h("button", { class: st.mode === k ? "on" : "", disabled: M.checked, onclick: () => { st.mode = k; st.played = 0; renderMini(); } }, l))));
      const once = st.mode === "challenge" && st.played >= 1;
      body.append(h("button", { class: "say", type: "button", disabled: once && !speaking, onclick: e => { st.played++; speak(def.audio, 1, e.currentTarget); } }, once ? "🔊 Played once" : "🔊 Play dialogue"));
      if (!("speechSynthesis" in window)) body.append(h("p", { class: "note" }, "This browser cannot read aloud. Open the transcript after you try."));
    }
    const lines = def.transcript || (def.passage && def.passage.map((t, i) => (i + 1) + ". " + t)) || null;
    if (lines && def.show === "always") body.append(h("div", { class: "tx" }, lines.map(l => h("p", {}, l))));
    if (!st.qi) {
      const missed = (miniData(def.id).data.missed || []).slice(0, 2), rest = shuffle(def.qs.map((_, i) => i).filter(i => !missed.includes(i)));
      st.qi = shuffle(missed.concat(rest).slice(0, Math.min(def.draw || 3, def.qs.length)));
    }
    const QS = st.qi.map(i => def.qs[i]);
    QS.forEach((q, qi) => {
      const opts = q.options || def.transcript;
      const card = h("div", { class: "q" }, h("div", { class: "qt" }, h("i", {}, (qi + 1) + "."), q.q));
      const box = h("div", { class: "opts" });
      opts.forEach((o, oi) => {
        const picked = st.ans[qi], isAns = oi === q.answer;
        box.append(h("button", { class: "opt" + (M.checked ? (isAns ? " ok" : picked === oi ? " bad" : "") : (picked === oi ? " sel" : "")), disabled: M.checked,
          onclick: () => { st.ans[qi] = oi; renderMini(); } }, h("b", {}, "ABCDEF"[oi]), o));
      });
      card.append(box);
      if (M.checked) card.append(h("div", { class: "why " + (st.ans[qi] === q.answer ? "ok" : "bad") }, (st.ans[qi] === q.answer ? "✔ Correct. " : "✖ Not quite. ") + q.why));
      body.append(card);
    });
    if (M.checked && def.bonus) body.append(h("button", { class: "btn bonus", style: "width:100%;margin-top:6px", onclick: () => { M.bonus = true; renderMini(); } }, "🎮 Bonus game: " + def.bonus.title.split(" · ")[0] + " ›"));
    if (M.checked && def.audio && def.show === "after") body.append(h("div", { class: "tx" }, h("b", {}, "Transcript"), def.audio.map(l => h("p", {}, l[0] + ": " + l[1]))));
    miniFoot(foot, QS.every((q, i) => st.ans[i] !== undefined), () => { M.checked = true; stopSpeak(); miniData(def.id).data.missed = st.qi.filter((qx, i) => st.ans[i] !== def.qs[qx].answer); finishMini({ correct: QS.filter((q, i) => st.ans[i] === q.answer).length, total: QS.length, missed: miniData(def.id).data.missed }); renderMini(); });
  }
  function mSelf(body, foot) {
    const def = M.def, st = M.st; st.t = st.t || {};
    body.append(h("p", { class: "intro" }, "Tick what you feel confident doing. This is a reflection, not a MUET band."));
    def.groups.forEach(g => body.append(h("div", { class: "q" }, h("div", { class: "qt" }, g.icon + " " + g.name),
      h("div", { class: "ticks" }, g.items.map((t, i) => h("label", { class: "tick" }, h("input", { type: "checkbox", checked: !!st.t[g.k + i], disabled: M.checked, onchange: e => { st.t[g.k + i] = e.target.checked; saveSess(); } }), t))))));
    body.append(h("p", { class: "intro" }, h("b", {}, "My next practice focus")),
      h("div", { class: "chips light" }, def.groups.map(g => h("button", { class: st.focus === g.k ? "on" : "", disabled: M.checked, onclick: () => { st.focus = g.k; renderMini(); } }, g.icon + " " + g.name))));
    body.append(h("p", { class: "intro" }, h("b", {}, "My target band")),
      h("div", { class: "chips light" }, ["Band 3", "Band 4", "Band 5", "Band 5+"].map(b => h("button", { class: st.band === b ? "on" : "", disabled: M.checked, onclick: () => { st.band = b; renderMini(); } }, b))));
    if (M.checked) {
      const n = Object.values(st.t).filter(Boolean).length, nx = def.next[st.focus];
      body.append(h("div", { class: "why ok" }, `✔ Saved. You ticked ${n} of 12. Next focus: ${nx[0]}.`,
        h("button", { class: "link", onclick: () => { closeMini(); goTo(nx[1]); } }, ` Go to page ${nx[1]} ›`)));
    }
    miniFoot(foot, !!st.focus, () => { M.checked = true; if (st.band) { state.goal = st.band; } finishMini({ focus: st.focus, band: st.band }); renderMini(); }, "Save my self-check");
  }
  function mPrep(body, foot) {
    const def0 = M.def, st = M.st; st.f = st.f || {};
    if (st.pi === undefined) st.pi = Math.floor(Math.random() * def0.prompts.length);
    const def = Object.assign({}, def0, def0.prompts[st.pi]);
    body.append(h("p", { class: "intro" }, "Topic: ", h("b", {}, def.prompt)), h("p", { class: "note" }, "Use keywords or short sentences. Your words save automatically."));
    def.fields.forEach(f => {
      const ta = h("textarea", { rows: 2, placeholder: f.ph, "aria-label": f.label, disabled: M.checked }, st.f[f.k] || "");
      ta.addEventListener("input", () => { st.f[f.k] = ta.value; autosave(st, { f: st.f, pi: st.pi }); syncCheck(def.fields.every(x => wc(st.f[x.k]) >= 1)); saveSess(); });
      body.append(h("div", { class: "fld" }, h("label", {}, h("b", {}, f.k === "P2" ? "P" : f.k), " " + f.label, h("small", {}, f.hint)), ta));
    });
    if (M.checked) {
      const hints = [];
      def.fields.forEach(f => { if (wc(st.f[f.k]) < 4) hints.push(`Your ${f.label} is very short. Add a few more words.`); });
      if (!/for example|for instance|such as|last |when /i.test(st.f.E || "")) hints.push("Your Example may need a signpost like “for example” and a real who/what/how.");
      if (!/\bso\b|therefore|that is why|overall|this is why/i.test(st.f.P2 || "")) hints.push("Start your closing point with “So,” or “That is why…” to link back.");
      body.append(h("div", { class: "why " + (hints.length ? "bad" : "ok") }, hints.length ? ["Small improvements: ", h("ul", {}, hints.map(x => h("li", {}, x)))] : "✔ Nice. All four parts are there and clearly signposted."));
      body.append(h("div", { class: "tx" }, h("b", {}, "Model PREP"), def.fields.map(f => h("p", {}, h("b", {}, f.label + ": "), def.model[f.k]))));
      body.append(h("p", { class: "intro" }, "Self-check (for learning, not a MUET band):"), tick(def.check, st));
    }
    miniFoot(foot, def.fields.every(f => wc(st.f[f.k]) >= 1), () => { M.checked = true; finishMini(); renderMini(); }, "Check my PREP");
  }
  function mPeel(body, foot) {
    const def0 = M.def, st = M.st;
    if (st.si === undefined) st.si = Math.floor(Math.random() * def0.sets.length);
    const def = Object.assign({}, def0, def0.sets[st.si]);
    if (!st.order) { st.order = []; st.pool = shuffle(def.sentences.map((x, i) => i)); }
    st.f = st.f || {};
    if (M.step === 0) {
      body.append(h("p", { class: "intro" }, "Step 1 of 2 · Tap the sentences in PEEL order: Point, Explain, Example, Link."));
      const slots = h("div", { class: "slots" });
      ["Point", "Explain", "Example", "Link"].forEach((lab, i) => {
        const idx = st.order[i], ok = M.checked && idx === i;
        slots.append(h("button", { class: "slot" + (idx !== undefined ? " full" : "") + (M.checked ? (ok ? " ok" : " bad") : ""), disabled: M.checked || idx === undefined,
          onclick: () => { st.pool.push(st.order.splice(i, 1)[0]); renderMini(); } }, h("b", {}, lab), idx !== undefined ? def.sentences[idx].t : "Tap a sentence below"));
      });
      body.append(slots, h("div", { class: "opts" }, st.pool.map(i => h("button", { class: "opt", disabled: M.checked || st.order.length >= 4, onclick: () => { st.order.push(i); st.pool = st.pool.filter(x => x !== i); renderMini(); } }, def.sentences[i].t))));
      const right = st.order.length === 4 && st.order.every((v, i) => v === i);
      if (M.checked) body.append(h("div", { class: "why " + (right ? "ok" : "bad") }, right ? "✔ Correct PEEL order. See how “For instance” and “Therefore” signpost the Example and the Link." : "Not quite. The order is Point → Explain → Example → Link. Check the red boxes."));
      if (!M.checked) foot.append(h("span", { class: "sc" }, st.order.length === 4 ? "Ready to check" : "Place all 4 sentences"), h("button", { class: "btn", disabled: st.order.length !== 4, onclick: () => { M.checked = true; renderMini(); } }, "Check my order"));
      else foot.append(h("span", { class: "sc" }, "Step 1 done"), h("button", { class: "btn go", onclick: () => { M.step = 1; M.checked = false; renderMini(); } }, "Next: write my own ›"));
      return;
    }
    const cur = () => (M.revise ? (st.v2 = st.v2 || {}) : st.f);
    body.append(h("p", { class: "intro" }, "Step 2 of 2 · Task: ", h("b", {}, def.task)), h("p", { class: "note" }, M.revise ? "Improving your paragraph. Your first version is kept." : "Write one sentence for each part."));
    def.fields.forEach(f => {
      const ta = h("textarea", { rows: 2, placeholder: f.ph, "aria-label": f.label, disabled: M.checked }, cur()[f.k] || "");
      ta.addEventListener("input", () => { cur()[f.k] = ta.value; autosave(st, { f: st.f, v2: st.v2, si: st.si }); syncCheck(def.fields.every(x => wc(cur()[x.k]) >= 1)); saveSess(); });
      body.append(h("div", { class: "fld" }, h("label", {}, h("b", {}, f.label)), ta));
    });
    if (M.checked) {
      const c = cur(), hints = [];
      def.fields.forEach(f => { if (wc(c[f.k]) < 6) hints.push(`Your ${f.label} could be a fuller sentence.`); });
      if (!/for example|for instance|such as/i.test(c.E2 || "")) hints.push("Start your Example with “For instance” or “For example”.");
      if (!/therefore|\bso\b|this is why|overall|as a result/i.test(c.L || "")) hints.push("Start your Link with “Therefore,” or “As a result,”.");
      body.append(h("div", { class: "why " + (hints.length ? "bad" : "ok") }, hints.length ? ["To improve: ", h("ul", {}, hints.map(x => h("li", {}, x)))] : "✔ Good paragraph. Each part has a job."));
      body.append(h("p", { class: "intro" }, "Self-check:"), tick(def.check, st));
      if (M.revise) body.append(h("div", { class: "tx" }, h("b", {}, "My first version"), def.fields.map(f => h("p", {}, h("b", {}, f.label + ": "), st.f[f.k] || "–"))));
    }
    const btns = miniFoot(foot, def.fields.every(f => wc(cur()[f.k]) >= 1), () => { M.checked = true; finishMini(); renderMini(); }, "Check my paragraph");
    if (M.checked) btns.prepend(h("button", { class: "btn alt", onclick: () => { M.revise = true; st.v2 = st.v2 || Object.assign({}, st.f); M.checked = false; renderMini(); } }, "✏️ Improve it"));
  }
  function stopRecording() { if (rec) { try { rec.timer && clearInterval(rec.timer); rec.mr && rec.mr.state !== "inactive" && rec.mr.stop(); rec.stream && rec.stream.getTracks().forEach(t => t.stop()); } catch (e) {} rec = null; } }
  async function startRecording(slot) {
    if (!navigator.mediaDevices || !window.MediaRecorder) { M.st.noMic = true; return renderMini(); }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }), mr = new MediaRecorder(stream), chunks = [], myM = M;
      rec = { mr, stream, left: 60, slot };
      mr.ondataavailable = e => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach(t => t.stop()); if (rec && rec.timer) clearInterval(rec.timer); rec = null;
        await AUD.put(myM.def.id + ":" + slot, blob);
        if (M === myM) { M.st.urls = M.st.urls || {}; M.st.urls[slot] = URL.createObjectURL(blob); M.step = slot === 1 ? 2 : 4; renderMini(); }
      };
      mr.start();
      rec.timer = setInterval(() => { if (!rec) return; rec.left--; const t = $("#recT"); if (t) t.textContent = rec.left + "s"; if (rec.left <= 0) mr.stop(); }, 1000);
      renderMini();
    } catch (e) { M.st.noMic = true; renderMini(); }
  }
  function mSpeak(body, foot) {
    const def = M.def, st = M.st, step = M.step; st.f = st.f || {}; st.topic = st.topic || pick(def.topics);
    body.append(h("div", { class: "stepper" }, ["Plan", "Record", "Listen back", "Record again", "Done"].map((n, i) => h("span", { class: i === step ? "cur" : i < step ? "ok" : "" }, (i + 1) + " " + n))));
    body.append(h("div", { class: "topic" }, "Topic: ", h("b", {}, st.topic), step === 0 ? h("button", { class: "link", onclick: () => { st.topic = pick(def.topics.filter(x => x !== st.topic)); renderMini(); } }, " 🎲 Another topic") : null));
    const next = (label, fn) => foot.append(h("span", { class: "sc" }, ""), h("button", { class: "btn go", onclick: fn }, label));
    if (st.noMic && (step === 1 || step === 3)) { body.append(h("div", { class: "why bad" }, "Recording is not available (microphone blocked or not supported). Speak aloud for 1 minute, then continue.")); return next("I spoke aloud ›", () => { st.noMic = false; M.step = step === 1 ? 2 : 4; renderMini(); }); }
    if (step === 0) {
      body.append(h("p", { class: "intro" }, "Plan with keywords, not sentences. About 30 seconds."));
      const kw = h("textarea", { rows: 3, placeholder: "P: …   R: …   E: …   P: …" }, st.f.kw || ""); kw.addEventListener("input", () => { st.f.kw = kw.value; });
      body.append(h("div", { class: "timer", id: "planT" }, "30s"), h("button", { class: "btn alt", style: "margin:8px 0", onclick: () => { clearInterval(planT); let n = 30; planT = setInterval(() => { n--; const e = $("#planT"); if (e) e.textContent = n + "s"; if (n <= 0) clearInterval(planT); }, 1000); } }, "⏱ Start 30s timer"), kw);
      return next("Record my response ›", () => { clearInterval(planT); M.step = 1; renderMini(); });
    }
    if (step === 1 || step === 3) {
      const slot = step === 1 ? 1 : 2, on = rec && rec.slot === slot;
      body.append(h("p", { class: "intro" }, step === 1 ? "Speak for up to 1 minute using P-R-E-P. Press stop when you finish." : "Improve it. Fix the one thing you chose, then record again."));
      body.append(on ? h("div", { class: "timer rec" }, "● Recording ", h("span", { id: "recT" }, rec.left + "s")) : h("div", { class: "timer" }, "Ready"));
      body.append(on ? h("button", { class: "btn", onclick: () => rec.mr.stop() }, "■ Stop") : h("button", { class: "btn", onclick: () => startRecording(slot) }, "● Start recording"));
      foot.append(h("span", { class: "sc" }, "Recordings stay on your device."), step === 3 ? h("button", { class: "link", onclick: () => { stopRecording(); M.step = 4; renderMini(); } }, "Skip") : null);
      return;
    }
    if (step === 2) {
      body.append(h("p", { class: "intro" }, "Listen to yourself, then tick what you did:"));
      if (st.urls && st.urls[1]) body.append(h("audio", { src: st.urls[1], controls: "" }));
      body.append(tick(def.check, st), h("div", { class: "fld" }, h("label", {}, h("b", {}, "One thing I will improve:")), h("textarea", { rows: 2, placeholder: "e.g. a more specific example", oninput: e => { st.f.fix = e.target.value; } }, st.f.fix || "")));
      return next("Record a better version ›", () => { M.step = 3; renderMini(); });
    }
    body.append(h("div", { class: "why ok" }, "✔ Well done. Hearing yourself and improving is the real practice. Self-checks are for learning, not a predicted MUET band."));
    if (st.urls && st.urls[1]) body.append(h("p", {}, "First try"), h("audio", { src: st.urls[1], controls: "" }));
    if (st.urls && st.urls[2]) body.append(h("p", {}, "Improved try"), h("audio", { src: st.urls[2], controls: "" }));
    if (!M.checked) { M.checked = true; finishMini(); }
    miniFoot(foot, true, () => {});
  }

  /* ---------------- start ---------------- */
  function bumpStreak() {
    const today = new Date().toISOString().slice(0, 10), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (state.streak.day === today) return state.streak.n;
    state.streak = { day: today, n: state.streak.day === y ? state.streak.n + 1 : 1 }; save(); return state.streak.n;
  }
  paintGreet(); refresh(); setZoom(1); refreshMinis();
  const streak = bumpStreak();
  if (!state.name && !state.skipped) showWelcome(false);
  else if (!state.guideSeen) showGuide(0);
  else if (!state.hinted) { const hint = $("#hint"); hint.hidden = false; setTimeout(() => { hint.hidden = true; state.hinted = true; save(); }, 6500); }
  else if (state.last > 0) toast(`Welcome back${you(", ")}! Continuing from ${pageLabel(state.last).toLowerCase()}.` + (streak > 1 ? ` 🔥 ${streak}-day streak` : ""), 3600);
  if (state.name && !state.hinted) { state.hinted = true; save(); }
  window.addEventListener("resize", () => setTimeout(refresh, 300));
  if (location.hash && /p=\d+/.test(location.hash)) setTimeout(() => goTo(+/p=(\d+)/.exec(location.hash)[1], { jump: true }), 400);
  window.SmartMuetBook = { goTo, openUnit: id => openUnit(UNITS.find(u => u.id === id)), pf, setZoom };
})();
