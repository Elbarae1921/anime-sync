import { Events } from 'discord.js';
import commands from '../commands/index.js';
import { DiscordCommand } from '../types.js';
import { event } from '../utils/discord/event.js';
import { Reply } from '../utils/discord/reply.js';

const allCommandsMap = new Map<string, DiscordCommand>(
  commands.map((c) => [c.meta.name, c])
);

export default event(
  Events.InteractionCreate,
  async ({ log, client }, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      const commandName = interaction.commandName;
      const command = allCommandsMap.get(commandName);

      if (!command) throw new Error('Command not found...');

      await command.exec({
        client,
        interaction,
        log(...args) {
          log(`[${command.meta.name}]`, ...args);
        }
      });
    } catch (error) {
      log('[Command Error]', error);

      if (interaction.deferred) {
        return interaction.editReply(
          Reply.error('Something went wrong :(')
        );
      }

      return interaction.reply(Reply.error('Something went wrong :('));
    }
  }
);
