// Dati di configurazione di default
const DEFAULT_CONFIG = {
    title: "My MQTT Dashboard",
    mqtt_server: "ws://your_mqtt_broker_address:port",
    update_interval: 5000,
    topics: [
        { id: 1, topic: "house/livingroom/temperature", text: "Living Room Temp", type: "string" },
        { id: 2, topic: "house/kitchen/humidity", text: "Kitchen Humidity", type: "string" },
        { id: 3, topic: "house/garage/door_status", text: "Garage Door", type: "boolean" },
        { id: 4, topic: "house/security/alarm_status", text: "Alarm Status", type: "boolean" }
    ]
};

// Funzione per salvare la configurazione nel localStorage
function saveConfigToLocalStorage(config) {
    localStorage.setItem('mqttDashboardConfig', JSON.stringify(config));
}

// Funzione per caricare la configurazione dal localStorage
function loadConfigFromLocalStorage() {
    const configString = localStorage.getItem('mqttDashboardConfig');
    if (configString) {
        try {
            return JSON.parse(configString);
        } catch (e) {
            console.error("Error parsing configuration from localStorage. Loading defaults.", e);
        }
    }
    return DEFAULT_CONFIG;
}

// ===============================================
// LOGICA PER dashboard.html
// ===============================================
function initDashboardPage() {
    if (document.getElementById('dashboard-title')) {
        let config = loadConfigFromLocalStorage();
        let client;
        let countdownInterval;
        let countdownValue;

        // Funzione principale di inizializzazione
        function init() {
            document.getElementById('dashboard-title').textContent = config.title;
            createTableRows(config.topics);
            connectToMqtt();
        }

        // Crea le righe della tabella
        function createTableRows(topics) {
            const dashboardBody = document.getElementById('dashboard-body');
            dashboardBody.innerHTML = ''; // Pulisci la tabella
            if (topics && Array.isArray(topics)) {
                topics.forEach(topic => {
                    const row = document.createElement('tr');
                    row.id = `topic-row-${topic.id}`;
                    row.innerHTML = `
                        <td>${topic.id}</td>
                        <td>${topic.text}</td>
                        <td id="topic-value-${topic.id}">...</td>
                    `;
                    dashboardBody.appendChild(row);
                });
            }
        }

        // Connessione MQTT
        function connectToMqtt() {
            if (typeof mqtt === 'undefined' || !config.mqtt_server) {
                console.error('Error: MQTT not configured');
                return;
            }

            client = mqtt.connect(config.mqtt_server);

            client.on('connect', () => {
                console.log('connected to MQTT broker!');
                if (config.topics) {
                    config.topics.forEach(topic => {
                        client.subscribe(topic.topic);
                    });
                }
                startUpdateCycle();
            });

            client.on('message', (topic, message) => {
                const topicConfig = config.topics.find(t => t.topic === topic.toString());
                if (topicConfig) {
                    updateTopicValue(topicConfig, message.toString());
                }
            });

            client.on('error', (err) => {
                console.error('Error connecting MQTT:', err);
                document.getElementById('dashboard-title').textContent = 'Error connecting MQTT.';
                client.end();
            });
        }

        // Aggiorna il valore nella tabella
        function updateTopicValue(topicConfig, value) {
            const valueCell = document.getElementById(`topic-value-${topicConfig.id}`);
            if (!valueCell) return;

            if (topicConfig.type === 'string') {
                valueCell.textContent = value;
            } else if (topicConfig.type === 'boolean') {
                const isTrue = value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'on';
                valueCell.innerHTML = `<span class="boolean-circle ${isTrue ? 'green' : 'red'}"></span>`;
            }
        }

        // Ciclo di aggiornamento con conto alla rovescia
        function startUpdateCycle() {
            if (countdownInterval) clearInterval(countdownInterval);
            const interval = Number(config.update_interval);
            if (isNaN(interval) || interval <= 0) return;

            countdownValue = interval / 1000;
            document.getElementById('countdown').textContent = countdownValue;

            countdownInterval = setInterval(() => {
                countdownValue--;
                if (countdownValue >= 0) {
                    document.getElementById('countdown').textContent = countdownValue;
                }
                if (countdownValue <= 0) {
                    clearInterval(countdownInterval);
                    startUpdateCycle();
                }
            }, 1000);
        }

        init();
    }
}

// ===============================================
// LOGICA PER config.html
// ===============================================
function initConfigPage() {
    const saveButton = document.getElementById('saveConfig');
    if (saveButton) {
        const configForm = document.getElementById('configForm');
        const dashboardTitleInput = document.getElementById('dashboardTitle');
        const mqttServerInput = document.getElementById('mqttServer');
        const updateIntervalInput = document.getElementById('updateInterval');
        const topicsConfigTextarea = document.getElementById('topicsConfig');
        const importButton = document.getElementById('importConfig');
        const exportButton = document.getElementById('exportConfig');

        // Carica la configurazione corrente nel form
        const currentConfig = loadConfigFromLocalStorage();
        dashboardTitleInput.value = currentConfig.title;
        mqttServerInput.value = currentConfig.mqtt_server;
        updateIntervalInput.value = currentConfig.update_interval;
        topicsConfigTextarea.value = JSON.stringify(currentConfig.topics, null, 4);

        // Salva la configurazione
        saveButton.addEventListener('click', () => {
            let newConfig = {
                title: dashboardTitleInput.value,
                mqtt_server: mqttServerInput.value,
                update_interval: Number(updateIntervalInput.value),
            };
            try {
                newConfig.topics = JSON.parse(topicsConfigTextarea.value);
                saveConfigToLocalStorage(newConfig);
                alert('Configuration successfully saved');
                window.location.href = 'index.html';
            } catch (e) {
                alert('JSON format error; check syntax ');
                console.error(e);
            }
        });

        // Esporta la configurazione in un file TXT
        exportButton.addEventListener('click', () => {
            const configToExport = {
                title: dashboardTitleInput.value,
                mqtt_server: mqttServerInput.value,
                update_interval: Number(updateIntervalInput.value),
                topics: JSON.parse(topicsConfigTextarea.value)
            };
            const jsonString = JSON.stringify(configToExport, null, 4);
            const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'mqtt_dashboard_config.txt';
            link.click();
        });

        // Importa la configurazione da un file TXT
        importButton.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt, .json';
            fileInput.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const importedConfig = JSON.parse(event.target.result);
                        if (importedConfig.title && importedConfig.mqtt_server && importedConfig.topics) {
                            dashboardTitleInput.value = importedConfig.title;
                            mqttServerInput.value = importedConfig.mqtt_server;
                            updateIntervalInput.value = importedConfig.update_interval || 5000;
                            topicsConfigTextarea.value = JSON.stringify(importedConfig.topics, null, 4);
                            alert('Configuration successfully imported!');
                        } else {
                            throw new Error('file format not valid.');
                        }
                    } catch (error) {
                        alert('Error importing file. format not valid.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            };
            fileInput.click();
        });
    }
}

// Esegui la funzione appropriata a seconda della pagina
document.addEventListener('DOMContentLoaded', () => {
    initDashboardPage();
    initConfigPage();
});