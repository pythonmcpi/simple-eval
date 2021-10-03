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
				result: await this.evaluate(args, false)
			})
		});
		
		powercord.api.commands.registerCommand({
			command: 'eval_async',
			description: '[DANGEROUS] Asynchronously evaluates javascript code locally. DO NOT USE THIS COMMAND WITH CODE YOU DO NOT UNDERSTAND.',
			usage: '{c} <async_code>',
			executor: async (args) => ({
				send: false,
				result: await this.evaluate(args, true)
			})
		});
	}
	
	pluginWillUnload() {
		powercord.api.commands.unregisterCommand('eval');
		powercord.api.commands.unregisterCommand('eval_async');
	}
	
	async evaluate(args, is_async) {
		var result = undefined;
		var errored = false;
		
		var statement = args.join(" ");
		if (is_async) {
			if (statement.includes(";") && (!statement.endsWith(";") || statement.includes("\n") || (statement.split(';').length) > 2)) {
				statement = "(async () => {" + statement + "})()";
			} else {
				statement = "(async () => { return " + statement + "})()";
			}
		}
		
		var start = process.hrtime();
		try {
			result = eval(statement);
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
			console.error(result);
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
