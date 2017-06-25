# Smart home
This is node for node-red which can receive message from device Xiaomi smart home.
Support next devices:
- Gateway
- Switch(button)
- Magnet
- Sensor_ht(temperature and humidity sensor)
- Cube
- motion sensor
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
| msg properties | Description |
|----------------|------|
| topic | it sid device |
| payload | here may be more properties but main event |
| model | it name device |

All properties payload:
- voltage
- temperature
- humidity
- no_motion
- rotate
- ip
That would apply to this property, you need write in function:
```javascript
msg.payload.voltage; // or temperature, humidity, no_motion and other...
return msg;
```