module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSListTypesNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            let conn = config.connection == '' ? 'corebos' : config.connection;
            if (conn in msg.payload && msg.payload[conn].sessionName != '') {
                cblib.setConnection(msg.payload[conn]);
                try {
                    payload = new Object();
                    payload.done = false;
                    let modules = await cblib.doListTypes();
                    Object.keys(modules).forEach(mod => {
                        if (send) {
                            send({"module": mod, "payload": payload});
                        } else {
                            node.send({"module": mod, "payload": payload});
                        }
                    });
                } catch (err) {
                    node.error(err)
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
                msg.payload.done = true
                if (send) {
                    send(msg);
                } else {
                    node.send(msg)
                }
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('corebos-listtypes', coreBOSListTypesNode);
}