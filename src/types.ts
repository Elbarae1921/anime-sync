import {
  Awaitable,
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ClientEvents
} from 'discord.js';
import WebTorrent from 'webtorrent';

type LoggerFunction = (...args: unknown[]) => void;

export type DiscordCommandExec = (
  props: DiscordCommandProps
) => Awaitable<unknown>;

export type DiscordCommandMeta =
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export interface DiscordCommandProps {
  interaction: ChatInputCommandInteraction;
  client: Client;
  log: LoggerFunction;
}

export interface DiscordCommand {
  meta: DiscordCommandMeta;
  exec: DiscordCommandExec;
}

export type DiscordEventKeys = keyof ClientEvents;

export type DiscordEventExec<T extends DiscordEventKeys> = (
  props: DiscordEventProps,
  ...args: ClientEvents[T]
) => Awaitable<unknown>;

export interface DiscordEventProps {
  client: Client;
  log: LoggerFunction;
  torrentClient: WebTorrent.Instance;
}

export interface DiscordEvent<T extends DiscordEventKeys> {
  id: T;
  exec: DiscordEventExec<T>;
  once: boolean;
}

export interface NyaaResult {
  name: string;
  url: string;
  seeders: string;
  leechers: string;
  size: string;
  date: string;
}
