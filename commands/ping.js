const { embedBuilder } = require('discord.js');
const config = require('../config.json')
const db = require('quick.db')
require("../structures/function")(client);

 //luxia
module.exports = {
    name: 'ping',
    aliases: ["ping"],
    usage: ".pong",
    run: async (client, message, args) => {
        const ping = client.ws.ping;
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ping Bilgisi')
            .setDescription(`Botun ping: **${ping} ms**`)
            .setTimestamp();
        
        message.channel.send({ embeds: [embed] });
    },
};
