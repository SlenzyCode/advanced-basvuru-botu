const { Collection, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("slenzy.db");
const db = new JsonDatabase({ path: "./database/database.json" });
const { readdirSync } = require("fs");

module.exports = async (client, interaction) => {

  if (interaction.isChatInputCommand()) {

    if (!interaction.guildId) return;

    readdirSync('./commands').forEach(f => {

      const cmd = require(`../commands/${f}`);

      if (interaction.commandName.toLowerCase() === cmd.name.toLowerCase()) {

        return cmd.run(client, interaction, db);
      }
    });
  }
};