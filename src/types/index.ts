/**
 * PHASE 1: DATA INGESTION SCHEMA
 * Strictly mirrors the taskA.json and taskB.json structures for V8 hydration.
 */
export interface DatasetPayload {
  milestoneBreakpoints: string[] // Format: "P01-R01"
  executionQueue?: string[] // INJECTED: Forces identical isomorphic execution trajectories
  proposerPreferences: Record<string, string[]>
  receiverPreferences: Record<string, string[]>
  receiverInvertedRanks: Record<string, Record<string, number>> // O(1) lookup for Micro-Evaluation Queue
}

/**
 * PHASE 2: GENERATOR EVENT ENGINE
 * Explicit state transitions yielded by the Asynchronous Generator (ADR 0002)
 */
export type EventType =
  'INITIALIZE' | 'PROPOSE' | 'ACCEPT' | 'REJECT' | 'DISPLACE' | 'BREAKPOINT' | 'COMPLETE'

export interface EngineEvent {
  type: EventType
  proposerId: string | null
  receiverId: string | null
  displacedId: string | null
  message: string
}

/**
 * PHASE 3: ASYMMETRIC NODE STATES
 * Structurally decouples Proposers (capacity: 1) from Receivers (capacity: 3)
 */
export interface ProposerState {
  id: string
  preferences: string[]
  match: string | null // Many-to-One: Proposer only holds 1 match
  nextProposalIndex: number
}

export interface ReceiverState {
  id: string
  preferences: string[]
  matches: string[] // Many-to-One: Receiver holds up to C matches
  capacity: number // Hardcoded to 3 as per ADR 0006
}

/**
 * PHASE 4: THE DETERMINISTIC STATE LEDGER (DAG)
 * The immutable micro-state snapshot pushed to the Pinia array (ADR 0010)
 */
export interface MarketStateSnapshot {
  tick: number
  proposers: Record<string, ProposerState>
  receivers: Record<string, ReceiverState>
  freeProposers: string[]
  activeEvent: EngineEvent // Drives the Dynamic Context Isolation (Spotlight UI)
  isComplete: boolean
}
