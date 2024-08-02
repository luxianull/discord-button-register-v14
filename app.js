const { Client, Collection, ActivityType  } = require("discord.js");
const { readdirSync, readdir } = require("fs");
const config = require("./config.json")

const client = global.client = new Client({
    intents: 32767,
})
require("./structures/function")(client);




//----------------------------------------------------------------------------------------------------------\\


const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
client.on('ready', async () => {

  let guild = client.guilds.cache.get(config.GuildID);
  await guild.members.fetch();

  const connection = getVoiceConnection(config.GuildID);
  if (connection) return;

  setInterval(async () => {
      const VoiceChannel = client.channels.cache.get(config.presence.voiceChannelID);
      if (VoiceChannel) {
          joinVoiceChannel({ 
              channelId: VoiceChannel.id,
              guildId: VoiceChannel.guild.id,
              adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
              selfDeaf: true
            //selfMute: true | bot kendini sustursun istiyorsanız satırın başındaki // işaretlerini silin ve bir üst satırın sonuna , koyun |> selfDeaf: true,
          });
      }
  }, 5000);

  let activities = config.presence.name, i = 0;
  setInterval(() => client.user.setActivity({ name: `${activities[i++ % activities.length]}`,
    type: ActivityType.Streaming, //İZLİYOR: Watching, DİNLİYOR: Listening, OYNUYOR: Playing, YAYINLIYOR: Streaming |> ActivityType.Watching gibi değişebilirsiniz.
    url: "https://www.twitch.tv/luxianull"}), 10000);
});


//----------------------------------------------------------------------------------------------------------\\




//luxia
const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js')); //luxia
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.on("messageCreate", message => {
    let client = message.client;
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;
    if (!message.content.startsWith(config.prefix)) return;
    let command = message.content.split(' ')[0].slice(config.prefix.length);//luxia
    let params = message.content.split(' ').slice(1);
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    }
    else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (cmd) {
        cmd.run(client, message, params);
    }
})

client.commands = new Collection();
client.aliases = new Collection();
readdir('./commands/', (err, files) => {
    if (err) console.error(err);
    console.log(`🟡 ${files.length} adet komut yüklenecek.`); //luxia
    files.forEach(f => {
        let props = require(`./commands/${f}`);
        console.log(`[>] Yüklenen Komut : ${props.name.toUpperCase()}`);
        client.commands.set(props.name, props);
        props.aliases.forEach(alias => {
            client.aliases.set(alias, props.name);
        });
    });
});

client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./commands/${command}`)]; //luxia
            let cmd = require(`./commands/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => { //luxia
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.name);
            });
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}; //luxia

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./commands/${command}`);
            client.commands.set(command, cmd);
            cmd.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.name);
            }); //luxia
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
};

client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./commands/${command}`)]; //luxia
            let cmd = require(`./commands/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client
.login(config.token) //luxia
.then(() => console.log("🟢 [BOT] Başarıyla Bağlandı!"))
.catch(() => console.log("🔴 [ERROR] Bot Bağlanamadı!"));