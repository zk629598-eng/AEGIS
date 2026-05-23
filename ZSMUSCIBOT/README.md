# 🎵 Discord Music Bot

A full-featured Discord music bot that plays audio from YouTube using slash commands.

---

## 📁 File Structure

```
discord-music-bot/
├── bot.js                    ← Main entry point
├── package.json
├── .env.example              ← Copy to .env and fill in your tokens
├── .gitignore
├── commands/
│   ├── join.js               ← /join
│   ├── play.js               ← /play
│   ├── search.js             ← /search
│   ├── skip.js               ← /skip
│   ├── stop.js               ← /stop
│   ├── pause.js              ← /pause
│   ├── resume.js             ← /resume
│   ├── queue.js              ← /queue
│   ├── nowplaying.js         ← /nowplaying
│   ├── volume.js             ← /volume
│   ├── loop.js               ← /loop
│   ├── shuffle.js            ← /shuffle
│   ├── seek.js               ← /seek
│   ├── remove.js             ← /remove
│   ├── clear.js              ← /clear
│   ├── leave.js              ← /leave
│   └── help.js               ← /help
└── utils/
    ├── queueManager.js       ← Per-guild queue logic + audio player
    └── youtube.js            ← YouTube URL resolver + search
```

---

## ⚙️ Setup Guide

### 1. Prerequisites
- **Node.js v18+** — https://nodejs.org
- **FFmpeg** — installed automatically via `ffmpeg-static`
- A Discord account and server where you have admin rights

### 2. Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Add Bot**
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy your **Bot Token** (click "Reset Token" if needed)
6. Go to **General Information** → copy your **Application ID**

### 3. Invite the Bot to Your Server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Or build a custom URL with these permissions:
- Connect, Speak (Voice)
- Send Messages, Embed Links, Read Message History

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Bot

```bash
npm start
```

On first run, slash commands are registered globally (takes up to 1 hour to propagate to all servers, but usually instant in your own server).

---

## 🎮 All Commands

| Command | Description |
|---|---|
| `/join` | Join your current voice channel |
| `/play [URL or name]` | Play from YouTube URL or search by name |
| `/search [query]` | Search YouTube, pick from top 5 results |
| `/skip` | Skip the current song |
| `/stop` | Stop, clear queue, leave channel |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/queue [page]` | View the queue (10 songs per page) |
| `/nowplaying` | Show current song info |
| `/volume [1-150]` | Set volume (default: 100) |
| `/loop [mode]` | Loop: current song / queue / off |
| `/shuffle` | Shuffle upcoming queue |
| `/seek [time]` | Jump to timestamp (`1:30` or `90`) |
| `/remove [pos]` | Remove song from queue by position |
| `/clear` | Clear all upcoming songs |
| `/leave` | Leave voice channel |
| `/help` | Show all commands |

---

## 🔧 Troubleshooting

**Bot doesn't respond to slash commands?**
- Wait up to 1 hour for global commands to propagate
- Make sure the bot has `applications.commands` scope when invited

**No audio / silent playback?**
- Make sure `ffmpeg-static` and `opusscript` installed correctly
- Run `npm install` again

**"Could not play" errors?**
- YouTube may rate-limit or block. Try a different video.
- The video may be age-restricted or region-locked.

**Bot disconnects randomly?**
- This is a known Discord voice stability issue. Use `/join` to reconnect.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `discord.js` | Discord API client |
| `@discordjs/voice` | Voice connection & audio playback |
| `@discordjs/rest` | REST API for command registration |
| `@distube/ytdl-core` | YouTube audio stream downloader |
| `yt-search` | YouTube search by name |
| `ffmpeg-static` | Audio encoding (bundled FFmpeg) |
| `opusscript` | Opus audio encoding |
| `libsodium-wrappers` | Voice encryption |
| `dotenv` | Environment variable loading |
