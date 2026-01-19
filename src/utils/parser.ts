/**
 * Natural language parser for text adventure commands
 */

import type { Parse, Context, Lexicon } from '../types';
import { PRONOUNS, PERSONS, INTENTS, VERBS, PREPOSITIONS, ADJECTIVES, NOUNS } from './lexicons';

/**
 * Normalize special compound words and character names
 */
export function normalizeWord(w: string): string {
  if (w === 'turnon') return 'turnon';
  if (w === 'getin') return 'getin';
  if (w === 'goin') return 'goin';
  if (w === 'escapepod') return 'pod';
  if (w === 'warpmotivator') return 'motivator';
  if (w === 'junkbay') return 'bay';
  if (w === 'roger' || w === 'wilco' || w === 'rogerwilco') return 'roger';
  if (w === 'scene2') return 'scene';
  return w;
}

/**
 * Check if any of the provided items exist in the set
 */
export function hasAny(set: Set<string>, ...items: string[]): boolean {
  return items.some((item) => set.has(item));
}

/**
 * Detect if input is a question
 */
export function isQuestionish(raw: string, rawWords: string[]): boolean {
  if (raw.includes('?')) {
    return true;
  }

  if (rawWords.length === 0) {
    return false;
  }

  const first = rawWords[0].toLowerCase();
  const questionStarters = [
    'what',
    'why',
    'how',
    'where',
    'who',
    'when',
    'tell',
    'explain',
    'describe',
    'can',
    'should',
    'is',
    'are',
    'do',
    'does',
  ];

  return questionStarters.includes(first);
}

/**
 * Resolve pronouns to concrete nouns based on context
 */
export function resolvePronouns(
  nouns: Set<string>,
  pronouns: Set<string>,
  ctx: Context,
): Set<string> {
  // If we already have explicit nouns, no resolution needed
  if (nouns.size > 0) {
    return new Set();
  }

  const resolved = new Set<string>();

  for (const p of pronouns) {
    if (p === 'it' || p === 'that' || p === 'this') {
      if (ctx.lastFocus) {
        resolved.add(ctx.lastFocus);
      }
    } else if (p === 'him') {
      if (ctx.lastFocus === 'roger') {
        resolved.add('roger');
      }
    } else if (p === 'her') {
      // No female characters yet, but structure is here
    } else if (p === 'there' || p === 'here') {
      if (ctx.lastFocus) {
        resolved.add(ctx.lastFocus);
      }
    }
  }

  return resolved;
}

/**
 * Main parser: converts natural language input into structured Parse object
 */
export function parse(
  input: string,
  ctx: Context,
  extraNouns: Lexicon = {},
  extraVerbs: Lexicon = {},
  extraAdjs: Lexicon = {},
): Parse {
  // Normalize input
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/[.,!;]+/g, ' ');
  clean = clean.replace(/\s+/g, ' ');

  const rawWords = clean.split(' ').filter((w) => w.length > 0);

  const question = isQuestionish(input, rawWords);

  // Initialize parse structure
  const intents = new Set<string>();
  const verbs = new Set<string>();
  const nouns = new Set<string>();
  const adjs = new Set<string>();
  const preps = new Set<string>();
  const person = new Set<string>();
  const pronouns = new Set<string>();

  // Merge global and room-specific lexicons
  const allNouns = { ...NOUNS, ...extraNouns };
  const allVerbs = { ...VERBS, ...extraVerbs };
  const allAdjs = { ...ADJECTIVES, ...extraAdjs };

  // Classify each word
  for (const raw of rawWords) {
    const w = normalizeWord(raw);

    // Check lexicons in order
    if (PRONOUNS[w]) {
      pronouns.add(PRONOUNS[w]);
    }

    if (PERSONS[w]) {
      person.add(PERSONS[w]);
    }

    if (INTENTS[w]) {
      intents.add(INTENTS[w]);
    }

    if (allVerbs[w]) {
      verbs.add(allVerbs[w]);
    }

    if (allNouns[w]) {
      nouns.add(allNouns[w]);
    }

    if (allAdjs[w]) {
      adjs.add(allAdjs[w]);
    }

    if (PREPOSITIONS[w]) {
      preps.add(PREPOSITIONS[w]);
    }
  }

  // Infer intents from verbs
  if (verbs.has('look')) intents.add('look');
  if (verbs.has('take')) intents.add('take');
  if (verbs.has('use')) intents.add('use');
  if (verbs.has('move')) intents.add('move');
  if (verbs.has('open')) intents.add('open');
  if (verbs.has('close')) intents.add('close');
  if (verbs.has('talk')) intents.add('talk');
  if (verbs.has('smell')) intents.add('smell');
  if (verbs.has('listen')) intents.add('listen');
  if (verbs.has('touch')) intents.add('touch');
  if (verbs.has('taste')) intents.add('taste');
  if (verbs.has('break')) intents.add('break');
  if (verbs.has('search')) intents.add('search');
  if (verbs.has('scan')) intents.add('scan');
  if (verbs.has('read')) intents.add('read');
  if (verbs.has('press')) intents.add('press');
  if (verbs.has('clean')) intents.add('clean');
  if (verbs.has('approach')) intents.add('approach');
  if (verbs.has('enter')) intents.add('enter');
  if (verbs.has('throw')) intents.add('throw');
  if (verbs.has('kick')) intents.add('kick');
  if (verbs.has('jump')) intents.add('jump');
  if (verbs.has('wait')) intents.add('wait');
  if (verbs.has('climb')) intents.add('climb');
  if (verbs.has('start')) intents.add('start');

  // Resolve pronouns
  const resolvedPronouns = resolvePronouns(nouns, pronouns, ctx);
  for (const r of resolvedPronouns) {
    nouns.add(r);
  }

  // Build targets (nouns + persons)
  const targets = new Set([...nouns, ...person]);

  // Build 'all' set
  const all = new Set([
    ...rawWords.map(normalizeWord),
    ...intents,
    ...verbs,
    ...nouns,
    ...adjs,
    ...preps,
    ...person,
    ...pronouns,
  ]);

  return {
    rawWords,
    intents,
    verbs,
    nouns,
    adjs,
    preps,
    targets,
    question,
    person,
    pronouns,
    all,
  };
}
