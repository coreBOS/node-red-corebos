module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSDescribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos)
                try {
                    let modules = await cblib.doDescribe(config.modules);
                    if (config.modules.includes(',')) {
                        Object.entries(modules).forEach(([key, value]) => {
                            node.send({"module": key, "metadata": value});
                        });
                    } else {
                        node.send({"module": config.modules, "metadata": modules});
                    }
                } catch (err) {
                    node.error(err)
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
                node.send(msg)
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
        });
    }
    RED.nodes.registerType('corebos-describe', coreBOSDescribeNode);
}