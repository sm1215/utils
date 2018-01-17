//Options should be an array of objects
//Each object should / can contain:
//type: of event
//name: of new custom event you want to listen on
//dispatcher (optional): object to dispatch the event from, if nothing is provided, event is dispatched from window
var Throttler = function(options){
  if(!options){
    throw new Error('Not throttling anything. Pass some options when instantiating.');
  }

  if(!options.length){
    options = [options];
  }

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    if(opt.type && opt.name){
      if(opt.type === opt.name){
        throw new Error('Event type and listener name cannot be the same.');
      }
      if(!this[opt.type]){
        throttle(opt.type, opt.name, opt.dispatcher);
        this[opt.type] = true;
      }
    } else {
      throw new Error('Incorrect parameters provided. Need an event type and the listener name you want to listen on.')
    }
  }

  function throttle(type, name, dispatcher){
    dispatcher = dispatcher || window;
    var running = false;
    var func = function(){
      if(running){
        return;
      }
      running = true;
      window.requestAnimationFrame(function(){
        dispatcher.dispatchEvent(new CustomEvent(name));
        running = false;
      });
      dispatcher.addEventListener(type, func);
    }
    func();
  }
};