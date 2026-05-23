const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue by its position')
    .addIntegerOption(opt =>
      opt.setName('position')
        .setDescription('Position of the song in the queue (use /queue to see positions)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
    }

    const pos = interaction.options.getInteger('position');
    if (pos > queue.songs.length) {
      return interaction.reply({ content: `❌ Invalid position. Queue only has **${queue.songs.length}** song(s).`, ephemeral: true });
    }

    const removed = queue.songs.splice(pos - 1, 1)[0];

    await interaction.reply({
      embeds: [{
        color: 0xff4444,
        title: '🗑️ Removed from Queue',
        description: `**${removed.title}** (position #${pos}) has been removed.`,
      }],
    });
  },
};
