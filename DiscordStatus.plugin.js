/**
	* @name DiscordStatus
	* @author Ahlawat
	* @authorId 887483349369765930
	* @version 1.0.0
	* @invite SgKSKyh9gY
	* @description Returns discord status from https://discordstatus.com
	* @website https://wife-ruby.ml
	* @source https://github.com/Tharki-God/BetterDiscordPlugins
	* @updateUrl https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/DiscordStatus.plugin.js
*/
/*@cc_on
	@if (@_jscript)	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
	shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
	shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
	fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
	// Show the user where to put plugins in the future
	shell.Exec("explorer " + pathPlugins);
	shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/
module.exports = (() => {
	const config = {
		info: {
			name: "DiscordStatus",
			authors: [
				{
					name: "Ahlawat",
					discord_id: "887483349369765930",
					github_username: "Tharki-God",
				},
			],
			version: "1.0.0",
			description:
			"Returns discord status from https://discordstatus.com",
			github: "https://github.com/Tharki-God/BetterDiscordPlugins",
			github_raw:
			"https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/DiscordStatus.plugin.js",
		},
		changelog: [
			{
				title: "v0.0.1",
				items: [
					"Idea in mind"
				]
			},
			{
				title: "v0.0.5",
				items: [
					"Base Model"
				]
			},
			{
				title: "Initial Release v1.0.0",
				items: [
					"This is the initial release of the plugin :)",
					"Get those stats nerd."
				]
			}
		],
		main: "DiscordStatus.plugin.js",
	};	
	return !global.ZeresPluginLibrary
	? class {
		constructor() {
			this._config = config;
		}
		getName() {
			return config.info.name;
		}
		getAuthor() {
			return config.info.authors.map((a) => a.name).join(", ");
		}
		getDescription() {
			return config.info.description;
		}
		getVersion() {
			return config.info.version;
		}
		load() {
			try {
				global.ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.github_raw);
			}
			catch (err) {
				console.error(this.getName(), "Plugin Updater could not be reached.", err);
			}
			BdApi.showConfirmationModal(
				"Library Missing",
				`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
				{
					confirmText: "Download Now",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get(
							"https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
							async (error, response, body) => {
								if (error)
								return require("electron").shell.openExternal(
									"https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
								);
								await new Promise((r) =>
									require("fs").writeFile(
										require("path").join(
											BdApi.Plugins.folder,
											"0PluginLibrary.plugin.js"
										),
										body,
										r
									)
								);
							}
						);
					},
				}
			);
		}
		start() { }
		stop() { }
	}
	: (([Plugin]) => {
		const plugin = (Plugin) => {			
			const DiscordCommands = BdApi.findModuleByProps("BUILT_IN_COMMANDS");
			const DiscordCommandTypes = BdApi.findModuleByProps("ApplicationCommandType");
			const Types = DiscordCommandTypes.ApplicationCommandType;
			const OptionTypes = DiscordCommandTypes.ApplicationCommandOptionType;
			const PermissionTypes = DiscordCommandTypes.ApplicationCommandPermissionType;
			if (!DiscordCommands.BUILT_IN_SECTIONS["tharki"]) DiscordCommands.BUILT_IN_SECTIONS["tharki"] = {
				icon: "https://cdn.discordapp.com/attachments/889198641775001670/975544544366051418/IMG_20220506_002009_copy.png",
				id: "tharki",
				name: "Tharki",
				type: 0
			};
			function registerCommand(caller, options) {
				const cmd = Object.assign({}, options, {
					__registerId: caller,
					applicationId: "tharki",
					type: Types.BOT,
					target: 1
				});
				DiscordCommands.BUILT_IN_COMMANDS.push(cmd);
				return () => {
					const index = DiscordCommands.BUILT_IN_COMMANDS.indexOf(cmd);
					if (index < 0) return false;
					DiscordCommands.BUILT_IN_COMMANDS.splice(index, 1);
				};
			}
			function unregisterAllCommands(caller) {
				let index = DiscordCommands.BUILT_IN_COMMANDS.findIndex((cmd => cmd.__registerId === caller));
				while (index > -1) {
					DiscordCommands.BUILT_IN_COMMANDS.splice(index, 1);
					index = DiscordCommands.BUILT_IN_COMMANDS.findIndex((cmd => cmd.__registerId === caller));
				}
			}
			const Commands = {
				registerCommand,
				unregisterAllCommands
			};
			const commands = Commands;			
			return class Status extends Plugin {			
					async stats () {
					let embed;
						await fetch('https://discordstatus.com/api/v2/summary.json').then(function (response) {
						return response.json();
						}).then(function (data) {
						console.log(data)
					    const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
					embed =  {
        type: 'rich',
        title: data.status.description,
        description: '[Discord Status](https://discordstatus.com/)\n' + '**Current Incident:**\n' + data.status.indicator,
		color: "6577E6",
		thumbnail: {
										url: "https://media.discordapp.net/attachments/963485601045307412/978017538485153833/372108630_DISCORD_LOGO_400.gif",
										proxyURL: "https://cdn.discordapp.com/attachments/963485601045307412/978017538485153833/372108630_DISCORD_LOGO_400.gif",
										width:400,
		height:400
									},
        fields: data.components.map(component => ({
          name: component.name,
          value: capitalize(component.status),
          inline: true,
        })),
		timestamp: data.page.updated_at
      }
						}).catch(function (err) {
						// There was an error
						console.warn('Something went wrong.', err);
					});

return embed;
   
  }
					async onStart()
					{         console.log();		
						const DiscordCommands = ZeresPluginLibrary.WebpackModules.getByProps("BUILT_IN_COMMANDS");
						DiscordCommands.BUILT_IN_COMMANDS.push({
							__registerId: this.getName(),
							applicationId: "tharki",
							name: "Status",

							description: "Returns discord status from https://discordstatus.com",
							id: "status",
							type: 1,
							target: 1,
							aliases: ["DiscordStatus", "Discord"],
							usage: '{c}',
							predicate: () => true,
							execute: (_, {
								channel
							}) => {
							 this.stats().then((embed) => {
   BdApi.findModuleByProps('sendBotMessage').sendBotMessage(channel.id,"",[embed]);	
  }).catch((error) => {
    console.error(error);
  });;						
									
								
							},
							options: []
						});	
					}
					onStop() {					
						commands.unregisterAllCommands(this.getName());
					}
			};
		};
		return plugin(Plugin);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
