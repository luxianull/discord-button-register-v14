const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { luxia_risk, luxia_verify} = require("../config.json")
const config = require("../config.json");

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        try {
             // luxia
            const kayıtsızRol = member.guild.roles.cache.get(config.kayıt.kayıtsızID); //luxia
            if (kayıtsızRol) {
                await member.roles.add(kayıtsızRol);
            }

             // luxia
            const kayıtChat = member.guild.channels.cache.get(config.kayıt.kayıtchatID); //luxia
            if (!kayıtChat) {
                return;
            }

            // luxia
            const button = new ButtonBuilder()
                .setCustomId(`register_button_${member.id}`)
                .setLabel('Kayıt Et [YETKİLİ]')  //luxia
                .setStyle(ButtonStyle.Success);

            // luxia
            const row = new ActionRowBuilder()
                .addComponents(button);


                let guvenilirlik = Date.now()-member.user.createdTimestamp < 1000*60*60*24*7;
                if (guvenilirlik) {
                if(config.fakeAccRole) member.roles.add(config.fakeAccRole).catch();
                } else if(config.kayıt.kayıtsızID) member.roles.add(config.kayıt.kayıtsızID).catch();
                


            // luxia
            const embed = new EmbedBuilder()
                .setColor('#808080')
                .setDescription(`
                Merhaba ${member}, sunucumuza hoş geldin!
                
                Kayıt olmak için bu kanala ismini yazmalısın. 
                
                Hesabın **<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>** oluşturulmuş. **(<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>)** ${guvenilirlik ? `${luxia_risk}` : `${luxia_verify}` }
                
                `)
                .setFooter({ text: 'luxia was here 💛' });

            // luxia
           kayıtChat.send({
                embeds: [embed],
                components: [row]
            });

           // luxia
            const pingMessage = await kayıtChat.send({
                content: `${config.kayıt.allowedRoleId}>` //luxia
            });

            // luxia
            setTimeout(() => {
                pingMessage.delete().catch(() => {});
            }, 1000);

        } catch (error) { //luxia
            console.error('Bir hata oluştu, Luxiaya ulaş:', error); 
        }
    },
};
