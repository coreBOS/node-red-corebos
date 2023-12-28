module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSQueryNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            msg.payload.totalrows = 0
            if ('corebos' in msg.payload && msg.payload.corebos.sessionName != '') {
                cblib.setSession(msg.payload.corebos)
                try {
                    let records = await cblib.doQueryWithTotal(config.query);
                    msg.payload.totalrows = records.totalrows
                    for (const record of records.result) {
                        node.send(record);
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
    RED.nodes.registerType('corebos-query', coreBOSQueryNode);
}