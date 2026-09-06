(function () {
  'use strict';

  function textOf(element) {
    return element ? element.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function makeLine(prefixParts, value, valueClass) {
    var line = makeElement('div', 'experience-code-line');
    prefixParts.forEach(function (part) {
      line.appendChild(makeElement('span', part[0], part[1]));
    });

    var typedValue = makeElement('span', 'code-value ' + (valueClass || ''), value);
    typedValue.setAttribute('data-code-value', value);
    line.appendChild(typedValue);
    return line;
  }

  function buildCodeWindow(job, index) {
    var heading = job.querySelector('.timeline-heading');
    var body = job.querySelector('.timeline-body');
    var company = textOf(heading && heading.querySelector('h4:not(.subheading)'));
    var role = textOf(heading && heading.querySelector('.subheading'));
    var dateText = textOf(job.querySelector('.timeline-image h4'));
    var deploymentStatus = /present/i.test(dateText) ? 'RUNNING' : 'DELIVERED';
    var paragraphs = body ? body.querySelectorAll('p') : [];
    var scope = paragraphs.length ? textOf(paragraphs[0]) : '';
    var stack = paragraphs.length > 1 ? textOf(paragraphs[1]).replace(/^Technologies:\s*/i, '') : '';

    var windowBox = makeElement('div', 'experience-code-window');
    windowBox.setAttribute('aria-label', company + ', ' + role + '. Interactive animated job description.');

    var bar = makeElement('div', 'code-window-bar');
    var dots = makeElement('span', 'code-window-dots');
    dots.appendChild(makeElement('i'));
    dots.appendChild(makeElement('i'));
    dots.appendChild(makeElement('i'));
    bar.appendChild(dots);
    bar.appendChild(makeElement('span', 'code-window-title', 'experience-' + String(index + 1) + '.yaml'));
    windowBox.appendChild(bar);

    var code = makeElement('div', 'experience-code');
    code.appendChild(makeLine([
      ['code-prompt', '$ '],
      ['code-command', 'career.deploy ']
    ], company));
    code.appendChild(makeLine([
      ['code-keyword', 'const '],
      ['code-key', 'role'],
      ['code-operator', ' = ']
    ], '"' + role + '"'));
    code.appendChild(makeLine([
      ['code-key', 'scope'],
      ['code-operator', ': ']
    ], scope));
    code.appendChild(makeLine([
      ['code-key', 'stack'],
      ['code-operator', ': [']
    ], stack + ']'));
    code.appendChild(makeLine([
      ['code-key', 'status'],
      ['code-operator', ': ']
    ], deploymentStatus, 'code-status'));
    windowBox.appendChild(code);
    return windowBox;
  }

  function enhanceJob(job, index) {
    var trigger = job.querySelector('.timeline-image');
    var panel = job.querySelector('.timeline-panel');
    if (!trigger || !panel) return;

    var codeWindow = buildCodeWindow(job, index);
    panel.appendChild(codeWindow);
    job.classList.add('code-job', 'is-enhanced');

    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', 'Animate job description ' + String(index + 1));
    var hint = makeElement('span', 'code-run-hint');
    hint.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i> RUN';
    trigger.appendChild(hint);

    var timers = [];
    var values = codeWindow.querySelectorAll('[data-code-value]');

    function clearTimers() {
      timers.forEach(function (timer) { window.clearTimeout(timer); });
      timers = [];
    }

    function showComplete() {
      Array.prototype.forEach.call(values, function (value) {
        value.textContent = value.getAttribute('data-code-value');
        value.classList.remove('is-typing');
      });
      job.classList.remove('code-running');
      job.classList.add('code-complete');
    }

    function playAnimation() {
      clearTimers();
      job.classList.remove('code-complete');

      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showComplete();
        return;
      }

      job.classList.add('code-running');
      Array.prototype.forEach.call(values, function (value) {
        value.textContent = '';
        value.classList.remove('is-typing');
      });

      var lineIndex = 0;

      function typeLine() {
        if (lineIndex >= values.length) {
          showComplete();
          return;
        }

        var value = values[lineIndex];
        var fullText = value.getAttribute('data-code-value');
        var charIndex = 0;
        var interval = Math.max(5, Math.min(20, Math.floor(850 / Math.max(fullText.length, 1))));
        value.classList.add('is-typing');

        function typeCharacter() {
          charIndex += 1;
          value.textContent = fullText.slice(0, charIndex);
          if (charIndex < fullText.length) {
            timers.push(window.setTimeout(typeCharacter, interval));
          } else {
            value.classList.remove('is-typing');
            lineIndex += 1;
            timers.push(window.setTimeout(typeLine, 105));
          }
        }

        typeCharacter();
      }

      typeLine();
    }

    trigger.addEventListener('mouseenter', playAnimation);
    trigger.addEventListener('focus', playAnimation);
    trigger.addEventListener('click', playAnimation);
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        playAnimation();
      }
    });
  }

  function init() {
    var experienceTimeline = document.querySelector('#resume > .container .timeline');
    if (!experienceTimeline) return;
    var jobs = experienceTimeline.querySelectorAll(':scope > li');
    Array.prototype.forEach.call(jobs, enhanceJob);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
