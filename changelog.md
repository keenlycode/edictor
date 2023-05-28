# Change Log
---

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