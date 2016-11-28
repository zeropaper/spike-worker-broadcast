(function() {
  var holder = document.getElementById('diagram-holder');
  var myRequest = new Request('drawing.svg');
  var svgEl;

  fetch(myRequest).then(function(response) {
    return response.text();
  }).then(function(response) {
    holder.innerHTML = response;
    svgEl = holder.querySelector('svg');
    svgEl.style.maxWidth = '100%';
    svgEl.style.maxHeight = '100%';
  });
  window.updateSVG = function updateSVG(id, text) {
    console.info(id, text);
    svgEl.querySelector('#__' + id + '__').textContent = text;
  };
})();