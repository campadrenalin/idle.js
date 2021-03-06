define(function() {
    var defaultTimeout = 2 * 60;
    var defaultHooks = ['mousemove', 'scroll', 'keydown'];

    // Used to reduce browser API overhead, particularly for mousemove
    function Throttle(timeout, callback) {
        this.timeout   = timeout;
        this.callback  = callback;
        this.waiting   = 0;
        this.saturated = 0;

        var self = this;
        this.comeback = function() {
            self.waiting   = 0;
            if (self.saturated > 0) self.activate();
            self.saturated = 0;
        }
        this.activate = function() {
            if (self.waiting > 0) {
                self.saturated = 1;
                return;
            }
            self.waiting = setTimeout(self.comeback, self.timeout);
            self.callback();
        }
    }

    function Idler(timeout, hooks) {
        var self = this;

        // More complex structures
        self.listeners = { 'wake': [], 'sleep': [] };
        self.throttle = new Throttle(1000, function(){ self.reset() });

        // Bound callbacks
        self._wake  = function() { self._broadcast('wake'); };
        self._sleep = function() { self._broadcast('sleep'); };
        self._reset = function() { self.reset(); return true; };

        // Final initialization
        self.setTimeout(timeout || defaultTimeout)
        self.setHooks(hooks || defaultHooks)
    }
    var proto = Idler.prototype;

    proto.setTimeout = function(timeout) {
        this._timeout = timeout * 1000;
        this.reset();

        return this;
    }
    proto.reset = function() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = setTimeout(this._sleep, this._timeout);
        if (this.state != 'awake') {
            this._broadcast('wake');
        }

        return this;
    }
    proto._broadcast = function(msg) {
        this.state = 'a' + msg;
        var listeners = this.listeners[msg];
        for (var i = 0; i < listeners.length; i++) {
            listeners[i]();
        }
    }
    proto.on = function(msg, callback) {
        var listeners = this.listeners[msg];
        listeners.push(callback);

        return this;
    }
    proto.off = function(msg, callback) {
        var listeners = this.listeners[msg];
        for (var i = listeners.length; i >= 0; i--) {
            if (listeners[i] == callback) {
                listeners.splice(i, 1);
            }
        }

        return this;
    }
    proto.setHooks = function(hooks) {
        var self = this;
        // Remove old hooks
        if (self._hooks != undefined) {
            for (var i = 0; i < self._hooks.length; i++) {
                window.removeEventListener(self._hooks[i], self._reset);
            }
        }

        // Set up new hooks
        for (var i = 0; i < hooks.length; i++) {
            window.addEventListener(hooks[i], self._reset);
        }

        // Store data for potential undo later
        self._hooks = hooks;

        return self;
    }

    var globalIdler = new Idler();
    globalIdler.Idler = Idler;
    return globalIdler;
});
