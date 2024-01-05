module.exports = function(RED) {
    const cblib = require('./WSClient')

    function coreBOSLoginNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let client = RED.nodes.getNode(config.server);

        if (!client) {
            return;
        }
        let cbhost = client.options.server;
        let cbuser = client.options.username;
        let cbakey = client.options.accesskey;
        if (cbhost == '' || cbuser == '' || cbakey == '') {
            return;
        }

        node.on('input', async function (msg, send, done) {
            node.status({fill:"yellow", shape:"ring", text:"Executing"});
            cblib.setConnection({'host': cbhost, 'sessionName': '', userId: false});
            let cinfo = {};
            cinfo.host = cbhost;
            cinfo.userId = '';
            cinfo.sessionName = '';
            try {
                await cblib.doLogin(cbuser, cbakey, false);
                let sessinfo = cblib.getSession();
                cinfo.userId = sessinfo.userId ? sessinfo.userId : '';
                cinfo.sessionName = sessinfo.sessionName ? sessinfo.sessionName : '';
                node.status({fill:"green", shape:"ring", text:"Ready"});
            } catch (err) {
                node.status({fill:"red", shape:"ring", text:"Error"});
            }
            if (typeof(msg.payload) == 'undefined') {
                msg.payload = {};
            }
            if (typeof(msg.payload) != 'object') {
                let current = msg.payload;
                msg.payload = {"payload": current};
            }
            msg.payload.corebos = cinfo;
            if (config.name != '') {
                let cname = config.name.replace(/\s/g, '');
                msg.payload[cname] = cinfo;
            }
            if (send) {
                send(msg)
            } else {
                node.send(msg);
            }
            if (done) {
                done();
            }
        });

        this.on('close', function (done) {
            node.status({});
            cblib.doLogout();
            done();
        });

        // we should listen to coreBOS events here and react accordingly
        // [[Event emitter for function object in separate module - Developing Nodes - Node-RED Forum|https://discourse.nodered.org/t/event-emitter-for-function-object-in-separate-module/48850]]
    }

    RED.nodes.registerType('corebos-login', coreBOSLoginNode);

    RED.httpAdmin.post('/coreboslogin/:id', RED.auth.needsPermission('corebos.write'), function(req,res) {
        var cbnode = RED.nodes.getNode(req.params.id);
        if (cbnode != null) {
            try {
                cbnode.receive();
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                cbnode.error(RED._('corebos.loginfailed', {error:err.toString()}));
            }
        } else {
            res.sendStatus(404);
        }
    });
}