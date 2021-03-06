
var test = require('tap').test;
var async = require('async');

var nspoint = require('../nspoint');

// Setup a simple transport with a nspoint in both sides
var B = nspoint();
var A = nspoint();

A.pipe(B);
B.pipe(A);

// Setup two namespaces
var a1 = A.namespace('1');
var b1 = B.namespace('1');
var a2 = A.namespace('2');
var b2 = B.namespace('2');
var a3 = A.namespace('3');

test('from A to B with existing multiply namespace', function (t) {
  async.parallel({
    a1: function (done) { a1.once('data', function (msg) { done(null, msg); }) },
    b1: function (done) { b1.once('data', function (msg) { done(null, msg); }) },
    a2: function (done) { a2.once('data', function (msg) { done(null, msg); }) },
    b2: function (done) { b2.once('data', function (msg) { done(null, msg); }) }
  }, function (err, result) {
    t.equal(err, null);

    t.equal(result.a1, 'from b1 to a1');
    t.equal(result.b1, 'from a1 to b1');
    t.equal(result.a2, 'from b2 to a2');
    t.equal(result.b2, 'from a2 to b2');
    t.end();
  });

  a1.write('from a1 to b1');
  b1.write('from b1 to a1');
  a2.write('from a2 to b2');
  b2.write('from b2 to a2');
});

test('writeing data with wrong namespace', function (t) {
  a1.once('data', function (msg) { t.ok(false, 'should not emit'); });
  b1.once('data', function (msg) { t.ok(false, 'should not emit'); });
  a2.once('data', function (msg) { t.ok(false, 'should not emit'); });
  b2.once('data', function (msg) { t.ok(false, 'should not emit'); });

  a3.write('nowhere');
  setImmediate(function () {
    t.end();
  });
});

test('calling namespace twice returns the same object', function (t) {
  t.equal(A.namespace('4'), A.namespace('4'));
  t.end();
});

test('two writes are possibol', function (t) {
  var a4 = A.namespace('4');
  var b4 = B.namespace('4');

  b4.once('data', function (ta) {
    b4.once('data', function (tb) {
      t.equal(ta, '1');
      t.equal(tb, '2');
      t.end();
    });
  });

  a4.write('1');
  a4.write('2');
});

test('calling end on a namespace emits end', function (t) {
  a3.resume();
  a3.end();
  a3.once('end', function () {
    t.end();
  });
});

test('calling end on a namespace prevents future data and relays the end call', function (t) {
  a2.end();

  var failed = false;
  a2.once('data', function () {
    failed = true;
  });
  b2.write('message');

  b2.once('end', function () {
    setTimeout(function () {
      t.ok(!failed, 'did not get data');
      t.end();
    }, 10);
  });
});

test('calling end on source boardcasts end event', function (t) {
  A.end();

  async.parallel({
    a1: function (done) { a1.once('end', function (msg) { done(null); }) },
    b1: function (done) { b1.once('end', function (msg) { done(null); }) }
  }, function (err, result) {
    t.equal(err, null);
    t.end();
  });
});
