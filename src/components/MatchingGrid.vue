<script setup lang="ts">
import { computed } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'
import PredictionModal from './PredictionModal.vue'

const props = defineProps<{
  isStatic: boolean
}>()

const store = useMatchingStore()

defineEmits<{
  (e: 'submit-prediction', payload: any): void
}>()

// --------------------------------------------------
// STATE & ISOLATION COMPUTATIONS
// --------------------------------------------------
const currentState = computed(() => store.currentState)
const activeDataset = computed(() => store.activeDataset)

// Spotlight is strictly disabled during the Static Control baseline (ADR 0008 & 0003)
const isSpotlightActive = computed(() => !props.isStatic && store.isAwaitingUserInput)

const isMuted = (nodeId: string) => {
  if (!isSpotlightActive.value) return false
  return store.activeProposerId !== nodeId && store.activeTargetReceiverId !== nodeId
}

// --------------------------------------------------
// VISUAL RENDERING ENGINES (ADR 0003 & 0007)
// --------------------------------------------------
const getProposerVisuals = (proposerId: string) => {
  const pState = currentState.value?.proposers[proposerId]
  const isActive = store.activeProposerId === proposerId

  // STATIC BASELINE: Absolute monochrome polarity. Zero attention guidance.
  if (props.isStatic) {
    if (isActive && store.isAwaitingUserInput) {
      return 'bg-neutral-50 border-neutral-900 text-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
    }
    return pState?.match
      ? 'bg-neutral-200 border-neutral-900 text-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      : 'bg-white border-neutral-900 text-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
  }

  // INTERACTIVE DAG VIEW: Semantic enterprise colour tokens.
  if (isActive)
    return 'bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] scale-105 z-10'
  if (pState?.match)
    return 'bg-emerald-400 text-black border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]'

  return 'bg-white text-black border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
}

const getReceiverVisuals = (receiverId: string) => {
  if (props.isStatic) return 'border-neutral-900 bg-white text-neutral-950'
  return isMuted(receiverId)
    ? 'border-neutral-900 bg-neutral-100 opacity-25 grayscale'
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
      class="w-full border-4 border-neutral-900 bg-neutral-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
      :class="{
        'ring-4 ring-neutral-950 ring-offset-4': store.isAwaitingUserInput && props.isStatic,
        'ring-4 ring-blue-500 ring-offset-4': isSpotlightActive,
      }"
    >
      <span
        class="font-black uppercase text-neutral-950 block text-sm tracking-widest mb-2 border-b-2 border-neutral-900 pb-1"
      >
        &sect; Task Condition:
        {{ props.isStatic ? 'Static Isomorphic Baseline' : 'Interactive DAG View' }}
      </span>
      <span v-if="!store.isAwaitingUserInput" class="font-bold">
        State engine ready. Awaiting traversal execution.
      </span>
      <span
        v-else
        class="font-bold"
        :class="!props.isStatic ? 'text-blue-700' : 'text-neutral-950'"
      >
        EXECUTION HALTED. Evaluate the system topology and predict the immediate downstream
        algorithmic transition.
      </span>
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
                'px-3 py-1.5 border-4 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
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
        <div class="w-full">
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
                isMuted(proposerId) ? 'opacity-25 grayscale shadow-none' : '',
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
                  Eval
                </template>
                <template v-else> Idle </template>
              </span>
            </div>
          </div>
        </div>

        <div
          class="w-full min-h-[120px] flex items-center justify-center border-4 border-dashed border-neutral-300 bg-neutral-50 relative p-4"
        >
          <div
            v-if="!store.isAwaitingUserInput"
            class="text-neutral-400 font-black uppercase text-sm tracking-widest text-center"
          >
            Prediction Input Inactive
          </div>
          <PredictionModal
            v-if="store.isAwaitingUserInput"
            :isStatic="props.isStatic"
            @submit="(payload) => $emit('submit-prediction', payload)"
            class="absolute w-full h-full z-20"
          />
        </div>
      </div>

      <div class="col-span-3 relative">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
          Vector Context
        </h3>

        <div
          class="border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[600px]"
        >
          <div v-if="props.isStatic" class="space-y-6">
            <div class="font-black text-sm border-b-2 border-neutral-900 pb-1">
              RAW PROPOSER VECTORS
            </div>
            <div class="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-neutral-800">
              <div v-for="(prefs, pId) in activeDataset?.proposerPreferences" :key="pId">
                <span class="font-black text-black">{{ pId }}:</span> [{{ prefs.join(', ') }}]
              </div>
            </div>
            <div class="font-black text-sm border-b-2 border-neutral-900 pb-1 mt-6">
              RAW RECEIVER VECTORS
            </div>
            <div class="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-neutral-800">
              <div v-for="(ranks, rId) in activeDataset?.receiverPreferences" :key="rId">
                <span class="font-black text-black">{{ rId }}:</span> [{{ ranks.join(', ') }}]
              </div>
            </div>
          </div>

          <div
            v-else-if="isSpotlightActive"
            class="w-full h-full border-4 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center text-center p-4"
          >
            <span class="font-black text-blue-900 text-lg mb-2 block">&lt;MicroQueue /&gt;</span>
            <span class="text-xs font-bold text-blue-700"
              >Dynamic Context Isolation component will mount here (Phase 5).</span
            >
          </div>

          <div v-else class="text-center py-20 opacity-50">
            <span class="block text-2xl font-black animate-pulse">...</span>
            <span class="block text-xs font-black uppercase tracking-widest"
              >Awaiting Traversal</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
