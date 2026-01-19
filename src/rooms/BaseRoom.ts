/**
 * Base Room class - provides common structure for all game rooms
 */

import type { IRoom, SceneFlags, Rule, Lexicon } from '../types';

export abstract class BaseRoom implements IRoom {
  abstract readonly id: string;
  abstract readonly backgroundPath: string;

  /**
   * Get default scene flags for this room
   */
  abstract getDefaultFlags(): Partial<SceneFlags>;

  /**
   * Get room-specific rules (to be combined with global rules)
   */
  abstract getRules(): Rule[];

  /**
   * Get room-specific noun lexicon
   */
  abstract getNouns(): Lexicon;

  /**
   * Get room-specific verb lexicon (optional, defaults to empty)
   */
  getVerbs(): Lexicon {
    return {};
  }

  /**
   * Get room-specific adjective lexicon (optional, defaults to empty)
   */
  getAdjectives(): Lexicon {
    return {};
  }
}
