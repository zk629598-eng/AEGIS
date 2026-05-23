const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music, clear the queue, and leave voice channel'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue) {
      return interaction.reply({ content: '❌ Not in a voice channel!', ephemeral: true });
    }

    queue.songs = [];
    queue.currentSong = null;
    queue.loop = false;
    queue.loopQueue = false;
    queue.playing = false;
    queue.player.stop();

    try { queue.connection.destroy(); } catch {}
    client.queues.delete(interaction.guild.id);

    await interaction.reply({
      embeds: [{
        color: 0xff4444,
        title: '⏹️ Stopped',
        description: 'Music stopped, queue cleared, and left the voice channel.',
      }],
    });
  },
};
