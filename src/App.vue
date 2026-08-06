<script setup lang="ts">
import { watch } from 'vue'
import { useSessionStore } from './stores/sessionStore'
import { useGaleShapleyStore } from './stores/galeShapleyStore'

import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'
import MatchingGrid from './components/MatchingGrid.vue'

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
  for (let i = 0; i < 10; i++) {
    const p = proposerIds[i]!
    const r = dataset.proposerPreferences[p]![0]!
    breakpoints.add(`${p}-${r}`)
  }

  engine.initializeMarket(
    proposerIds,
    receiverIds,
    dataset.receiverInvertedRanks,
    dataset.proposerPreferences,
  )
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
      <div class="border-b-4 border-neutral-900 pb-3 mb-6 font-mono">
        <span
          class="text-xs font-black uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
        >
          Pre-Task Orientation Protocol
        </span>
        <h2 class="text-3xl font-black text-black tracking-tight mt-2 uppercase">
          Gale-Shapley: Logic & Legend
        </h2>
      </div>

      <div class="space-y-8 font-sans text-base text-black leading-relaxed">
        <section class="space-y-3">
          <h3
            class="text-lg font-black uppercase tracking-wide text-black font-mono border-b-2 border-neutral-900 pb-1"
          >
            0. Architectural Context: Two-Sided Resource Allocation
          </h3>
          <p>
            The system you are evaluating runs the
            <strong>Gale-Shapley Stable Matching Algorithm</strong>, a Nobel Prize-winning
            mathematical framework designed to compute optimal matching choices across modern
            decentralised networks.
          </p>
          <p class="font-bold text-neutral-900">Real-World Macro System Analogs:</p>
          <ul class="list-disc pl-6 space-y-2 text-sm font-medium text-neutral-800">
            <li>
              <strong>Higher Education Allocation (UCAS Clearing):</strong> Structurally matching
              thousands of university applicants (Proposers) to specific course capacity limits at
              target institutions (Receivers) based on grade-priority cutoff tiers.
            </li>
            <li>
              <strong>Ride-Hailing Dispatch Logistics:</strong> Asynchronously routing a rolling
              fleet of proximity vehicles to matching passenger requests based on structural arrival
              latencies and network metrics.
            </li>
            <li>
              <strong>Medical Clearing Networks:</strong> Allocating clinical graduates to strict
              training quotas within regional residency hospitals based on cross-preference priority
              ranks.
            </li>
          </ul>
          <p
            class="text-sm font-semibold text-neutral-800 bg-neutral-100 p-4 border-2 border-dashed border-neutral-400 leading-normal"
          >
            <strong>System Ruleset:</strong> The matching execution is strictly <em>Asymmetric</em>.
            Proposers issue sequential applications to their highest preferred targets. Receivers do
            not lock assignments immediately; they hold options temporarily in a deferred state and
            will drop a current occupant the exact millisecond a superior candidate applies.
          </p>
        </section>

        <section class="space-y-3">
          <h3
            class="text-lg font-black uppercase tracking-wide border-b-2 border-neutral-900 pb-1 text-black font-mono"
          >
            1. Telemetry Interface Node States
          </h3>
          <p class="text-sm font-bold text-neutral-700">
            The simulation tracks 30 Proposers matching into 10 Receivers. Each Receiver maintains a
            strict quota capacity of exactly 3 available slots. Familiarise yourself with the live
            node execution states:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono">
            <div
              class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
            >
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >PROPOSING</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900"
              >
                Active State Transition. The node is dispatching a matching proposal to its highest
                available preferred target receiver.
              </p>
            </div>

            <div
              class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
            >
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-emerald-400 text-black border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >HELD</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900"
              >
                Deferred Security State. The node has been provisionally accepted and holds an
                active slot inside a receiver's quota.
              </p>
            </div>

            <div
              class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
            >
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-red-600 text-white border-red-950 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] text-xs"
              >
                <span class="text-sm font-black">P1</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                  >REJECTED</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900"
              >
                Eviction State. The node has been blocked or kicked out by a receiver in preference
                for a higher-priority candidate.
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h3
            class="text-lg font-black font-mono uppercase text-black border-b-2 border-neutral-900 pb-1"
          >
            2. Real-Time Telemetry Prediction Mechanics
          </h3>
          <p class="text-sm font-medium">
            During evaluation, the system clock will halt exactly 10 times at predefined algorithmic
            checkpoints. When the interface isolates, you must parse the focused grid nodes to
            submit an immediate assertion:
          </p>

          <div class="space-y-3 font-mono text-sm">
            <div
              class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span
                class="bg-emerald-400 text-black border-2 border-emerald-950 px-3 py-1 font-black min-w-[100px] text-center shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]"
                >ACCEPT</span
              >
              <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
                The targeted receiver currently holds fewer than 3 occupants. It has unallocated
                capacity and automatically accepts the new proposer.
              </p>
            </div>

            <div
              class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span
                class="bg-red-500 text-white border-2 border-red-950 px-3 py-1 font-black min-w-[100px] text-center shadow-[2px_2px_0px_0px_rgba(127,29,29,1)]"
                >REJECT</span
              >
              <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
                The targeted receiver is full (3/3 occupants) and the tracking panel shows the new
                applicant ranks lower (worse priority) than all 3 current occupants.
              </p>
            </div>

            <div
              class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span
                class="bg-amber-400 text-black border-2 border-amber-950 px-3 py-1 font-black min-w-[100px] text-center shadow-[2px_2px_0px_0px_rgba(146,64,14,1)]"
                >DISPLACE</span
              >
              <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
                The targeted receiver is full, but the priority list shows the new applicant ranks
                higher (better priority) than at least one current occupant. The lowest-ranked
                occupant is instantly ejected back into the open pool.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-10 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
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

      <MatchingGrid @submit-prediction="handleTelemetryPayload" />
    </div>

    <DebriefView v-else-if="session.currentPhase === 'DEBRIEF'" />
  </main>
</template>
