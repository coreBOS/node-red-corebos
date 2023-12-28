module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSRetrieveNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos);
                if ('recordid' in msg && msg.recordid != '') {
                    msg.record = {};
                    try {
                        let record = await cblib.doRetrieve(msg.recordid);
                        msg.record = record;
                        node.status({fill:"green", shape:"ring", text:"Done"});
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
    RED.nodes.registerType('corebos-retrieve', coreBOSRetrieveNode);
}