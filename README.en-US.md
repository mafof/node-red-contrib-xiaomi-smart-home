# Smart home
*Description to others language [Russian](README.md), [English](README.en-US.md)*

This is node for node-red which can receive message and send command from device Xiaomi smart home.

**support all devices** - 
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
input module must be in format JSON, and have next view:
```json
{
  "model": "gateway",
  "sid": "you sid", 
  "command": "you command for example rgb",
  "value": 4286578816
}
```
At the moment I know of 2 commands:

1. rgb - set color for gateway.
2. mid - play music with 0 to 13.

[Example flow](https://flows.nodered.org/flow/a35d538fcb9be04fcc2f2fcfc88ed9b3)