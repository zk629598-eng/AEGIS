const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the upcoming songs in the queue'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || queue.songs.length < 2) {
      return interaction.reply({ content: '❌ Not enough songs in the queue to shuffle!', ephemeral: true });
    }

    // Fisher-Yates shuffle
    for (let i = queue.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
    }

    await interaction.reply({
      embeds: [{
        color: 0xff69b4,
        title: '🔀 Queue Shuffled',
        description: `${queue.songs.length} songs have been shuffled!`,
        footer: { text: `Next up: ${queue.songs[0]?.title || 'N/A'}` },
      }],
    });
  },
};
