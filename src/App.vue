<script setup lang="ts">
import { watch } from 'vue'
import { useSessionStore } from './stores/sessionStore'
import { useGaleShapleyStore } from './stores/galeShapleyStore'

import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'
import MatchingGrid from './components/MatchingGrid.vue'
import PredictionModal from './components/PredictionModal.vue'

// Native ES6 Data Ingestion
import taskA from './data/taskA.json'
import taskB from './data/taskB.json'

const session = useSessionStore()
const engine = useGaleShapleyStore()

// Watcher: Automatically ignites the algorithmic engine when the user enters an active task phase
watch(
  () => session.currentPhase,
  async (newPhase) => {
    if (newPhase === 'TASK_1') {
      const dataset = session.task1Type === 'STATIC' ? taskA : taskB
      executeMarket(dataset)
    }
  },
)

const executeMarket = async (dataset: any) => {
  const proposerIds = Object.keys(dataset.proposerPreferences)
  const receiverIds = Object.keys(dataset.receiverPreferences)

  // Dynamic Breakpoint Injection: Intercept the first 5 proposers' initial market moves for telemetry
  const breakpoints = new Set<string>()
  for (let i = 0; i < 5; i++) {
    const p = proposerIds[i]
    const r = dataset.proposerPreferences[p][0]
    breakpoints.add(`${p}-${r}`)
  }

  // Hydrate the Pinia state with O(1) inversion maps
  engine.initializeMarket(proposerIds, receiverIds, dataset.receiverInvertedRanks)

  // Ignite the asynchronous state machine with a capacity of 3
  await engine.startExecution(proposerIds, dataset.proposerPreferences, 3, breakpoints)
}

const handleTelemetryPayload = (payload: {
  predictedAction: string
  predictedTarget: string
  latencyMs: number
}) => {
  // Output to console to verify T_cognitive latency tracking before Phase 5 DB integration
  console.table({ UUID: session.uuid, ...payload })
  engine.resumeFromBreakpoint(payload)
}
</script>

<template>
  <main class="min-h-screen bg-neutral-50 p-6 flex flex-col items-center justify-center">
    <PISView v-if="session.currentPhase === 'PIS'" @continue="session.advanceTo('CONSENT')" />
    <ConsentGateway
      v-else-if="session.currentPhase === 'CONSENT'"
      @consented="session.initializeSession()"
    />

    <div v-else-if="session.currentPhase === 'TASK_1'" class="w-full flex flex-col items-center">
      <div
        class="w-full max-w-7xl flex justify-between items-end border-b-4 border-neutral-900 pb-4 mb-8"
      >
        <div>
          <span
            class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 bg-neutral-100 px-2 py-1 border border-neutral-300"
          >
            UUID: {{ session.uuid }} | Sequence: {{ session.sequenceGroup }}
          </span>
          <h1 class="text-3xl font-black font-mono tracking-tight mt-3 text-neutral-900">
            Bipartite Matching Engine
          </h1>
        </div>
        <button
          @click="session.advanceTo('DEBRIEF')"
          class="bg-neutral-900 text-white font-mono font-bold text-sm uppercase py-3 px-6 border-2 border-neutral-900 hover:bg-neutral-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
