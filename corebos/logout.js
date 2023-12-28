module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSLogoutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.connected = false;

        let client = RED.nodes.getNode(config.server);

        if (!client) {
            return;
        }

        node.init = async function init() {
            node.status({fill:"yellow", shape:"ring", text:"Disconnecting"});

            node.onConnect = function () {
                node.connected = true;
                node.status({fill:"green", shape:"ring", text:"Done"});
            }

            node.onDisconnect = function () {
                node.connected = false;
                node.status({fill:"red", shape:"ring", text:"Offline"});
            }

            node.onRequestTimeout = function () {
                node.status({fill:"red", shape:"ring", text:"Timeout"});
            }

            node.onError = function (e) {
                node.error(e.message);
                node.status({fill:"red", shape:"ring", text:"Error"});
            }

            node.onMessage = async function (topic, message) {
                cblib.setURL(client.options.server);
                await cblib.doLogout();
                var payload = new Object();
                payload.topic = topic;
                payload.payload = new Object();
                payload.payload.msg = message;
                payload.payload.userId= '';
                payload.payload.sessionName = '';
                node.status({fill:"green", shape:"ring", text:"Done"});
                return payload
            }

            let payload = await node.onMessage('logout', 'logout');
            node.send(payload);

            // we should listen to coreBOS events here and react accordingly
        }

        node.init().catch(e => {
            node.onError(e);
        });

        node.on('input', async function (msg) {
            let ts = msg.payload;
            msg.payload = new Object();
            msg.payload.timestamp = ts;
            let payload = await node.onMessage('logout', 'input');
            msg.payload.corebos = payload.payload;
            node.send(msg);
        });

        node.on('close', function (done) {
            node.consumer.disconnect().then(() => {
                node.status({});
                cblib.doLogout();
                done();
            }).catch(e => {
                node.onError(e);
            });
        });
    }
    RED.nodes.registerType('corebos-logout', coreBOSLogoutNode);
}