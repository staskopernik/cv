(function () {
  'use strict';

  var cards = document.querySelectorAll('[data-overview-card]');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cards, function (card) {
      card.classList.add('is-active');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
      } else {
        entry.target.classList.remove('is-active');
      }
    });
  }, { threshold: 0.28 });

  Array.prototype.forEach.call(cards, function (card) {
    observer.observe(card);
  });
}());
