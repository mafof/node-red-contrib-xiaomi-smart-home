const dgram = require('dgram');
const crypto = require('crypto');

class Socket {
	constructor(node, RED, devices, password) {
		this.devices = devices;
		this.RED = RED;
		this.node = node;
		this.node.status({fill: 'red', shape: 'dot', text: 'Not ready for send command'});
		this.server = dgram.createSocket('udp4');
		this.binding();
		// Данные для отправки данных =>
		this.IV = new Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);
		this.token = ''; // Одноразовый токен
		this.key = ''; // Сам ключ для отправки команд
		this.password = password; // Пароль(взять из телефонного приложения)
		this.sendMessageForUpdateToken();
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
		//this.checkValidSendCommand(data);
		this.checkEncryptDataMessage(data);
		if(data.cmd != 'write')
			if(this.checkVaildDevice(data.model, data))
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
					return {no_motion: +data[key]};
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
				case 'channel_0':
					return {channel_0: data[key].toString()};
				break;
				case 'channel_1':
					return {channel_1: data[key].toString()};
				break;
				default:
					return data[key].toString();
				break;
			}
		}
	}

	//TODO: Только на вывод информации!
	checkVaildDevice(model, data) {
		if(model != undefined && model != null && model != '') {
			for(let key in this.devices) {
				if(key == model.toString()) {
					if(this.devices[key] == true) {
						return true;
					} else {
						return false;
					}
				} else if(key == 'otherDevice') {
					if(this.devices[key] == true)
						this.sendMessageOtherDevice(data);
					else
						return false;
				}
			}
		} else {
			return false;
		}
	}

	// TODO: Отправка сообщения если устройство не обнаружено в списках
	sendMessageOtherDevice(data) {
		if(data.sid != undefined && data.data != undefined && data.model != undefined) {
			let complData = JSON.parse(data.data);
			let msg = {topic: data.sid, payload: {}, model: data.model};
			for(let key in complData) {
				msg.payload[`${key}`] = complData[key];
			}
			this.node.send(msg);
		}
	}

	/*
	checkValidSendCommand(msg) {
		if(msg.data != undefined) {
			let cp_data = JSON.parse(msg.data);
			if(cp_data.error != undefined) {
				this.node.send('wrong password');
			}
		}
	}
	*/

	sendMessageForUpdateToken() {
		const command = Buffer(`{"cmd": "get_id_list"}`);
		this.server.send(command, 0, command.length, 9898, '224.0.0.50', err => {if(err) throw err;});
	}

	//TODO: Проверка изменение статуса можно ли начать посылать команды.
	checkEncryptDataMessage(msg) {
		if(msg.cmd == 'get_id_list_ack') {
			this.updateToken(msg.token);
		} else if(msg.cmd == 'heartbeat' && msg.model == 'gateway') {
			this.updateToken(msg.token);
		}
	}

	updateToken(token) {
		this.token = token;
		if(this.password != undefined && this.password != undefined != null && this.password != '')
			this.encrypt();
		else
			this.node.status({fill: 'red', shape: 'dot', text: 'Not found password'});
	}

	encrypt() {
		try {
			let cipher = crypto.createCipheriv('aes-128-cbc', this.password, this.IV);
			this.key = cipher.update(this.token, "ascii", "hex");
			this.node.status({fill: 'green', shape: 'ring', text: 'Ready for send command'});
		} catch(e) {
			this.node.status({fill: 'red', shape: 'dot', text: 'password not current'});
		}
	}

	sendCommand(dates) {
		if(this.key == undefined || this.key == null || this.key == '') {
			this.node.send('Error: this module not ready for send command, please wait');
			this.node.status({fill: 'red', shape: 'dot', text: 'Not ready for send command'});
			return false;
		}
		let data = dates.payload;
		let command = `{"cmd": "write", "model": "${data.model}", "sid": "${data.sid}", "short_id": ${data.model == 'gateway' ? 4343:4343}, "data": { \"${data.command}\": ${data.value}, \"key\": \"${this.key}\" }}`;
		this.server.send(command, 0, command.length, 9898, '224.0.0.50', err => {if(err) throw err;});
	}
}

module.exports = Socket;
