const dgram = require('dgram');
const crypto = require('crypto');

class Socket {
	constructor(node, RED, devices, password) {
		this.devices = devices;
		this.RED = RED;
		this.node = node;
		this.node.status({fill: 'red', shape: 'dot', text: 'Not ready for send command'}); // FIX: перенести в главный файл
		this.server = dgram.createSocket('udp4');
		this.binding();
		// Данные для отправки данных =>
		this.IV = new Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]); // Убрать from
		if(password != undefined && password != '')
			this.password = password; // Пароль(взять из телефонного приложения)
		else
			return false;
		this.RED.log.info(`password: ${typeof password}`);
		this.RED.log.info(`password: ${typeof this.password}`);
		this.token = ''; // Одноразовый токен
		this.key = ''; // Сам ключ для отправки команд
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
		this.checkEncryptDataMessage(data);
		if(data.cmd != 'write')
			if(this.checkVaildDevice(data.model))
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
					return {no_motion: data[key]};
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

	//TODO: Только на вывод информации!
	checkVaildDevice(model) {
		if(model != undefined && model != null && model != '') {
			for(let key in this.devices) {
				if(key == model.toString())
					if(this.devices[key] == true)
						return true;
						else
						return false;
						//return `device ${model.toString()} not found`;
			}
		} else {
			return false;
		}
	}

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
		this.encrypt();
	}

	encrypt() {
		let cipher = crypto.createCipheriv('aes-128-cbc', this.password, this.IV);
		this.key = cipher.update(this.token, "ascii", "hex");
		this.node.status({fill: 'green', shape: 'ring', text: 'Ready for send command'});
	}

	sendCommand(dates) {
		if(this.key == undefined || this.key == null || this.key == '') {
			this.node.send('Error: this module not ready for send command, please wait');
			return false;
		}
		let data = dates.payload;
		let command = `{"cmd": "write", "model": "${data.model}", "sid": "${data.sid}", "short_id": ${data.model == 'gateway' ? 4343:4343}, "data": { \"${data.command}\": ${data.value}, \"key\": \"${this.key}\" }}`;
		this.RED.log.warn(command);
		this.server.send(command, 0, command.length, 9898, '224.0.0.50', err => {if(err) throw err;});
	}
}

module.exports = Socket;
