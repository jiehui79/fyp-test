//Install mqtt library using: npm install mqtt
var mqtt = require('mqtt');

var client = mqtt.connect({
    servers: [{
        'host': 'mqtt.relayr.io'
    }],
    username: "username",
    password: "password",
    clientId: "clientId",
    protocol: 'mqtts'
});


client.on('connect', function() {

    //subscribe to commands sent from the dashboard or other clients
    client.subscribe("/v1/" + username + "/cmd");

    client.on('message', function(topic, message) {
        console.log(message.toString());
    });

    //simple timer to send a message every 1 second
    var publisher = setInterval(function() {

        // publish a message to a topic
        var val = Math.random() * 10;
        var data = JSON.stringify({
            meaning: "other meaning",
            value: val.toFixed(1)
        });

        client.publish("/v1/" + username + "/data", data, function() {
            console.log("Message is published");
        });

    }, 1000);

});