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


test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

//For testing validation regex patterns

// var validator = new require('../js/validator.js');
// var testData = [
//   {
//     vtype: 'required',
//     tests: [
//       { value: '0', expected: true },
//       { value: 'false', expected: true },
//       { value: '!@#$%^&*()', expected: true },
//       { value: '123', expected: true },
//       { value: '-1', expected: true }
//     ]
//   },
//   {
//     vtype: 'email',
//     tests: [
//       { value: '1@1.com', expected: true },
//       { value: 'test@test.org', expected: true },
//       { value: 'email@domain', expected: true },
//       { value: '@.com', expected: false },
//       { value: '@@.com', expected: false }
//     ]
//   },
//   {
//     vtype: 'phone',
//     tests: [
//       { value: '0123456789', expected: true },
//       { value: '123456789', expected: true },
//       { value: '1-234-567-8901', expected: true },
//       { value: '1.234.567.8910', expected2: true },
//       { value: '1234567', expected: false },
//       { value: '11223344556677889900', expected: false }
//     ]
//   },
//   {
//     vtype: 'date',
//     tests: [
//       { value: '1-1-11', expected: true },
//       { value: '11-11-1111', expected: true },
//       { value: '09-01-2000', expected: true },
//       { value: '12/13/1999', expected: true },
//       { value: '99/99/9999', expected: true }
//     ]
//   },
//   {
//     vtype: 'number',
//     tests: [
//       { value: -1, expected: true },
//       { value: 0, expected: true },
//       { value: 1, expected: true },
//       { value: 1.1, expected: true },
//       { value: '1', expected: true }
//     ]
//   },
//   {
//     vtype: 'letters',
//     tests:[
//       { value: 'abc', expected: true },
//       { value: '1', expected: true },
//       { value: '-abc', expected: true },
//       { value: '!@##$%^&*()', expected: true },
//       { value: 1, expected: false }
//     ]
//   }
// ];

// test('testing validation inputs', function(t){
//   for (var i = 0; i < testData.length; i++) {
//     var td = testData[i];
//     var vtype = td.vtype;

//     for (var j = 0; j < td.tests.length; j++) {
//       var value = td.tests[j].value;
//       var expected = td.tests[j].expected;

//       var actual = validator.runTest(vtype, value);
//       t.comment(`vtype: ${vtype} value: ${value}`);
//       t.equal(actual, expected, `${value}`);
//     }
//   }
//   t.end();
// });

//For testing a mergeObjects function

// let defaults = {
//   form: 'default-form',
//   inputSelector: 'data-my-vtypes',
//   valid: true,
//   errorString: '',
//   errorTarget: '#errors',
//   validationTypes: [
//     {
//       name: 'required',
//       weight: 0,
//       test: function(value){
//         if(!value || !value.length){
//           return false;
//         }
//         return value.length > 0;
//       },
//       error: 'This field is required.'
//     }
//   ]
// };

// let override = {
//   inputSelector: 'data-vtypes',
//   errorTarget: 'inline',
//   validationTypes: [
//     {
//       name: 'required',
//       weight: 10,
//       error: 'Please fill out all fields.'
//     },
//     {
//       name: 'price',
//       weight: 20,
//       test: function(value){
//         return /(\d)+\.(\d){0,2}$/.test(value);
//       },
//       error: 'Incorrect price format.'
//     }
//   ]
// };

// let expected = {
//   form: 'default-form',
//   inputSelector: 'data-vtypes',
//   valid: true,
//   errorString: '',
//   errorTarget: 'inline',
//   validationTypes: [
//     {
//       name: 'required',
//       weight: 10,
//       test: function(value){
//         if(!value || !value.length){
//           return false;
//         }
//         return value.length > 0;
//       },
//       error: 'Please fill out all fields.'
//     },
//     {
//       name: 'price',
//       weight: 20,
//       test: function(value){
//         return /(\d)+\.(\d){0,2}$/.test(value);
//       },
//       error: 'Incorrect price format.'
//     }
//   ]
// }

// //Merge properties of b and a.
// //If a matching key is found between the two, the value of b should override the value of a.
// //Returns the modified 'a' object
// function mergeObjects(a, b){
//   if(typeof(a) == 'object' && typeof(b) == 'object'){
//     //Check almost all of the keys except validationTypes.
//     //These have a more complex structure and are handled in a separate loop below
//     for(let key in b){
//       if(key != 'validationTypes' && a.hasOwnProperty(key) && b[key] != undefined){
//         a[key] = b[key];
//       }
//     }
//   }

//   return a;
// }

// function mergeValidationTypes(a, b){
//   if(!a.hasOwnProperty('validationTypes') || !b.hasOwnProperty('validationTypes')){
//     return a;
//   }

//   let av = a.validationTypes;
//   let bv = b.validationTypes;
//   if(bv.hasOwnProperty('length') && bv.length > 0){

//     bv.forEach((bel) => {
//       let found = false;
//       if(bel.hasOwnProperty('name')){

//         av.forEach((ael, i) => {
//           if(ael.name == bel.name){
//             found = true;
//             av[i] = mergeObjects(ael, bel);
//           }
//         });

//         if(!found){
//           av.push(bel);
//         }
//       }
//     });
//     a.validationTypes = av;
//   }

//   return a;
// }

// function mergeOptions(a, b){
//   a = mergeObjects(a, b);
//   a = mergeValidationTypes(a, b);

//   return a;
// }

// if(this.hasOwnProperty(key)){
//   if(typeof(this[key]) == 'object' && typeof(opts[key]) == 'object'){
//     for (var i = 0; i < opts[key].length; i++) {
//       let obj = opts[key][i];
//       for(let key in obj){
//         console.log("key", key);

//       }
//       console.log(opts[key][i]);
//       this[key].push(opts[key][i]); //pushing should only happen if keys don't match
//     }
//   } else if(this[key] != undefined && opts[key] != undefined) {
//     this[key] = opts[key];
//   }
// }

test('mergeObjects function', (t) => {
  // let actual = mergeObjects(defaults, override);
  let actual = mergeOptions(defaults, override);
  t.deepEqual(actual, expected, 'should merge two objects together. Second object should override any properties in the first object.');
  t.end();
});