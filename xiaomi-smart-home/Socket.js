const dgram = require('dgram');
const crypto = require('crypto');

class Socket {
	constructor() {
		this.server = dgram.createSocket('udp4');
		this.binding();
    this.node = [];
    this.isListenCommand = false;

  	// Данные для отправки кодманд на шлюз =>
		this.IV = new Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);
		this.key = null; // Сам ключ для отправки команд
    this.password = null;
    this.data = null;
		this.sid = null;
	}

	binding() {
		this.server.on('error', this.error.bind(this));
		this.server.on('message', this.message.bind(this));
		this.server.on('listening', this.listening.bind(this));
		this.server.bind(9898);
	}

	error(err) {
		this.server.close();
	}

	message(msg) {
    let data = JSON.parse(msg);
    this.checkEncryptDataMessage(data);
    for(var index in this.getListNode()) {
      if(data.cmd != 'write' && data.cmd != 'get_id_list')
        this.node[index][0].send({topic: data.sid, payload: this.checkMessage(JSON.parse(data.data)), model: data.model});
    }
	}

	listening() {
		this.server.setBroadcast(true);
		this.server.setMulticastTTL(128);
		this.server.addMembership('224.0.0.50');
	}

	closeSocket() {
		this.server.close();
	}

  addNode(node, devices) {
    this.node.push([node, devices]);
  }

  getListNode() {
    return this.node;
  }

  // Методы для отправки/принятия данных =>

	sendMessageForUpdateToken() {
    this.isListenCommand = true;
		const command = Buffer(`{"cmd": "get_id_list"}`);
		this.server.send(command, 0, command.length, 9898, '224.0.0.50', err => {if(err) throw err;});
	}

	//TODO: Проверка изменение статуса можно ли начать посылать команды.
	checkEncryptDataMessage(msg) {
    if(!this.isListenCommand) return;

    if(msg.cmd == 'get_id_list_ack' && msg.sid == this.sid) {
			this.encrypt(msg.token);
		} else if(msg.cmd == 'heartbeat' && msg.model == 'gateway' && msg.sid == this.sid) {
			this.encrypt(msg.token);
		}
	}

	encrypt(token) {
		try {
      		this.isListenCommand = false;
			let cipher = crypto.createCipheriv('aes-128-cbc', this.password, this.IV);
			this.key = cipher.update(token, "ascii", "hex");
			cipher.final('hex');
      		this.sendCommand();
		} catch(e) {
      console.log(e);
		}
	}

  callSendCommand(password, data, sid) {
    this.password = password;
    this.data = data;
		this.sid = sid;
    this.sendMessageForUpdateToken();
  }

  sendCommand() {
    let data = JSON.parse(this.data);
    let command = null;
    if(typeof data.value == "string")
      command = `{"cmd": "write", "model": "${data.model}", "sid": "${data.sid}", "short_id": ${data.model == 'gateway' ? 4343:4343}, "data": { \"${data.command}\": \"${data.value}\", \"key\": \"${this.key}\" }}`;
    else
      command = `{"cmd": "write", "model": "${data.model}", "sid": "${data.sid}", "short_id": ${data.model == 'gateway' ? 4343:4343}, "data": { \"${data.command}\": ${data.value}, \"key\": \"${this.key}\" }}`;

    this.server.send(command, 0, command.length, 9898, '224.0.0.50', err => {if(err) throw err;});

    this.key = null;
    this.password = null;
    this.data = null;
		this.sid = null;
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
}
module.exports = Socket;
