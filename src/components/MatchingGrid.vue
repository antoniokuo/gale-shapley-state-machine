<script setup lang="ts">
import { computed } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'
import PredictionModal from './PredictionModal.vue'
import MicroQueue from './MicroQueue.vue'

const props = defineProps<{
  isStatic: boolean
}>()

const store = useMatchingStore()

// Bubble telemetry prediction hooks to App.vue orchestrator
defineEmits<{
  (e: 'submit-prediction', payload: any): void
}>()

// --------------------------------------------------
// METRIC EXTRACTION & AMBIENT GATEKEEPERS
// --------------------------------------------------
const currentState = computed(() => store.currentState)
const activeDataset = computed(() => store.activeDataset)

// Environment Gatekeeper: Expose Dev Speed panel strictly to hiring managers
const isPortfolioMode = computed(
  () => (import.meta.env.VITE_APP_MODE || 'portfolio') === 'portfolio',
)

// Spotlight mask isolates visual fields to capture cognitive processing latency (SOP 1.3)
const isSpotlightActive = computed(() => !props.isStatic && store.isAwaitingUserInput)

const isMuted = (nodeId: string) => {
  if (!isSpotlightActive.value) return false
  return store.activeProposerId !== nodeId && store.activeTargetReceiverId !== nodeId
}

// --------------------------------------------------
// DYNAMIC ELEMENT STATE FORMATTERS
// --------------------------------------------------
const getProposerVisuals = (proposerId: string) => {
  const pState = currentState.value?.proposers[proposerId]
  const isActive = store.activeProposerId === proposerId

  // CONTROL CONDITION: Strict monochrome polarity (ADR 0012)
  if (props.isStatic) {
    if (isActive && store.isAwaitingUserInput) {
      return 'bg-neutral-50 border-neutral-900 text-neutral-950 ring-2 ring-neutral-950 scale-105 z-10'
    }
    return pState?.match
      ? 'bg-neutral-200 border-neutral-900 text-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      : 'bg-white border-neutral-900 text-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
  }

  // EXPERIMENTAL CONDITION: Interactive Semantic Colour Architecture
  if (isActive) {
    return 'bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] scale-105 z-10'
  }
  if (pState?.match) {
    return 'bg-emerald-400 text-black border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]'
  }
  return 'bg-white text-black border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
}

const getReceiverVisuals = (receiverId: string) => {
  if (props.isStatic) {
    return 'border-neutral-900 bg-white text-neutral-950'
  }
  return isMuted(receiverId)
    ? 'border-neutral-900 bg-neutral-100 opacity-25 grayscale blur-[1px] shadow-none'
    : 'border-neutral-900 bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
}

const getOccupantVisuals = () => {
  if (props.isStatic) return 'bg-neutral-200 text-neutral-950 border-neutral-900'
  return 'bg-emerald-400 text-black border-emerald-950'
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col space-y-6 font-mono text-neutral-950">
    <div
      class="w-full border-4 border-neutral-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-base font-sans font-bold leading-relaxed transition-all duration-300"
      :class="{
        'ring-4 ring-neutral-950 ring-offset-4 scale-[1.01]':
          store.isAwaitingUserInput && props.isStatic,
        'ring-4 ring-blue-500 ring-offset-4 scale-[1.01]': isSpotlightActive,
      }"
    >
      <span
        class="font-black uppercase text-neutral-950 block text-sm tracking-widest mb-2 border-b-2 border-neutral-900 pb-1"
      >
        &sect; Task Condition:
        {{ props.isStatic ? 'Static Isomorphic Baseline' : 'Interactive DAG View' }}
      </span>
      <span v-if="!store.isAwaitingUserInput">
        Observe background execution vectors. State engine running autonomously.
      </span>
      <span v-else :class="!props.isStatic ? 'text-blue-700' : 'text-neutral-950'">
        EXECUTION HALTED. Evaluate system topology and submit prediction matrix inputs to resume
        runtime.
      </span>
    </div>

    <div
      v-if="isPortfolioMode"
      class="w-full border-4 border-blue-950 bg-blue-100 p-4 shadow-[6px_6px_0px_0px_rgba(30,58,138,1)]"
    >
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-black text-blue-950 uppercase tracking-wider block"
            >Dev-Telemetry Panel Active</span
          >
          <p class="text-xs font-sans font-bold text-neutral-900 mt-1">
            Exposing execution clock loops. Drag toggle grid to modify tick rate parameters.
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            v-model.number="store.tickRate"
            class="accent-blue-700 cursor-pointer h-3 bg-neutral-300 border-2 border-neutral-500 rounded-none w-48"
          />
          <span
            class="text-sm font-black bg-white px-3 py-1.5 border-4 border-blue-950 min-w-[70px] text-center"
          >
            {{ store.tickRate }}ms
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6 pt-2 items-start">
      <div class="col-span-3 space-y-4">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-2">
          Receivers (C=3)
        </h3>
        <div
          v-for="(rState, receiverId) in currentState?.receivers"
          :key="receiverId"
          :class="[
            'border-4 p-4 min-h-[110px] flex flex-col justify-between transition-all duration-300',
            getReceiverVisuals(receiverId as string),
          ]"
        >
          <span
            class="font-black text-sm px-3 py-1 border-2 border-neutral-900 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
          >
            {{ receiverId }}
          </span>

          <div class="flex flex-wrap gap-2 mt-4">
            <div
              v-for="occupantId in rState.matches"
              :key="occupantId"
              :class="[
                'px-3 py-1.5 border-4 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300',
                getOccupantVisuals(),
              ]"
            >
              {{ occupantId }}
            </div>
            <div
              v-if="rState.matches.length === 0"
              class="text-neutral-500 font-bold text-sm italic py-1"
            >
              Empty Slot
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-6 flex flex-col items-center space-y-8">
        <div class="w-full relative">
          <template v-if="store.isAwaitingUserInput">
            <PredictionModal
              :isStatic="props.isStatic"
              @submit="(payload) => $emit('submit-prediction', payload)"
            ></PredictionModal>
          </template>

          <template v-else>
            <h3
              class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4 w-full text-left"
            >
              Proposers (N=16)
            </h3>
            <div class="grid grid-cols-4 gap-3 w-full">
              <div
                v-for="proposerId in store.spatialProposerOrder"
                :key="proposerId"
                :class="[
                  'border-4 p-3 flex flex-col items-center justify-center font-black transition-all duration-300 min-h-[85px]',
                  getProposerVisuals(proposerId),
                  isMuted(proposerId) ? 'opacity-25 grayscale shadow-none blur-[1px]' : '',
                ]"
              >
                <span class="text-lg tracking-tight">{{ proposerId }}</span>
                <span
                  class="text-[10px] uppercase font-black mt-1 border-t-2 border-current pt-1 w-full text-center block"
                >
                  <template v-if="currentState?.proposers[proposerId]?.match">
                    {{ currentState?.proposers[proposerId].match }}
                  </template>
                  <template
                    v-else-if="store.activeProposerId === proposerId && store.isAwaitingUserInput"
                  >
                    EVAL
                  </template>
                  <template v-else>IDLE</template>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="col-span-3">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
          Vector Context
        </h3>

        <div
          class="border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[600px] overflow-y-auto"
        >
          <div v-if="props.isStatic" class="space-y-4">
            <div
              class="font-black text-base uppercase border-b-4 border-neutral-900 pb-1 tracking-wider text-black"
            >
              Receiver Preference Rankings
            </div>

            <div
              class="bg-blue-50 border-2 border-blue-900 p-2.5 text-xs font-bold text-blue-900 tracking-tight leading-normal"
            >
              &rarr; Priority scans left-to-right (Leftmost item = highest priority).
            </div>

            <div class="space-y-3">
              <div
                v-for="(ranks, rId) in activeDataset?.receiverPreferences"
                :key="rId"
                class="bg-neutral-100 border-2 border-neutral-300 p-3 flex flex-col"
              >
                <span
                  class="font-black text-xs text-black bg-neutral-300 px-2 py-0.5 border border-neutral-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] block mb-3 w-max"
                >
                  {{ rId }}
                </span>

                <div
                  class="flex items-center space-x-1.5 font-mono text-sm font-bold text-neutral-950 overflow-x-auto whitespace-nowrap pb-1 scrollbar-thin"
                >
                  <span
                    v-for="(node, index) in ranks"
                    :key="index"
                    class="w-9 shrink-0 text-center border border-neutral-300 bg-white py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]"
                  >
                    {{ node }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="isSpotlightActive" class="animate-fade-in w-full h-full">
            <MicroQueue />
          </div>

          <div
            v-else
            class="text-center py-20 opacity-50 flex flex-col items-center justify-center"
          >
            <span class="block text-2xl font-black animate-pulse mb-2">...</span>
            <span class="block text-xs font-black uppercase tracking-widest"
              >Awaiting Traversal</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

/* Minimalist styling to keep custom track clear and readable */
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 0px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
