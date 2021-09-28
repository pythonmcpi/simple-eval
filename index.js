const {Plugin} = require('powercord/entities')
const util = require('util')
const process = require('process')
module.exports = class simple_eval extends Plugin {
	startPlugin() {
		powercord.api.commands.registerCommand({
			command: 'eval',
			description: '[DANGEROUS] Evaluates javascript code locally. DO NOT USE THIS COMMAND WITH CODE YOU DO NOT UNDERSTAND.',
			usage: '{c} <code>',
			executor: async (args) => ({
				send: false,
				result: await this.evaluate(args)
			})
		});
	}
	
	pluginWillUnload() {
		powercord.api.commands.unregisterCommand('eval');
	}
	
	async evaluate(args) {
		var result = undefined;
		var errored = false;
		var start = process.hrtime();
		try {
			result = eval(args.join(" "));
			if (result instanceof Promise) {
				result = await result;
			}
		} catch (e) {
			result = e;
			errored = true;
		}
		var elapsed = process.hrtime(start); // https://stackoverflow.com/a/14551263
		var elapsed_ms = elapsed[0] * 1e3 + elapsed[1] / 1e6; // Convert seconds, nanoseconds to milliseconds
		var elapsed_str = elapsed_ms + ' ms'; // 3 decimal places
		
		if (errored) {
			console.log(result);
		}
		
		result = util.inspect(result);
		
		return {
			type: 'rich',
			title: (errored ? 'Error' : 'Success') + ' ' + elapsed_str,
			description : '```js\n' + result + '\n```',
			timestamp: Date.now(),
			color: 0x00ffff
		}
	}
}
