define(function() {
    var defaultTimeout = 2 * 60;

    function Idler(timeout) {
        var self = this;

        self.listeners = { 'wake': [], 'sleep': [] };

        self.setTimeout(timeout || defaultTimeout)
        self._wake  = function() { self._broadcast('wake'); };
        self._sleep = function() { self._broadcast('sleep'); };
        self._listen();
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
    proto._listen = function() {
        // Make a bound version
        var self = this;
        function reset() { self.reset(); return true; };

        // Add hooks
        var hooks = ['mousemove', 'scroll', 'keydown'];
        for (var i = 0; i < hooks.length; i++) {
            window.addEventListener(hooks[i], reset);
        }
    }

    var globalIdler = new Idler();
    globalIdler.Idler = Idler;
    return globalIdler;
});
