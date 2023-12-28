module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSInvokeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos);
                if ('method' in msg && msg.method != '') {
                    msg.payload.invoked = false;
                    msg.response = null;
                    let invoketype = ('invoketype' in msg && msg.invoketype != '') ? msg.invoketype : 'POST';
                    let invokeparams = ('params' in msg && msg.params != '') ? msg.params : {};
                    try {
                        let invrdo = await cblib.doInvoke(msg.method, invokeparams, invoketype);
                        msg.payload.invoked = true;
                        msg.response = invrdo;
                        node.status({fill:"green", shape:"ring", text:"Done"});
                    } catch (err) {
                        node.status({fill:"yellow", shape:"ring", text:"Error"});
                        node.error(err)
                    }
                    node.send(msg);
                } else {
                    node.status({fill:"red", shape:"ring", text:"No Method"});
                }
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
        });
    }
    RED.nodes.registerType('corebos-invoke', coreBOSInvokeNode);
}