var net = require('net');
var sys = require('sys');

function MPD(server, port) {
  if (!port) port = '6600';
  if (!server) server = '127.0.0.1';
  
  this.connect(port, server);
}

MPD.prototype = {
  stream: null,
  is_connected: false,
  updateTimer: null,
  
  status: {},
  cs: {},
  
  _callbacks: {},
  
  _callback: function() {
    this._callback = null;
  },
  
  close: function() {
    this.stream.end();
    this.is_connected = false;
  },
  
  connect: function(port, server) {
    if (this.is_connected == true) {
      this.close();
    }
    
    this.stream = net.createConnection(port, server);
    
    this.stream.setEncoding('utf8');
    
    this.stream.on('connect', this.connected());
    this.stream.on('data', this.data());
    this.stream.on('close', this.closed());
    
    this.stream.on('end', function() {
      this.end();
    });
  },
  
  connected: function() {
    var self = this;
    
    return function() {
      self.is_connected = true;
      if (self.debug) console.log('MPD connection opened');
      
      self.updateTimer = setInterval(function() {
        if (self.is_connected == true) {
          self.send('currentsong', function(cs) {          
            for (var v in cs) {
              if (self.cs[v] != cs[v]) {
                self.callback(v, cs[v]);
                self.cs[v] = cs[v];
              }
            }
          });
          
          self.send('status', function(status) {          
            for (var v in status) {
              if (self.status[v] != status[v]) {
                self.callback(v, status[v]);
                self.status[v] = status[v];
              }
            }
          });
        } else {
          clearInterval(self.updateTimer);
        }
      }, 10);
      
      self.callback('connect');
    };
  },
  
  data: function() {
    var self = this;
    
    var packet = [];
    
    return function(data) {
      var data = data.toString();
      var commands = data.split('\n');
      
      for (var i = 0; i < commands.length; i++) {
        if (commands[i].length >= 2) {
          packet.push(commands[i]);
          
          var command = commands[i].split(' ');
          
          switch (command[0]) {
            case 'ACK':
            case 'OK':
              if (command[1] == 'MPD') {
                self.version = command[2];
              } else {
                self._callback.call(self, self._parsePacket(packet));
                packet = [];
                this._callback = null;
              }
            break;
          }
        }
      }
    };
  },
  
  closed: function() {
    var self = this;
    
    return function(had_error) {
      if (self.debug) console.log('MPD connection closed');
      self.callback('close');
    };
  },
  
  _parsePacket: function(packet) {
    var p = {};
    
    for (var i = 0; i < packet.length; i++) {
      var regx = /^(\w+):\s?(.*)$/i;
      var result = regx.exec(packet[i]);
      
      if (result !== null) {
        p[result[1]] = result[2];
      }
    }
    
    return p;
  },
  
  send: function(str, cb) {
    this._callback = cb;
    this.stream.write(str + '\n');
  },
  
  on: function(type, cb) {
    if (!this._callbacks[type]) this._callbacks[type] = [];
    
    this._callbacks[type].push(cb);
  },
  
  callback: function(type, data) {
    if (this._callbacks[type]) {
      for (var c = 0; c < this._callbacks[type].length; c++) {
        this._callbacks[type][c].call(this, data);
      }
    }
  }
};

module.exports = MPD;