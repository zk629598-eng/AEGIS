const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

function createQueue(guildId, voiceConnection, textChannel) {
  const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
  });

  const queue = {
    guildId,
    connection: voiceConnection,
    textChannel,
    player,
    songs: [],
    currentSong: null,
    volume: 1.0,
    loop: false,
    loopQueue: false,
    playing: false,
  };

  voiceConnection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    queue.playing = false;
    if (queue.loop && queue.currentSong) {
      playSong(queue, queue.currentSong);
    } else {
      if (queue.loopQueue && queue.currentSong) {
        queue.songs.push(queue.currentSong);
      }
      playNext(queue);
    }
  });

  player.on('error', err => {
    console.error('Player error:', err.message);
    queue.playing = false;
    textChannel.send(`❌ Playback error: ${err.message}`).catch(() => {});
    playNext(queue);
  });

  voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      queue.songs = [];
      queue.currentSong = null;
      queue.playing = false;
      try { voiceConnection.destroy(); } catch {}
    }
  });

  return queue;
}

async function playSong(queue, song) {
  queue.currentSong = song;
  queue.playing = true;

  try {
    const stream = ytdl(song.url, {
      filter: 'audioonly',
      quality: 'lowestaudio',
      highWaterMark: 1 << 25,
      dlChunkSize: 0,
    });

    stream.on('error', err => {
      console.error('ytdl stream error:', err.message);
      queue.playing = false;
      queue.textChannel.send(`❌ Stream error for **${song.title}**. Skipping...`).catch(() => {});
      playNext(queue);
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });

    resource.volume.setVolume(queue.volume);
    queue.player.play(resource);

    queue.textChannel.send({
      embeds: [{
        color: 0x1db954,
        title: '▶️ Now Playing',
        description: `**[${song.title}](${song.url})**`,
        fields: [
          { name: '⏱️ Duration', value: song.duration || 'Unknown', inline: true },
          { name: '👤 Requested by', value: song.requestedBy || 'Unknown', inline: true },
        ],
        footer: { text: queue.loop ? '🔂 Loop ON' : queue.loopQueue ? '🔁 Queue Loop ON' : '🎵 Music Bot' },
        timestamp: new Date().toISOString(),
      }],
    }).catch(() => {});

  } catch (err) {
    console.error('playSong error:', err.message);
    queue.playing = false;
    queue.textChannel.send(`❌ Could not play **${song.title}**. Skipping...`).catch(() => {});
    playNext(queue);
  }
}

function playNext(queue) {
  if (queue.songs.length === 0) {
    queue.currentSong = null;
    queue.playing = false;
    queue.textChannel.send('✅ Queue finished! Use `/play` to add more songs.').catch(() => {});
    return;
  }
  const next = queue.songs.shift();
  playSong(queue, next);
}

module.exports = { createQueue, playSong, playNext };
