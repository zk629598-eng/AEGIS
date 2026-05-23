const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the voice channel and clear the queue'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue) {
      return interaction.reply({ content: '❌ I am not in a voice channel!', ephemeral: true });
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
        title: '👋 Left Voice Channel',
        description: 'Disconnected and cleared the queue.',
      }],
    });
  },
};
