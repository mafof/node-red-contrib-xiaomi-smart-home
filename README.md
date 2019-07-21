# Smart Home
*Описание на других языках [Russian](README.md), [English](README.en-US.md)*

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
Для отправки данных на шлюз(gateway) нужно создать элемент ввода(input) и прописать в нем следующие данные(формата json):
```json
{
  "model": "gateway", // Модель устройства к которой надо обратиться
  "sid": "sid(id) устройства", // Sid устройства
  "command": "command", // Команда для отправки на устройство
  "value": "value" // Значение для команды
}
```
Так же можно отправлять несколько команд одновременно, достаточно отправить json строку в таком формате:
```json
{
  "model": "gateway", // Модель устройства к которой надо обратиться 
  "sid": "sid(id) устройства", // Sid устройства 
  "command": ["command1", "command2", "commandN..."], // Команды
  "value": ["value1", "value2", "valueN"] // Значения для команд
}
```
****
### Принятие данных из шлюза
Для принятие данных можно воспользоваться элементом вывода(debug),формат данных имеет немного иную структуру от формата отправки данных, а именно:
- msg.model =  Здесь обозначаеться модель устройства
- msg.topic = Здесь отображается sid(id) устройства
- msg.payload = Здесь отображаються данные пришедшие с вывода
****
[Пример Flow](https://flows.nodered.org/flow/a35d538fcb9be04fcc2f2fcfc88ed9b3)