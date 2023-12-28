module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSListTypesNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos)
                try {
                    payload = new Object();
                    payload.done = false;
                    let modules = await cblib.doListTypes();
                    Object.keys(modules).forEach(mod => {
                        node.send({"module": mod, "payload": payload});
                    });
                } catch (err) {
                    node.error(err)
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
                msg.payload.done = true
                node.send(msg)
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
        });
    }
    RED.nodes.registerType('corebos-listtypes', coreBOSListTypesNode);
}