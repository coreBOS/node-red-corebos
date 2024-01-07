module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSLogoutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Disconnecting"});
            let conn = config.connection == '' ? 'corebos' : config.connection;
            if (conn in msg.payload && msg.payload[conn].sessionName != '') {
                cblib.setConnection(msg.payload[conn]);
                try {
                    await cblib.doLogout();
                    cblib.setConnection({'host': '', 'sessionName': '', userId: false});
                    if (conn != 'corebos' && msg.payload[conn] == msg.payload.corebos) {
                        delete msg.payload.corebos;
                    }
                    delete msg.payload[conn];
                    if (send) {
                        send(msg);
                    } else {
                        node.send(msg);
                    }
                } catch (err) {
                    node.error(err);
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('corebos-logout', coreBOSLogoutNode);
}