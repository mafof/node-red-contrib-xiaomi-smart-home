module.exports = function(RED) {
	const Socket = require('./Socket');
	function smartHomeNode(n) {
		RED.nodes.createNode(this, n);
		let node = this;

		function isSocketForSluice() {
			if(global.socketForSluice != null || global.socketForSluice != undefined)
				return true;
			return false;
		}

		if(!isSocketForSluice()) global.socketForSluice = new Socket();

		global.socketForSluice.addNode(node, n);

		node.on("input", (msg) => {
			try {
				let msgJson = JSON.stringify(msg.payload);
				global.socketForSluice.callSendCommand(n.password, msgJson, n.sid);
			} catch(e) {console.log(e);}
		});

		node.on("close", () => {
			if(isSocketForSluice()) {
				console.log("close->isSocketForSluice");
				global.socketForSluice.closeSocket();
				global.socketForSluice = null;
			}
		});
	}

	RED.nodes.registerType("xiaomi-smart-home", smartHomeNode);
}
