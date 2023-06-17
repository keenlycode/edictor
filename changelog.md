# Change Log
---
[0.5.0]
---
## Breaking Change
- test() concept has been removed, library will focus
  on validation() concept which throw error object.
  Focus in modifying error object to be more meaningful errors.
  Removed : `Model.test()`, `Array.test()`
- module `field.FieldError` has been chaged to `field.ValidateError`

[0.4.0]
---
- Better errors information
- Partial testing
- Rename TestResult -> ModelTestResult

[0.3.2]
---
## Better support for `defineField().arrayOf()`
- Better error message
- Can handle recursive array such as `arrayOf(['number', 'string'])`
## Model
- Model.test return TestResult instance which contains testing data
  ```
  interface TestResult {
    valid: {},
    invalid: {},
    error: {},
    errorMessage: ''
  }
  ```
- Model() error message contains TestResult data in JSON.