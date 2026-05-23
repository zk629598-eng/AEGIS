const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the playback volume (1–150)')
    .addIntegerOption(opt =>
      opt.setName('level')
        .setDescription('Volume level (1–150, default 100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(150)
    ),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    const level = interaction.options.getInteger('level');
    queue.volume = level / 100;

    // Apply to current resource if available
    try {
      const resource = queue.player.state.resource;
      if (resource?.volume) resource.volume.setVolume(queue.volume);
    } catch {}

    const bar = '█'.repeat(Math.floor(level / 10)) + '░'.repeat(15 - Math.floor(level / 10));

    await interaction.reply({
      embeds: [{
        color: 0x5865f2,
        title: '🔊 Volume Updated',
        description: `\`${bar}\` **${level}%**`,
      }],
    });
  },
};
