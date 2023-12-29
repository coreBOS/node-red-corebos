module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSLoginNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.connected = false;

        let client = RED.nodes.getNode(config.server);

        if (!client) {
            return;
        }

        node.init = async function init() {
            node.status({fill:"yellow", shape:"ring", text:"Connecting"});

            node.onConnect = function () {
                node.connected = true;
                node.status({fill:"green", shape:"ring", text:"Ready"});
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
                var payload = new Object();
                payload.topic = topic;
                payload.payload = new Object();
                payload.payload.msg = message;
                payload.payload.userId = '';
                payload.payload.sessionName = '';
                try {
                    await cblib.doLogin(client.options.username, client.options.accesskey, false);
                    let sessinfo = cblib.getSession();
                    payload.payload.userId = sessinfo.userId ? sessinfo.userId : '';
                    payload.payload.sessionName = sessinfo.sessionName ? sessinfo.sessionName : '';
                    node.status({fill:"green", shape:"ring", text:"Ready"});
                } catch (err) {
                    node.error(err)
                }
                return payload
            }

            let payload = await node.onMessage('login', 'login');
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
            let payload = await node.onMessage('login', 'input');
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
    RED.nodes.registerType('corebos-login', coreBOSLoginNode);

    RED.httpAdmin.post('/coreboslogin/:id', RED.auth.needsPermission('corebos.write'), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                node.receive();
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                node.error(RED._('corebos.loginfailed', {error:err.toString()}));
            }
        } else {
            res.sendStatus(404);
        }
    });
}