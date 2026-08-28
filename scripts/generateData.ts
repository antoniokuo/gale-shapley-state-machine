// scripts/generateData.ts
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// --- ES Module Compatibility Wrappers ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Mathematical Specifications ---
const N = 30 // Proposers (Residents)
const M = 10 // Receivers (Hospitals)
const S = 1.5 // Zipfian Skew Parameter

interface MarketData {
  proposerPreferences: Record<string, string[]>
  receiverPreferences: Record<string, string[]>
  receiverInvertedRanks: Record<string, Record<string, number>>
}

// --- Algorithmic Utilities ---

/**
 * Generates relative probabilities for a set of items based on a Zipfian distribution.
 * Highly popular items occur with exponentially greater frequency.
 */
function getZipfianProbabilities(n: number, skew: number): number[] {
  let sum = 0
  const probs: number[] = []
  for (let i = 1; i <= n; i++) {
    const val = 1 / Math.pow(i, skew)
    probs.push(val)
    sum += val
  }
  return probs.map((p) => p / sum)
}

/**
 * Samples items from an array according to a probability vector without replacement,
 * ensuring every preference list is complete (length M) without duplicate choices.
 */
function weightedSampleWithoutReplacement(items: string[], probs: number[]): string[] {
  const available = items.map((item, i) => ({ item, prob: probs[i] }))
  const result: string[] = []

  while (available.length > 0) {
    const totalProb = available.reduce((sum, a) => sum + a.prob, 0)
    const rand = Math.random() * totalProb
    let cumulative = 0
    let selectedIndex = 0

    for (let i = 0; i < available.length; i++) {
      cumulative += available[i].prob
      if (rand <= cumulative) {
        selectedIndex = i
        break
      }
    }
    result.push(available[selectedIndex].item)
    available.splice(selectedIndex, 1)
  }
  return result
}

/**
 * Randomizes an array using the Fisher-Yates shuffle algorithm to generate
 * a baseline master list of proposer performance rankings.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// --- Core Generation Logic ---

function generateDataset(): MarketData {
  const proposers = Array.from({ length: N }, (_, i) => `P${i + 1}`)
  const receivers = Array.from({ length: M }, (_, i) => `R${i + 1}`)

  // 1. PROPOSER PREFERENCES: Skewed via Zipfian Distribution
  // Receivers are ranked by market popularity (R1 is highly contested, R10 is neglected)
  const receiverPopularityProbs = getZipfianProbabilities(M, S)
  const proposerPreferences: Record<string, string[]> = {}

  proposers.forEach((p) => {
    proposerPreferences[p] = weightedSampleWithoutReplacement(receivers, receiverPopularityProbs)
  })

  // 2. RECEIVER PREFERENCES: Master List + Localized Noise Modification
  // Simulates a global correlated performance standard (e.g., test scores) with local interview variance
  const masterProposerOrder = shuffle(proposers)
  const receiverPreferences: Record<string, string[]> = {}
  const receiverInvertedRanks: Record<string, Record<string, number>> = {}

  receivers.forEach((r) => {
    const noisyList = [...masterProposerOrder]
    // Traverse list and introduce a 20% local perturbation rate (swapping adjacent elements)
    for (let i = 0; i < noisyList.length - 1; i++) {
      if (Math.random() > 0.8) {
        ;[noisyList[i], noisyList[i + 1]] = [noisyList[i + 1], noisyList[i]]
      }
    }
    receiverPreferences[r] = noisyList

    // O(1) Optimization Layer: Invert the array maps into dictionary lookups for the UI layer
    receiverInvertedRanks[r] = {}
    noisyList.forEach((proposerId, index) => {
      // 1-indexed conversion maps directly to UI semantics: "Choice #1", "Choice #2"
      receiverInvertedRanks[r][proposerId] = index + 1
    })
  })

  return {
    proposerPreferences,
    receiverPreferences,
    receiverInvertedRanks,
  }
}

// --- Execution and Asset Ingestion ---

const taskAData = generateDataset()
const taskBData = generateDataset()

const outputDir = path.join(__dirname, '..', 'src', 'data')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(path.join(outputDir, 'taskA.json'), JSON.stringify(taskAData, null, 2))
fs.writeFileSync(path.join(outputDir, 'taskB.json'), JSON.stringify(taskBData, null, 2))

console.log('✅ Enterprise Datasets Generated Successfully.')
console.log(`Outputs routed to: ${outputDir}`)
