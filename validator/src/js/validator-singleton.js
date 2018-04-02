/*
*  Frontend validator singleton
*  Author: Sam Miller
*  Version 0.0.8
*/

var Validator = {
  construct: function(opts){

    //Defaults
    this.form = 'default-form';
    this.inputSelector = '[data-vtypes]';
    this.valid = true;
    this.errorString = '';
    this.errorTarget = document.querySelector('#errors');
    this.validationTypes = [
      {
        name: 'required',
        weight: 0,
        test: function(){
          if(!this.value || !this.value.length){
            return false;
          }
          return this.value.length > 0;
        },
        error: 'This field is required.'
      },
      {
        name: 'radio',
        weight: 0,
        test: function(){
          var options = document.querySelectorAll('[name="'+ this.getAttribute('name') +'"]');
          var value;
          for(var i = 0; i < options.length; i++){
            if(options[i].checked){
              value = options[i].value;
            }
          }
          return value ? true : false;
        },
        error: 'Please select an option.'
      },
      {
        name: 'email',
        weight: 10,
        test: function(){
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.value);
        },
        error: 'Incorrect email format. (user@domain.com)'
      },
      {
        name: 'phone',
        weight: 10,
        test: function(){
          return /^(\d{10})$/.test(this.value);
        },
        error: 'Incorrect phone format. (555-555-5555)'
      },
      {
        name: 'date',
        weight: 10,
        test: function(){
          return /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(([\d]{4})|([\d]{2}))$/.test(this.value);
        },
        error: 'Incorrect date format. (DD-MM-YYY)'
      },
      {
        name: 'number',
        weight: 10,
        test: function(){
          if(!this.value || this.value.length <= 0){
            return false;
          }
          return /^[0-9]*$/g.test(this.value);
        },
        error: 'This field only accepts numbers.'
      },
      {
        name: 'letters',
        weight: 10,
        test: function(){
          if(!this.value || this.value.length <= 0){
            return false;
          }
          return /^[a-zA-Z]+$/.test(this.value);
        },
        error: 'This field only accepts letters.'
      }
    ];

    this.init(this, opts);
  },

  /*
  * init will take an opts object and overwrite any defaults that it matches
  * - form: selector for the form
  * - inputSelector: what to search the form for
  * - errorTarget: should either be 'inline' for inline errors or a selector pointing to a specified element made for holding errors.
  * - validationTypes: add these to the default array unless a matching name is found
  * - validationTypes (matching name): overwrite any matching properties. maybe the user just wants to change the error message and leave the rest.
  */

  init: function(defaults, opts){
    if(!opts || typeof(opts) == 'undefined'){
      return;
    }    

    this.mergeObjects(defaults, opts);
    this.mergeValidationTypes(defaults, opts);
  },

  //Merge properties of b and a.
  //If a matching key is found between the two, the value of b should override the value of a.
  //Returns the modified 'a' object
  mergeObjects: function(a, b){
    if(typeof(a) == 'object' && typeof(b) == 'object'){
      for(var key in b){
        //Leaving arrays alone (validationTypes)
        //These have a more complex structure and are handled in a separate function below
        if(!Array.isArray(b[key]) && a.hasOwnProperty(key) && b[key] != undefined){
          a[key] = b[key];
        }
      }
    }

    return a;
  },

  mergeValidationTypes: function(a, b){
    if(!a.hasOwnProperty('validationTypes') || !b.hasOwnProperty('validationTypes')){
      return a;
    }

    var av = a.validationTypes;
    var bv = b.validationTypes;
    if(bv.hasOwnProperty('length') && bv.length > 0){

      for(var i = 0; i < bv.length; i++){
        var bel = bv[i];
        var found = false;
        if(bel.hasOwnProperty('name')){

          for(var j = 0; j < av.length; j++){
            var ael = av[j];
            if(ael.name == bel.name){
              found = true;
              av[j] = this.mergeObjects(ael, bel);
            }
          }

          if(!found){
            av.push(bel);
          }
        }
      }
      a.validationTypes = av;
    }

    return a;
  },

  validate: function(form){
    if(!form){
      if(!this.form){
        return false;
      } else {
        form = this.form;
      }
    }

    console.log("form", form);
    
    var fields = [];
    var failedFields = [];

    fields = this.findFields(form);

    console.log("fields", fields);    
    
    this.unmarkFields(fields);
    failedFields = this.runTests(fields);    

    if(failedFields.length > 0){
      this.handleFails(failedFields);
    }

    return this.valid;
  },

  validateField: function(fieldId){
    var fields = document.querySelectorAll(fieldId);
    var failedFields = [];

    this.unmarkFields(fields);
    failedFields = this.runTests(fields);   

    if(failedFields.length > 0){
      this.handleFails(failedFields);
    }

    return this.valid;
  },

  //finding fields should use the inputSelector moving forward
  findFields: function(form){
    var fields = [];
    var result = form.querySelectorAll(this.inputSelector);
    for (var j = 0; j < result.length; j++) {
      fields.push(result[j]);
    }
    return fields;
  },

  unmarkFields: function(fields){
    this.removeErrorDivs();
    for (var i = 0; i < fields.length; i++) {
      fields[i].classList.remove('error');
    }
  },

  markFailedFields: function(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.classList.add('error');
    }
  },

  handleFails: function(failedFields){
    this.markFailedFields(failedFields);

    //If appending to one location
    // errorString = buildErrorString(failedFields);
    // writeErrorsToTarget(errorString);

    //If appending to fields
    this.appendErrorsToFields(failedFields);
  },

  removeErrorDivs: function(){
    var errorDivs = document.querySelectorAll('.error-message');
    for(var i = 0; i < errorDivs.length; i++){
      errorDivs[i].parentNode.removeChild(errorDivs[i]);
    }
  },

  runTests: function(fields){
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
        if(required != null && this.arrayContainsString(vtypes, 'required') === false){
          vtypes.push('required');
        }

        var sortedVtypes = this.sortVtypesByWeight(vtypes);   

        for (var j = 0; j < sortedVtypes.length; j++) {
          var vt = this.findVtype(sortedVtypes[j]);
          var test = vt.test.call(f);

          console.log("test.name", vt.name, test);
          

          if(test == false){
            this.valid = false;
            if(this.arrayContainsNode(failedFields, f) === false){
              failedFields.push({ el: f, vtype: vt, error: vt.error });
              break;
            }
          }
        }
      }
    }
    return failedFields;
  },

  runTest: function(vtype, value){
    return this.findVtype(vtype).test(value);
  },

  //This will take the vtypes provided by the dev in html and sort them according to the weights found in the validationTypes object
  //Returns the sorted array
  sortVtypesByWeight: function(vtypes){
    if(vtypes.length <= 1){
      return vtypes;
    }

    var vt = this.validationTypes;
    var toSort = vtypes;

    function sort(arr, i){
      i == undefined ? i = 0 : i;
      if(i == arr.length){
        return arr;
      }

      for (var j = i; j < arr.length - 1; j++) {
        var keyA = arr[j];
        var keyB = arr[j + 1];
        var a = this.findVtype(keyA);
        var b = this.findVtype(keyB);
        if(a.weight > b.weight){
          var swap;
          swap = arr[j + 1];
          arr[j + 1] = arr[j];
          arr[j] = swap;
        }
      }
      return sort.call(this, arr, i + 1);
    }
    return sort.call(this, toSort);
  },

  findVtype: function(vtype){
    for (var i = 0; i < this.validationTypes.length; i++) {
      if(vtype == this.validationTypes[i].name){
        return this.validationTypes[i];
      }
    }
    return false;
  },

  //returns array location if true
  arrayContainsNode: function(arr, node){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].hasOwnProperty('el') && arr[i].el.isSameNode(node)){
        return i;
      }
    }
    return false;
  },

  //returns array location if true
  arrayContainsString: function(arr, string){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] == string){
        return i;
      }
    }
    return false;
  },

  //Intended for use when appending all errors to the same location, like the bottom of a form
  buildErrorString: function(failedFields){
    var es = '<ul class="form-errors">';
    for (var i = 0; i < failedFields.length; i++) {
      es += '<li>' + failedFields[i].error + '</li>';
    }
    es += '</ul>';
    return es;
  },

  writeErrorsToTarget: function(errorString){
    errorTarget.innerHTML = errorString;
  },

  //Intended for use when appending errors directly to their respective fields
  appendErrorsToFields: function(failedFields){    
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.insertAdjacentHTML('afterend', '<div class="error-message"><p>'+ failedFields[i].error +'</p></div>');
    }
  },

  getErrorString: function(){
    return this.errorString;
  },

  isValid: function(){
    return this.valid;
  }
};
