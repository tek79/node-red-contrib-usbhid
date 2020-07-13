module.exports = function(RED) {

  var HID = require('node-hid');

  function HIDConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.path = n.path;
  }

  function usbHIDNode(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.server = RED.nodes.getNode(config.connection);
    var device
    try {
      device = new HID.HID(this.server.path);

      node.status({
        fill: "green",
        shape: "dot",
        text: "connected"
      });

    device.on("data", function(data) {
      var message = {
        payload: ""
      };
      message.payload = data;
      node.send([message, null]);
    });


    device.on("error", function(err) {
      var message = {
        payload: ""
      };
      message.payload = err;
      node.send([null, message]);
    });

    } catch (err) {
      node.status({
        fill: "red",
        shape: "ring",
        text: "disconnected"
      });
    }


    node.on('input', function(msg) {

      if(!device) return

      var data = toArray(msg.payload);

      device.write(data);

    });


    node.on('close', function() {
      if(!device) return 
      device.close();
    });


  }


  function toArray(buffer) {
    var view = [];
    for (var i = 0; i < buffer.length; ++i) {
      view.push(buffer[i]);
    }
    return view;
  }


  function getHIDNode(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    node.on('input', function(msg) {

      var devices = HID.devices();
      msg.payload = devices;
      node.send(msg);

    });
  }

  RED.nodes.registerType("getHIDdevices", getHIDNode);
  RED.nodes.registerType("HIDdevice", usbHIDNode);
  RED.nodes.registerType('HIDConfig', HIDConfigNode);
}
