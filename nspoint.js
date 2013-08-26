
var util = require('util');
var stream = require('stream');

var hasOwnProperty = Object.prototype.hasOwnProperty;

function NamespacePoint() {
  if (!(this instanceof NamespacePoint)) return new NamespacePoint();
  stream.Duplex.call(this, {objectMode: true});

  this._outputs = Object.create(null);
}
module.exports = NamespacePoint;
util.inherits(NamespacePoint, stream.Duplex);

NamespacePoint.prototype._write = function (message, encodeing, done) {
  if (hasOwnProperty.call(this._outputs, message.ns)) {
    this._outputs[message.ns].push(message.msg);
  }
  done(null);
};

NamespacePoint.prototype._read = function () {
  // Implemented by push
};

NamespacePoint.prototype.namespace = function (namespace) {
  return this._outputs[namespace] = new NamespaceOutput(this, namespace);
};

function NamespaceOutput(parent, namespace) {
  stream.Duplex.call(this, {objectMode: true});
  this.namespace = namespace;
  this.stream = parent;
}
util.inherits(NamespaceOutput, stream.Duplex);

NamespaceOutput.prototype._read = function () {
  // Implemented by push
};

NamespaceOutput.prototype._write = function (message, encodeing, done) {
  this.stream.push({ ns: this.namespace, msg: message });
};
