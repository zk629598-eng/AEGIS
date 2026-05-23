const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }
    if (queue.player.state.status !== AudioPlayerStatus.Paused) {
      return interaction.reply({ content: '▶️ Music is already playing!', ephemeral: true });
    }

    queue.player.unpause();

    await interaction.reply({
      embeds: [{
        color: 0x1db954,
        title: '▶️ Resumed',
        description: `**${queue.currentSong.title}**`,
      }],
    });
  },
};
