import {
  DiscordCommand,
  DiscordCommandExec,
  DiscordCommandMeta
} from '../../types.js';

export function command(
  meta: DiscordCommandMeta,
  exec: DiscordCommandExec
): DiscordCommand {
  return { meta, exec };
}
