module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSDescribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            let conn = config.connection == '' ? 'corebos' : config.connection;
            if (conn in msg.payload && msg.payload[conn].sessionName != '') {
                cblib.setConnection(msg.payload[conn]);
                try {
                    let modules = await cblib.doDescribe(config.modules);
                    if (config.modules.includes(',')) {
                        Object.entries(modules).forEach(([key, value]) => {
                            if (send) {
                                send({"module": key, "metadata": value});
                            } else {
                                node.send({"module": key, "metadata": value});
                            }
                        });
                    } else {
                        if (send) {
                            send({"module": config.modules, "metadata": modules});
                        } else {
                            node.send({"module": config.modules, "metadata": modules});
                        }
                    }
                } catch (err) {
                    node.error(err)
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
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
    RED.nodes.registerType('corebos-describe', coreBOSDescribeNode);
}