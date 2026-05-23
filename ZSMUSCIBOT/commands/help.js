const { SlashCommandBuilder } = require('discord.js');

const commands = [
  { name: '/join', desc: 'Join your current voice channel' },
  { name: '/play [URL or name]', desc: 'Play a song from YouTube URL or search query' },
  { name: '/search [query]', desc: 'Search YouTube and pick from top 5 results' },
  { name: '/skip', desc: 'Skip the current song' },
  { name: '/stop', desc: 'Stop music, clear queue, and leave' },
  { name: '/pause', desc: 'Pause the current song' },
  { name: '/resume', desc: 'Resume the paused song' },
  { name: '/queue [page]', desc: 'View the music queue (10 per page)' },
  { name: '/nowplaying', desc: 'Show info about the current song' },
  { name: '/volume [1-150]', desc: 'Set the playback volume' },
  { name: '/loop [mode]', desc: 'Loop current song, entire queue, or disable' },
  { name: '/shuffle', desc: 'Shuffle the upcoming songs in the queue' },
  { name: '/seek [time]', desc: 'Jump to a timestamp (e.g. 1:30 or 90)' },
  { name: '/remove [position]', desc: 'Remove a song from the queue by position' },
  { name: '/clear', desc: 'Clear all upcoming songs from the queue' },
  { name: '/leave', desc: 'Leave the voice channel and clear the queue' },
  { name: '/help', desc: 'Show this help message' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available music commands'),

  async execute(interaction, client) {
    const fields = commands.map(c => ({
      name: c.name,
      value: c.desc,
      inline: true,
    }));

    await interaction.reply({
      embeds: [{
        color: 0x5865f2,
        title: '🎵 Music Bot — All Commands',
        description: 'Here are all available commands:',
        fields,
        footer: { text: 'Tip: Use /search to pick from results, or /play with a YouTube URL/name directly!' },
        timestamp: new Date().toISOString(),
      }],
      ephemeral: true,
    });
  },
};
