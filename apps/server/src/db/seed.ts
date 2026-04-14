import { pool } from './client.js'
import { gameSeeds, wordSeeds } from '../data/vocabulary.js'

async function main() {
  for (const game of gameSeeds) {
    await pool.query(
      `
        INSERT INTO games (slug, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug)
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
      `,
      [game.slug, game.name, game.description]
    )
  }

  for (const word of wordSeeds) {
    await pool.query(
      `
        INSERT INTO words (word, definition, example_sentence, difficulty, part_of_speech, length)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (word)
        DO UPDATE SET
          definition = EXCLUDED.definition,
          example_sentence = EXCLUDED.example_sentence,
          difficulty = EXCLUDED.difficulty,
          part_of_speech = EXCLUDED.part_of_speech,
          length = EXCLUDED.length
      `,
      [
        word.word.toLowerCase(),
        word.definition,
        word.exampleSentence,
        word.difficulty,
        word.partOfSpeech,
        word.word.length,
      ]
    )
  }

  console.log(`Seeded ${gameSeeds.length} games and ${wordSeeds.length} words`)
  await pool.end()
}

main().catch(async (error) => {
  console.error('Failed to seed database', error)
  await pool.end()
  process.exit(1)
})
