/*
*  Small frontend validator module.
*  Author: Sam Miller
*  Version 0.0.1
*  [todo]:
*    1) build other todo comments throughout code
*    2) add constructor or initialization function
*      2b) accept user arguments on constructor for customization
*          some initial arguments that should be available:
*            + specify errorWriteTarget
*            + specify where error messages appear (under field or stacked in a single element)
*            + extra validationTypes could be introduced by outside dev
*    3) allow more than one test to fail per field. right now, one is enough, but this could be useful for debugging purposes while developing
*/

var validator = (function(){
  var formElements = ['input', 'textarea', 'select']; //nodeNames (console lists these in caps)
  var validationTypes = {
    required: {
      test: function(value){
        if(!value || !value.length){
          return false;
        }
        return value.length > 0;
      },
      error: 'This field is required.'
    },
    email: {
      test: function(value){
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
      },
      error: 'Incorrect email format.'
    },
    phone: {
      test: function(value){
        return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value);
      },
      error: 'Incorrect phone format.'
    },
    date: {
      test: function(value){
        return /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(([\d]{4})|([\d]{2}))$/.test(value);
      },
      error: 'Incorrect date format.'
    },
    number: {
      test: function(value){
        if(!value || value.length <= 0){
          return false;
        }
        return /^\d+$/.test(value);
      },
      error: 'This field only accepts numbers.'
    },
    letters: {
      test: function(value){
        if(!value || value.length <= 0){
          return false;
        }
        return /^[a-zA-Z]+$/.test(value);
      },
      error: 'This field only accepts letters.'
    }
  };

  var valid = true;
  var errorString = '';
  var errorWriteTarget = document.querySelector('#errors');

  var _validate = function(form){
    var fields = [], failedFields = [];

    fields = _findFields(form);
     _unmarkFields(fields);
    failedFields = _runTests(fields);

    if(failedFields.length > 0){
      handleFails(failedFields);
    }

    return valid;
  }

  var handleFails = function(failedFields){
    _markFailedFields(failedFields);

    //If appending to one location
    // errorString = _buildErrorString(failedFields);
    // _writeErrorsToTarget(errorString);

    //If appending to fields
    _appendErrorsToFields(failedFields);
  }

  var _runTests = function(fields){
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
        if(required != null && _arrayContainsString(vtypes, 'required') !== false){
          vtypes.push('required');
        }

        //[todo]: it might be useful to weight certain vtypes higher than others.
        //the 'required' test should be performed before any format-specific tests.
        //i.e. it doesn't make sense to tell a user their email format is incorrect if the field is blank
        for (var j = 0; j < vtypes.length; j++) {
          var vt = vtypes[j];
          var test = validationTypes[vt].test(f.value);

          console.log('vt', vt, 'test', test, 'value', f.value);

          if(test == false){
            valid = false;

            if(_arrayContainsNode(failedFields, f) === false){
              failedFields.push({ el: f, vtype: vt, error: validationTypes[vt].error });
              break;
            }
          }
        }
      }
    }
    return failedFields;
  }

  var _unmarkFields = function(fields){
    for (var i = 0; i < fields.length; i++) {
      fields[i].classList.remove('error');
    }
  }

  var _markFailedFields = function(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.classList.add('error');
    }
  }

  //returns array location if true
  var _arrayContainsNode = function(arr, node){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].hasOwnProperty('el') && arr[i].el.isSameNode(node)){
        return i;
      }
    }
    return false;
  }

  //returns array location if true
  var _arrayContainsString = function(arr, string){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] == string){
        return i;
      }
    }
    return false;
  }

  var _findFields = function(form){
    var fields = [];
    for (var i = 0; i < formElements.length; i++) {
      var result = form.querySelectorAll(formElements[i]);
      for (var j = 0; j < result.length; j++) {
        fields.push(result[j]);
      }
    }
    return fields;
  }

  //Intended for use when appending all errors to the same location, like the bottom of a form
  var _buildErrorString = function(failedFields){
    var es = '<ul class="form-errors">';
    for (var i = 0; i < failedFields.length; i++) {
      es += '<li>' + failedFields[i].error + '</li>';
    }
    es += '</ul>';
    return es;
  }

  var _writeErrorsToTarget = function(errorString){
    errorWriteTarget.innerHTML = errorString;
  }

  //Intended for use when appending errors directly to their respective fields
  var _appendErrorsToFields = function(failedFields){
    for (var i = 0; i < failedFields.length; i++) {
      failedFields[i].el.insertAdjacentHTML('afterend', '<div class="error-message"><p>'+ failedFields[i].error +'</p></div>');
    }
  }

  var _getErrorString = function(){
    return errorString;
  }

  var _isValid = function(){
    return valid;
  }

  return {
    validate: _validate,
    getErrorString: _getErrorString,
    isValid: _isValid
  }
})();
