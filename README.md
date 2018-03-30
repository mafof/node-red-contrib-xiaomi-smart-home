# Smart home
This is node for node-red which can receive message and send command from device Xiaomi smart home.<br>
<b>support all devices*</b> <br>
support for all devices is experimental technology, and may experience crashes with the module.

100% Support next devices:
- Gateway
- Wireless switch
- Door and window sensor
- Temperature and humidity sensor
- Cube controller
- Occupancy sensor
- Wireless switch(One Button)
- Wireless switch(Two Buttons)

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

All properties payload:
- voltage
- temperature
- humidity
- no_motion
- rotate
- ip
- channel_0
- channel_1

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
