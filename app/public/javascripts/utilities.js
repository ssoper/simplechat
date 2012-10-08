var hasClass = function(klassName) {
  return (this.getAttribute('class').split(' ').indexOf(klassName) > -1);
}

Element.prototype.hasClass = hasClass;
HTMLElement.prototype.hasClass = hasClass;

var addClass = function(klassName) {
  if (!this.hasClass(klassName)) {
    var klasses = this.getAttribute('class').split(' ');
    klasses.push(klassName);
    this.setAttribute('class', klasses.join(' '));
    return klassName;
  }

  return false;
}

Element.prototype.addClass = addClass;
HTMLElement.prototype.addClass = addClass;

var removeClass = function(klassName) {
  if (this.hasClass(klassName)) {
    var klasses = this.getAttribute('class').split(' ').filter(function(el, index, ary) {
      return el != klassName;
    });
    this.setAttribute('class', klasses.join(' '));
    return klassName;
  }

  return false;
}

Element.prototype.removeClass = removeClass;
HTMLElement.prototype.removeClass = removeClass;

var getAncestor = function(klassName, depth) {
  var el = this;
  for (var i = 0; i < (depth || 6); i++) {
    if (!el.hasClass(klassName)) {
      el = el.parentNode;
    }
  }

  return el;
}

Element.prototype.getAncestor = getAncestor;
HTMLElement.prototype.getAncestor = getAncestor;
