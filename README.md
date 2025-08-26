# SSDSHBRD
## Super Simple DashBoard
A really Super Simple Dashboard; monitor items via MQTT websocket directly from browser

## Features:
- Single static HTML page: use the [GitHub page ](https://no-cqrt.github.io/SSDSHBRD/) or host everywhere you like it.
- No Database required. Parameters are stored in Browser's LocalStorage
- Export / import config via TXT file or copy and paste
- Display values as String or Boolean (red/green)

 > [!NOTE]
 > MQTT call is made via WebSocket, please check that your broker is configured to accept WS or WSS call.
 > For reference or testing, check [Mosquitto page](https://test.mosquitto.org/)


 ### Here the config for test.mosquitto.org; 
 The server listens on the following ports:
 
- 1883 : MQTT, unencrypted, unauthenticated
- 1884 : MQTT, unencrypted, authenticated
- 8883 : MQTT, encrypted, unauthenticated
- 8884 : MQTT, encrypted, client certificate required
- 8885 : MQTT, encrypted, authenticated
- 8886 : MQTT, encrypted, unauthenticated
- 8887 : MQTT, encrypted, server certificate deliberately expired
- 8080 : MQTT over WebSockets, unencrypted, unauthenticated
- 8081 : MQTT over WebSockets, encrypted, unauthenticated
- 8090 : MQTT over WebSockets, unencrypted, authenticated
- 8091 : MQTT over WebSockets, encrypted, authenticated


# Config Structure
The config is a simple JSON with the following structure:
```
[
    {
        "id": 1,
        "topic": "house/livingroom/temperature",
        "text": "Living Room Temp",
        "type": "string"
    },
    {
        "id": 2,
        "topic": "house/kitchen/humidity",
        "text": "Kitchen Humidity",
        "type": "string"
    },
    {
        "id": 3,
        "topic": "house/garage/door_status",
        "text": "Garage Door",
        "type": "boolean"
    },
    {
        "id": 4,
        "topic": "house/security/alarm_status",
        "text": "Alarm Status",
        "type": "boolean"
    }
]

```
You can simply edit, expand, copy and paste or save/export to a file, or import it.


  # Screenshots

  ## The main page  
<img width="1084" height="887" alt="main" src="https://github.com/user-attachments/assets/fd1ec1bd-daf4-400a-b553-6e523070b3ab" />

   ## The config page
<img width="1084" height="1588" alt="config" src="https://github.com/user-attachments/assets/4103c4d7-da0b-4ca9-b560-53f4ec8c9fe2" />

  
