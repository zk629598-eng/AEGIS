const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }
    if (queue.player.state.status === AudioPlayerStatus.Paused) {
      return interaction.reply({ content: '⏸️ Already paused. Use `/resume` to continue.', ephemeral: true });
    }

    queue.player.pause();

    await interaction.reply({
      embeds: [{
        color: 0xffdd00,
        title: '⏸️ Paused',
        description: `**${queue.currentSong.title}**\nUse \`/resume\` to continue.`,
      }],
    });
  },
};
