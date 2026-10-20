/* Screen reading style only. The reader owns persistence and the shared
   passage anchor, so a style cannot change fonts, language, notes, or colour. */
(function (global) {
  'use strict';

  const choices = Object.freeze(['quiet', 'book', 'structured']);
  const selector = '#pageStyleSelect, #fb-page-style-select';
  const normalise = value => choices.includes(value) ? value : 'quiet';
  let active = null;

  function init(options = {}) {
    if (active) active.destroy();

    let value = normalise(options.value);
    const preserve = typeof options.preserve === 'function' ? options.preserve : work => work();
    const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};

    function sync() {
      document.documentElement.setAttribute('data-reading-style', value);
      document.querySelectorAll(selector).forEach(select => {
        if (select.value !== value) select.value = value;
      });
    }

    function set(next) {
      if (!choices.includes(next)) {
        sync();
        return false;
      }
      if (next === value) {
        sync();
        return true;
      }
      // Synchronous work shares the existing anchor batch with font/order changes.
      preserve(() => {
        value = next;
        sync();
        onChange(value);
      });
      return true;
    }

    function change(event) {
      if (event.target?.matches?.(selector)) set(event.target.value);
    }

    document.addEventListener('change', change);
    sync();
    active = Object.freeze({
      get: () => value,
      set,
      sync,
      destroy() {
        document.removeEventListener('change', change);
      }
    });
    return active;
  }

  global.DaruriReadingStyles = Object.freeze({ choices, normalise, init });
})(window);
