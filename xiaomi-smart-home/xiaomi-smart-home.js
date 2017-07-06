module.exports = function(RED) {
	const Socket = require('./Socket');

	function smartHomeNode(n) {
		RED.nodes.createNode(this, n);
		let node = this;
		RED.log.info(`n.password ${n.password}`);

		let socket = new Socket(node, RED, {
			gateway:   n.gateway,
			switch:    n.switch,
			cube:      n.cube,
			sensor_ht: n.sensor_ht,
			motion:    n.motion,
			magnet:    n.magnet
		}, n.password);

		node.on("input", (msg) => {
			socket.sendCommand(msg);
		});

		node.on("close", () =>{
			socket.closeSocket();
		});
	}

	RED.nodes.registerType("xiaomi-smart-home", smartHomeNode);
}
