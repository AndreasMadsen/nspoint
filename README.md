#nspoint

> Split a dublex object stream intro multiply dublex streams

## Installation

```sheel
npm install nspoint
```

## Documentation

```javascript
var nspoint = require('nspoint');

// you have a some duplex `transport` socket there takes and outputs objects
// wrap it in each end with `nspoint` to split it via namespaces

// e.q. server side
var A = nspoint();
transport.pipe(A).pipe(transport);

var aFoo = A.namespace('foo');
var aBar = A.namespace('bar');

aFoo.write('foo message');
aBar.once('data', function (msg) {
  // gets gets {object: 'bar'}
  console.log(msg);
});

// e.q. client side
var B = nspoint(transport);
transport.pipe(B).pipe(transport);

var bFoo = B.namespace('foo');
var bBar = B.namespace('bar');

bFoo.once('data', function (msg) {
  // gets 'foo message'
  b2.write({object: 'bar'});
});
```

##License

**The software is license under "MIT"**

> Copyright (c) 2013 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
