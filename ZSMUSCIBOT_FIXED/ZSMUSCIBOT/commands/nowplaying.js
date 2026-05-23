const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    const s = queue.currentSong;
    await interaction.reply({
      embeds: [{
        color: 0x1db954,
        title: '🎵 Now Playing',
        description: `**[${s.title}](${s.url})**`,
        fields: [
          { name: '⏱️ Duration', value: s.duration, inline: true },
          { name: '👤 Requested by', value: s.requestedBy, inline: true },
          { name: '🔊 Volume', value: `${Math.round(queue.volume * 100)}%`, inline: true },
        ],
        footer: {
          text: `${queue.loop ? '🔂 Loop ON  ' : ''}${queue.loopQueue ? '🔁 Queue Loop ON  ' : ''}${queue.songs.length} song(s) in queue`,
        },
      }],
    });
  },
};
