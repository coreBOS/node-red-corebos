module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSDeleteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos);
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
                    node.send(msg);
                } else {
                    node.status({fill:"red", shape:"ring", text:"No Record"});
                }
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
        });
    }
    RED.nodes.registerType('corebos-delete', coreBOSDeleteNode);
}