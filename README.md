# Comparison of 6.13.1 4.8.7

## Node.js ES2015 Support

### syntax

#### undefined

##### default function parameters

###### basic functionality

```js
return (function (a = 1, b = 2) { return a === 3 && b === 2; }(3));
```

###### explicit undefined defers to the default

```js
return (function (a = 1, b = 2) { return a === 1 && b === 3; }(undefined, 3));
```

###### defaults can refer to previous params

```js
return (function (a, b = a) { return b === 5; }(5));
```

###### arguments object interaction

```js
return (function (a = "baz", b = "qux", c = "quux") {
  a = "corge";
  // The arguments object is not mapped to the
  // parameters, even outside of strict mode.
  return arguments.length === 2
    && arguments[0] === "foo"
    && arguments[1] === "bar";
}("foo", "bar"));
```

###### temporal dead zone

```js
return (function(x = 1) {
  try {
    eval("(function(a=a){}())");
    return false;
  } catch(e) {}
  try {
    eval("(function(a=b,b){}())");
    return false;
  } catch(e) {}
  return true;
}());
```

###### separate scope

```js
return (function(a=function(){
  return typeof b === 'undefined';
}){
  var b = 1;
  return a();
}());
```

###### new Function() support

```js
return new Function("a = 1", "b = 2",
  "return a === 3 && b === 2;"
)(3);
```

##### rest parameters

###### basic functionality

```js
return (function (foo, ...args) {
  return args instanceof Array && args + "" === "bar,baz";
}("foo", "bar", "baz"));
```

###### function 'length' property

```js
return function(a, ...b){}.length === 1 && function(...c){}.length === 0;
```

###### arguments object interaction

```js
return (function (foo, ...args) {
  foo = "qux";
  // The arguments object is not mapped to the
  // parameters, even outside of strict mode.
  return arguments.length === 3
    && arguments[0] === "foo"
    && arguments[1] === "bar"
    && arguments[2] === "baz";
}("foo", "bar", "baz"));
```

###### can't be used in setters

```js
return (function (...args) {
  try {
    eval("({set e(...args){}})");
  } catch(e) {
    return true;
  }
}());
```

###### new Function() support

```js
return new Function("a", "...b",
  "return b instanceof Array && a+b === 'foobar,baz';"
)('foo','bar','baz');
```

##### RegExp "y" and "u" flags

###### "y" flag

```js
var re = new RegExp('\\w', 'y');
re.exec('xy');
return (re.exec('xy')[0] === 'y');
```

###### "y" flag, lastIndex

```js
var re = new RegExp('yy', 'y');
re.lastIndex = 3;
var result = re.exec('xxxyyxx')[0];
return result === 'yy' && re.lastIndex === 5;
```

###### "u" flag

```js
return "𠮷".match(/^.$/u)[0].length === 2;
```

###### "u" flag, Unicode code point escapes

```js
return "𝌆".match(/\u{1d306}/u)[0].length === 2;
```

###### "u" flag, case folding

```js
return "ſ".match(/S/iu) && "S".match(/ſ/iu);
```

##### destructuring, declarations

###### with arrays

```js
var [a, , [b], c] = [5, null, [6]];
return a === 5 && b === 6 && c === undefined;
```

###### with sparse arrays

```js
var [a, , b] = [,,,];
return a === undefined && b === undefined;
```

###### with strings

```js
var [a, b, c] = "ab";
return a === "a" && b === "b" && c === undefined;
```

###### with astral plane strings

```js
var [c] = "𠮷𠮶";
return c === "𠮷";
```

###### with generator instances

```js
var [a, b, c] = (function*(){ yield 1; yield 2; }());
return a === 1 && b === 2 && c === undefined;
```

###### with generic iterables

```js
var [a, b, c] = global.__createIterableObject([1, 2]);
return a === 1 && b === 2 && c === undefined;
```

###### with instances of generic iterables

```js
var [a, b, c] = Object.create(global.__createIterableObject([1, 2]));
return a === 1 && b === 2 && c === undefined;
```

###### iterator closing

```js
var closed = false;
var iter = global.__createIterableObject([1, 2, 3], {
  'return': function(){ closed = true; return {}; }
});
var [a, b] = iter;
return closed;
```

###### trailing commas in iterable patterns

```js
var [a,] = [1];
return a === 1;
```

###### with objects

```js
var {c, x:d, e} = {c:7, x:8};
return c === 7 && d === 8 && e === undefined;
```

###### object destructuring with primitives

```js
var {toFixed} = 2;
var {slice} = '';
return toFixed === Number.prototype.toFixed
  && slice === String.prototype.slice;
```

###### trailing commas in object patterns

```js
var {a,} = {a:1};
return a === 1;
```

###### throws on null and undefined

```js
try {
  var {a} = null;
  return false;
} catch(e) {
  if (!(e instanceof TypeError))
    return false;
}
try {
  var {b} = undefined;
  return false;
} catch(e) {
  if (!(e instanceof TypeError))
    return false;
}
return true;
```

###### computed properties

```js
var qux = "corge";
var { [qux]: grault } = { corge: "garply" };
return grault === "garply";
```

###### multiples in a single var statement

```js
var [a,b] = [5,6], {c,d} = {c:7,d:8};
return a === 5 && b === 6 && c === 7 && d === 8;
```

###### nested

```js
var [e, {x:f, g}] = [9, {x:10}];
var {h, x:[i]} = {h:11, x:[12]};
return e === 9 && f === 10 && g === undefined
  && h === 11 && i === 12;
```

###### in for-in loop heads

```js
for(var [i, j, k] in { qux: 1 }) {
  return i === "q" && j === "u" && k === "x";
}
```

###### in for-of loop heads

```js
for(var [i, j, k] of [[1,2,3]]) {
  return i === 1 && j === 2 && k === 3;
}
```

###### in catch heads

```js
try {
  throw [1,2];
} catch([i,j]) {
  try {
    throw { k: 3, l: 4 };
  } catch({k, l}) {
    return i === 1 && j === 2 && k === 3 && l === 4;
  }
}
```

###### rest

```js
var [a, ...b] = [3, 4, 5];
var [c, ...d] = [6];
return a === 3 && b instanceof Array && (b + "") === "4,5" &&
   c === 6 && d instanceof Array && d.length === 0;
```

###### defaults

```js
var {a = 1, b = 0, z:c = 3} = {b:2, z:undefined};
var [d = 0, e = 5, f = 6] = [4,,undefined];
return a === 1 && b === 2 && c === 3
  && d === 4 && e === 5 && f === 6;
```

###### defaults, let temporal dead zone

```js
var {a, b = 2} = {a:1};
try {
  eval("let {c = c} = {};");
  return false;
} catch(e){}
try {
  eval("let {c = d, d} = {d:1};");
  return false;
} catch(e){}
return a === 1 && b === 2;
```

##### destructuring, assignment

###### with arrays

```js
var a,b,c;
[a, , [b], c] = [5, null, [6]];
return a === 5 && b === 6 && c === undefined;
```

###### with sparse arrays

```js
var a, b;
[a, , b] = [,,,];
return a === undefined && b === undefined;
```

###### with strings

```js
var a,b,c;
[a, b, c] = "ab";
return a === "a" && b === "b" && c === undefined;
```

###### with astral plane strings

```js
var c;
[c] = "𠮷𠮶";
return c === "𠮷";
```

###### with generator instances

```js
var a,b,c;
[a, b, c] = (function*(){ yield 1; yield 2; }());
return a === 1 && b === 2 && c === undefined;
```

###### with generic iterables

```js
var a,b,c;
[a, b, c] = global.__createIterableObject([1, 2]);
return a === 1 && b === 2 && c === undefined;
```

###### with instances of generic iterables

```js
var a,b,c;
[a, b, c] = Object.create(global.__createIterableObject([1, 2]));
return a === 1 && b === 2 && c === undefined;
```

###### iterator closing

```js
var closed = false;
var iter = global.__createIterableObject([1, 2, 3], {
  'return': function(){ closed = true; return {}; }
});
var a,b;
[a, b] = iter;
return closed;
```

###### iterable destructuring expression

```js
var a, b, iterable = [1,2];
return ([a, b] = iterable) === iterable;
```

###### chained iterable destructuring

```js
var a,b,c,d;
[a,b] = [c,d] = [1,2];
return a === 1 && b === 2 && c === 1 && d === 2;
```

###### trailing commas in iterable patterns

```js
var a;
[a,] = [1];
return a === 1;
```

###### with objects

```js
var c,d,e;
({c, x:d, e} = {c:7, x:8});
return c === 7 && d === 8 && e === undefined;
```

###### object destructuring with primitives

```js
var toFixed, slice;
({toFixed} = 2);
({slice} = '');
return toFixed === Number.prototype.toFixed
  && slice === String.prototype.slice;
```

###### trailing commas in object patterns

```js
var a;
({a,} = {a:1});
return a === 1;
```

###### object destructuring expression

```js
var a, b, obj = { a:1, b:2 };
return ({a,b} = obj) === obj;
```

###### parenthesised left-hand-side is a syntax error

```js
var a, b;
({a,b} = {a:1,b:2});
try {
  eval("({a,b}) = {a:3,b:4};");
}
catch(e) {
  return a === 1 && b === 2;
}
```

###### chained object destructuring

```js
var a,b,c,d;
({a,b} = {c,d} = {a:1,b:2,c:3,d:4});
return a === 1 && b === 2 && c === 3 && d === 4;
```

###### throws on null and undefined

```js
var a,b;
try {
  ({a} = null);
  return false;
} catch(e) {
  if (!(e instanceof TypeError))
    return false;
}
try {
  ({b} = undefined);
  return false;
} catch(e) {
  if (!(e instanceof TypeError))
    return false;
}
return true;
```

###### computed properties

```js
var grault, qux = "corge";
({ [qux]: grault } = { corge: "garply" });
return grault === "garply";
```

###### nested

```js
var e,f,g,h,i;
[e, {x:f, g}] = [9, {x:10}];
({h, x:[i]} = {h:11, x:[12]});
return e === 9 && f === 10 && g === undefined
  && h === 11 && i === 12;
```

###### rest

```js
var a,b,c,d;
[a, ...b] = [3, 4, 5];
[c, ...d] = [6];
return a === 3 && b instanceof Array && (b + "") === "4,5" &&
   c === 6 && d instanceof Array && d.length === 0;
```

###### nested rest

```js
var a = [1, 2, 3], first, last;
[first, ...[a[2], last]] = a;
return first === 1 && last === 3 && (a + "") === "1,2,2";
```

###### empty patterns

```js
[] = [1,2];
({} = {a:1,b:2});
return true;
```

###### defaults

```js
var a,b,c,d,e,f;
({a = 1, b = 0, z:c = 3} = {b:2, z:undefined});
[d = 0, e = 5, f = 6] = [4,,undefined];
return a === 1 && b === 2 && c === 3
  && d === 4 && e === 5 && f === 6;
```

##### destructuring, parameters

###### with arrays

```js
return function([a, , [b], c]) {
  return a === 5 && b === 6 && c === undefined;
}([5, null, [6]]);
```

###### with sparse arrays

```js
return function([a, , b]) {
  return a === undefined && b === undefined;
}([,,,]);
```

###### with strings

```js
return function([a, b, c]) {
  return a === "a" && b === "b" && c === undefined;
}("ab");
```

###### with astral plane strings

```js
return function([c]) {
  return c === "𠮷";
}("𠮷𠮶");
```

###### with generator instances

```js
return function([a, b, c]) {
  return a === 1 && b === 2 && c === undefined;
}(function*(){ yield 1; yield 2; }());
```

###### with generic iterables

```js
return function([a, b, c]) {
  return a === 1 && b === 2 && c === undefined;
}(global.__createIterableObject([1, 2]));
```

###### with instances of generic iterables

```js
return function([a, b, c]) {
  return a === 1 && b === 2 && c === undefined;
}(Object.create(global.__createIterableObject([1, 2])));
```

###### iterator closing

```js
var closed = false;
var iter = global.__createIterableObject([1, 2, 3], {
  'return': function(){ closed = true; return {}; }
});
(function([a,b]) {}(iter));
return closed;
```

###### trailing commas in iterable patterns

```js
return function([a,]) {
  return a === 1;
}([1]);
```

###### with objects

```js
return function({c, x:d, e}) {
  return c === 7 && d === 8 && e === undefined;
}({c:7, x:8});
```

###### object destructuring with primitives

```js
return function({toFixed}, {slice}) {
  return toFixed === Number.prototype.toFixed
    && slice === String.prototype.slice;
}(2,'');
```

###### trailing commas in object patterns

```js
return function({a,}) {
  return a === 1;
}({a:1});
```

###### throws on null and undefined

```js
try {
  (function({a}){}(null));
  return false;
} catch(e) {}
try {
  (function({b}){}(undefined));
  return false;
} catch(e) {}
return true;
```

###### computed properties

```js
var qux = "corge";
return function({ [qux]: grault }) {
  return grault === "garply";
}({ corge: "garply" });
```

###### nested

```js
return function([e, {x:f, g}], {h, x:[i]}) {
  return e === 9 && f === 10 && g === undefined
    && h === 11 && i === 12;
}([9, {x:10}],{h:11, x:[12]});
```

###### 'arguments' interaction

```js
return (function({a, x:b, y:e}, [c, d]) {
  return arguments[0].a === 1 && arguments[0].x === 2
    && !("y" in arguments[0]) && arguments[1] + '' === "3,4";
}({a:1, x:2}, [3, 4]));
```

###### new Function() support

```js
return new Function("{a, x:b, y:e}","[c, d]",
  "return a === 1 && b === 2 && c === 3 && "
  + "d === 4 && e === undefined;"
)({a:1, x:2}, [3, 4]);
```

###### in parameters, function 'length' property

```js
return function({a, b}, [c, d]){}.length === 2;
```

###### rest

```js
return function([a, ...b], [c, ...d]) {
  return a === 3 && b instanceof Array && (b + "") === "4,5" &&
     c === 6 && d instanceof Array && d.length === 0;
}([3, 4, 5], [6]);
```

###### empty patterns

```js
return function ([],{}){
  return arguments[0] + '' === "3,4" && arguments[1].x === "foo";
}([3,4],{x:"foo"});
```

###### defaults

```js
return (function({a = 1, b = 0, c = 3, x:d = 0, y:e = 5},
    [f = 6, g = 0, h = 8]) {
  return a === 1 && b === 2 && c === 3 && d === 4 &&
    e === 5 && f === 6 && g === 7 && h === 8;
}({b:2, c:undefined, x:4},[, 7, undefined]));
```

###### defaults, separate scope

```js
return (function({a=function(){
  return typeof b === 'undefined';
}}){
  var b = 1;
  return a();
}({}));
```

###### defaults, new Function() support

```js
return new Function("{a = 1, b = 0, c = 3, x:d = 0, y:e = 5}",
  "return a === 1 && b === 2 && c === 3 && d === 4 && e === 5;"
)({b:2, c:undefined, x:4});
```

###### defaults, arrow function

```js
return ((a, {b = 0, c = 3}) => {
  return a === 1 && b === 2 && c === 3;
})(1, {b: 2});
```

#### undefined

##### generators

###### %GeneratorPrototype%.return

```js
function * generator(){
  yield 5; yield 6;
};
var iterator = generator();
var item = iterator.next();
var passed = item.value === 5 && item.done === false;
item = iterator.return("quxquux");
passed    &= item.value === "quxquux" && item.done === true;
item = iterator.next();
passed    &= item.value === undefined && item.done === true;
return passed;
```

###### yield *, iterator closing

```js
var closed = '';
var iter = __createIterableObject([1, 2, 3], {
  'return': function(){
    closed += 'a';
    return {done: true};
  }
});
var gen = (function* generator(){
  try {
    yield *iter;
  } finally {
    closed += 'b';
  }
})();
gen.next();
gen['return']();
return closed === 'ab';
```

#### undefined

##### Map

###### Map[Symbol.species]

```js
var prop = Object.getOwnPropertyDescriptor(Map, Symbol.species);
return 'get' in prop && Map[Symbol.species] === Map;
```

##### Set

###### Set[Symbol.species]

```js
var prop = Object.getOwnPropertyDescriptor(Set, Symbol.species);
return 'get' in prop && Set[Symbol.species] === Set;
```

##### Proxy

###### constructor requires new

```js
new Proxy({}, {});
try {
  Proxy({}, {});
  return false;
} catch(e) {
  return true;
}
```

###### no "prototype" property

```js
new Proxy({}, {});
return !Proxy.hasOwnProperty('prototype');
```

###### "get" handler

```js
var proxied = { };
var proxy = new Proxy(proxied, {
  get: function (t, k, r) {
    return t === proxied && k === "foo" && r === proxy && 5;
  }
});
return proxy.foo === 5;
```

###### "get" handler, instances of proxies

```js
var proxied = { };
var proxy = Object.create(new Proxy(proxied, {
  get: function (t, k, r) {
    return t === proxied && k === "foo" && r === proxy && 5;
  }
}));
return proxy.foo === 5;
```

###### "get" handler invariants

```js
var passed = false;
var proxied = { };
var proxy = new Proxy(proxied, {
  get: function () {
    passed = true;
    return 4;
  }
});
// The value reported for a property must be the same as the value of the corresponding
// target object property if the target object property is a non-writable,
// non-configurable own data property.
Object.defineProperty(proxied, "foo", { value: 5, enumerable: true });
try {
  proxy.foo;
  return false;
}
catch(e) {}
// The value reported for a property must be undefined if the corresponding target
// object property is a non-configurable own accessor property that has undefined
// as its [[Get]] attribute.
Object.defineProperty(proxied, "bar",
  { set: function(){}, enumerable: true });
try {
  proxy.bar;
  return false;
}
catch(e) {}
return passed;
```

###### "set" handler

```js
var proxied = { };
var passed = false;
var proxy = new Proxy(proxied, {
  set: function (t, k, v, r) {
    passed = t === proxied && k + v === "foobar" && r === proxy;
  }
});
proxy.foo = "bar";
return passed;
```

###### "set" handler, instances of proxies

```js
var proxied = { };
var passed = false;
var proxy = Object.create(new Proxy(proxied, {
  set: function (t, k, v, r) {
    passed = t === proxied && k + v === "foobar" && r === proxy;
  }
}));
proxy.foo = "bar";
return passed;
```

###### "set" handler invariants

```js
var passed = false;
new Proxy({},{});
// Cannot change the value of a property to be different from the value of
// the corresponding target object if the corresponding target object
// property is a non-writable, non-configurable own data property.
var proxied = {};
var proxy = new Proxy(proxied, {
  set: function () {
    passed = true;
    return true;
  }
});
Object.defineProperty(proxied, "foo", { value: 2, enumerable: true });
proxy.foo = 2;
try {
  proxy.foo = 4;
  return false;
} catch(e) {}
// Cannot set the value of a property if the corresponding target
// object property is a non-configurable own accessor property
// that has undefined as its [[Set]] attribute.
Object.defineProperty(proxied, "bar",
  { get: function(){}, enumerable: true });
try {
  proxy.bar = 2;
  return false;
} catch(e) {}
return passed;
```

###### "has" handler

```js
var proxied = {};
var passed = false;
"foo" in new Proxy(proxied, {
  has: function (t, k) {
    passed = t === proxied && k === "foo";
  }
});
return passed;
```

###### "has" handler, instances of proxies

```js
var proxied = {};
var passed = false;
"foo" in Object.create(new Proxy(proxied, {
  has: function (t, k) {
    passed = t === proxied && k === "foo";
  }
}));
return passed;
```

###### "has" handler invariants

```js
var passed = false;
new Proxy({},{});
// A property cannot be reported as non-existent, if it exists as a
// non-configurable own property of the target object.
var proxied = {};
var proxy = new Proxy(proxied, {
  has: function () {
    passed = true;
    return false;
  }
});
Object.defineProperty(proxied, "foo", { value: 2, writable: true, enumerable: true });
try {
  'foo' in proxy;
  return false;
} catch(e) {}
// A property cannot be reported as non-existent, if it exists as an
// own property of the target object and the target object is not extensible.
proxied.bar = 2;
Object.preventExtensions(proxied);
try {
  'bar' in proxy;
  return false;
} catch(e) {}
return passed;
```

###### "deleteProperty" handler

```js
var proxied = {};
var passed = false;
delete new Proxy(proxied, {
  deleteProperty: function (t, k) {
    passed = t === proxied && k === "foo";
  }
}).foo;
return passed;
```

###### "deleteProperty" handler invariant

```js
var passed = false;
new Proxy({},{});
// A property cannot be reported as deleted, if it exists as a non-configurable
// own property of the target object.
var proxied = {};
Object.defineProperty(proxied, "foo", { value: 2, writable: true, enumerable: true });
try {
  delete new Proxy(proxied, {
    deleteProperty: function () {
      passed = true;
      return true;
    }
  }).foo;
  return false;
} catch(e) {}
return passed;
```

###### "getOwnPropertyDescriptor" handler

```js
var proxied = {};
var fakeDesc = { value: "foo", configurable: true };
var returnedDesc = Object.getOwnPropertyDescriptor(
  new Proxy(proxied, {
    getOwnPropertyDescriptor: function (t, k) {
      return t === proxied && k === "foo" && fakeDesc;
    }
  }),
  "foo"
);
return (returnedDesc.value     === fakeDesc.value
  && returnedDesc.configurable === fakeDesc.configurable
  && returnedDesc.writable     === false
  && returnedDesc.enumerable   === false);
```

###### "getOwnPropertyDescriptor" handler invariants

```js
var passed = false;
new Proxy({},{});
// A property cannot be reported as non-existent, if it exists as a non-configurable
// own property of the target object.
var proxied = {};
var proxy = new Proxy(proxied, {
  getOwnPropertyDescriptor: function () {
    passed = true;
    return undefined;
  }
});
Object.defineProperty(proxied, "foo", { value: 2, writable: true, enumerable: true });
try {
  Object.getOwnPropertyDescriptor(proxy, "foo");
  return false;
} catch(e) {}
// A property cannot be reported as non-existent, if it exists as an own property
// of the target object and the target object is not extensible.
proxied.bar = 3;
Object.preventExtensions(proxied);
try {
  Object.getOwnPropertyDescriptor(proxy, "bar");
  return false;
} catch(e) {}
// A property cannot be reported as existent, if it does not exists as an own property
// of the target object and the target object is not extensible.
try {
  Object.getOwnPropertyDescriptor(new Proxy(proxied, {
    getOwnPropertyDescriptor: function() {
      return { value: 2, configurable: true, writable: true, enumerable: true };
    }}), "baz");
  return false;
} catch(e) {}
// A property cannot be reported as non-configurable, if it does not exists as an own
// property of the target object or if it exists as a configurable own property of
// the target object.
try {
  Object.getOwnPropertyDescriptor(new Proxy({}, {
    getOwnPropertyDescriptor: function() {
      return { value: 2, configurable: false, writable: true, enumerable: true };
    }}), "baz");
  return false;
} catch(e) {}
try {
  Object.getOwnPropertyDescriptor(new Proxy({baz:1}, {
    getOwnPropertyDescriptor: function() {
      return { value: 1, configurable: false, writable: true, enumerable: true };
    }}), "baz");
  return false;
} catch(e) {}
return passed;
```

###### "defineProperty" handler

```js
var proxied = {};
var passed = false;
Object.defineProperty(
  new Proxy(proxied, {
    defineProperty: function (t, k, d) {
      passed = t === proxied && k === "foo" && d.value === 5;
      return true;
    }
  }),
  "foo",
  { value: 5, configurable: true }
);
return passed;
```

###### "defineProperty" handler invariants

```js
var passed = false;
new Proxy({},{});
// A property cannot be added, if the target object is not extensible.
var proxied = Object.preventExtensions({});
var proxy = new Proxy(proxied, {
  defineProperty: function() {
    passed = true;
    return true;
  }
});
try {
  Object.defineProperty(proxy, "foo", { value: 2 });
  return false;
} catch(e) {}
// A property cannot be non-configurable, unless there exists a corresponding
// non-configurable own property of the target object.
try {
  Object.defineProperty(
    new Proxy({ bar: true }, {
      defineProperty: function () {
        return true;
      }
    }),
    "bar",
    { value: 5, configurable: false, writable: true, enumerable: true }
  );
  return false;
} catch(e) {}
return passed;
```

###### "getPrototypeOf" handler

```js
var proxied = {};
var fakeProto = {};
var proxy = new Proxy(proxied, {
  getPrototypeOf: function (t) {
    return t === proxied && fakeProto;
  }
});
return Object.getPrototypeOf(proxy) === fakeProto;
```

###### "getPrototypeOf" handler invariant

```js
var passed = false;
new Proxy({},{});
// If the target object is not extensible, [[GetPrototypeOf]] applied to the proxy object
// must return the same value as [[GetPrototypeOf]] applied to the proxy object's target object.
try {
  Object.getPrototypeOf(new Proxy(Object.preventExtensions({}), {
    getPrototypeOf: function () {
      passed = true;
      return {};
    }
  }));
  return false;
} catch(e) {}
return passed;
```

###### "setPrototypeOf" handler

```js
var proxied = {};
var newProto = {};
var passed = false;
Object.setPrototypeOf(
  new Proxy(proxied, {
    setPrototypeOf: function (t, p) {
      passed = t === proxied && p === newProto;
      return true;
    }
  }),
  newProto
);
return passed;
```

###### "setPrototypeOf" handler invariant

```js
var passed = false;
new Proxy({},{});
Object.setPrototypeOf({},{});
// If the target object is not extensible, the argument value must be the
// same as the result of [[GetPrototypeOf]] applied to target object.
try {
  Object.setPrototypeOf(
    new Proxy(Object.preventExtensions({}), {
      setPrototypeOf: function () {
        passed = true;
        return true;
      }
    }),{});
  return false;
} catch(e) {}
return passed;
```

###### "isExtensible" handler

```js
var proxied = {};
var passed = false;
Object.isExtensible(
  new Proxy(proxied, {
    isExtensible: function (t) {
      passed = t === proxied; return true;
    }
  })
);
return passed;
```

###### "isExtensible" handler invariant

```js
var passed = false;
new Proxy({},{});
// [[IsExtensible]] applied to the proxy object must return the same value
// as [[IsExtensible]] applied to the proxy object's target object with the same argument.
try {
  Object.isExtensible(new Proxy({}, {
    isExtensible: function (t) {
      passed = true;
      return false;
    }
  }));
  return false;
} catch(e) {}
try {
  Object.isExtensible(new Proxy(Object.preventExtensions({}), {
    isExtensible: function (t) {
      return true;
    }
  }));
  return false;
} catch(e) {}
return true;
```

###### "preventExtensions" handler

```js
var proxied = {};
var passed = false;
Object.preventExtensions(
  new Proxy(proxied, {
    preventExtensions: function (t) {
      passed = t === proxied;
      return Object.preventExtensions(proxied);
    }
  })
);
return passed;
```

###### "preventExtensions" handler invariant

```js
var passed = false;
new Proxy({},{});
// [[PreventExtensions]] applied to the proxy object only returns true
// if [[IsExtensible]] applied to the proxy object's target object is false.
try {
  Object.preventExtensions(new Proxy({}, {
    preventExtensions: function () {
      passed = true;
      return true;
    }
  }));
  return false;
} catch(e) {}
return passed;
```

###### "ownKeys" handler

```js
var proxied = {};
var passed = false;
Object.keys(
  new Proxy(proxied, {
    ownKeys: function (t) {
      passed = t === proxied; return [];
    }
  })
);
return passed;
```

###### "ownKeys" handler invariant

```js
var passed = false;
new Proxy({},{});
// The Type of each result List element is either String or Symbol.
try {
  Object.keys(new Proxy({}, {
    ownKeys: function () {
      passed = true;
      return [2];
    }}));
  return false;
} catch(e) {}
// The result List must contain the keys of all non-configurable own properties of the target object.
var proxied = {};
Object.defineProperty(proxied, "foo", { value: 2, writable: true, enumerable: true });
try {
  Object.keys(new Proxy(proxied, {
    ownKeys: function () {
      return [];
    }}));
  return false;
} catch(e) {}
// If the target object is not extensible, then the result List must contain all the keys
// of the own properties of the target object and no other values.
try {
  Object.keys(new Proxy(Object.preventExtensions({b:1}), {
    ownKeys: function () {
      return ['a'];
    }}));
  return false;
} catch(e) {}
return passed;
```

###### "apply" handler

```js
var proxied = function(){};
var passed = false;
var host = {
  method: new Proxy(proxied, {
    apply: function (t, thisArg, args) {
      passed = t === proxied && thisArg === host && args + "" === "foo,bar";
    }
  })
};
host.method("foo", "bar");
return passed;
```

###### "apply" handler invariant

```js
var passed = false;
new Proxy(function(){}, {
    apply: function () { passed = true; }
})();
// A Proxy exotic object only has a [[Call]] internal method if the
// initial value of its [[ProxyTarget]] internal slot is an object
// that has a [[Call]] internal method.
try {
  new Proxy({}, {
    apply: function () {}
  })();
  return false;
} catch(e) {}
return passed;
```

###### "construct" handler

```js
var proxied = function(){};
var passed = false;
new new Proxy(proxied, {
  construct: function (t, args) {
    passed = t === proxied && args + "" === "foo,bar";
    return {};
  }
})("foo","bar");
return passed;
```

###### "construct" handler invariants

```js
var passed = false;
new Proxy({},{});
// A Proxy exotic object only has a [[Construct]] internal method if the
// initial value of its [[ProxyTarget]] internal slot is an object
// that has a [[Construct]] internal method.
try {
  new new Proxy({}, {
    construct: function (t, args) {
      return {};
    }
  })();
  return false;
} catch(e) {}
// The result of [[Construct]] must be an Object.
try {
  new new Proxy(function(){}, {
    construct: function (t, args) {
      passed = true;
      return 5;
    }
  })();
  return false;
} catch(e) {}
return passed;
```

###### Proxy.revocable

```js
var obj = Proxy.revocable({}, { get: function() { return 5; } });
var passed = (obj.proxy.foo === 5);
obj.revoke();
try {
  obj.proxy.foo;
} catch(e) {
  passed &= e instanceof TypeError;
}
return passed;
```

###### Array.isArray support

```js
return Array.isArray(new Proxy([], {}));
```

###### JSON.stringify support

```js
return JSON.stringify(new Proxy(['foo'], {})) === '["foo"]';
```

##### Reflect

###### Reflect.get

```js
return Reflect.get({ qux: 987 }, "qux") === 987;
```

###### Reflect.set

```js
var obj = {};
Reflect.set(obj, "quux", 654);
return obj.quux === 654;
```

###### Reflect.has

```js
return Reflect.has({ qux: 987 }, "qux");
```

###### Reflect.deleteProperty

```js
var obj = { bar: 456 };
Reflect.deleteProperty(obj, "bar");
return !("bar" in obj);
```

###### Reflect.getOwnPropertyDescriptor

```js
var obj = { baz: 789 };
var desc = Reflect.getOwnPropertyDescriptor(obj, "baz");
return desc.value === 789 &&
  desc.configurable && desc.writable && desc.enumerable;
```

###### Reflect.defineProperty

```js
var obj = {};
Reflect.defineProperty(obj, "foo", { value: 123 });
return obj.foo === 123 &&
  Reflect.defineProperty(Object.freeze({}), "foo", { value: 123 }) === false;
```

###### Reflect.getPrototypeOf

```js
return Reflect.getPrototypeOf([]) === Array.prototype;
```

###### Reflect.setPrototypeOf

```js
var obj = {};
Reflect.setPrototypeOf(obj, Array.prototype);
return obj instanceof Array;
```

###### Reflect.isExtensible

```js
return Reflect.isExtensible({}) &&
  !Reflect.isExtensible(Object.preventExtensions({}));
```

###### Reflect.preventExtensions

```js
var obj = {};
Reflect.preventExtensions(obj);
return !Object.isExtensible(obj);
```

###### Reflect.ownKeys, string keys

```js
var obj = Object.create({ C: true });
obj.A = true;
Object.defineProperty(obj, 'B', { value: true, enumerable: false });

return Reflect.ownKeys(obj).sort() + '' === "A,B";
```

###### Reflect.ownKeys, symbol keys

```js
var s1 = Symbol(), s2 = Symbol(), s3 = Symbol();
var proto = {};
proto[s1] = true;
var obj = Object.create(proto);
obj[s2] = true;
Object.defineProperty(obj, s3, { value: true, enumerable: false });

var keys = Reflect.ownKeys(obj);
return keys.indexOf(s2) >-1 && keys.indexOf(s3) >-1 && keys.length === 2;
```

###### Reflect.apply

```js
return Reflect.apply(Array.prototype.push, [1,2], [3,4,5]) === 5;
```

###### Reflect.construct

```js
return Reflect.construct(function(a, b, c) {
  this.qux = a + b + c;
}, ["foo", "bar", "baz"]).qux === "foobarbaz";
```

###### Reflect.construct sets new.target meta-property

```js
return Reflect.construct(function(a, b, c) {
  if (new.target === Object) {
    this.qux = a + b + c;
  }
}, ["foo", "bar", "baz"], Object).qux === "foobarbaz";
```

###### Reflect.construct creates instances from third argument

```js
function F(){}
var obj = Reflect.construct(function(){ this.y = 1; }, [], F);
return obj.y === 1 && obj instanceof F;
```

###### Reflect.construct, Array subclassing

```js
function F(){}
var obj = Reflect.construct(Array, [], F);
obj[2] = 'foo';
return obj.length === 3 && obj instanceof F;
```

###### Reflect.construct, RegExp subclassing

```js
function F(){}
var obj = Reflect.construct(RegExp, ["baz","g"], F);
return RegExp.prototype.exec.call(obj, "foobarbaz")[0] === "baz"
  && obj.lastIndex === 9 && obj instanceof F;
```

###### Reflect.construct, Function subclassing

```js
function F(){}
var obj = Reflect.construct(Function, ["return 2"], F);
return obj() === 2 && obj instanceof F;
```

###### Reflect.construct, Promise subclassing

```js
function F(){}
var p1 = Reflect.construct(Promise,[function(resolve, reject) { resolve("foo"); }], F);
var p2 = Reflect.construct(Promise,[function(resolve, reject) { reject("quux"); }], F);
var score = +(p1 instanceof F && p2 instanceof F);

function thenFn(result)  { score += (result === "foo");  check(); }
function catchFn(result) { score += (result === "quux"); check(); }
function shouldNotRun(result)  { score = -Infinity;   }

p1.then = p2.then = Promise.prototype.then;
p1.catch = p2.catch = Promise.prototype.catch;

p1.then(thenFn, shouldNotRun);
p2.then(shouldNotRun, catchFn);
p1.catch(shouldNotRun);
p2.catch(catchFn);

function check() {
  if (score === 4) asyncTestPassed();
}
```

##### Promise

###### Promise[Symbol.species]

```js
var prop = Object.getOwnPropertyDescriptor(Promise, Symbol.species);
return 'get' in prop && Promise[Symbol.species] === Promise;
```

##### well-known symbols

###### Symbol.match, String.prototype.startsWith

```js
var re = /./;
try {
  '/./'.startsWith(re);
} catch(e){
  re[Symbol.match] = false;
  return '/./'.startsWith(re);
}
```

###### Symbol.match, String.prototype.endsWith

```js
var re = /./;
try {
  '/./'.endsWith(re);
} catch(e){
  re[Symbol.match] = false;
  return '/./'.endsWith(re);
}
```

###### Symbol.match, String.prototype.includes

```js
var re = /./;
try {
  '/./'.includes(re);
} catch(e){
  re[Symbol.match] = false;
  return '/./'.includes(re);
}
```

#### undefined

##### RegExp.prototype properties

###### RegExp[Symbol.species]

```js
var prop = Object.getOwnPropertyDescriptor(RegExp, Symbol.species);
return 'get' in prop && RegExp[Symbol.species] === RegExp;
```

##### Array static methods

###### Array[Symbol.species]

```js
var prop = Object.getOwnPropertyDescriptor(Array, Symbol.species);
return 'get' in prop && Array[Symbol.species] === Array;
```

##### 

###### Date.prototype[Symbol.toPrimitive]

```js
var tp = Date.prototype[Symbol.toPrimitive];
return tp.call(Object(2), "number") === 2
  && tp.call(Object(2), "string") === "2"
  && tp.call(Object(2), "default") === "2";
```

#### undefined

##### Proxy, internal 'get' calls

###### ToPrimitive

```js
// ToPrimitive -> Get -> [[Get]]
var get = [];
var p = new Proxy({toString:Function()}, { get: function(o, k) { get.push(k); return o[k]; }});
p + 3;
return get[0] === Symbol.toPrimitive && get.slice(1) + '' === "valueOf,toString";
```

###### CreateListFromArrayLike

```js
// CreateListFromArrayLike -> Get -> [[Get]]
var get = [];
var p = new Proxy({length:2, 0:0, 1:0}, { get: function(o, k) { get.push(k); return o[k]; }});
Function.prototype.apply({}, p);
return get + '' === "length,0,1";
```

###### instanceof operator

```js
// InstanceofOperator -> GetMethod -> GetV -> [[Get]]
// InstanceofOperator -> OrdinaryHasInstance -> Get -> [[Get]]
var get = [];
var p = new Proxy(Function(), { get: function(o, k) { get.push(k); return o[k]; }});
({}) instanceof p;
return get[0] === Symbol.hasInstance && get.slice(1) + '' === "prototype";
```

###### HasBinding

```js
// HasBinding -> Get -> [[Get]]
var get = [];
var p = new Proxy({foo:1}, { get: function(o, k) { get.push(k); return o[k]; }});
p[Symbol.unscopables] = p;
with(p) {
  typeof foo;
}
return get[0] === Symbol.unscopables && get.slice(1) + '' === "foo";
```

###### CreateDynamicFunction

```js
// CreateDynamicFunction -> GetPrototypeFromConstructor -> Get -> [[Get]]
var get = [];
var p = new Proxy(Function, { get: function(o, k) { get.push(k); return o[k]; }});
new p;
return get + '' === "prototype";
```

###### ClassDefinitionEvaluation

```js
// ClassDefinitionEvaluation -> Get -> [[Get]]
var get = [];
var p = new Proxy(Function(), { get: function(o, k) { get.push(k); return o[k]; }});
class C extends p {}
return get + '' === "prototype";
```

###### IteratorComplete, IteratorValue

```js
// IteratorComplete -> Get -> [[Get]]
// IteratorValue -> Get -> [[Get]]
var get = [];
var iterable = {};
iterable[Symbol.iterator] = function() {
  return {
    next: function() {
      return new Proxy({ value: 2, done: false }, { get: function(o, k) { get.push(k); return o[k]; }});
    }
  };
}
var i = 0;
for(var e of iterable) {
  if (++i >= 2) break;
}
return get + '' === "done,value,done,value";
```

###### ToPropertyDescriptor

```js
// ToPropertyDescriptor -> Get -> [[Get]]
var get = [];
var p = new Proxy({
    enumerable: true, configurable: true, value: true,
    writable: true, get: Function(), set: Function()
  }, { get: function(o, k) { get.push(k); return o[k]; }});
try {
  // This will throw, since it will have true for both "get" and "value",
  // but not before performing a Get on every property.
  Object.defineProperty({}, "foo", p);
} catch(e) {
  return get + '' === "enumerable,configurable,value,writable,get,set";
}
```

###### Object.assign

```js
// Object.assign -> Get -> [[Get]]
var get = [];
var p = new Proxy({foo:1, bar:2}, { get: function(o, k) { get.push(k); return o[k]; }});
Object.assign({}, p);
return get + '' === "foo,bar";
```

###### Object.defineProperties

```js
// Object.defineProperties -> Get -> [[Get]]
var get = [];
var p = new Proxy({foo:{}, bar:{}}, { get: function(o, k) { get.push(k); return o[k]; }});
Object.defineProperties({}, p);
return get + '' === "foo,bar";
```

###### Function.prototype.bind

```js
// Function.prototype.bind -> Get -> [[Get]]
var get = [];
var p = new Proxy(Function(), { get: function(o, k) { get.push(k); return o[k]; }});
Function.prototype.bind.call(p);
return get + '' === "length,name";
```

###### Error.prototype.toString

```js
// Error.prototype.toString -> Get -> [[Get]]
var get = [];
var p = new Proxy({}, { get: function(o, k) { get.push(k); return o[k]; }});
Error.prototype.toString.call(p);
return get + '' === "name,message";
```

###### String.raw

```js
// String.raw -> Get -> [[Get]]
var get = [];
var raw = new Proxy({length: 2, 0: '', 1: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
var p = new Proxy({raw: raw}, { get: function(o, k) { get.push(k); return o[k]; }});
String.raw(p);
return get + '' === "raw,length,0,1";
```

###### RegExp constructor

```js
// RegExp -> Get -> [[Get]]
var get = [];
var re = { constructor: null };
re[Symbol.match] = true;
var p = new Proxy(re, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp(p);
return get[0] === Symbol.match && get.slice(1) + '' === "constructor,source,flags";
```

###### RegExp.prototype.flags

```js
// RegExp.prototype.flags -> Get -> [[Get]]
var get = [];
var p = new Proxy({}, { get: function(o, k) { get.push(k); return o[k]; }});
Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(p);
return get + '' === "global,ignoreCase,multiline,unicode,sticky";
```

###### RegExp.prototype.test

```js
// RegExp.prototype.test -> RegExpExec -> Get -> [[Get]]
var get = [];
var p = new Proxy({ exec: function() { return null; } }, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp.prototype.test.call(p);
return get + '' === "exec";
```

###### RegExp.prototype.toString

```js
// RegExp.prototype.toString -> Get -> [[Get]]
var get = [];
var p = new Proxy({}, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp.prototype.toString.call(p);
return get + '' === "source,flags";
```

###### RegExp.prototype[Symbol.match]

```js
// RegExp.prototype[Symbol.match] -> Get -> [[Get]]
var get = [];
var p = new Proxy({ exec: function() { return null; } }, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp.prototype[Symbol.match].call(p);
p.global = true;
RegExp.prototype[Symbol.match].call(p);
return get + '' === "global,exec,global,unicode,exec";
```

###### RegExp.prototype[Symbol.replace]

```js
// RegExp.prototype[Symbol.replace] -> Get -> [[Get]]
var get = [];
var p = new Proxy({ exec: function() { return null; } }, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp.prototype[Symbol.replace].call(p);
p.global = true;
RegExp.prototype[Symbol.replace].call(p);
return get + '' === "global,exec,global,unicode,exec";
```

###### RegExp.prototype[Symbol.split]

```js
// RegExp.prototype[Symbol.split] -> Get -> [[Get]]
var get = [];
var constructor = Function();
constructor[Symbol.species] = Object;
var p = new Proxy({ constructor: constructor, flags: '', exec: function() { return null; } }, { get: function(o, k) { get.push(k); return o[k]; }});
RegExp.prototype[Symbol.split].call(p, "");
return get + '' === "constructor,flags,exec";
```

###### Array.from

```js
// Array.from -> Get -> [[Get]]
var get = [];
var p = new Proxy({length: 2, 0: '', 1: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
Array.from(p);
return get[0] === Symbol.iterator && get.slice(1) + '' === "length,0,1";
```

###### Array.prototype.concat

```js
// Array.prototype.concat -> Get -> [[Get]]
var get = [];
var arr = [1];
arr.constructor = undefined;
var p = new Proxy(arr, { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.concat.call(p,p);
return get[0] === "constructor"
  && get[1] === Symbol.isConcatSpreadable
  && get[2] === "length"
  && get[3] === "0"
  && get[4] === get[1] && get[5] === get[2] && get[6] === get[3]
  && get.length === 7;
```

###### Array.prototype iteration methods

```js
// Array.prototype methods -> Get -> [[Get]]
var methods = ['copyWithin', 'every', 'fill', 'filter', 'find', 'findIndex', 'forEach',
  'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some'];
var get;
var p = new Proxy({length: 2, 0: '', 1: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
for(var i = 0; i < methods.length; i+=1) {
  get = [];
  Array.prototype[methods[i]].call(p, Function());
  if (get + '' !== (
    methods[i] === 'fill' ? "length" :
    methods[i] === 'every' ? "length,0" :
    methods[i] === 'lastIndexOf' || methods[i] === 'reduceRight' ? "length,1,0" :
    "length,0,1"
  )) {
    return false;
  }
}
return true;
```

###### Array.prototype.pop

```js
// Array.prototype.pop -> Get -> [[Get]]
var get = [];
var p = new Proxy([0,1,2,3], { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.pop.call(p);
return get + '' === "length,3";
```

###### Array.prototype.reverse

```js
// Array.prototype.reverse -> Get -> [[Get]]
var get = [];
var p = new Proxy([0,,2,,4,,], { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.reverse.call(p);
return get + '' === "length,0,4,2";
```

###### Array.prototype.shift

```js
// Array.prototype.shift -> Get -> [[Get]]
var get = [];
var p = new Proxy([0,1,2,3], { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.shift.call(p);
return get + '' === "length,0,1,2,3";
```

###### Array.prototype.splice

```js
// Array.prototype.splice -> Get -> [[Get]]
var get = [];
var p = new Proxy([0,1,2,3], { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.splice.call(p,1,1);
Array.prototype.splice.call(p,1,0,1);
return get + '' === "length,constructor,1,2,3,length,constructor,2,1";
```

###### Array.prototype.toString

```js
// Array.prototype.toString -> Get -> [[Get]]
var get = [];
var p = new Proxy({ join:Function() }, { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.toString.call(p);
return get + '' === "join";
```

###### JSON.stringify

```js
// JSON.stringify -> Get -> [[Get]]
var get = [];
var p = new Proxy({}, { get: function(o, k) { get.push(k); return o[k]; }});
JSON.stringify(p);
return get + '' === "toJSON";
```

###### Promise resolve functions

```js
// Promise resolve functions -> Get -> [[Get]]
var get = [];
var p = new Proxy({}, { get: function(o, k) { get.push(k); return o[k]; }});
new Promise(function(resolve){ resolve(p); });
return get + '' === "then";
```

###### String.prototype.match

```js
// String.prototype.match -> Get -> [[Get]]
var get = [];
var proxied = {};
proxied[Symbol.toPrimitive] = Function();
var p = new Proxy(proxied, { get: function(o, k) { get.push(k); return o[k]; }});
"".match(p);
return get[0] === Symbol.match && get[1] === Symbol.toPrimitive && get.length === 2;
```

###### String.prototype.replace

```js
// String.prototype.replace functions -> Get -> [[Get]]
var get = [];
var proxied = {};
proxied[Symbol.toPrimitive] = Function();
var p = new Proxy(proxied, { get: function(o, k) { get.push(k); return o[k]; }});
"".replace(p);
return get[0] === Symbol.replace && get[1] === Symbol.toPrimitive && get.length === 2;
```

###### String.prototype.search

```js
// String.prototype.search functions -> Get -> [[Get]]
var get = [];
var proxied = {};
proxied[Symbol.toPrimitive] = Function();
var p = new Proxy(proxied, { get: function(o, k) { get.push(k); return o[k]; }});
"".search(p);
return get[0] === Symbol.search && get[1] === Symbol.toPrimitive && get.length === 2;
```

###### String.prototype.split

```js
// String.prototype.split functions -> Get -> [[Get]]
var get = [];
var proxied = {};
proxied[Symbol.toPrimitive] = Function();
var p = new Proxy(proxied, { get: function(o, k) { get.push(k); return o[k]; }});
"".split(p);
return get[0] === Symbol.split && get[1] === Symbol.toPrimitive && get.length === 2;
```

###### Date.prototype.toJSON

```js
// Date.prototype.toJSON -> ToPrimitive -> Get -> [[Get]]
// Date.prototype.toJSON -> Invoke -> GetMethod -> GetV -> [[Get]]
var get = [];
var p = new Proxy({toString:Function(),toISOString:Function()}, { get: function(o, k) { get.push(k); return o[k]; }});
Date.prototype.toJSON.call(p);
return get[0] === Symbol.toPrimitive && get.slice(1) + '' === "valueOf,toString,toISOString";
```

##### Proxy, internal 'set' calls

###### Object.assign

```js
// Object.assign -> Set -> [[Set]]
var set = [];
var p = new Proxy({}, { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
Object.assign(p, { foo: 1, bar: 2 });
return set + '' === "foo,bar";
```

###### Array.from

```js
// Array.from -> Set -> [[Set]]
var set = [];
var p = new Proxy({}, { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
Array.from.call(function(){ return p; }, {length:2, 0:1, 1:2});
return set + '' === "length";
```

###### Array.of

```js
// Array.from -> Set -> [[Set]]
var set = [];
var p = new Proxy({}, { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
Array.of.call(function(){ return p; }, 1, 2, 3);
return set + '' === "length";
```

###### Array.prototype.copyWithin

```js
// Array.prototype.copyWithin -> Set -> [[Set]]
var set = [];
var p = new Proxy([1,2,3,4,5,6], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.copyWithin(0, 3);
return set + '' === "0,1,2";
```

###### Array.prototype.fill

```js
// Array.prototype.fill -> Set -> [[Set]]
var set = [];
var p = new Proxy([1,2,3,4,5,6], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.fill(0, 3);
return set + '' === "3,4,5";
```

###### Array.prototype.pop

```js
// Array.prototype.pop -> Set -> [[Set]]
var set = [];
var p = new Proxy([], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.pop();
return set + '' === "length";
```

###### Array.prototype.push

```js
// Array.prototype.push -> Set -> [[Set]]
var set = [];
var p = new Proxy([], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.push(0,0,0);
return set + '' === "0,1,2,length";
```

###### Array.prototype.reverse

```js
// Array.prototype.reverse -> Set -> [[Set]]
var set = [];
var p = new Proxy([0,0,0,,], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.reverse();
return set + '' === "3,1,2";
```

###### Array.prototype.shift

```js
// Array.prototype.shift -> Set -> [[Set]]
var set = [];
var p = new Proxy([0,0,,0], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.shift();
return set + '' === "0,2,length";
```

###### Array.prototype.splice

```js
// Array.prototype.splice -> Set -> [[Set]]
var set = [];
var p = new Proxy([1,2,3], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.splice(1,0,0);
return set + '' === "3,2,1,length";
```

###### Array.prototype.unshift

```js
// Array.prototype.unshift -> Set -> [[Set]]
var set = [];
var p = new Proxy([0,0,,0], { set: function(o, k, v) { set.push(k); o[k] = v; return true; }});
p.unshift(0,1);
return set + '' === "5,3,2,0,1,length";
```

##### Proxy, internal 'defineProperty' calls

###### [[Set]]

```js
// [[Set]] -> [[DefineOwnProperty]]
var def = [];
var p = new Proxy({foo:1, bar:2}, { defineProperty: function(o, v, desc) { def.push(v); Object.defineProperty(o, v, desc); return true; }});
p.foo = 2; p.bar = 4;
return def + '' === "foo,bar";
```

###### SetIntegrityLevel

```js
// SetIntegrityLevel -> DefinePropertyOrThrow -> [[DefineOwnProperty]]
var def = [];
var p = new Proxy({foo:1, bar:2}, { defineProperty: function(o, v, desc) { def.push(v); Object.defineProperty(o, v, desc); return true; }});
Object.freeze(p);
return def + '' === "foo,bar";
```

##### Proxy, internal 'deleteProperty' calls

###### Array.prototype.copyWithin

```js
// Array.prototype.copyWithin -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,0,0,,,,], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.copyWithin(0,3);
return del + '' === "0,1,2";
```

###### Array.prototype.pop

```js
// Array.prototype.pop -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,0,0], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.pop();
return del + '' === "2";
```

###### Array.prototype.reverse

```js
// Array.prototype.reverse -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,,2,,4,,], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.reverse();
return del + '' === "0,4,2";
```

###### Array.prototype.shift

```js
// Array.prototype.shift -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,,0,,0,0], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.shift();
return del + '' === "0,2,5";
```

###### Array.prototype.splice

```js
// Array.prototype.splice -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,0,0,0,,0], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.splice(2,2,0);
return del + '' === "3,5";
```

###### Array.prototype.unshift

```js
// Array.prototype.unshift -> DeletePropertyOrThrow -> [[Delete]]
var del = [];
var p = new Proxy([0,0,,0,,0], { deleteProperty: function(o, v) { del.push(v); return delete o[v]; }});
p.unshift(0);
return del + '' === "5,3";
```

##### Proxy, internal 'getOwnPropertyDescriptor' calls

###### [[Set]]

```js
// [[Set]] -> [[GetOwnProperty]]
var gopd = [];
var p = new Proxy({},
  { getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }});
p.foo = 1; p.bar = 1;
return gopd + '' === "foo,bar";
```

###### Object.assign

```js
// Object.assign -> [[GetOwnProperty]]
var gopd = [];
var p = new Proxy({foo:1, bar:2},
  { getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }});
Object.assign({}, p);
return gopd + '' === "foo,bar";
```

###### Object.prototype.hasOwnProperty

```js
// Object.prototype.hasOwnProperty -> HasOwnProperty -> [[GetOwnProperty]]
var gopd = [];
var p = new Proxy({foo:1, bar:2},
  { getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }});
p.hasOwnProperty('garply');
return gopd + '' === "garply";
```

###### Function.prototype.bind

```js
// Function.prototype.bind -> HasOwnProperty -> [[GetOwnProperty]]
var gopd = [];
var p = new Proxy(Function(),
  { getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }});
p.bind();
return gopd + '' === "length";
```

##### Proxy, internal 'ownKeys' calls

###### SetIntegrityLevel

```js
// SetIntegrityLevel -> [[OwnPropertyKeys]]
var ownKeysCalled = 0;
var p = new Proxy({}, { ownKeys: function(o) { ownKeysCalled++; return Object.keys(o); }});
Object.freeze(p);
return ownKeysCalled === 1;
```

###### TestIntegrityLevel

```js
// TestIntegrityLevel -> [[OwnPropertyKeys]]
var ownKeysCalled = 0;
var p = new Proxy(Object.preventExtensions({}), { ownKeys: function(o) { ownKeysCalled++; return Object.keys(o); }});
Object.isFrozen(p);
return ownKeysCalled === 1;
```

###### SerializeJSONObject

```js
// SerializeJSONObject -> EnumerableOwnNames -> [[OwnPropertyKeys]]
var ownKeysCalled = 0;
var p = new Proxy({}, { ownKeys: function(o) { ownKeysCalled++; return Object.keys(o); }});
JSON.stringify({a:p,b:p});
return ownKeysCalled === 2;
```

##### own property order

###### Reflect.ownKeys, string key order

```js
var obj = {
  2: true,
  0: true,
  1: true,
  ' ': true,
  9: true,
  D: true,
  B: true,
  '-1': true
};
obj.A = true;
obj[3] = true;
"EFGHIJKLMNOPQRSTUVWXYZ".split('').forEach(function(key){
  obj[key] = true;
});
Object.defineProperty(obj, 'C', { value: true, enumerable: true });
Object.defineProperty(obj, '4', { value: true, enumerable: true });
delete obj[2];
obj[2] = true;

return Reflect.ownKeys(obj).join('') === "012349 DB-1AEFGHIJKLMNOPQRSTUVWXYZC";
```

###### Reflect.ownKeys, symbol key order

```js
var sym1 = Symbol(), sym2 = Symbol(), sym3 = Symbol();
var obj = {
  1: true,
  A: true,
};
obj.B = true;
obj[sym1] = true;
obj[2] = true;
obj[sym2] = true;
Object.defineProperty(obj, 'C', { value: true, enumerable: true });
Object.defineProperty(obj, sym3,{ value: true, enumerable: true });
Object.defineProperty(obj, 'D', { value: true, enumerable: true });

var result = Reflect.ownKeys(obj);
var l = result.length;
return result[l-3] === sym1 && result[l-2] === sym2 && result[l-1] === sym3;
```

##### miscellaneous

###### RegExp constructor can alter flags

```js
return new RegExp(/./im, "g").global === true;
```

###### RegExp.prototype.toString generic and uses "flags" property

```js
return RegExp.prototype.toString.call({source: 'foo', flags: 'bar'}) === '/foo/bar';
```

## Node.js ES2016 Support

#### undefined

##### exponentiation (**) operator

###### basic support

```js
return 2 ** 3 === 8 && -(5 ** 2) === -25 && (-5) ** 2 === 25;
```

###### assignment

```js
var a = 2; a **= 3; return a === 8;
```

###### early syntax error for unary negation without parens

```js
if (2 ** 3 !== 8) { return false; }
try {
Function("-5 ** 2")();
} catch(e) {
return true;
}
```

##### Array.prototype.includes

###### Array.prototype.includes

```js
return [1, 2, 3].includes(1)
&& ![1, 2, 3].includes(4)
&& ![1, 2, 3].includes(1, 1)
&& [NaN].includes(NaN)
&& Array(1).includes();
```

###### Array.prototype.includes is generic

```js
var passed = 0;
return [].includes.call({
get "0"() {
passed = NaN;
return 'foo';
},
get "11"() {
passed += 1;
return 0;
},
get "19"() {
passed += 1;
return 'foo';
},
get "21"() {
passed = NaN;
return 'foo';
},
get length() {
passed += 1;
return 24;
}
}, 'foo', 6) === true && passed === 3;
```

###### %TypedArray%.prototype.includes

```js
return [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
Int32Array, Uint32Array, Float32Array, Float64Array].every(function(TypedArray){
return new TypedArray([1, 2, 3]).includes(1)
&& !new TypedArray([1, 2, 3]).includes(4)
&& !new TypedArray([1, 2, 3]).includes(1, 1);
});
```

#### undefined

##### 

###### strict fn w/ non-strict non-simple params is error

```js
function foo(...a){}
try {
Function("function bar(...a){'use strict';}")();
} catch(e) {
return true;
}
```

###### nested rest destructuring, declarations

```js
var [x, ...[y, ...z]] = [1,2,3,4];
return x === 1 && y === 2 && z + '' === '3,4';
```

###### nested rest destructuring, parameters

```js
return function([x, ...[y, ...z]]) {
return x === 1 && y === 2 && z + '' === '3,4';
}([1,2,3,4]);
```

###### Proxy, "enumerate" handler removed

```js
var passed = true;
var proxy = new Proxy({}, {
enumerate: function() {
passed = false;
}
});
for(var key in proxy); // Should not throw, nor execute the 'enumerate' method.
return passed;
```

###### Proxy internal calls, Array.prototype.includes

```js
// Array.prototype.includes -> Get -> [[Get]]
var get = [];
var p = new Proxy({length: 3, 0: '', 1: '', 2: '', 3: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.includes.call(p, {});
if (get + '' !== "length,0,1,2") return;

get = [];
p = new Proxy({length: 4, 0: NaN, 1: '', 2: NaN, 3: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
Array.prototype.includes.call(p, NaN, 1);
return (get + '' === "length,1,2");
```

## Node.js ES2017 Support

#### undefined

##### Object static methods

###### Object.values

```js
var obj = Object.create({ a: "qux", d: "qux" });
obj.a = "foo"; obj.b = "bar"; obj.c = "baz";
var v = Object.values(obj);
return Array.isArray(v) && String(v) === "foo,bar,baz";
```

###### Object.entries

```js
var obj = Object.create({ a: "qux", d: "qux" });
obj.a = "foo"; obj.b = "bar"; obj.c = "baz";
var e = Object.entries(obj);
return Array.isArray(e)
&& e.length === 3
&& String(e[0]) === "a,foo"
&& String(e[1]) === "b,bar"
&& String(e[2]) === "c,baz";
```

###### Object.getOwnPropertyDescriptors

```js
var object = {a: 1};
var B = typeof Symbol === 'function' ? Symbol('b') : 'b';
object[B] = 2;
var O = Object.defineProperty(object, 'c', {value: 3});
var D = Object.getOwnPropertyDescriptors(O);

return D.a.value === 1 && D.a.enumerable === true && D.a.configurable === true && D.a.writable === true
&& D[B].value === 2 && D[B].enumerable === true && D[B].configurable === true && D[B].writable === true
&& D.c.value === 3 && D.c.enumerable === false && D.c.configurable === false && D.c.writable === false;
```

###### Object.getOwnPropertyDescriptors doesn't provide undefined descriptors

```js
var P = new Proxy({a:1}, {
  getOwnPropertyDescriptor: function(t, k) {}
});
return !Object.getOwnPropertyDescriptors(P).hasOwnProperty('a');
```

#### undefined

##### 

###### Proxy "ownKeys" handler, duplicate keys for non-extensible targets (ES 2017 semantics)

```js
var P = new Proxy(Object.preventExtensions(Object.defineProperty({a:1}, "b", {value:1})), {
ownKeys: function() {
return ['a','a','b','b'];
}
});
return Object.getOwnPropertyNames(P) + '' === "a,a,b,b";
```

#### undefined

##### Proxy internal calls, getter/setter methods

###### __defineGetter__

```js
// Object.prototype.__defineGetter__ -> DefinePropertyOrThrow -> [[DefineOwnProperty]]
var def = [];
var p = new Proxy({}, { defineProperty: function(o, v, desc) { def.push(v); Object.defineProperty(o, v, desc); return true; }});
Object.prototype.__defineGetter__.call(p, "foo", Object);
return def + '' === "foo";
```

###### __defineSetter__

```js
// Object.prototype.__defineSetter__ -> DefinePropertyOrThrow -> [[DefineOwnProperty]]
var def = [];
var p = new Proxy({}, { defineProperty: function(o, v, desc) { def.push(v); Object.defineProperty(o, v, desc); return true; }});
Object.prototype.__defineSetter__.call(p, "foo", Object);
return def + '' === "foo";
```