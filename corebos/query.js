module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSQueryNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            delete msg._msgid;
            msg.payload.totalrows = 0;
            let conn = config.connection == '' ? 'corebos' : config.connection;
            if (conn in msg.payload && msg.payload[conn].sessionName != '') {
                cblib.setConnection(msg.payload[conn]);
                try {
                    let records = await cblib.doQueryWithTotal(config.query);
                    msg.payload.totalrows = records.totalrows;
                    for (let record of records.result) {
                        msg.record = record;
                        if (send) {
                            send(RED.util.cloneMessage(msg));
                        } else {
                            node.send(RED.util.cloneMessage(msg));
                        }
                    }
                } catch (err) {
                    node.error(err);
                }
                node.status({fill:"green", shape:"ring", text:"Done"});
            } else {
                node.status({fill:"red", shape:"ring", text:"Login"});
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('corebos-query', coreBOSQueryNode);
}