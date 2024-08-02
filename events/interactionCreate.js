const { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const config = require("../config.json");

module.exports = {
    name: 'interactionCreate', // luxia
    once: false,
    async execute(interaction, client) {
        if (interaction.isButton()) {
            const buttonId = interaction.customId;
            if (buttonId.startsWith('register_button_')) {
                const memberId = buttonId.split('_')[2];
                const member = interaction.guild.members.cache.get(memberId);

                const allowedRoleId = config.kayıt.allowedRoleId;
                if (!interaction.member.roles.cache.has(allowedRoleId)) {
                    return interaction.reply({ content: `Bu işlemi yapabilmek için <@&${config.kayıt.allowedRoleId}> rolüne ihtiyacın var.`, ephemeral: true }); // luxia
                }

                const modal = new ModalBuilder()
                    .setCustomId(`register_modal_${memberId}`)
                    .setTitle('Kullanıcı İsmi Belirleme')
                    .addComponents(
                        new ActionRowBuilder().addComponents( // luxia
                            new TextInputBuilder()
                                .setCustomId('new_name')
                                .setLabel('Yeni kayıt')
                                .setStyle(TextInputStyle.Short)                     // luxia
                                .setPlaceholder('Kullanıcının yeni ismini buraya girin.')
                                .setRequired(true)
                        )
                    );

                await interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            const modalId = interaction.customId;
            if (modalId.startsWith('register_modal_')) {
                const memberId = modalId.split('_')[2];
                const member = interaction.guild.members.cache.get(memberId);

                const newName = interaction.fields.getTextInputValue('new_name');

                try {
                    await member.setNickname(newName);

                    // luxia
                    const kayıtlıRol = interaction.guild.roles.cache.find(role => role.id == config.kayıt.kayıtlıID);
                    if (kayıtlıRol) {
                        await member.roles.add(kayıtlıRol);
                        //await member.roles.add(config.kayıt.kayıtlıID2);
                        await member.roles.remove(config.kayıt.kayıtsızID);
                        await interaction.reply({ content: `✅ Kullanıcının ismi başarıyla "${newName}" olarak değiştirildi ve rol verildi.`, ephemeral: true });
                    } else {
                        console.error('Kayıtlı rol bulunamadı.');
                        await interaction.reply({ content: 'Kayıtlı rol bulunamadı.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('İsim değiştirme veya rol verme hatası:', error);
                    await interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
                }
            }
        }
    },
};
