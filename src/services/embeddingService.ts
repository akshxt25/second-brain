import { pipeline, env } from '@xenova/transformers';

// Tell transformers.js to download models to a local cache directory
// and not to use browser-specific environments
env.localModelPath = './models';
env.allowRemoteModels = true;
env.backends.onnx.wasm.numThreads = 1;

let extractor: any = null;

// Lazy load the model pipeline
async function getExtractor() {
  if (!extractor) {
    console.log("Loading embedding model (this may take a few seconds on first run)...");
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Model loaded successfully!");
  }
  return extractor;
}

/**
 * Build a searchable text string from content fields.
 * Example output: "[Youtube] My Video Title #Productivity some user notes here"
 */
export function buildContextText(
  contentType: string,
  title: string,
  tags: string[],
  notes?: string
): string {
  const parts: string[] = [];

  if (contentType) {
    parts.push(`[${contentType}]`);
  }
  if (title) {
    parts.push(title);
  }
  if (tags && tags.length > 0) {
    parts.push(tags.map((t) => `#${t}`).join(" "));
  }
  if (notes && notes.trim()) {
    parts.push(notes.trim());
  }

  return parts.join(" ");
}

/**
 * Split long text into smaller chunks with overlap.
 * Each chunk is at most `maxChars` characters, with `overlap` characters
 * of overlap between consecutive chunks.
 */
export function chunkText(
  text: string,
  maxChars: number = 500,
  overlap: number = 50
): string[] {
  if (!text || text.length === 0) return [];
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));

    if (end === text.length) break;
    start = end - overlap;
  }

  return chunks;
}

/**
 * Generate an embedding vector for a given text using Xenova/all-MiniLM-L6-v2.
 * Returns a 384-dimensional number array.
 *
 * If the text is long, it chunks it and averages the embeddings.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return [];
  }

  const model = await getExtractor();

  // If there's only one chunk, just embed it directly
  if (chunks.length === 1) {
    const output = await model(chunks[0], { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  // If there are multiple chunks, embed them all and average them
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const output = await model(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  const dimensions = 384; // all-MiniLM-L6-v2 dimension size
  const averaged = new Array(dimensions).fill(0);

  for (const emb of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      averaged[i] += emb[i];
    }
  }

  // Average and normalize the final vector
  const count = embeddings.length;
  let magnitude = 0;
  for (let i = 0; i < dimensions; i++) {
    averaged[i] /= count;
    magnitude += averaged[i] * averaged[i];
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      averaged[i] /= magnitude;
    }
  }

  return averaged;
}
