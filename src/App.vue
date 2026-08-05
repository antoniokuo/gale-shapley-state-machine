<script setup lang="ts">
import { watch } from 'vue'
import { useSessionStore } from './stores/sessionStore'
import { useGaleShapleyStore } from './stores/galeShapleyStore'

import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'
import MatchingGrid from './components/MatchingGrid.vue'
import PredictionModal from './components/PredictionModal.vue'

import taskA from './data/taskA.json'
import taskB from './data/taskB.json'

interface MarketDataset {
  proposerPreferences: Record<string, string[]>
  receiverPreferences: Record<string, string[]>
  receiverInvertedRanks: Record<string, Record<string, number>>
}

const session = useSessionStore()
const engine = useGaleShapleyStore()

watch(
  () => session.currentPhase,
  async (newPhase) => {
    if (newPhase === 'TASK_1') {
      const dataset = session.task1Type === 'STATIC' ? taskA : taskB
      executeMarket(dataset)
    }
  },
)

const executeMarket = async (rawDataset: unknown) => {
  const dataset = rawDataset as MarketDataset
  const proposerIds = Object.keys(dataset.proposerPreferences)
  const receiverIds = Object.keys(dataset.receiverPreferences)

  const breakpoints = new Set<string>()
  for (let i = 0; i < 5; i++) {
    const p = proposerIds[i]!
    const r = dataset.proposerPreferences[p]![0]!
    breakpoints.add(`${p}-${r}`)
  }

  engine.initializeMarket(proposerIds, receiverIds, dataset.receiverInvertedRanks)
  await engine.startExecution(proposerIds, dataset.proposerPreferences, 3, breakpoints)
}

const handleTelemetryPayload = (payload: {
  predictedAction: string
  predictedTarget: string
  latencyMs: number
}) => {
  console.table({ UUID: session.uuid, ...payload })
  engine.resumeFromBreakpoint(payload)
}
</script>

<template>
  <main
    class="min-h-screen bg-neutral-50 p-6 flex flex-col items-center justify-center text-black font-mono"
  >
    <PISView v-if="session.currentPhase === 'PIS'" @continue="session.advanceTo('CONSENT')" />

    <ConsentGateway
      v-else-if="session.currentPhase === 'CONSENT'"
      @consented="session.advanceTo('TRAINING')"
    />

    <div
      v-else-if="session.currentPhase === 'TRAINING'"
      class="max-w-4xl w-full border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="border-b-4 border-neutral-900 pb-3 mb-6">
        <span
          class="text-xs font-bold uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
          >Pre-Task Orientation Protocol</span
        >
        <h2 class="text-3xl font-black text-black tracking-tight mt-2 uppercase">
          Gale-Shapley: Logic & Legend
        </h2>
      </div>

      <div class="space-y-6 font-sans text-base text-black leading-relaxed">
        <p>
          Before beginning the timed execution phase, please familiarise yourself with the
          structural grid mechanics. You are observing an automated Deferred Acceptance market
          matching 30 Proposers (P1–P30) to 10 Receivers (R1–R10). Each Receiver holds a strict
          capacity limit of exactly 3 slots.
        </p>

        <div
          class="border-4 border-neutral-900 p-5 bg-neutral-50 font-mono space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3
            class="text-lg font-black uppercase tracking-wide border-b-2 border-neutral-900 pb-1 text-black"
          >
            1. Core Node States
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div class="flex flex-col items-center space-y-2">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >PROPOSING</span
                >
              </div>
              <p class="text-xs font-bold text-center mt-2 leading-tight">
                Actively making an offer to its highest preferred target.
              </p>
            </div>

            <div class="flex flex-col items-center space-y-2">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-emerald-400 text-neutral-950 border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >HELD</span
                >
              </div>
              <p class="text-xs font-bold text-center mt-2 leading-tight">
                Temporarily accepted into an open Receiver slot.
              </p>
            </div>

            <div class="flex flex-col items-center space-y-2">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-red-600 text-white border-red-950 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >REJECTED</span
                >
              </div>
              <p class="text-xs font-bold text-center mt-2 leading-tight">
                Denied or displaced by a more highly preferred candidate.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <h3
            class="text-lg font-black font-mono uppercase text-black border-b-2 border-neutral-900 pb-1"
          >
            2. How to Evaluate State Predictions
          </h3>
          <p>
            When the execution hits a breakpoint, the engine will freeze and open a floating
            dashboard card. You must analyse the background grid state and the preference maps on
            the right margin to determine the next immediate outcome:
          </p>
          <ul class="list-disc pl-6 space-y-2 font-medium">
            <li>
              <strong>ACCEPT:</strong> If the target Receiver currently holds fewer than 3
              Proposers, it has open seats and will automatically accept the offer.
            </li>
            <li>
              <strong>REJECT:</strong> If the target Receiver is already full (holding 3 Proposers)
              and values all 3 current occupants <em>higher</em> than the new applicant, the
              applicant is instantly rejected.
            </li>
            <li>
              <strong>DISPLACE:</strong> If the target Receiver is full but values the new applicant
              <em>higher</em> than its least-preferred current occupant, the new applicant is
              accepted, and the least-preferred occupant is thrown back into the pool.
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
        <button
          @click="session.initializeSession()"
          class="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Acknowledge & Begin Task &rarr;
        </button>
      </div>
    </div>

    <div v-else-if="session.currentPhase === 'TASK_1'" class="w-full flex flex-col items-center">
      <div
        class="w-full max-w-7xl flex justify-between items-end border-b-4 border-neutral-900 pb-4 mb-6"
      >
        <div>
          <span
            class="text-xs font-bold uppercase tracking-widest text-neutral-900 bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
          >
            UUID: {{ session.uuid }} | Sequence: {{ session.sequenceGroup }}
          </span>
          <h1 class="text-3xl font-black tracking-tight mt-3 text-neutral-950">
            Bipartite Matching Engine
          </h1>
        </div>
        <button
          @click="session.advanceTo('DEBRIEF')"
          class="bg-neutral-900 text-white font-bold text-sm uppercase py-3 px-6 border-2 border-neutral-900 hover:bg-neutral-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Conclude Task
        </button>
      </div>

      <MatchingGrid />
      <PredictionModal v-if="engine.isAwaitingUserInput" @submit="handleTelemetryPayload" />
    </div>

    <DebriefView v-else-if="session.currentPhase === 'DEBRIEF'" />
  </main>
</template>
