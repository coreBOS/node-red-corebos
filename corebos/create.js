module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSCreateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos);
                if ('record' in msg && msg.record != '' && 'module' in msg && msg.module != '') {
                    msg.payload.created = false;
                    try {
                        let insrdo = await cblib.doCreate(msg.module, msg.record);
                        msg.payload.created = true;
                        msg.record = insrdo;
                        node.status({fill:"green", shape:"ring", text:"Done"});
                    } catch (err) {
                        node.status({fill:"yellow", shape:"ring", text:"Error"});
                        node.error(err)
                    }
                    node.send(msg);
                } else {
                    node.status({fill:"red", shape:"ring", text:"No Record"});
                }
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
        });
    }
    RED.nodes.registerType('corebos-create', coreBOSCreateNode);
}