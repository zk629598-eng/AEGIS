# 🔑 KeyAuth Discord Bot V3 — Multi-App Manager

Add and manage multiple KeyAuth apps **directly from Discord** — no need to edit any config files!

---

## ✨ Commands

| Command | Description |
|---|---|
| `/addapp` | ➕ Add a new KeyAuth app (modal form) |
| `/listapps` | 📋 Show all added apps |
| `/removeapp` | 🗑️ Remove an app |
| `/panel` | 🎛️ Create public "Get Key" panel |
| `/genkey` | 🔑 Generate license keys |
| `/stats` | 📊 View dashboard stats |
| `/keys` | 🔑 Browse license keys |
| `/users` | 👥 Browse users |
| `/manage` | 🔧 Ban/unban/delete users & keys |
| `/logs` | 📋 View activity logs |

---

## 🚀 Setup (Only 3 values needed in .env)

### Step 1 — Create Discord Bot
1. Go to https://discord.com/developers/applications
2. **New Application** → give it a name
3. Go to **Bot** tab → **Reset Token** → copy token
4. Enable **Server Members Intent** and **Message Content Intent**
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`, `Read Message History`
   - Copy URL → invite bot to your server

### Step 2 — Get IDs
- **CLIENT_ID** = discord.com/developers → Your App → General Information → **Application ID**
- **GUILD_ID** = Discord → Settings → Advanced → Enable Developer Mode → Right-click server → **Copy Server ID**

### Step 3 — Fill .env
```
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
GUILD_ID=your_server_id
```

---

## 🚂 Deploy on Railway

1. Push to GitHub:
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/keyauth-bot.git
git push -u origin main
```

2. Go to https://railway.app → **New Project → Deploy from GitHub**
3. Select your repo
4. Go to **Variables** tab → add:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
5. Bot goes live 24/7 ✅

---

## 📱 How to Add Your KeyAuth App in Discord

1. Type `/addapp` in your Discord server
2. A form pops up — fill in:
   - **App Label** — nickname (e.g. `ZS Cheat`)
   - **App Name** — exact name in KeyAuth (e.g. `ZS`)
   - **Owner ID** — from KeyAuth Account Settings (e.g. `inlBe174bk`)
   - **Secret Key** — your app's secret key
   - **Version** — your app version (e.g. `1.0`)
3. Bot tests the credentials and saves if valid
4. Use `/listapps` to confirm it's added
5. All commands now show this app in the selector!

---

## 📁 File Structure

```
keyauth-bot-v3/
├── index.js              # Bot entry point
├── keyauth.js            # KeyAuth API wrapper
├── appstore.js           # Saves/loads apps from apps.json
├── picker.js             # Shared app selector helper
├── apps.json             # Auto-created, stores your apps
├── commands/
│   ├── addapp.js         # Add new app via modal
│   ├── listapps.js       # List all apps
│   ├── removeapp.js      # Remove an app
│   ├── panel.js          # Public key panel
│   ├── genkey.js         # Generate keys
│   ├── stats.js          # App stats
│   ├── keys.js           # Browse keys
│   ├── users.js          # Browse users
│   ├── manage.js         # Manage users/keys
│   └── logs.js           # Activity logs
├── events/
│   ├── ready.js
│   └── interactionCreate.js
├── package.json
├── railway.toml
└── .env.example
```
