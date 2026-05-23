const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue')
    .addIntegerOption(opt =>
      opt.setName('page')
        .setDescription('Page number (10 songs per page)')
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);

    if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
      return interaction.reply({ content: '📭 The queue is empty!', ephemeral: true });
    }

    const page = (interaction.options.getInteger('page') || 1) - 1;
    const perPage = 10;
    const totalPages = Math.ceil(queue.songs.length / perPage) || 1;
    const start = page * perPage;
    const end = start + perPage;

    const queueList = queue.songs
      .slice(start, end)
      .map((s, i) => `\`${start + i + 1}.\` [${s.title}](${s.url}) — \`${s.duration}\` — ${s.requestedBy}`)
      .join('\n') || '*No upcoming songs*';

    await interaction.reply({
      embeds: [{
        color: 0x5865f2,
        title: '📋 Music Queue',
        fields: [
          {
            name: '▶️ Now Playing',
            value: queue.currentSong
              ? `[${queue.currentSong.title}](${queue.currentSong.url}) — \`${queue.currentSong.duration}\``
              : 'Nothing',
          },
          {
            name: `📜 Up Next (${queue.songs.length} songs)`,
            value: queueList,
          },
        ],
        footer: {
          text: `Page ${page + 1}/${totalPages} • ${queue.loop ? '🔂 Loop ON' : ''}${queue.loopQueue ? '🔁 Queue Loop ON' : ''}`,
        },
      }],
    });
  },
};
