const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');

/**
 * Resolves a YouTube URL or search query to a song object.
 * Returns { title, url, duration } or throws.
 */
async function resolveSong(query) {
  let url = query;
  let isUrl = query.startsWith('http://') || query.startsWith('https://');

  if (!isUrl) {
    // Search YouTube
    const results = await yts(query);
    const video = results.videos[0];
    if (!video) throw new Error('No results found for: ' + query);
    url = video.url;
    return {
      title: video.title,
      url: video.url,
      duration: video.timestamp || 'Live',
    };
  }

  // Validate & get info from URL
  if (!ytdl.validateURL(url)) {
    throw new Error('Invalid YouTube URL: ' + url);
  }

  const info = await ytdl.getBasicInfo(url);
  const details = info.videoDetails;
  const secs = parseInt(details.lengthSeconds, 10);
  const duration = secs ? formatDuration(secs) : 'Live';

  return {
    title: details.title,
    url: details.video_url,
    duration,
  };
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

module.exports = { resolveSong };
