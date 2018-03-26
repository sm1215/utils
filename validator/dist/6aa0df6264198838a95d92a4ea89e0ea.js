// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({3:[function(require,module,exports) {
/*
*  Small frontend validator module.
*  Author: Sam Miller
*  Version 0.0.6
*  [todo]:
*    1) accept user arguments on constructor for customization
*          some initial arguments that should be available:
*            + specify errorTarget
*            + specify where error messages appear (under field or stacked in a single element)
*            + extra validationTypes could be introduced by outside dev
*    2) allow more than one test to fail per field. right now, one is enough, but this could be useful for debugging purposes while developing
*/

//[Note]: It might be useful to weight certain validationTypes higher than others.
//The 'required' vtype test should be performed before any format-specific tests.
//i.e. it doesn't make sense to tell a user their email format is incorrect if the field is blank

class Validator {
  constructor(opts){

    //Defaults
    this.form = 'default-form';
    this.inputSelector = 'data-my-vtypes';
    this.valid = true;
    this.errorString = '';
    this.errorTarget = document.querySelector('#errors');
    this.validationTypes = [
      {
        name: 'required',
        weight: 0,
        test: function(value){
          if(!value || !value.length){
            return false;
          }
          return value.length > 0;
        },
        error: 'This field is required.'
      },
      {
        name: 'email',
        weight: 10,
        test: function(value){
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        error: 'Incorrect email format.'
      },
      {
        name: 'phone',
        weight: 10,
        test: function(value){
          return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value);
        },
        error: 'Incorrect phone format.'
      },
      {
        name: 'date',
        weight: 10,
        test: function(value){
          return /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(([\d]{4})|([\d]{2}))$/.test(value);
        },
        error: 'Incorrect date format.'
      },
      {
        name: 'number',
        weight: 10,
        test: function(value){
          if(!value || value.length <= 0){
            return false;
          }
          return /^\d+$/.test(value);
        },
        error: 'This field only accepts numbers.'
      },
      {
        name: 'letters',
        weight: 10,
        test: function(value){
          if(!value || value.length <= 0){
            return false;
          }
          return /^[a-zA-Z]+$/.test(value);
        },
        error: 'This field only accepts letters.'
      }
    ];

    this.init(this, opts);
  }

  /*
  * init will take an opts object and overwrite any defaults that it matches
  * - form: selector for the form
  * - inputSelector: what to search the form for
  * - errorTarget: should either be 'inline' for inline errors or a selector pointing to a specified element made for holding errors.
  * - validationTypes: add these to the default array unless a matching name is found
  * - validationTypes (matching name): overwrite any matching properties. maybe the user just wants to change the error message and leave the rest.
  */

  init(defaults, opts){
    if(!opts || typeof(opts) == 'undefined'){
      return;
    }

    this.mergeOptions(defaults, opts);
  }

  mergeOptions(a, b){
    a = this.mergeObjects(a, b);
    a = this.mergeValidationTypes(a, b);

    return a;
  }

  //Merge properties of b and a.
  //If a matching key is found between the two, the value of b should override the value of a.
  //Returns the modified 'a' object
  mergeObjects(a, b){
    if(typeof(a) == 'object' && typeof(b) == 'object'){
      for(let key in b){
        //Leaving arrays alone (validationTypes)
        //These have a more complex structure and are handled in a separate function below
        if(!Array.isArray(b[key]) && a.hasOwnProperty(key) && b[key] != undefined){
          a[key] = b[key];
        }
      }
    }

    return a;
  }

  mergeValidationTypes(a, b){
    if(!a.hasOwnProperty('validationTypes') || !b.hasOwnProperty('validationTypes')){
      return a;
    }

    let av = a.validationTypes;
    let bv = b.validationTypes;
    if(bv.hasOwnProperty('length') && bv.length > 0){

      bv.forEach((bel) => {
        let found = false;
        if(bel.hasOwnProperty('name')){

          av.forEach((ael, i) => {
            if(ael.name == bel.name){
              found = true;
              av[i] = this.mergeObjects(ael, bel);
            }
          });

          if(!found){
            av.push(bel);
          }
        }
      });
      a.validationTypes = av;
    }

    return a;
  }

  validate(form){
    var fields = [];
    var failedFields = [];

    fields = findFields(form);
     unmarkFields(fields);
    failedFields = runTests(fields);

    if(failedFields.length > 0){
      handleFails(failedFields);
    }

    return valid;
  }

  //finding fields should use the inputSelector moving forward
  findFields(form){
    var fields = [];
    for (var i = 0; i < formElements.length; i++) {
      var result = form.querySelectorAll(formElements[i]);
      for (var j = 0; j < result.length; j++) {
        fields.push(result[j]);
      }
    }
    return fields;
  }

  unmarkFields(fields){
    for (var i = 0; i < fields.length; i++) {
      fields[i].classList.remove('error');
    }
  }

  markFailedFields(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.classList.add('error');
    }
  }

  handleFails(failedFields){
    markFailedFields(failedFields);

    //If appending to one location
    // errorString = buildErrorString(failedFields);
    // writeErrorsToTarget(errorString);

    //If appending to fields
    appendErrorsToFields(failedFields);
  }

  runTests(fields){
    var failedFields = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var vtypes = [];
      var vtypesString = f.getAttribute('data-vtypes');
      var required = f.getAttribute('required');

      if(vtypesString){
        vtypes = vtypesString.split(' ');
      }

      if(vtypes){
        if(required != null && arrayContainsString(vtypes, 'required') === false){
          vtypes.push('required');
        }

        var sortedVtypes = sortVtypesByWeight(vtypes);

        for (var j = 0; j < sortedVtypes.length; j++) {
          var vt = findVtype(sortedVtypes[j]);
          var test = vt.test(f.value);

          if(test == false){
            valid = false;
            if(arrayContainsNode(failedFields, f) === false){
              failedFields.push({ el: f, vtype: vt, error: vt.error });
              break;
            }
          }
        }
      }
    }
    return failedFields;
  }

  runTest(vtype, value){
    return findVtype(vtype).test(value);
  }

  //This will take the vtypes provided by the dev in html and sort them according to the weights found in the validationTypes object
  //Returns the sorted array
  sortVtypesByWeight(vtypes){
    if(vtypes.length <= 1){
      return vtypes;
    }

    var vt = validationTypes;
    var toSort = vtypes;

    function sort(arr, i){
      i == undefined ? i = 0 : i;
      if(i == arr.length){
        return arr;
      }

      for (var j = i; j < arr.length - 1; j++) {
        var keyA = arr[j];
        var keyB = arr[j + 1];
        var a = findVtype(keyA);
        var b = findVtype(keyB);
        if(a.weight > b.weight){
          var swap;
          swap = arr[j + 1];
          arr[j + 1] = arr[j];
          arr[j] = swap;
        }
      }
      return sort(arr, i + 1);
    }
    return sort(toSort);
  }

  findVtype(vtype){
    for (var i = 0; i < validationTypes.length; i++) {
      if(vtype == validationTypes[i].name){
        return validationTypes[i];
      }
    }
    return false;
  }

  //returns array location if true
  arrayContainsNode(arr, node){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].hasOwnProperty('el') && arr[i].el.isSameNode(node)){
        return i;
      }
    }
    return false;
  }

  //returns array location if true
  arrayContainsString(arr, string){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] == string){
        return i;
      }
    }
    return false;
  }

  //Intended for use when appending all errors to the same location, like the bottom of a form
  buildErrorString(failedFields){
    var es = '<ul class="form-errors">';
    for (var i = 0; i < failedFields.length; i++) {
      es += '<li>' + failedFields[i].error + '</li>';
    }
    es += '</ul>';
    return es;
  }

  writeErrorsToTarget(errorString){
    errorTarget.innerHTML = errorString;
  }

  //Intended for use when appending errors directly to their respective fields
  appendErrorsToFields(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.insertAdjacentHTML('afterend', '<div class="error-message"><p>'+ failedFields[i].error +'</p></div>');
    }
  }

  getErrorString(){
    return errorString;
  }

  isValid(){
    return valid;
  }
};

module.exports = Validator;
},{}],2:[function(require,module,exports) {
document.addEventListener('DOMContentLoaded', function(){
  const Validator = require('./validator.js');
  var validator = new Validator({
    form: 'form',
    inputSelector: 'data-vtypes',
    errorTarget: 'inline',
    validationTypes: [
      {
        name: 'price',
        weight: 20,
        test: function(value){
          return /(\d)+\.(\d){0,2}$/.test(value);
        },
        error: 'Incorrect price format.'
      }
    ]
  });

  document.querySelector('input[type="submit"]').addEventListener('click', function(e){
    e.preventDefault();
    validator.validate(document.querySelector('form'));
  });
  //run on refresh
  // validator.validate(document.querySelector('form'));

  // console.log('errors: ', validator.getErrorString());
});
},{"./validator.js":3}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://' + window.location.hostname + ':55803/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,2])