# Русская версия описания плагина
Данный плагин для системы node-red принимает и отправляет данные для шлюза gateway (Xiaomi Smart Home)
****
# Поддерживаемые устройства
На данный момент поддерживаються следующие устройства:
- Gateway
- Wireless switch
- Wireless switch(One Button)
- Wireless switch(Two Buttons)
- Door and window sensor
- Temperature and humidity sensor
- Cube controller
- Occupancy sensor
- Plug
- Embeddable plug
- Gas sensor
****
# Отправка/принятие данных
## Настройка перед отправкой данных
Перед тем как отправить данные необходимо в настройках самого плагина указать 2 пункта, а именно:
1. sid - Id устройства
2. key - Ключ который выдается при включение функции `Wireless communication protocol`
****
### Отправка данных на шлюз(gateway)
Для отправки данных на шлюз(gateway) нужно создать элемент ввода(input) и прописать в нем следующие данные(формата json):<br>
{ <br>
  "model": "gateway" - Модель устройства к которой надо обратиться <br>
  "sid": "sid(id) устройства"  - Sid устройства <br>
  "command": "command" - Команда для отправки на устройство <br>
  "value": "value" - Значение для команды <br>
} <br>
****
### Принятие данных из шлюза
Для принятие данных можно воспользоваться элементом вывода(debug),формат данных имеет немного иную структуру от формата отправки данных, а именно:
- msg.model =  Здесь обозначаеться модель устройства
- msg.topic = Здесь отображается sid(id) устройства
- msg.payload = Здесь отображаються данные пришедшие с вывода
****
# English version
# Smart home
This is node for node-red which can receive message and send command from device Xiaomi smart home.<br>
<b>support all devices*</b> <br>
support for all devices is experimental technology, and may experience crashes with the module.

100% Support next devices:
- Gateway
- Wireless switch
- Wireless switch(One Button)
- Wireless switch(Two Buttons)
- Door and window sensor
- Temperature and humidity sensor
- Cube controller
- Occupancy sensor
- Plug
- Embeddable plug
- Gas sensor

Other device may display not current data!!!

# How install and using
install this node you can via command in directory node-red
```sh
cd ~/.node-red
npm install node-red-contrib-xiaomi-smart-home
```
Use it with block which is located in the section 'input'.
Note: you can put only one instance on a work surface!

# Data analysis
received message has next format:
- msg => topic - sid device
- msg => payload  - here may be more properties but main event
- msg => model - it name device

That would apply to this property, you need write in function:
```javascript
msg.payload.voltage; // or temperature, humidity, no_motion and other...
return msg;
```
# Example input date:
input module must be in format JSON, and have next view: <br>
{"model": "gateway", "sid": "you sid", "command": "you command for example rgb", "value": you value for example 4286578816} <br>
At the moment I know of 2 commands: <br>
1. rgb - set color for gateway.
2. mid - play music with 0 to 13.

<a href="https://flows.nodered.org/flow/a35d538fcb9be04fcc2f2fcfc88ed9b3">Example flow</a>

# Update
- 2.0.0 - fix bugs and added support more gateway
- 2.0.4 - add more devices
