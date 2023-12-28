module.exports = function(RED) {

    function coreBOSConfigNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var options = new Object();
        options.server = config.server;
        options.username = config.username;
        options.accesskey = config.accesskey;
        options.token = config.token;
        node.options = options;
    }
    RED.nodes.registerType('corebos-config', coreBOSConfigNode);
}