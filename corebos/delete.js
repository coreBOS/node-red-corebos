module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSDeleteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            let conn = config.connection == '' ? 'corebos' : config.connection;
            if (conn in msg.payload && msg.payload[conn].sessionName != '') {
                cblib.setConnection(msg.payload[conn]);
                if ('recordid' in msg && msg.recordid != '') {
                    msg.payload.deleted = false;
                    try {
                        let delrdo = await cblib.doDelete(msg.recordid);
                        if (delrdo.status == 'successful') {
                            msg.payload.deleted = true;
                            node.status({fill:"green", shape:"ring", text:"Done"});
                        } else {
                            node.error(delrdo.error.message);
                            node.status({fill:"yellow", shape:"ring", text:"Error"});
                        }
                    } catch (err) {
                        node.error(err)
                    }
                    if (send) {
                        send(msg);
                    } else {
                        node.send(msg);
                    }
                } else {
                    node.status({fill:"red", shape:"ring", text:"No Record"});
                }
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('corebos-delete', coreBOSDeleteNode);
}