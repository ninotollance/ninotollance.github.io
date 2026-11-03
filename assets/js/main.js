// Script principal du portfolio : thème, langue, effets, filtre et formulaire.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; }
  }

  /* ================= Année du footer ================= */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ================= Mode jour / nuit ================= */
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      store('theme', dark ? 'dark' : 'light');
    });
  }

  /* ================= Textes affichés par le JavaScript ================= */
  // Les textes de la page sont directement dans le HTML.
  // Ici, seulement ceux que le script ajoute lui-même (soutenances, formulaire…).
  // {date}, {n}… sont remplacés par la bonne valeur au moment de l'affichage.
  var TEXTES = {
    'a11y.menu': "Ouvrir le menu",
    'a11y.menuClose': "Fermer le menu",
    'form.err': "L'envoi a échoué. Réessaie ou écris-moi directement par e-mail.",
    'form.invalid': "Remplis les trois champs avec un e-mail valide.",
    'form.ok': "Message envoyé, merci ! Je te réponds vite.",
    'form.send': "Envoyer",
    'form.sending': "Envoi…",
    'hero.timerDone': "Le tour est fait, on en parle ?",
    'skills.soonTitle': "Au programme du CDA · {date}",
    'soutenances.code': "Code source",
    'soutenances.dossier': "Dossier projet",
    'soutenances.dossierDoc': "Dossier projet & doc technique",
    'soutenances.firstNoDate': "Première soutenance à venir",
    'soutenances.less': "Voir moins",
    'soutenances.level0': "",
    'soutenances.level1': "Premiers pas",
    'soutenances.level2': "Apprenti développeur",
    'soutenances.level3': "Développeur en progression",
    'soutenances.level4': "Développeur confirmé",
    'soutenances.level5': "Presque concepteur",
    'soutenances.level6': "Concepteur Développeur d'Applications",
    'soutenances.more1': "Voir l'autre soutenance",
    'soutenances.moreN': "Voir les {n} autres soutenances",
    'soutenances.next': "Prochaine en {date}",
    'soutenances.nextDay': "Prochaine le {date}",
    'soutenances.nextTitle': "Prochaine soutenance",
    'soutenances.progress': "{done} / {total} soutenances",
    'soutenances.techdoc': "Documentation technique",
    'soutenances.validated': "Validée"
  };
  function t(key) { return TEXTES[key] !== undefined ? TEXTES[key] : ''; }
  var timerDone = false;

  /* ================= Zone visible de l'écran ================= */
  // Cas normal : c'est la fenêtre du navigateur (scrollY + innerHeight).
  // Cas particulier : la page est intégrée dans un cadre aussi haut qu'elle (ex. un aperçu) ;
  // c'est alors la page parente qui défile et la page ne « voit » pas le scroll.
  // On retrouve la partie visible grâce à de fines bandes invisibles observées
  // par IntersectionObserver.
  var view = { top: 0, height: window.innerHeight, embedded: false };
  var viewListeners = [];
  var viewRaf = 0;
  function onView(fn) { viewListeners.push(fn); fn(view); }
  function emitView() {
    if (viewRaf) return;
    viewRaf = requestAnimationFrame(function () {
      viewRaf = 0;
      viewListeners.forEach(function (fn) { fn(view); });
    });
  }
  function inFrame() { try { return window.self !== window.top; } catch (e) { return true; } }
  function docHeight() { return document.documentElement.scrollHeight; }

  var STRIP = 20, probeBox = null, probeObs = null, visibleStrips = {};
  function buildProbes() {
    if (!('IntersectionObserver' in window)) return;
    if (!probeObs) {
      var steps = [];
      for (var s = 0; s <= 20; s++) steps.push(s / 20);
      probeObs = new IntersectionObserver(onProbe, { threshold: steps });
      probeBox = document.createElement('div');
      probeBox.setAttribute('aria-hidden', 'true');
      probeBox.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:0;pointer-events:none;visibility:hidden';
      document.body.appendChild(probeBox);
    }
    probeObs.disconnect();
    probeBox.textContent = '';
    visibleStrips = {};
    var H = docHeight();
    for (var y = 0, i = 0; y < H; y += STRIP, i++) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;width:1px;top:' + y + 'px;height:' + Math.min(STRIP, H - y) + 'px';
      d.dataset.i = i;
      probeBox.appendChild(d);
      probeObs.observe(d);
    }
  }
  function onProbe(entries) {
    entries.forEach(function (e) {
      var i = e.target.dataset.i, r = e.intersectionRect;
      if (e.isIntersecting && r.height > 0) visibleStrips[i] = [r.top + window.scrollY, r.bottom + window.scrollY];
      else delete visibleStrips[i];
    });
    if (!view.embedded) return;
    var top = Infinity, bottom = -Infinity;
    for (var k in visibleStrips) {
      top = Math.min(top, visibleStrips[k][0]);
      bottom = Math.max(bottom, visibleStrips[k][1]);
    }
    if (top < bottom) { view.top = top; view.height = bottom - top; emitView(); }
  }

  function measureView() {
    var embedded = inFrame() && docHeight() - window.innerHeight < 40;
    if (embedded !== view.embedded) {
      view.embedded = embedded;
      root.classList.toggle('is-embedded', embedded);
      if (embedded) buildProbes();
      else if (probeObs) { probeObs.disconnect(); probeBox.textContent = ''; }
    } else if (embedded) {
      buildProbes(); // la hauteur de la page a pu changer
    }
    if (!view.embedded) { view.top = window.scrollY; view.height = window.innerHeight; }
    emitView();
  }
  window.addEventListener('scroll', function () {
    if (view.embedded) return;
    view.top = window.scrollY; view.height = window.innerHeight;
    emitView();
  }, { passive: true });
  window.addEventListener('resize', measureView);
  window.addEventListener('load', measureView);
  measureView();

  /* ================= Trait « 2 minutes » sur le périmètre ================= */
  var DURATION = 120; // secondes
  var perimeter = document.querySelector('.perimeter');
  var timer = document.getElementById('timer');
  var timerLabel = document.getElementById('timer-label');

  function setTimerDone() {
    timerDone = true;
    if (timerLabel) timerLabel.textContent = t('hero.timerDone');
    if (timer && timer.dataset.href) {
      timer.setAttribute('href', timer.dataset.href);
      timer.classList.remove('text-muted', 'dark:text-night-muted');
      timer.classList.add('text-accent', 'dark:text-accent-night', 'hover:underline');
    }
  }

  if (perimeter) {
    var rects = perimeter.querySelectorAll('rect');
    var line = perimeter.querySelector('.perimeter__line');

    // Le cadre suit la zone visible (voir « Zone visible de l'écran » plus bas)
    onView(function (v) {
      var w = document.documentElement.clientWidth, h = v.height;
      perimeter.style.width = w + 'px';
      perimeter.style.height = h + 'px';
      perimeter.style.top = (v.embedded ? v.top : 0) + 'px';
      rects.forEach(function (r) {
        r.setAttribute('x', 1); r.setAttribute('y', 1);
        r.setAttribute('width', Math.max(w - 2, 0));
        r.setAttribute('height', Math.max(h - 2, 0));
      });
    });

    if (!reduceMotion) {
      // Le temps déjà passé est gardé d'une page à l'autre (ex. page Kenweturi)
      var elapsed = 0;
      try { elapsed = parseFloat(sessionStorage.getItem('perimeterElapsed')) || 0; } catch (e) {}
      var startedAt = performance.now();

      var saveElapsed = function () {
        if (!perimeter.classList.contains('is-paused')) {
          elapsed += (performance.now() - startedAt) / 1000;
          startedAt = performance.now();
        }
        try { sessionStorage.setItem('perimeterElapsed', String(Math.min(elapsed, DURATION))); } catch (e) {}
      };

      if (elapsed >= DURATION) {
        line.style.animation = 'none';
        line.style.strokeDashoffset = '0';
        setTimerDone();
      } else {
        line.style.animationDelay = (-elapsed) + 's';
        line.addEventListener('animationend', function () { saveElapsed(); setTimerDone(); });
      }

      // Pause quand l'onglet n'est pas visible : les 2 minutes comptent vraiment
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          saveElapsed();
          perimeter.classList.add('is-paused');
        } else {
          perimeter.classList.remove('is-paused');
          startedAt = performance.now();
        }
      });
      window.addEventListener('pagehide', saveElapsed);
    }
  }

  /* ================= Apparition des sections au scroll ================= */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // Petit décalage entre éléments voisins (cartes d'une même grille)
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
      var i = siblings.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 3) * 90 + 'ms';
    });
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ================= Menu intelligent ================= */
  var header = document.querySelector('.site-header');
  var menuOpen = false;
  function updateHeader(v) {
    if (!header) return;
    header.classList.toggle('is-scrolled', menuOpen || v.top > 12);
    // Dans un cadre intégré, le menu est replacé en haut de la zone visible
    header.style.transform = v.embedded ? 'translateY(' + v.top + 'px)' : '';
  }
  onView(updateHeader);

  // Section en cours surlignée dans le menu
  var navLinks = document.querySelectorAll('.nav-link[href^="#"], .m-link[href^="#"]');
  var sections = Array.prototype.filter.call(document.querySelectorAll('main section[id]'), function (s) {
    return document.querySelector('.nav-link[href="#' + s.id + '"]');
  });
  var spyLockedUntil = 0;

  function setCurrent(id) {
    navLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function updateSpy(v) {
    if (!sections.length || Date.now() < spyLockedUntil) return;
    var current = null;
    var atBottom = v.top + v.height >= docHeight() - 4;
    if (atBottom) {
      current = sections[sections.length - 1].id;
    } else {
      var line = v.top + v.height * 0.35; // ligne de lecture : un tiers de l'écran
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top + window.scrollY <= line) current = s.id;
      });
    }
    setCurrent(current);
  }
  onView(updateSpy);

  // Clic sur un lien interne (#projets, #contact…) : défilement doux vers la section
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (a.classList.contains('nav-link') || document.querySelector('.nav-link[href="#' + id + '"]')) {
      setCurrent(id);
      spyLockedUntil = Date.now() + 900; // évite le clignotement pendant le défilement
      setTimeout(function () { updateSpy(view); }, 950);
    }
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + id); } catch (err) {}
  });

  // Menu mobile
  var menuBtn = document.getElementById('menu-toggle');
  var menuMobile = document.getElementById('menu-mobile');
  var backdrop = document.getElementById('menu-backdrop');
  if (menuBtn && menuMobile) {
    var setMenu = function (open) {
      menuOpen = open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menu'));
      menuMobile.classList.toggle('is-open', open);
      menuMobile.setAttribute('aria-hidden', String(!open));
      menuMobile.inert = !open; // liens non atteignables au clavier quand c'est fermé
      if (backdrop) backdrop.classList.toggle('is-open', open);
      header.classList.toggle('menu-is-open', open);
      root.classList.toggle('menu-open', open);
      updateHeader(view);
    };
    menuMobile.inert = true;

    // Le voile couvre la zone visible (utile dans un cadre intégré)
    if (backdrop) {
      onView(function (v) {
        backdrop.style.top = (v.embedded ? v.top : 0) + 'px';
        backdrop.style.height = v.height + 'px';
      });
      backdrop.addEventListener('click', function () { setMenu(false); });
    }

    menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
    menuMobile.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); }
    });
    // Si l'écran s'élargit (menu complet affiché), on referme le menu mobile
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches && menuOpen) setMenu(false);
    });
  }

  /* ================= Soutenances (données dans soutenances.js) ================= */
  var talksOpen = false;

  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  // 'AAAA-MM' → « novembre 2026 » ; 'AAAA-MM-JJ' → « 5 novembre 2026 »
  function dateLabel(value, opts) {
    if (!value) return '';
    var p = value.split('-');
    var d = new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
    var o = opts || (p[2] ? { day: 'numeric', month: 'long', year: 'numeric' } : { month: 'long', year: 'numeric' });
    return d.toLocaleDateString('fr-FR', o);
  }
  function monthLabel(v) { return dateLabel(v); }
  function hasDay(v) { return !!(v && v.split('-')[2]); }

  var ICONS = {
    dossier: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    doc: '<path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M4 17a2 2 0 0 1 2-2h12M9 7h5"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>'
  };
  function icon(name, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', cls);
    s.innerHTML = ICONS[name];
    return s;
  }
  function docLinks(item, compact) {
    // Dossier et doc technique dans le même PDF : un seul lien
    var same = item.dossier && item.doc === item.dossier;
    var list = [
      { key: 'dossier', href: item.dossier, label: same ? t('soutenances.dossierDoc') : t('soutenances.dossier'), short: 'Dossier', tag: 'PDF' },
      { key: 'doc', href: same ? '' : item.doc, label: t('soutenances.techdoc'), short: 'Doc', tag: 'PDF' },
      { key: 'code', href: item.code, label: t('soutenances.code'), short: 'Code', tag: 'GitHub' }
    ].filter(function (d) { return d.href; });
    var ul = el('ul', compact ? 'talk-row__links' : 'doc-links');
    list.forEach(function (d) {
      var li = el('li');
      var a = el('a', compact ? 'mini-link' : 'doc-link');
      a.href = d.href; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(icon(d.key, compact ? 'mini-link__icon' : 'doc-link__icon'));
      if (compact) {
        a.appendChild(el('span', '', d.short));
        a.setAttribute('aria-label', d.label);
      } else {
        a.appendChild(el('span', 'doc-link__label', d.label));
        a.appendChild(el('span', 'doc-link__tag', d.tag));
        var arrow = el('span', 'doc-link__arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
        a.appendChild(arrow);
      }
      li.appendChild(a); ul.appendChild(li);
    });
    return ul;
  }

  function renderTalks() {
    var featured = document.getElementById('talks-featured');
    if (!featured || !window.SOUTENANCES) return;
    var levelBox = document.getElementById('talks-level');
    var list = document.getElementById('talks-list');
    var toggle = document.getElementById('talks-toggle');
    var toggleLabel = document.getElementById('talks-toggle-label');

    var all = window.SOUTENANCES.map(function (s, i) { return Object.assign({ n: i + 1 }, s); });
    var total = all.length;
    var done = all.filter(function (s) { return s.statut === 'passee'; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || b.n - a.n; });
    var next = all.filter(function (s) { return s.statut !== 'passee'; })[0];

    // Badge de niveau : titre + jauge à segments (0 à 6 soutenances validées)
    if (levelBox) {
      levelBox.textContent = '';
      var lvl = done.length;
      // Titre du niveau (aucun titre à 0)
      var levelTitle = t('soutenances.level' + Math.min(lvl, 6));
      if (levelTitle) levelBox.appendChild(el('p', 'talk-level__title', levelTitle));
      // Jauge à segments + compteur « 3 / 6 » à droite, sur la même ligne
      var row = el('div', 'talk-level__row');
      var bar = el('div', 'talk-level__bar');
      bar.setAttribute('role', 'meter');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', String(total));
      bar.setAttribute('aria-valuenow', String(lvl));
      bar.setAttribute('aria-label', fill(t('soutenances.progress'), { done: lvl, total: total }));
      for (var i = 0; i < total; i++) {
        var seg = el('span', 'talk-level__seg' + (i < lvl ? ' is-done' : i === lvl ? ' is-next' : ''));
        seg.style.setProperty('--i', i);
        bar.appendChild(seg);
      }
      row.appendChild(bar);
      var count = el('span', 'talk-level__count', lvl + ' / ' + total);
      count.setAttribute('aria-hidden', 'true');
      row.appendChild(count);
      levelBox.appendChild(row);
      if (next && next.date) {
        levelBox.appendChild(el('p', 'talk-level__next', hasDay(next.date)
          ? fill(t('soutenances.nextDay'), { date: dateLabel(next.date, { day: 'numeric', month: 'long' }) })
          : fill(t('soutenances.next'), { date: monthLabel(next.date) })));
      }
    }

    featured.textContent = '';
    list.textContent = '';

    // Aucune soutenance passée : on annonce la prochaine, avec son numéro
    if (!done.length) {
      var empty = el('div', 'talk-empty');
      if (next) {
        empty.appendChild(el('span', 'talk-num', String(next.n).padStart(2, '0')));
        var txt = el('div', 'talk-empty__text');
        txt.appendChild(el('p', 'talk-empty__kicker', t('soutenances.nextTitle') + (next.date ? ' · ' + dateLabel(next.date) : '')));
        txt.appendChild(el('p', 'talk-empty__title', (next.titre || '')));
        // Résumé et liens déjà prêts (ex. le code) : on les montre avant la soutenance
        if (next.resume) txt.appendChild(el('p', 'talk-empty__text-body', next.resume));
        if (next.dossier || next.doc || next.code) txt.appendChild(docLinks(next, false));
        empty.appendChild(txt);
      } else {
        empty.appendChild(el('span', '', t('soutenances.firstNoDate')));
      }
      featured.appendChild(empty);
      toggle.classList.add('hidden');
      return;
    }

    // Carte mise en avant : la plus récente
    var f = done[0];
    var card = el('article', 'talk-feature group');
    var media = el('div', 'talk-feature__media');
    media.appendChild(el('span', 'talk-feature__placeholder', '[Capture du projet]'));
    if (f.image) {
      var img = el('img'); img.src = f.image; img.alt = (f.titre || ''); img.loading = 'lazy';
      img.onerror = function () { img.remove(); };
      media.appendChild(img);
    }
    var body = el('div', 'talk-feature__body');
    var head = el('div', 'talk-feature__head');
    head.appendChild(el('span', 'talk-num', String(f.n).padStart(2, '0')));
    head.appendChild(el('span', 'talk-num__total', '/ ' + String(total).padStart(2, '0')));
    head.appendChild(el('span', 'talk-badge', t('soutenances.validated')));
    body.appendChild(head);
    body.appendChild(el('h3', 'talk-feature__title', (f.titre || '')));
    if (f.date) body.appendChild(el('p', 'talk-date', dateLabel(f.date)));
    if ((f.resume || '')) body.appendChild(el('p', 'talk-feature__text', (f.resume || '')));
    body.appendChild(docLinks(f, false));
    card.appendChild(media); card.appendChild(body);
    featured.appendChild(card);

    // Les autres soutenances passées, en lignes compactes
    var others = done.slice(1);
    others.forEach(function (s) {
      var li = el('li', 'talk-row');
      li.appendChild(el('span', 'talk-num talk-num--sm', String(s.n).padStart(2, '0')));
      var info = el('div', 'talk-row__info');
      info.appendChild(el('h3', 'talk-row__title', (s.titre || '')));
      if (s.date) info.appendChild(el('span', 'talk-date', dateLabel(s.date)));
      li.appendChild(info);
      li.appendChild(docLinks(s, true));
      list.appendChild(li);
    });

    toggle.classList.toggle('hidden', !others.length);
    toggleLabel.textContent = talksOpen ? t('soutenances.less')
      : others.length === 1 ? t('soutenances.more1') : fill(t('soutenances.moreN'), { n: others.length });
  }

  var talksToggle = document.getElementById('talks-toggle');
  if (talksToggle) {
    var talksMore = document.getElementById('talks-more');
    talksMore.inert = true;
    talksToggle.addEventListener('click', function () {
      talksOpen = !talksOpen;
      talksToggle.setAttribute('aria-expanded', String(talksOpen));
      talksMore.classList.toggle('is-open', talksOpen);
      talksMore.setAttribute('aria-hidden', String(!talksOpen));
      talksMore.inert = !talksOpen;
      renderTalks();
      // La page a changé de hauteur : on recalcule la zone visible
      setTimeout(measureView, 500);
    });
  }
  renderTalks();

  /* ================= Compétences (données dans competences.js) ================= */
  function renderSkills() {
    var grid = document.getElementById('skills-grid');
    if (!grid || !window.COMPETENCES) return;
    var today = new Date().toISOString().slice(0, 10);
    grid.textContent = '';
    window.COMPETENCES.forEach(function (cat) {
      var card = el('div', 'skill-card');
      card.appendChild(el('h3', 'skill-card__title', (cat.titre || '')));
      var ul = el('ul', 'skill-card__list');
      // Pratiquées d'abord, puis celles au programme dans l'ordre du planning
      var items = cat.items.map(function (it) {
        return { nom: (it.nom || ''), depuis: it.depuis, soon: !!(it.depuis && it.depuis > today) };
      }).sort(function (a, b) {
        if (a.soon !== b.soon) return a.soon ? 1 : -1;
        return a.soon ? a.depuis.localeCompare(b.depuis) : 0;
      });
      items.forEach(function (it) {
        var li = el('li', it.soon ? 'skill is-soon' : 'skill', it.nom);
        if (it.soon) {
          var when = dateLabel(it.depuis.slice(0, 7), { month: 'short' }).replace('.', '');
          li.appendChild(el('span', 'skill__when', when));
          li.title = fill(t('skills.soonTitle'), { date: dateLabel(it.depuis.slice(0, 7)) });
        }
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    });
  }
  renderSkills();

  /* ================= Agrandir une capture ================= */
  // Le lien ouvre la version de la capture affichée (claire ou sombre)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.shot--zoom');
    if (!a) return;
    var visible = Array.prototype.find.call(a.querySelectorAll('img'), function (img) { return img.offsetParent !== null; });
    if (visible) a.href = visible.currentSrc || visible.src;
  });

  /* ================= Formulaire de contact (Formspree) ================= */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submit = form.querySelector('[type="submit"]');
    var showStatus = function (key, ok) {
      status.textContent = t(key);
      status.className = 'text-sm ' + (ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = form.elements.nom.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      if (!nom || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('form.invalid', false);
        return;
      }
      if (form.action.indexOf('VOTRE_ID') !== -1) {
        console.warn('Formulaire non configuré : remplace VOTRE_ID dans index.html par ton identifiant Formspree.');
        showStatus('form.err', false);
        return;
      }
      submit.disabled = true;
      submit.textContent = t('form.sending');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          showStatus('form.ok', true);
        })
        .catch(function () { showStatus('form.err', false); })
        .then(function () { submit.disabled = false; submit.textContent = t('form.send'); });
    });

    form.addEventListener('input', function () { status.textContent = ''; });
  }
})();
