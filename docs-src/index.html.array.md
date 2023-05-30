## Array & Matrix

Array data validations can be done easily with `ArrayOf()` which provides
APIs to validate data by instance type or validation function.
Validations also support higher order array.

```js
array1 = new ArrayOf('string', 'number');
// Higher order array.
array2 = new ArrayOf(['string', 'number'], ['string', 'boolean']);

// These are valid arrays according to the schemas.
array1.push(1, 2, 3, 'a', 'b', 'c');
array2.push(['a',1], ['a',2], [true, false, 'abc']);
```

> `{Edictor}` is planned to have better APIs for matrix validations
> in the near future.