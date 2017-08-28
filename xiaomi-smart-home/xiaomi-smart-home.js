module.exports = function(RED) {
	const Socket = require('./Socket');

	function smartHomeNode(n) {
		RED.nodes.createNode(this, n);
		let node = this;

		let socket = new Socket(node, RED, {
			gateway:   n.gateway,
			switch:    n.switch,
			cube:      n.cube,
			sensor_ht: n.sensor_ht,
			motion:    n.motion,
			magnet:    n.magnet,
			'86sw1':   n.Wrieless_switch,
			'86sw2':   n.Wrieless_switch_two,
			otherDevice: n.otherDevice,
		}, n.password);

		node.on("input", (msg) => {
			let msgJson = JSON.stringify(msg.payload);
			socket.sendCommand(msgJson);
		});

		node.on("close", () =>{
			socket.closeSocket();
		});
	}

	RED.nodes.registerType("xiaomi-smart-home", smartHomeNode);
}
