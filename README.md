idle.js
=======

A page idle detector. Aims to be extremely simple and efficient, provide a convenient API, and to support RequireJS specifically.

The use case here is when you have some fancy widget that regularly does compute or network stuff, but should pause or stop forever when we have good reason to think the user isn't paying attention. Live feeds, streaming graphs, all kinds of stuff. It particularly has mobile in mind, where wakelocks can be the devil for battery life, and wasted network access can use up someone's bandwidth for no reason. But it's also a client-side throttle on how much "slow leak" traffic your servers have to handle - never underestimate how much N bytes/M seconds * T hours will add up!

# API

## Idler

The core item here is the Idler class, with the following API:

### var idler = new Idler([timeout_seconds]);

Constructor. You know the drill. Optionally takes a timeout as an argument, which can be adjusted after the fact. Timeouts are in seconds, which can be fractional. Internally, we multiply that up to milliseconds for SetInterval.

Default timeout is 2 minutes (2 * 60).

### idler.setTimeout(timeout_seconds);

Set the timeout. This is in (potentially fractional) seconds. Setting this implies a reset.

Returns Idler object for fluent construction.

### idler.reset();

Start the timer at 0 again.

Returns Idler object for fluent construction.

### idler.on('wake'|'sleep', function(){ ... });

Allows code outside the idler to be notified when the Idler sleeps or wakes. First argument should be 'wake' or 'sleep', second argument should be a callback (we pass no arguments to this, and ignore anything returned by it).

Returns Idler object for fluent construction.

### idler.off('wake'|'sleep', callback);

Unregister a previously registered callback.

Returns Idler object for fluent construction.

### idler.state

Returns 'awake' or 'asleep'.

## Top-level functions

For convenience, we keep a global Idler around as an internal module variable, and expose its methods as top-level functions of the module. So you will typically use idle.js like so:

```javascript
// Uses global instance
define('myWidget', ['idle'], function(idle) {
    var widget = function() {
        // Constructor
        idle.on('wake',  this.wake.bind(wake));
            .on('sleep', this.sleep.bind(sleep));
    }
    // ...
});

// And somewhere in your app you probably do:
require(['idle'], function(idle) { idle.setTimeout(200) });
// ... or similar, for custom global timeout
```

However, if you need separate idle timers, you can instantiate them like so:

```javascript
require(['idle'], function(idle) {
    window.WidgetIdler = new idle.Idler(40);
    window.WidgetIdler.on('wake', function() {
        // ...
    }).on('sleep', function() {
        // ...
    });
});
```

And those will be cleanly separate from the global one.
