const {
  PermissionsBitField,
  EmbedBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
  ChannelType,
  Partials,
  ActionRowBuilder,
  SelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  SelectMenuInteraction,
  ButtonBuilder,
  AuditLogEvent,
} = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();

const client = new Client({
  intents: Object.values(Discord.IntentsBitField.Flags),
  partials: Object.values(Partials),
});

const chalk = require("chalk");
const { JsonDatabase } = require("slenzy.db");
const db = new JsonDatabase({ path: "./database/database.json" });

global.client = client;
client.commands = global.commands = [];
const { readdirSync } = require("fs");
readdirSync("./commands").forEach((f) => {
  if (!f.endsWith(".js")) return;

  const props = require(`./commands/${f}`);

  client.commands.push({
    name: props.name.toLowerCase(),
    description: props.description,
    options: props.options,
    dm_permission: false,
    type: 1,
  });
  console.log(chalk.red`[COMMAND]` + ` ${props.name} komutu yüklendi.`);
});

readdirSync("./events").forEach((e) => {
  const eve = require(`./events/${e}`);
  const name = e.split(".")[0];

  client.on(name, (...args) => {
    eve(client, ...args);
  });
  console.log(chalk.blue`[EVENT]` + ` ${name} eventi yüklendi.`);
});

client.login(process.env.TOKEN);

process.on("unhandledRejection", async (error) => {
  return console.log(chalk.red(`Bir hata oluştu!\n\n${error}`));
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'basvuruKatil') {
      // Embed's
      const zaten_yetklisin = new EmbedBuilder()
        .setColor("Red")
        .setDescription('Dostum zaten yetkilisin neden başvuru oluşturmak istiyorsun?')
      const veriyi_bulamadim = new EmbedBuilder()
        .setColor("Red")
        .setDescription('Dostum botta veriyi bulamadım.')
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
        .setDescription('> Heyy dostum, başvuru yapmak istediğine emin misin?')

      // Button's
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Eminim")
            .setStyle(ButtonStyle.Success)
            .setCustomId('eminim'),
          new ButtonBuilder()
            .setLabel("İptal Et")
            .setStyle(ButtonStyle.Danger)
            .setCustomId('iptalEt')
        )
      if (interaction.member.roles.cache.has(process.env.YETKILI_ROL_ID)) {
        interaction.reply({ embeds: [zaten_yetklisin], ephemeral: true });
      } else {
        if (!db.has(`başvuruSistemi${interaction.guild.id}`)) return interaction.reply({ embeds: [veriyi_bulamadim], ephemeral: true });
        interaction.reply({ embeds: [embed], components: [button], ephemeral: true });
      }
    };
    if (interaction.customId === 'eminim') {
      // Embed's
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
        .setDescription('> Aşağıdaki `Başvuruya Git` butonuna basarak başvuruya gidebilirsin.')
      // Button's
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Eminim")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setCustomId("eminim"),
          new ButtonBuilder()
            .setLabel("Başvuruya Git")
            .setStyle(ButtonStyle.Primary)
            .setCustomId('basvuruyaGit')
        )
      interaction.update({ embeds: [embed], components: [button] });
    };
    if (interaction.customId === 'basvuruyaGit') {
      const modal = new ModalBuilder()
        .setCustomId('form')
        .setTitle('Başvuru Formu')
      const plugin_1 = new TextInputBuilder()
        .setCustomId('plugin_1')
        .setLabel('Adınız')
        .setMaxLength(25)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örnek: Ege')
        .setRequired(true)
      const plugin_2 = new TextInputBuilder()
        .setCustomId('plugin_2')
        .setLabel('Yaşınız')
        .setMaxLength(2)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örnek: 15')
        .setRequired(true)
      const plugin_3 = new TextInputBuilder()
        .setCustomId('plugin_3')
        .setLabel('Tecrübeleriniz')
        .setMaxLength(1500)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örnek: 2 yıldır programlama ile uğraşıyorum.')
        .setRequired(true)
      const plugin_4 = new TextInputBuilder()
        .setCustomId('plugin_4')
        .setLabel('Bildiğiniz Diller')
        .setMaxLength(50)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örnek: English, German')
        .setRequired(true)
      const plugin_5 = new TextInputBuilder()
        .setCustomId('plugin_5')
        .setLabel('Bildiğiniz Yazılım Dilleri')
        .setMaxLength(75)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örnek: Html, Css, Js, Ts')
        .setRequired(true)
      const row_1 = new ActionRowBuilder().addComponents(plugin_1)
      const row_2 = new ActionRowBuilder().addComponents(plugin_2)
      const row_3 = new ActionRowBuilder().addComponents(plugin_3)
      const row_4 = new ActionRowBuilder().addComponents(plugin_4)
      const row_5 = new ActionRowBuilder().addComponents(plugin_5)
      modal.addComponents(row_1, row_2, row_3, row_4, row_5);
      await interaction.showModal(modal);
    }
  };
  if (interaction.type === InteractionType.ModalSubmit) {
    db.set("data", interaction.user.username);
    db.set("data1", interaction.user.id);
    const adiniz = interaction.fields.getTextInputValue('plugin_1');
    const yasiniz = interaction.fields.getTextInputValue('plugin_2');
    const tecrubeleriniz = interaction.fields.getTextInputValue('plugin_3');
    const bildiginiz_diller = interaction.fields.getTextInputValue('plugin_4');
    const bildiginiz_yazilim_dilleri = interaction.fields.getTextInputValue('plugin_5');
    if (process.env.MONGO_TRUE_FALSE === 'true') {
      try {
        const Schema = new mongoose.Schema({
          adiniz: String,
          yasiniz: String,
          tecrubeleriniz: String,
          bildiginiz_diller: String,
          bildiginiz_yazilim_dilleri: String
        });

        const modal = mongoose.model(`basvuru_${interaction.user.id}`, Schema);

        mongoose.connect(process.env.MONGO, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        const Data = {
          adiniz: `${adiniz}`,
          yasiniz: `${yasiniz}`,
          tecrubeleriniz: `${tecrubeleriniz}`,
          bildiginiz_diller: `${bildiginiz_diller}`,
          bildiginiz_yazilim_dilleri: `${bildiginiz_yazilim_dilleri}`
        };

        const data = new modal(Data);
        data.save().then(() => {
          mongoose.connection.close();
        });
        // Embed's
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
          .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
          .setDescription(`> **${interaction.user.username}** kullanıcısı bir başvuru talebinde bulundu aşağıda bilgiler yer almaktadır.`)
          .addFields([
            {
              name: "👤 Adınız",
              value: `• \`${adiniz}\``,
              inline: true
            },
            {
              name: "👤 Yaşınız",
              value: `• \`${yasiniz}\``,
              inline: true
            },
            {
              name: "🌐 Tecrübeleri",
              value: `• \`${tecrubeleriniz}\``,
              inline: true
            },
            {
              name: "💬 Bildiği Diller",
              value: `• \`${bildiginiz_diller}\``,
              inline: true
            },
            {
              name: "💻 Bildiği Yazılım Dilleri",
              value: `• \`${bildiginiz_yazilim_dilleri}\``,
              inline: true
            }
          ])
        const embed2 = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
          .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
          .setDescription('> 🎉 Tebrikler dostum, başarıyla başvurun gönderildi.')
        // Button's
        const button2 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("Eminim")
              .setStyle(ButtonStyle.Success)
              .setDisabled(true)
              .setCustomId("eminim"),
            new ButtonBuilder()
              .setLabel("Başvuruya Git")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
              .setCustomId('basvuruyaGit')
          )
        const button3 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("Onayla")
              .setStyle(ButtonStyle.Success)
              .setCustomId('onayla'),
            new ButtonBuilder()
              .setLabel("Reddet")
              .setStyle(ButtonStyle.Danger)
              .setCustomId('reddet'),
          )

        await interaction.update({ embeds: [embed2], components: [button2] });


        client.channels.cache.get(process.env.BASVURU_LOG_KANAL_ID).send({ embeds: [embed], components: [button3] });
      } catch (err) {

      }
    } else {
      // Embed's
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
        .setDescription(`> **${interaction.user.username}** kullanıcısı bir başvuru talebinde bulundu aşağıda bilgiler yer almaktadır.`)
        .addFields([
          {
            name: "👤 Adınız",
            value: `• \`${adiniz}\``,
            inline: true
          },
          {
            name: "👤 Yaşınız",
            value: `• \`${yasiniz}\``,
            inline: true
          },
          {
            name: "🌐 Tecrübeleri",
            value: `• \`${tecrubeleriniz}\``,
            inline: true
          },
          {
            name: "💬 Bildiği Diller",
            value: `• \`${bildiginiz_diller}\``,
            inline: true
          },
          {
            name: "💻 Bildiği Yazılım Dilleri",
            value: `• \`${bildiginiz_yazilim_dilleri}\``,
            inline: true
          }
        ])
      const embed2 = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
        .setDescription('> 🎉 Tebrikler dostum, başarıyla başvurun gönderildi.')
      // Button's
      const button2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Eminim")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setCustomId("eminim"),
          new ButtonBuilder()
            .setLabel("Başvuruya Git")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
            .setCustomId('basvuruyaGit')
        )
      const button3 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Onayla")
            .setStyle(ButtonStyle.Success)
            .setCustomId('onayla'),
          new ButtonBuilder()
            .setLabel("Reddet")
            .setStyle(ButtonStyle.Danger)
            .setCustomId('reddet'),
        )

      await interaction.update({ embeds: [embed2], components: [button2] });


      client.channels.cache.get(process.env.BASVURU_LOG_KANAL_ID).send({ embeds: [embed], components: [button3] });
    }
  };
  if (interaction.customId === 'onayla') {
    // Embed's
    const err = new EmbedBuilder()
      .setColor("Red")
      .setDescription('Bu komudu kullanabilmek için `Yetkili` rolüne ihtiyacın var')
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`> Heyy **${db.get("data")}** yapmış olduğun başvuru kabul edilmiştir yetkililer en kısa sürede aşağıdaki \`Yetkisini Ver\` butonunu kullanarak yetkini verecektir.`)
    const embed1 = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`> **${db.get("data")}** adlı kullanıcının başvurusu kabul edildi.`)
      .addFields([
        {
          name: "📧 Başvuruyu Kabul Eden",
          value: `**${interaction.user.username}**`,
          inline: true
        },
        {
          name: "📧 Başvurusu Kabul Edilen",
          value: `**${db.get("data")}**`,
          inline: true
        }
      ])
    // Button's
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Yetkisini Ver")
          .setStyle(ButtonStyle.Danger)
          .setCustomId('yetkisiniVer')
      )
    if (interaction.member.roles.cache.has(process.env.YETKILI_ONAYLAYICI_ROL_ID)) {
      client.channels.cache.get(process.env.BASVURU_ONAY_RED_KANAL_ID).send({ embeds: [embed], components: [button] });
      interaction.update({ embeds: [embed1], components: [] });
    } else {
      interaction.reply({ embeds: [err], ephemeral: true });
    }
  };
  if (interaction.customId === 'yetkisiniVer') {
    // Embed's
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`> **${interaction.user.username}** adlı kullanıcı \`Yetkisini Ver\` butonunu kullandı ve **${db.get("data")}** adlı kullanıcıya yetkisi verildi.`)
      .addFields([
        {
          name: "🎓 Verilen Rol",
          value: `<@&${process.env.YETKILI_ROL_ID || 'Rol Bulunamadı.'}>`,
          inline: true
        }
      ])
      .setFooter({ text: "Hayırlı Olsun." })
    const zaten_yetklisin = new EmbedBuilder()
      .setColor("Red")
      .setDescription('Dostum bunu yapmaya yetkin yok malesef.')
    // Button's
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Yetkisini Ver")
          .setStyle(ButtonStyle.Danger)
          .setCustomId('yetkisiniVer')
          .setDisabled(true)
      )
    if (!interaction.member.roles.cache.has(process.env.BASVURU_YETKISINI_VERICEK_ROL_ID)) return interaction.reply({ embeds: [zaten_yetklisin], ephemeral: true });
    const database = db.get("data1");
    const member = interaction.guild.members.cache.get(database);
    member.roles.add(process.env.YETKILI_ROL_ID);
    interaction.update({ embeds: [embed], components: [button] });
  };
  if (interaction.customId === 'iptalEt') {
    // Embed's
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`**${interaction.user.username}** başarıyla başvurmanızı iptal ettim.`)
    interaction.update({ embeds: [embed], components: [], ephemeral: true });
  };
  if (interaction.customId === 'reddet') {
    // Embed's
    const err = new EmbedBuilder()
      .setColor("Red")
      .setDescription('Bu komudu kullanabilmek için `Yetkili` rolüne ihtiyacın var')
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`> **${db.get("data")}** yapmış olduğun başvuru malesef reddedildi.`)
    const embed1 = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`${interaction.guild.name} - Başvuru Sistemi`)
      .setDescription(`> **${db.get("data")}** adlı kullanıcının başvurusu reddedildi.`)
      .addFields([
        {
          name: "📧 Başvuruyu Reddeden",
          value: `**${interaction.user.username}**`,
          inline: true
        },
        {
          name: "📧 Başvurusu Reddedilen",
          value: `**${db.get("data")}**`,
          inline: true
        }
      ])
    if (interaction.member.roles.cache.has(process.env.YETKILI_ONAYLAYICI_ROL_ID)) {
      client.channels.cache.get(process.env.BASVURU_ONAY_RED_KANAL_ID).send({ embeds: [embed] });
      interaction.update({ embeds: [embed1], components: [] });
    } else {
      interaction.reply({ embeds: [err], ephemeral: true });
    }
  };
});