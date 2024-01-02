import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { NyaaResult } from '../types.js';
import { relations } from 'drizzle-orm';

export const animes = sqliteTable(
  'animes',
  {
    id: integer('id', { mode: 'number' })
      .primaryKey({ autoIncrement: true })
      .notNull(),
    name: text('name').notNull(),
    season: integer('season').notNull(),
    episode: integer('episode').notNull(),
    maxEpisode: integer('maxEpisode').notNull(),
    dayOfRelease: text('dayOfRelease', {
      enum: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]
    }).notNull(),
    status: text('status', {
      enum: ['awaitingConfirmation', 'idle', 'done', 'dropped']
    }).notNull()
  },
  (t) => ({
    unq: unique().on(t.name, t.season)
  })
);

export const messages = sqliteTable('messages', {
  id: integer('id', { mode: 'number' })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  animeId: integer('animeId')
    .notNull()
    .references(() => animes.id),
  discordMessageId: text('discordMessageId').notNull(),
  data: text('data', { mode: 'json' }).notNull().$type<NyaaResult[]>(),
  isStale: integer('isStale', { mode: 'boolean' }).notNull().default(false)
});

export const messagesRelations = relations(messages, ({ one }) => ({
  anime: one(animes, {
    fields: [messages.animeId],
    references: [animes.id]
  })
}));
