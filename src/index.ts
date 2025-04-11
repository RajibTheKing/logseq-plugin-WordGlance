import '@logseq/libs';
import { germanWords, Word } from './words';

type WordState = {
  currentWord: Word;
  showingDetails: boolean;
  uuid: string;
};

const wordStates = new Map<string, WordState>();

function getRandomWord(): Word {
  return germanWords[Math.floor(Math.random() * germanWords.length)];
}

function createWordView(state: WordState): string {
  const { currentWord, showingDetails } = state;
  return `
    <div class="word-glance-container">
      <div class="word-display">
        <h2 class="word">${currentWord.word}</h2>
        <div class="word-details">
            <p><strong>Translation:</strong> ${currentWord.translation}</p>
            <p><strong>Part of speech:</strong> ${currentWord.partOfSpeech}</p>
            <p><strong>Pronunciation:</strong> ${currentWord.pronunciation}</p>
            <p><strong>Example:</strong> ${currentWord.example}</p>
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

  if (state.showingDetails) {
    // Get new word
    state.currentWord = getRandomWord();
    state.showingDetails = false;
  } else {
    // Show details
    state.showingDetails = true;
  }

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
      showingDetails: false,
      uuid
    });

    // Create initial view
    await logseq.Editor.updateBlock(uuid, createWordView({
      currentWord,
      showingDetails: false,
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

  // Handle clicks from existing blocks on load
  logseq.App.onPageHeadActionsLoaded(async ({ uuid }) => {
    const block = await logseq.Editor.getBlock(uuid);
    if (block?.content?.includes('word-glance-container')) {
      const match = block.content.match(/data-on-click="handleClick-(.*?)"/);
      if (match && match[1]) {
        const existingUuid = match[1];
        if (!wordStates.has(existingUuid)) {
          wordStates.set(existingUuid, {
            currentWord: getRandomWord(),
            showingDetails: false,
            uuid: existingUuid
          });
        }
      }
    }
  });
}

logseq.ready(main).catch(console.error);