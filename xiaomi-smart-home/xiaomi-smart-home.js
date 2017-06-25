module.exports = function(RED) {
	let dgram = require('dgram');
	let fs = require('fs');
	var more = false;
	var fileText = '';

	class Socket {
		constructor(node) {
			this.node = node;
			if(!more) {
				this.server = dgram.createSocket('udp4');
				more = true;
			}

			this.server.on('error', this.error.bind(node));
			this.server.on('message', this.message.bind(this));
			this.server.on('listening', this.listening.bind(this));
			this.server.bind(9898);
		}

		message(msg, rinfo, ctx) {
			let data = JSON.parse(msg);
			if(data.model == "switch") {
				this.node.send({topic: data.sid, 
								payload: checkMessage(JSON.parse(data.data)),
								model: "switch"});
			
			} else if(data.model == "motion") {
				this.node.send({topic: data.sid,
								payload: checkMessage(JSON.parse(data.data)),
								model: "motion"});
			
			} else if(data.model == "cube") {
				this.node.send({topic: data.sid,
								payload: checkMessage(JSON.parse(data.data)),
								model: "cube"});
			
			} else if(data.model == "magnet") {
				this.node.send({topic: data.sid,
								payload: checkMessage(JSON.parse(data.data)),
								model: "magnet"});
			
			} else if(data.model == "sensor_ht") {
				this.node.send({topic: data.sid,
								payload: checkMessage(JSON.parse(data.data)),
								model: "sensor_ht"});
			}
			function checkMessage(data) {
				for(let key in data) {
					switch(key) {
						case 'status':
							return data[key].toString();
						break;
						case 'no_motion':
							return {no_motion: data[key].toString()};
						break;
						case 'voltage':
							return {voltage: data[key].toString()};
						break;
						case 'temperature':
							return {temperature: data[key].toString()};
						break;
						case 'humidity':
							return {humidity: data[key].toString()};
						break;
						case 'rotate':
							return {rotate: data[key].toString()};
						break;
					}
				}
			}

			this.writeLog(data);
		}

		error(err) {
			this.send({payload: `server error:\n${err.stack}`});
			this.close();
		}

		listening() {
			this.server.setBroadcast(true);
			this.server.setMulticastTTL(128);
			this.server.addMembership('224.0.0.50'); //this.server.addMembership('224.0.0.50');
			let address = this.server.address();
			this.node.send({ payload: `server listening ${address.address}:${address.port}`});
		}

		closeSocket() {
			this.server.close();
			more = false;
		}

		writeLog(data) {
			fs.readFile('logs.txt', 'utf8', (err, dates) => {
				if(err) throw err;
				let msg = dates + '\n';
				msg += `time(h:m): ${new Date().getHours()}:${new Date().getMinutes()}\ncmd: ${data.cmd}\nmodel: ${data.model}\nsid: ${data.sid}\ntoken: ${data.token}\ndata: ${data.data}`;
				fs.writeFile('logs.txt', msg, 'utf8', err => {if(err) throw err;});
			});	
		}
	};

	function smartHomeNode(n) {
		RED.nodes.createNode(this, n);
		let node = this;
		let socket = new Socket(node);
		RED.log.info(`node.wires: ${node.wires}`);
		RED.log.info(`node.wires[0]: ${node.wires[0]}`);

		node.on("close", () =>{
			socket.closeSocket();
			RED.log.info(`node.wires: ${node.wires}`);
			RED.log.info(`node.wires[0]: ${node.wires[0]}`);
		});
	}

	RED.nodes.registerType("xiaomi-smart-home", smartHomeNode);
}