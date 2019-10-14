"use strict";

window.onload = function () {
  var items = document.querySelectorAll('.js-collapse');

  var collapseDown = function collapseDown(node) {
    node.style.overflowY = 'hidden';
    node.dataset.height = node.scrollHeight;
    var options = {
      type: 'CLOSE',
      from: node.scrollHeight,
      to: 0,
      distance: -node.scrollHeight,
      duration: 250
    };
    window.requestAnimationFrame(function (timestamp) {
      return animate(node, options, timestamp);
    });
  };

  var collapseUp = function collapseUp(node) {
    node.style.overflowY = 'hidden';
    var options = {
      type: 'OPEN',
      from: 0,
      to: +node.dataset.height,
      distance: +node.dataset.height,
      duration: 250
    };
    window.requestAnimationFrame(function (timestamp) {
      return animate(node, options, timestamp);
    });
  };

  var animate = function animate(element, options, timestamp) {
    if (!options.startTime) {
      options.startTime = timestamp;
    }

    if (options.type === 'OPEN') {
      element.style.display = 'block';
    }

    var currentTime = timestamp - options.startTime;
    var animationContinue = currentTime < options.duration;
    var newHeight = options.from - currentTime / options.duration * -options.distance;

    if (animationContinue) {
      element.style.height = "".concat(newHeight.toFixed(2), "px");
      window.requestAnimationFrame(function (timestamp) {
        return animate(element, options, timestamp);
      });
    } else {
      if (options.type === 'CLOSE') {
        element.style.display = 'none';
        element.style.height = '0px';
      }

      if (options.type === 'OPEN') {
        element.style.height = "".concat(options.distance, "px");
        element.style.height = "";
      }
    }
  };

  var collapseToggle = function collapseToggle(e) {
    var element = document.querySelector(e.target.dataset.target);

    if (e.target.classList.contains('--collapsed')) {
      e.target.classList.remove('--collapsed');
      collapseUp(element);
    } else {
      e.target.classList.add('--collapsed');
      collapseDown(element);
    }
  };

  items.forEach(function (node) {
    node.addEventListener('click', function (e) {
      return collapseToggle(e);
    });
  });
};
"use strict";

if ('objectFit' in document.documentElement.style === false) {
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('img[data-object-fit]'), function (image) {
      (image.runtimeStyle || image.style).background = 'url("' + image.src + '") no-repeat 50%/' + (image.currentStyle ? image.currentStyle['object-fit'] : image.getAttribute('data-object-fit'));
      image.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'' + image.width + '\' height=\'' + image.height + '\'%3E%3C/svg%3E';
    });
  });
}