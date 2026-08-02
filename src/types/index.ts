// src/types/index.ts

export type EntityType = 'PROPOSER' | 'RECEIVER'

export interface Entity {
  id: string
  name: string
  type: EntityType
  preferences: string[] // Array of Entity IDs in ranked order
  capacity: number // 1 for standard Gale-Shapley, >1 for Asymmetric/HR
  currentMatches: string[] // Array of currently matched Entity IDs
}

export interface MatchState {
  proposers: Record<string, Entity> // O(1) Hash Map lookup
  receivers: Record<string, Entity> // O(1) Hash Map lookup
  freeProposers: string[] // Queue of IDs waiting to propose
  roundCount: number
  isComplete: boolean
}

export interface LogEntry {
  round: number
  message: string
  timestamp: number
  snapshot: MatchState // The deep clone payload for time-travel
}
