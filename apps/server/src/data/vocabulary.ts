import { Difficulty, GameType } from '@keen/types'

export interface WordSeed {
  word: string
  definition: string
  exampleSentence: string
  difficulty: Difficulty
  partOfSpeech: string
}

export const wordSeeds: WordSeed[] = [
  { word: 'adapt', definition: 'to change so something fits a new use or condition', exampleSentence: 'Strong readers adapt their strategies to the text.', difficulty: 'easy', partOfSpeech: 'verb' },
  { word: 'brisk', definition: 'quick, lively, and energetic', exampleSentence: 'They took a brisk walk before class.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'calm', definition: 'free from excitement or nervous activity', exampleSentence: 'She stayed calm during the puzzle round.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'dwell', definition: 'to live in a place or to think about something for too long', exampleSentence: 'Do not dwell on one wrong guess.', difficulty: 'easy', partOfSpeech: 'verb' },
  { word: 'eager', definition: 'wanting to do something very much', exampleSentence: 'The eager team started the challenge immediately.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'flair', definition: 'a natural ability to do something well', exampleSentence: 'He has a flair for language games.', difficulty: 'easy', partOfSpeech: 'noun' },
  { word: 'glint', definition: 'a small flash of light', exampleSentence: 'A glint of confidence returned after the hint.', difficulty: 'easy', partOfSpeech: 'noun' },
  { word: 'harbor', definition: 'to keep a thought or feeling in the mind', exampleSentence: 'She did not harbor doubt for long.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'ignite', definition: 'to cause something to start burning or become active', exampleSentence: 'The first win can ignite a learning streak.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'jovial', definition: 'friendly and cheerful', exampleSentence: 'The host kept a jovial tone through the tournament.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'kindle', definition: 'to start a fire or inspire a feeling', exampleSentence: 'A great clue can kindle curiosity.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'lucid', definition: 'clear and easy to understand', exampleSentence: 'Her lucid explanation solved the clue.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'mosaic', definition: 'a picture or pattern made from many small pieces', exampleSentence: 'The dashboard felt like a mosaic of achievements.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'nurture', definition: 'to care for and help something grow', exampleSentence: 'Daily practice helps nurture strong vocabulary.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'opaque', definition: 'hard to understand or not transparent', exampleSentence: 'The vague hint felt opaque at first.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'prism', definition: 'a solid shape that can separate light into colors', exampleSentence: 'A prism split the beam into bands of color.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'quiver', definition: 'to shake with small rapid movements', exampleSentence: 'The tiles quiver after a wrong answer.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'radiant', definition: 'bright and glowing with happiness or light', exampleSentence: 'She looked radiant after topping the leaderboard.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'serene', definition: 'calm and peaceful', exampleSentence: 'The serene palette made the app feel focused.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'thrive', definition: 'to grow or develop well', exampleSentence: 'Players thrive when feedback is immediate.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'unravel', definition: 'to solve or explain something complicated', exampleSentence: 'The final clue helped unravel the mystery word.', difficulty: 'hard', partOfSpeech: 'verb' },
  { word: 'vibrant', definition: 'full of energy and bright life', exampleSentence: 'The vibrant cards keep the game inviting.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'wary', definition: 'careful because something could be risky', exampleSentence: 'Stay wary of repeated letters in Wordle.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'zenith', definition: 'the highest point or best moment', exampleSentence: 'Winning five rounds felt like a zenith.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'anchor', definition: 'something that gives support or stability', exampleSentence: 'The center letter acts like an anchor in spelling bee.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'fable', definition: 'a short story that usually teaches a lesson', exampleSentence: 'The hint read like a modern fable.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'vigor', definition: 'physical strength, energy, or force', exampleSentence: 'She attacked the rapid rounds with vigor.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'bravery', definition: 'the quality of being ready to face danger or pain', exampleSentence: 'Guessing boldly takes a little bravery.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'cascade', definition: 'a waterfall or a series of things falling or flowing together', exampleSentence: 'The hints arrived like a gentle cascade.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'celestial', definition: 'relating to the sky or outer space', exampleSentence: 'The game lobby now feels almost celestial.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'clarity', definition: 'the quality of being clear and easy to understand', exampleSentence: 'The new API brought clarity to the architecture.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'coastal', definition: 'related to the sea or coast', exampleSentence: 'The color palette felt coastal and calm.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'crisp', definition: 'fresh, clear, and neat', exampleSentence: 'A crisp clue can make the round feel rewarding.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'dapple', definition: 'a small contrasting spot or patch', exampleSentence: 'Soft dappled light filled the scene.', difficulty: 'hard', partOfSpeech: 'verb' },
  { word: 'daring', definition: 'showing courage and confidence', exampleSentence: 'A daring guess won the round.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'ember', definition: 'a small piece of burning or glowing coal or wood', exampleSentence: 'The confetti sparkled like an ember.', difficulty: 'easy', partOfSpeech: 'noun' },
  { word: 'enchant', definition: 'to attract and delight strongly', exampleSentence: 'The new theme should enchant players instantly.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'eloquent', definition: 'fluent and persuasive in speaking or writing', exampleSentence: 'Her eloquent answer won bonus points.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'fathom', definition: 'to understand something after much thought', exampleSentence: 'It took a moment to fathom the hidden clue.', difficulty: 'hard', partOfSpeech: 'verb' },
  { word: 'festival', definition: 'a time or event of celebration', exampleSentence: 'Every win should feel like a festival.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'fertile', definition: 'able to produce growth or good ideas', exampleSentence: 'A fertile mind notices language patterns.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'fable', definition: 'a short story that usually teaches a lesson', exampleSentence: 'The hint read like a modern fable.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'glimmer', definition: 'to shine faintly with a wavering light', exampleSentence: 'A glimmer of the answer showed up.', difficulty: 'medium', partOfSpeech: 'verb' },
  { word: 'harvest', definition: 'the process of gathering crops or a useful result', exampleSentence: 'The scoring curve felt like a harvest of points.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'galaxy', definition: 'a huge system of stars held together by gravity', exampleSentence: 'The score chart looked like a galaxy of progress.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'hollow', definition: 'having an empty space inside or sounding empty', exampleSentence: 'Avoid hollow guesses and stay precise.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'harmony', definition: 'a pleasing agreement between parts', exampleSentence: 'The frontend and backend moved in harmony.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'lattice', definition: 'a structure of crossed strips or a crisscross pattern', exampleSentence: 'The letter grid felt like a lattice of clues.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'insight', definition: 'a deep understanding of something', exampleSentence: 'The stat cards provide insight into improvement.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'journey', definition: 'the act of traveling from one place to another', exampleSentence: 'Vocabulary growth is a long journey.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'lively', definition: 'full of life and energy', exampleSentence: 'The interface should feel lively and warm.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'lantern', definition: 'a portable lamp with a protective case', exampleSentence: 'The hint served as a lantern in the dark round.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'meander', definition: 'to follow a winding path', exampleSentence: 'The story of the round can meander playfully.', difficulty: 'hard', partOfSpeech: 'verb' },
  { word: 'meadow', definition: 'a field of grass and wild flowers', exampleSentence: 'The background felt calm like a meadow.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'mellow', definition: 'soft, gentle, and relaxed', exampleSentence: 'The colors should stay mellow and kind to the eyes.', difficulty: 'easy', partOfSpeech: 'adjective' },
  { word: 'notion', definition: 'an idea or belief about something', exampleSentence: 'He had a notion that the answer started with s.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'oracle', definition: 'a person or source of wise guidance', exampleSentence: 'Each hint can feel like an oracle.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'orbit', definition: 'the curved path of one object around another', exampleSentence: 'The quiz choices orbit around the main idea.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'poised', definition: 'calm and ready for action', exampleSentence: 'The best players stay poised under pressure.', difficulty: 'medium', partOfSpeech: 'adjective' },
  { word: 'pristine', definition: 'clean and fresh as if new', exampleSentence: 'A pristine UI keeps players comfortable.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'pulse', definition: 'the steady beat of the heart or a rhythmic beat', exampleSentence: 'The music dock gives the game a pulse.', difficulty: 'easy', partOfSpeech: 'noun' },
  { word: 'quartz', definition: 'a hard mineral often used in watches and glass', exampleSentence: 'The timer felt as precise as quartz.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'ripple', definition: 'a small wave or spreading effect', exampleSentence: 'Every correct guess should send a ripple of joy.', difficulty: 'easy', partOfSpeech: 'noun' },
  { word: 'subtle', definition: 'delicate and not immediately obvious', exampleSentence: 'A subtle clue often separates good rounds from great ones.', difficulty: 'hard', partOfSpeech: 'adjective' },
  { word: 'saffron', definition: 'a bright orange-yellow color or spice', exampleSentence: 'The saffron accents feel warm and welcoming.', difficulty: 'medium', partOfSpeech: 'noun' },
  { word: 'serenade', definition: 'a musical performance or a sweet expressive song', exampleSentence: 'The music layer should feel like a serenade.', difficulty: 'hard', partOfSpeech: 'noun' },
  { word: 'resolve', definition: 'firm determination or the act of solving something', exampleSentence: 'Her resolve carried the streak forward.', difficulty: 'hard', partOfSpeech: 'noun' }
]

export const spellingBeePuzzles = [
  {
    difficulty: 'easy' as Difficulty,
    letters: ['A', 'E', 'H', 'N', 'R', 'S', 'T'],
    centerLetter: 'A',
    validWords: ['earn', 'earth', 'hater', 'heart', 'hears', 'near', 'rate', 'rates', 'share', 'shear', 'snare', 'stare', 'star', 'tear', 'tears'],
  },
  {
    difficulty: 'medium' as Difficulty,
    letters: ['O', 'D', 'G', 'L', 'N', 'R', 'W'],
    centerLetter: 'O',
    validWords: ['down', 'glow', 'gold', 'grow', 'growl', 'long', 'lord', 'word', 'world', 'wrong'],
  },
  {
    difficulty: 'hard' as Difficulty,
    letters: ['I', 'E', 'N', 'P', 'R', 'S', 'T'],
    centerLetter: 'I',
    validWords: ['inset', 'insert', 'inter', 'rinse', 'rise', 'risen', 'rite', 'siren', 'spire', 'spite', 'sprite', 'stir'],
  },
]

export const gameSeeds: Array<{
  slug: GameType
  name: string
  description: string
}> = [
  { slug: 'wordle', name: 'Wordle', description: 'Guess the hidden word with positional feedback.' },
  { slug: 'scramble', name: 'Scramble', description: 'Unscramble letters before the timer runs out.' },
  { slug: 'spelling-bee', name: 'Spelling Bee', description: 'Find words that obey the center letter rule.' },
  { slug: 'speed', name: 'Speed Vocab', description: 'Answer definition questions before time expires.' },
  { slug: 'quiz', name: 'Quiz', description: 'Multiple-choice vocabulary rounds with instant feedback.' },
]
