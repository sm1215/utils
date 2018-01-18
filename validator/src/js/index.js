document.addEventListener('DOMContentLoaded', function(){
  document.querySelector('input[type="submit"]').addEventListener('click', function(e){
    e.preventDefault();
    // validator.validate(document.querySelector('form'));
  });
  //run on refresh
  // validator.validate(document.querySelector('form'));
  const Validator = require('./validator.js');
  var v = new Validator();
  console.log("v", v);

  // console.log('errors: ', validator.getErrorString());
});