/* Zorvilo — site behaviour.
 * Plain script, no build step, so the pages open straight off disk for review.
 */
(function () {
  'use strict';

  var data = window.ZORVILO || {};
  var products = data.products || [];
  var ranges = data.ranges || [];

  /* ------------------------------------------------------------- header -- */
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.nav__toggle');
  var nav = document.querySelector('.nav');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      // The collapsed menu is invisible over the hero, so pin the header solid.
      if (header) header.classList.toggle('is-stuck', open || window.scrollY > 40);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------- footer -- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------- product tiles -- */
  function rangeById(id) {
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i].id === id) return ranges[i];
    }
    return { short: '', name: '' };
  }

  function productCard(product) {
    var range = rangeById(product.range);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'product product--' + product.fit + ' reveal';
    button.dataset.range = product.range;
    button.dataset.id = product.id;
    button.style.setProperty('--accent', product.accent);
    button.style.setProperty('--tint', product.tint);
    button.setAttribute('aria-label', 'View details for Zorvilo ' + product.name);

    var badge = product.badge
      ? '<span class="product__badge">' + product.badge + '</span>'
      : '';

    button.innerHTML =
      badge +
      '<span class="product__media">' +
        '<img src="' + product.image + '" alt="Zorvilo ' + product.name + '" loading="lazy" decoding="async">' +
      '</span>' +
      '<span class="product__body">' +
        '<span class="product__range">' + range.short + '</span>' +
        '<span class="product__name">' + product.name + '</span>' +
        '<span class="product__size">' + product.size + '</span>' +
      '</span>';

    return button;
  }

  var grid = document.querySelector('[data-product-grid]');

  if (grid) {
    var only = (grid.dataset.productGrid || '').split(',').filter(Boolean);
    var list = only.length
      ? products.filter(function (p) { return only.indexOf(p.range) > -1; })
      : products;
    list.forEach(function (product) { grid.appendChild(productCard(product)); });
  }

  /* ------------------------------------------------------ scroll reveal -- */
  // Runs after the product tiles exist so their .reveal class is picked up too.
  var revealables = document.querySelectorAll('.reveal');

  if (revealables.length) {
    if (!('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

      revealables.forEach(function (el, index) {
        el.style.transitionDelay = Math.min(index % 6, 5) * 70 + 'ms';
        observer.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------- filtering -- */
  var filterBar = document.querySelector('[data-filters]');
  var emptyState = document.querySelector('[data-empty]');

  if (filterBar && grid) {
    filterBar.addEventListener('click', function (event) {
      var button = event.target.closest('.filter');
      if (!button) return;

      filterBar.querySelectorAll('.filter').forEach(function (el) {
        el.setAttribute('aria-pressed', String(el === button));
      });

      var wanted = button.dataset.filter;
      var shown = 0;

      grid.querySelectorAll('.product').forEach(function (card) {
        var match = wanted === 'all' || card.dataset.range === wanted;
        card.hidden = !match;
        if (match) shown++;
      });

      if (emptyState) emptyState.hidden = shown > 0;

      var hash = wanted === 'all' ? ' ' : '#' + wanted;
      history.replaceState(null, '', hash);
    });

    // Deep links such as products.html#beer land on a pre-filtered grid.
    var initial = window.location.hash.replace('#', '');
    if (initial) {
      var preset = filterBar.querySelector('[data-filter="' + initial + '"]');
      if (preset) preset.click();
    }
  }

  /* -------------------------------------------------------------- modal -- */
  var modal = document.querySelector('[data-modal]');

  // Pages that show a teaser grid have no modal, so send the click to the
  // products page with that range pre-selected.
  if (!modal && grid) {
    grid.addEventListener('click', function (event) {
      var card = event.target.closest('.product');
      if (card) window.location.href = 'products.html#' + card.dataset.range;
    });
  }

  if (modal && grid) {
    var panel = modal.querySelector('.modal__grid');
    var lastFocused = null;

    var closeModal = function () {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      modal.setAttribute('aria-hidden', 'true');
      if (lastFocused) lastFocused.focus();
    };

    var openModal = function (product) {
      var range = rangeById(product.range);
      var specs = Object.keys(product.specs || {}).map(function (key) {
        return '<div class="modal__spec"><dt>' + key + '</dt><dd>' + product.specs[key] + '</dd></div>';
      }).join('');

      panel.innerHTML =
        '<div class="modal__media modal__media--' + product.fit + '" style="--tint:' + product.tint + '">' +
          '<img src="' + product.image + '" alt="Zorvilo ' + product.name + '">' +
        '</div>' +
        '<div class="modal__body">' +
          '<span class="eyebrow" style="color:' + product.accent + '">' + range.name + '</span>' +
          '<h3 id="modal-title">' + product.name + '</h3>' +
          '<p>' + product.text + '</p>' +
          '<dl class="modal__specs">' + specs + '</dl>' +
          '<a class="textlink" href="contact.html">Enquire about this product' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.4 20 12l-6.8 6.6-1.4-1.4 4.2-4.2H4v-2h12l-4.2-4.2z"/></svg>' +
          '</a>' +
        '</div>';

      lastFocused = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      modal.querySelector('.modal__close').focus();
    };

    grid.addEventListener('click', function (event) {
      var card = event.target.closest('.product');
      if (!card) return;
      var product = products.filter(function (p) { return p.id === card.dataset.id; })[0];
      if (product) openModal(product);
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('.modal__close')) closeModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  /* --------------------------------------------------------------- form -- */
  var form = document.querySelector('[data-form]');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = form.querySelector('[data-form-status]');
      var submit = form.querySelector('button[type="submit"]');

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
      }

      // The draft has no backend yet: hand the enquiry to the visitor's mail
      // client so the flow is demonstrable end to end.
      var values = new FormData(form);
      var body = [];
      values.forEach(function (value, key) { body.push(key + ': ' + value); });

      window.location.href = 'mailto:zorvilo3@gmail.com' +
        '?subject=' + encodeURIComponent('Zorvilo enquiry — ' + (values.get('enquiry') || 'General')) +
        '&body=' + encodeURIComponent(body.join('\n'));

      if (status) {
        status.hidden = false;
        status.textContent = 'Opening your email app with this enquiry. If nothing happens, write to zorvilo3@gmail.com.';
      }

      window.setTimeout(function () {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Send enquiry';
        }
      }, 2500);
    });
  }
})();
