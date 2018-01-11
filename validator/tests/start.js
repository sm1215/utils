/*
* Tape test examples with tap-spec reporting
*
* First need to install "tape" and "tap-spec"
*
* "npm install tape" - core
* "npm install tap-spec" - styling for better readability
*
* documentation: https://github.com/substack/tape#methods
*
* use "tape start.js" to run
*/

var test = require('tape');
var tapSpec = require('tap-spec');

var validator = new require('../js/validator.js');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

var testData = [
  {
    vtype: 'required',
    tests: [
      { value: '0', expected: true },
      { value: 'false', expected: true },
      { value: '!@#$%^&*()', expected: true },
      { value: '123', expected: true },
      { value: '-1', expected: true }
    ]
  },
  {
    vtype: 'email',
    tests: [
      { value: '1@1.com', expected: true },
      { value: 'test@test.org', expected: true },
      { value: 'email@domain', expected: true },
      { value: '@.com', expected: false },
      { value: '@@.com', expected: false }
    ]
  },
  {
    vtype: 'phone',
    tests: [
      { value: '0123456789', expected: true },
      { value: '123456789', expected: true },
      { value: '1-234-567-8901', expected: true },
      { value: '1.234.567.8910', expected2: true },
      { value: '1234567', expected: false },
      { value: '11223344556677889900', expected: false }
    ]
  },
  {
    vtype: 'date',
    tests: [
      { value: '1-1-11', expected: true },
      { value: '11-11-1111', expected: true },
      { value: '09-01-2000', expected: true },
      { value: '12/13/1999', expected: true },
      { value: '99/99/9999', expected: true }
    ]
  },
  {
    vtype: 'number',
    tests: [
      { value: -1, expected: true },
      { value: 0, expected: true },
      { value: 1, expected: true },
      { value: 1.1, expected: true },
      { value: '1', expected: true }
    ]
  },
  {
    vtype: 'letters',
    tests:[
      { value: 'abc', expected: true },
      { value: '1', expected: true },
      { value: '-abc', expected: true },
      { value: '!@##$%^&*()', expected: true },
      { value: 1, expected: false }
    ]
  }
];

test('testing validation inputs', function(t){
  for (var i = 0; i < testData.length; i++) {
    var td = testData[i];
    var vtype = td.vtype;

    for (var j = 0; j < td.tests.length; j++) {
      var value = td.tests[j].value;
      var expected = td.tests[j].expected;

      var actual = validator.runTest(vtype, value);
      t.comment(`vtype: ${vtype} value: ${value}`);
      t.equal(actual, expected, `${value}`);
    }
  }
  t.end();
});
