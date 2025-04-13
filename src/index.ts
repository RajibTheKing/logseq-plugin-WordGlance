import '@logseq/libs';
import { germanWords, Word } from './words';

type WordState = {
  currentWord: Word;
  uuid: string;
};

const wordStates = new Map<string, WordState>();

function getRandomWord(): Word {
  return germanWords[Math.floor(Math.random() * germanWords.length)];
}

function createWordView(state: WordState): string {
  const { currentWord } = state;
  return `
    <div style="font-family: Arial,
                sans-serif; display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 300px;
                padding: 10px;
                background: #2c3e50;
                border: 1px solid #4a6278;
                border-radius: 8px;">
      <div id="germanWord"
          style="font-size: 1.2em;
                  font-weight: bold;
                  color: #ffffff;
                  text-transform: capitalize;
                  margin-right: 10px;">
          ${currentWord.word}
      </div>
      <div id="englishMeaning"
          style="font-size: 0.8em;
                  color: #ecf0f1;
                  font-style: italic;">
          ${currentWord.translation}
      </div>
    </div>
  `;
}

async function updateWordView(uuid: string) {
  const state = wordStates.get(uuid);
  if (!state) return;

  await logseq.Editor.updateBlock(uuid, createWordView(state));
}

async function handleWordGlanceClick(uuid: string) {
  const state = wordStates.get(uuid);
  if (!state) return;
  state.currentWord = getRandomWord();
  await updateWordView(uuid);
}

async function main() {
  console.log('Word Glance plugin loaded');

  // Register slash command
  logseq.Editor.registerSlashCommand('wordglance', async () => {
    const block = await logseq.Editor.getCurrentBlock();
    if (!block?.uuid) return;

    const uuid = block.uuid;
    const currentWord = getRandomWord();

    // Store initial state
    wordStates.set(uuid, {
      currentWord,
      uuid
    });

    // Create initial view
    await logseq.Editor.updateBlock(uuid, createWordView({
      currentWord,
      uuid
    }));

    // Register click handler
    logseq.provideModel({
      [`handleClick-${uuid}`]: () => handleWordGlanceClick(uuid)
    });

    // Add click handler to block
    setTimeout(async () => {
      const blockContent = await logseq.Editor.getBlock(uuid);
      if (blockContent?.content) {
        const updatedContent = blockContent.content.replace(
          '<div class="word-glance-container">',
          `<div class="word-glance-container" data-on-click="handleClick-${uuid}">`
        );
        await logseq.Editor.updateBlock(uuid, updatedContent);
      }
    }, 300);
  });
}

logseq.ready(main).catch(console.error);