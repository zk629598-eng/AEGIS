const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot ready: ${client.user.tag}`);
    client.user.setActivity('KeyAuth Manager', { type: ActivityType.Watching });
  },
};
