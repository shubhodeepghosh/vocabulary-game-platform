-- Insert sample words for different difficulty levels
INSERT INTO public.word_lists (word, definition, difficulty, word_category, example_sentence, pronunciation) VALUES
-- Easy words
('HELLO', 'A polite greeting', 'easy', 'greeting', 'Hello, how are you today?', 'huh-LOH'),
('WORLD', 'The Earth and all its inhabitants', 'easy', 'noun', 'Welcome to the world', 'WURLD'),
('APPLE', 'A round red fruit', 'easy', 'food', 'I eat an apple every day', 'AP-ul'),
('HAPPY', 'Feeling or showing pleasure', 'easy', 'emotion', 'I am happy to see you', 'HAP-ee'),
('LIGHT', 'Electromagnetic radiation visible to the eye', 'easy', 'noun', 'The light from the lamp is bright', 'LITE'),
('MUSIC', 'Organized sounds with rhythm and melody', 'easy', 'art', 'I love listening to music', 'MYU-zik'),
('WATER', 'A clear liquid that covers most of Earth', 'easy', 'noun', 'Drink water to stay healthy', 'WAW-tur'),
('DREAM', 'A series of images during sleep', 'easy', 'noun', 'I had a strange dream last night', 'DREEM'),
('SMILE', 'A facial expression of happiness', 'easy', 'expression', 'She gave me a warm smile', 'SMYL'),
('OCEAN', 'A large body of salt water', 'easy', 'geography', 'The ocean is beautiful at sunset', 'OH-shun'),

-- Medium words
('SERENDIPITY', 'Finding something good by chance', 'medium', 'abstract', 'Meeting you was pure serendipity', 'ser-un-dip-uh-tee'),
('ELOQUENT', 'Fluent and persuasive in speaking', 'medium', 'adjective', 'The speaker was eloquent and engaging', 'EL-uh-kwunt'),
('PERSEVERE', 'To persist despite difficulty', 'medium', 'verb', 'You must persevere to achieve your goals', 'pur-suh-VEER'),
('BENEVOLENT', 'Kind and charitable', 'medium', 'adjective', 'The benevolent donations helped many', 'buh-NEV-uh-lunt'),
('METICULOUS', 'Very careful and precise', 'medium', 'adjective', 'She is meticulous with her work', 'muh-TIK-yuh-lus'),
('EPHEMERAL', 'Lasting a very short time', 'medium', 'adjective', 'The beauty of flowers is ephemeral', 'uh-FEM-ur-ul'),
('PRAGMATIC', 'Dealing with things in a practical way', 'medium', 'adjective', 'Take a pragmatic approach to the problem', 'prag-MAT-ik'),
('NOSTALGIA', 'Sentimental longing for the past', 'medium', 'emotion', 'I feel nostalgia when I see old photos', 'nuh-STAL-juh'),
('ZENITH', 'The peak or highest point', 'medium', 'noun', 'She reached the zenith of her career', 'ZEN-ith'),
('LUCID', 'Clear and easy to understand', 'medium', 'adjective', 'His explanation was lucid and helpful', 'LOO-sid'),

-- Hard words
('OBFUSCATE', 'To deliberately make something unclear', 'hard', 'verb', 'They tried to obfuscate the truth', 'ob-FUS-kayt'),
('ANTIDISESTABLISHMENTARIANISM', 'Opposition to removing church influence from government', 'hard', 'noun', 'Historical antidisestablishmentarianism shaped politics', 'an-ty-dis-uh-BLISH-mun-tar-ee-uh-niz-um'),
('PUSILLANIMOUS', 'Lacking courage or determination', 'hard', 'adjective', 'His pusillanimous response disappointed everyone', 'pyoo-suh-LAN-uh-mus'),
('SESQUIPEDALIAN', 'Characterized by long words; long-winded', 'hard', 'adjective', 'The sesquipedalian prose was difficult to read', 'ses-kwuh-puh-DAYL-yun'),
('DEFENESTRATION', 'The action of throwing someone out a window', 'hard', 'noun', 'Medieval defenestration was a brutal act', 'def-uh-nes-TRAY-shun'),
('CALLIPYGOUS', 'Having shapely buttocks', 'hard', 'adjective', 'The statue was praised for its callipygous form', 'kuh-LIP-uh-gus'),
('ABECEDARIAN', 'A person who is learning the alphabet', 'hard', 'noun', 'The abecedarian student practiced daily', 'ay-bee-see-DAIR-ee-un'),
('SESQUICENTENNIAL', 'The 150th anniversary', 'hard', 'noun', 'They celebrated the sesquicentennial with fanfare', 'ses-kwuh-sen-TEN-ee-ul'),
('PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS', 'A lung disease from inhaling volcanic ash', 'hard', 'noun', 'The word pneumonoultramicroscopicsilicovolcanoconiosis is famously long', 'noo-muh-noh-ul-truh-my-kruh-skop-ik-sil-uh-koh-vol-kay-noh-koh-nee-OH-sis'),
('LOQUACIOUS', 'Tending to talk a great deal', 'hard', 'adjective', 'The loquacious guest dominated the conversation', 'loh-KWAY-shus')
ON CONFLICT DO NOTHING;
