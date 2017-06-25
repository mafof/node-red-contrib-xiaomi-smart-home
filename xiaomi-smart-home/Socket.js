const dgram = require('dgram');
const EventEmitter = require('events');

class Socket {
	constructor(node, RED, devices) {
		this.devices = devices;
		this.RED = RED;
		this.node = node;
		this.server = dgram.createSocket('udp4');
		this.binding();
	}

	binding() {
		this.server.on('error', this.error.bind(this));
		this.server.on('message', this.message.bind(this));
		this.server.on('listening', this.listening.bind(this));
		this.server.bind(9898);
	}

	error(err) {
		this.RED.log.error(err.stack);
		this.server.close();
	}

	message(msg) {
		let data = JSON.parse(msg);
		if(this.checkVaildDevice(data.model, this.devices))
			this.node.send({ topic: data.sid, payload: this.checkMessage(JSON.parse(data.data)), model: data.model });
	}

	listening() {
		this.server.setBroadcast(true);
		this.server.setMulticastTTL(128);
		this.server.addMembership('224.0.0.50');
		let address = this.server.address();
		this.RED.log.info(`server listening ${address.address}:${address.port}`);
	}

	closeSocket() {
		this.server.close();
	}

	checkMessage(data) {
		for(let key in data) {
			switch(key) {
				case 'status':
					return data[key].toString();
				break;
				case 'no_motion':
					return {no_motion: data[key].toString()};
				break;
				case 'voltage':
					return {voltage: +data[key]};
				break;
				case 'temperature':
					return {temperature: +data[key]};
				break;
				case 'humidity':
					return {humidity: +data[key]};
				break;
				case 'rotate':
					return {rotate: data[key]};
				break;
				case 'ip':
					return {ip: data[key].toString()};
				break;
				default:
					return data[key].toString();
				break;
			}
		}
	}

	checkVaildDevice(model) {
		for(let key in this.devices) {
			if(key == model.toString())
				if(this.devices[key] == true)
					return true;
		}
	}
}

module.exports = Socket;