const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, embedLength, MessageFlagsBitField } = require("discord.js");
const { JsonDatabase } = require("slenzy.db");
const db = new JsonDatabase({ path: "./database/database.json" });
const raven_text = require("raven_text");
require("dotenv").config();

module.exports = {
    name: "başvuru-ayarla",
    description: 'Başvuru sistemini kurarsınız.',
    type: 1,
    options: [
        {
            name: "kanal",
            description: 'Kanal seçiniz.',
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "ekstra-not",
            description: 'Embed içeriğini not yazarsınız.',
            type: 3,
            required: false
        }
    ],
    /** @param {import("discord.js").ChatInputCommandInteraction} interaction */
    run: async (client, interaction) => {
        // Option's
        const channel = interaction.options.getChannel('kanal');
        const note = interaction.options.getString('ekstra-not');
        // Embed's
        const basarili = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Başarıyla \`#${channel.name}\` adlı kanala başvuru sistemini kurdum.`)
        const yetki_yok = new EmbedBuilder()
            .setColor("Red")
            .setDescription('Yetkin yetersiz.')
        const guild_send_1 = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
            .setDescription(`> Merhaba, sunucumuzda yetkili olmaya ne dersin?\n\n• Sunucumuzda yetkili olmak için aşağıdaki butonu kullanabilirsiniz.\n• Aşağıdaki butona basmadan önce aşağıdaki \`Alım Şartları\` kısmını okuyunuz.\n• Okuduktan sonra \`Başvuruya Katıl\` butonuna basarak başvuru yapabilirsiniz.\n\n${raven_text.text()}`)
            .addFields([
                {
                    name: "📋 Alım Şartları",
                    value: `• \`${process.env.ALIM_1}\`\n----------------------\n• \`${process.env.ALIM_2}\`\n----------------------\n• \`${process.env.ALIM_3}\`\n----------------------\n• \`${process.env.ALIM_4}\`\n----------------------\n• \`${process.env.ALIM_5}\``,
                    inline: true
                }
            ])
        const guild_send_2 = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
            .setDescription(`> Merhaba, sunucumuzda yetkili olmaya ne dersin?\n\n• Sunucumuzda yetkili olmak için aşağıdaki butonu kullanabilirsiniz.\n• Aşağıdaki butona basmadan önce aşağıdaki \`Alım Şartları\` kısmını okuyunuz.\n• Okuduktan sonra \`Başvuruya Katıl\` butonuna basarak başvuru yapabilirsiniz.\n• Sunucu sahibinin size bir notu var \`Ekstra Not\` bölümünü okuyunuz.\n\n${raven_text.text()}`)
            .addFields([
                {
                    name: "📋 Alım Şartları",
                    value: `• \`${process.env.ALIM_1}\`\n----------------------\n• \`${process.env.ALIM_2}\`\n----------------------\n• \`${process.env.ALIM_3}\`\n----------------------\n• \`${process.env.ALIM_4}\`\n----------------------\n• \`${process.env.ALIM_5}\``,
                    inline: true
                },
                {
                    name: "📝 Ekstra Not",
                    value: `• ${note}`,
                    inline: true
                }
            ])
        // Button's
        const basvuru_katil = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Başvuruya Katıl")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('basvuruKatil')
            )
        if (interaction.user.id !== process.env.KURUCU_ID) return interaction.reply({ embeds: [yetki_yok], ephemeral: true });
        interaction.reply({ embeds: [basarili], ephemeral: true });
        if (note) {
            channel.send({ embeds: [guild_send_2], components: [basvuru_katil] });
            db.set(`başvuruSistemi${interaction.guild.id}`, true);
        } else {
            db.set(`başvuruSistemi${interaction.guild.id}`, false);
            channel.send({ embeds: [guild_send_1], components: [basvuru_katil] });
        }
    }
}
/*
name: "📝 • Ekstra Not"
 */