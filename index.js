var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
	
	self.actions(); // export actions
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Use this module to send messages to a preconfigured GroupMe Group using a bot. Follow these instructions to set up your bot: <https://dev.groupme.com/tutorials/bots>'
		},
		{
			type: 'textinput',
			id: 'botId',
			label: 'Bot ID',
			width: 12,
			required: true
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'custom': {
			label: 'Send A Custom Message',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					default: ''
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd = 'https://api.groupme.com/v3/bots/post';
	var body = {};
	
	switch(action.action) {
		case 'custom':
      body.bot_id = self.config.botId.trim();
			body.text = action.options.message.trim();
			break;
		default:
			break;
	};

	self.system.emit('rest', cmd, body, function (err, result) {
		if (err !== null) {
			self.log('error', 'GroupMe Webhook Send Failed (' + result.error.code + ')');
			self.status(self.STATUS_ERROR, result.error.code);
		}
		else {
			self.status(self.STATUS_OK);
		}
	});
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;