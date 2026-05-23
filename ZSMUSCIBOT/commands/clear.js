const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear all upcoming songs from the queue (keeps current song playing)'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '❌ The queue is already empty!', ephemeral: true });
    }

    const count = queue.songs.length;
    queue.songs = [];

    await interaction.reply({
      embeds: [{
        color: 0xff4444,
        title: '🗑️ Queue Cleared',
        description: `Removed **${count}** song(s) from the queue.\nCurrently playing song will finish normally.`,
      }],
    });
  },
};
