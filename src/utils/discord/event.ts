import { Client } from 'discord.js';
import { DiscordEvent, DiscordEventExec, DiscordEventKeys } from '../../types.js';
import WebTorrent from 'webtorrent';

export function event<T extends DiscordEventKeys>(
  id: T,
  exec: DiscordEventExec<T>,
  once: boolean = false
): DiscordEvent<T> {
  return { id, exec, once };
}

export function registerEvents(
  events: DiscordEvent<any>[],
  client: Client,
  torrentClient: WebTorrent.Instance
): void {
  for (const event of events) {
    if (event.once) {
      client.once(event.id, async (...args) => {
        const props = {
          client,
          log: (...args: unknown[]) => console.log(`[${event.id}]`, ...args),
          torrentClient
        };
        try {
          await event.exec(props, ...args);
        } catch (error) {
          props.log('Uncaught Error', error);
        }
      });
    } else {
      client.on(event.id, async (...args) => {
        const props = {
          client,
          log: (...args: unknown[]) => console.log(`[${event.id}]`, ...args),
          torrentClient
        };
        try {
          await event.exec(props, ...args);
        } catch (error) {
          props.log('Uncaught Error', error);
        }
      });
    }
  }
}
