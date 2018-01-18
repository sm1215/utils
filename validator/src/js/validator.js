/*
*  Small frontend validator module.
*  Author: Sam Miller
*  Version 0.0.2
*  [todo]:
*    1) accept user arguments on constructor for customization
*          some initial arguments that should be available:
*            + specify errorWriteTarget
*            + specify where error messages appear (under field or stacked in a single element)
*            + extra validationTypes could be introduced by outside dev
*    2) allow more than one test to fail per field. right now, one is enough, but this could be useful for debugging purposes while developing
*/

//[Note]: It might be useful to weight certain validationTypes higher than others.
//The 'required' vtype test should be performed before any format-specific tests.
//i.e. it doesn't make sense to tell a user their email format is incorrect if the field is blank

class Validator {
  constructor(){
    this.form = null;
    this.formElements = ['input', 'textarea', 'select'];
    this.valid = true;
    this.errorString = '';
    this.errorWriteTarget = document.querySelector('#errors');

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
  }

  _init(opts){
    if(!opts.length && opts.length <= 0){
      return;
    }

    for(key in opts){
      if(this.hasOwnProperty(key)){
        this[key] = opts[key];
      }
    }
  }

  _validate(form){
    var fields = [];
    var failedFields = [];

    fields = _findFields(form);
     _unmarkFields(fields);
    failedFields = _runTests(fields);

    if(failedFields.length > 0){
      _handleFails(failedFields);
    }

    return valid;
  }

  _findFields(form){
    var fields = [];
    for (var i = 0; i < formElements.length; i++) {
      var result = form.querySelectorAll(formElements[i]);
      for (var j = 0; j < result.length; j++) {
        fields.push(result[j]);
      }
    }
    return fields;
  }

  _unmarkFields(fields){
    for (var i = 0; i < fields.length; i++) {
      fields[i].classList.remove('error');
    }
  }

  _markFailedFields(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.classList.add('error');
    }
  }

  _handleFails(failedFields){
    _markFailedFields(failedFields);

    //If appending to one location
    // errorString = _buildErrorString(failedFields);
    // _writeErrorsToTarget(errorString);

    //If appending to fields
    _appendErrorsToFields(failedFields);
  }

  _runTests(fields){
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
        if(required != null && _arrayContainsString(vtypes, 'required') === false){
          vtypes.push('required');
        }

        var sortedVtypes = _sortVtypesByWeight(vtypes);

        for (var j = 0; j < sortedVtypes.length; j++) {
          var vt = _findVtype(sortedVtypes[j]);
          var test = vt.test(f.value);

          if(test == false){
            valid = false;
            if(_arrayContainsNode(failedFields, f) === false){
              failedFields.push({ el: f, vtype: vt, error: vt.error });
              break;
            }
          }
        }
      }
    }
    return failedFields;
  }

  _runTest(vtype, value){
    return _findVtype(vtype).test(value);
  }

  //This will take the vtypes provided by the dev in html and sort them according to the weights found in the validationTypes object
  //Returns the sorted array
  _sortVtypesByWeight(vtypes){
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
        var a = _findVtype(keyA);
        var b = _findVtype(keyB);
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

  _findVtype(vtype){
    for (var i = 0; i < validationTypes.length; i++) {
      if(vtype == validationTypes[i].name){
        return validationTypes[i];
      }
    }
    return false;
  }

  //returns array location if true
  _arrayContainsNode(arr, node){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].hasOwnProperty('el') && arr[i].el.isSameNode(node)){
        return i;
      }
    }
    return false;
  }

  //returns array location if true
  _arrayContainsString(arr, string){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] == string){
        return i;
      }
    }
    return false;
  }

  //Intended for use when appending all errors to the same location, like the bottom of a form
  _buildErrorString(failedFields){
    var es = '<ul class="form-errors">';
    for (var i = 0; i < failedFields.length; i++) {
      es += '<li>' + failedFields[i].error + '</li>';
    }
    es += '</ul>';
    return es;
  }

  _writeErrorsToTarget(errorString){
    errorWriteTarget.innerHTML = errorString;
  }

  //Intended for use when appending errors directly to their respective fields
  _appendErrorsToFields(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.insertAdjacentHTML('afterend', '<div class="error-message"><p>'+ failedFields[i].error +'</p></div>');
    }
  }

  _getErrorString(){
    return errorString;
  }

  _isValid(){
    return valid;
  }
};

module.exports = Validator;