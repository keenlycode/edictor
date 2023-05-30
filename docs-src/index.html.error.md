<div class="flex flex-center width-100">
<h2>Error Detection</h2>
</div>

When data validations fail, `{Edictor}` will throw errors and and provide
useful information based on the structure of tesing data.

```ts
interface TestResult {
    valid?: object, // stores valid data object
    invalid?: object, // stores invalid data object
    error?: object, // stores error information based on data structure.
    errorMessage?: '' // error message
}
```