
var util = require('util');
var stream = require('stream');

var hasOwnProperty = Object.prototype.hasOwnProperty;

function NamespacePoint() {
  if (!(this instanceof NamespacePoint)) return new NamespacePoint();
  stream.Duplex.call(this, {objectMode: true});
  var self = this;

  this._outputs = Object.create(null);

  // Boardcast end call to all namespaces, this will also result in a cleanup
  this.once('finish', function () {
    var keys = Object.keys(self._outputs);
    for (var i = 0; i < keys.length; i++) {
      self._outputs[ keys[i] ].end();
    }
  });
}
module.exports = NamespacePoint;
util.inherits(NamespacePoint, stream.Duplex);

NamespacePoint.prototype._write = function (message, encodeing, done) {
  if (hasOwnProperty.call(this._outputs, message.ns)) {
    if (message.end === true) {
      this._outputs[message.ns].end();
    } else {
      this._outputs[message.ns].push(message.msg);
    }
  }
  done(null);
};

NamespacePoint.prototype._read = function () {
  // Implemented by push
};

NamespacePoint.prototype.namespace = function (namespace) {
  if (hasOwnProperty.call(this._outputs, namespace) === false) {
    this._outputs[namespace] = new NamespaceOutput(this, namespace);
  }
  return this._outputs[namespace];
};

function NamespaceOutput(parent, namespace) {
  stream.Duplex.call(this, {objectMode: true});
  var self = this;

  this.namespace = namespace;
  this.stream = parent;

  // Cleanup when this stream ends
  this.once('finish', function () {
    delete self.stream._outputs[self.namespace];

    process.nextTick(function () {
      self.stream.push({ ns: self.namespace, end: true });
      self.push(null);
    });
  });
}
util.inherits(NamespaceOutput, stream.Duplex);

NamespaceOutput.prototype._read = function () {
  // Implemented by push
};

NamespaceOutput.prototype._write = function (message, encodeing, done) {
  this.stream.push({ ns: this.namespace, msg: message });
  done(null);
};
