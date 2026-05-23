const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    const skipped = queue.currentSong.title;
    queue.loop = false;
    queue.player.stop(); // triggers Idle event → playNext

    await interaction.reply({
      embeds: [{
        color: 0xffa500,
        title: '⏭️ Skipped',
        description: `Skipped **${skipped}**`,
        footer: { text: queue.songs.length > 0 ? `${queue.songs.length} song(s) remaining` : 'Queue is empty' },
      }],
    });
  },
};
