const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = 'DEIN_BOT_TOKEN_HIER'; // 🔒 Ersetze durch deinen Bot-Token
const OWNER_ID = '1213880801796554783'; // ✅ Deine Discord-ID

let isActive = false;

const backupPath = path.join(__dirname, 'backup.json');
let backup = {};

if (fs.existsSync(backupPath)) {
  backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
}

client.once('ready', () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const guild = message.guild;

  // ❌ Nur du darfst die Befehle nutzen
  const protectedCommands = ['&&start', '&&stop', '&&reset', '&&clearbackup'];
  if (protectedCommands.includes(content) && message.author.id !== OWNER_ID) {
    await message.reply('⛔ Nur Max darf diesen Befehl verwenden!');
    return;
  }

  // ✅ &&start
  if (content === '&&start') {
    await message.delete(); // Nachricht löschen

    if (isActive) {
      message.channel.send('Der Spaß läuft schon 😏');
      return;
    }

    isActive = true;
    message.channel.send('**Troll-Modus AKTIVIERT!** 🔥');

    guild.channels.cache.forEach(async (channel) => {
      if (channel.isTextBased() && channel.type !== 4) {
        try {
          if (!backup[channel.id]) {
            backup[channel.id] = channel.name;
            fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
          }

          await channel.setName('gefickt-von-max 😈');
          await channel.send('@everyone **Dies ist ein Max Moment!** 💥');
          console.log(`Umbenannt: ${channel.name}`);
        } catch (err) {
          console.error(`Fehler bei ${channel.name}:`, err.message);
        }
      }
    });
  }

  // ✅ &&stop
  if (content === '&&stop') {
    await message.delete(); // Nachricht löschen

    if (!isActive) {
      message.channel.send('Der Spaß war gar nicht an 😐');
      return;
    }

    isActive = false;
    message.channel.send('**Troll-Modus DEAKTIVIERT!** 🧯');
  }

  // ✅ &&reset
  if (content === '&&reset') {
    await message.delete(); // Nachricht löschen

    if (!Object.keys(backup).length) {
      message.channel.send('Kein Backup gefunden 😶');
      return;
    }

    message.channel.send('🔄 Stelle ursprüngliche Kanalnamen wieder her...');

    for (const [channelId, oldName] of Object.entries(backup)) {
      const channel = guild.channels.cache.get(channelId);
      if (channel && channel.isTextBased()) {
        try {
          await channel.setName(oldName);
          console.log(`Zurückgesetzt: ${channel.name} → ${oldName}`);
        } catch (err) {
          console.error(`Fehler bei Reset: ${channel.name}`, err.message);
        }
      }
    }

    message.channel.send('✅ Reset abgeschlossen!');
  }

  // ✅ &&clearbackup
  if (content === '&&clearbackup') {
    await message.delete(); // Nachricht löschen

    fs.writeFileSync(backupPath, '{}');
    backup = {};
    message.channel.send('🗑️ Backup wurde gelöscht!');
  }
});

client.login(TOKEN);
      
