document.addEventListener('DOMContentLoaded', function(){
  // ES6 Module version
  // const Validator = require('./validator.js');
  // var validator = new Validator({
  //   form: 'form',
  //   inputSelector: 'data-vtypes',
  //   errorTarget: 'inline',
  //   validationTypes: [
  //     {
  //       name: 'price',
  //       weight: 20,
  //       test: function(value){
  //         return /(\d)+\.(\d){0,2}$/.test(value);
  //       },
  //       error: 'Incorrect price format.'
  //     }
  //   ]
  // });

  document.querySelector('input[type="submit"]').addEventListener('click', function(e){
    e.preventDefault();
    validator.validate();
  });
  //run on refresh
  // validator.validate(document.querySelector('form'));

  // console.log('errors: ', validator.getErrorString());


  // Singleton version
  var validator = Validator;
  validator.construct({
    form: document.querySelector('form')
    // errorTarget: document.querySelector('#errors')
  });
  validator.validate();
});