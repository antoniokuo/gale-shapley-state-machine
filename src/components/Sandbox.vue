<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'
import { useSessionStore } from '../stores/sessionStore'
import MatchingGrid from './MatchingGrid.vue'

const store = useMatchingStore()
const session = useSessionStore()

// Enforce Interactive DAG View to maximize visual feedback during unconstrained exploration
const isStatic = false

// Ensure any lingering breakpoint locks from Task 2 are purged upon mounting
onMounted(() => {
  store.isAwaitingUserInput = false
  store.activeProposerId = null
  store.activeTargetReceiverId = null
})

const progressPercentage = computed(() => {
  if (store.stateLedger.length === 0) return 0
  return Math.round((store.tickIndex / (store.stateLedger.length - 1)) * 100)
})

// Direct array index mutations bypassing the store's breakpoint evaluation locks
const safeStepBack = () => {
  if (store.tickIndex > 0) {
    store.tickIndex--
    store.isAwaitingUserInput = false
    store.activeProposerId = null
    store.activeTargetReceiverId = null
  }
}

const safeStepForward = () => {
  if (store.tickIndex < store.stateLedger.length - 1) {
    store.tickIndex++
    store.isAwaitingUserInput = false
    store.activeProposerId = null
    store.activeTargetReceiverId = null
  }
}

const jumpToExtremity = (index: number) => {
  store.tickIndex = index
  store.isAwaitingUserInput = false
  store.activeProposerId = null
  store.activeTargetReceiverId = null
}
</script>

<template>
  <div class="w-full flex flex-col items-center animate-fade-in">
    <div
      class="w-full max-w-7xl flex justify-between items-end border-b-4 border-neutral-900 pb-4 mb-6"
    >
      <div>
        <span
          class="text-xs font-bold uppercase tracking-widest text-white bg-blue-600 px-3 py-1 border-2 border-blue-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Phase: Unconstrained Sandbox
        </span>
        <h1 class="text-3xl font-black tracking-tight mt-3 text-neutral-950 uppercase">
          Exploratory Time-Travel Module
        </h1>
      </div>
      <button
        @click="session.advanceTo('DEBRIEF')"
        class="bg-neutral-950 text-white font-black text-sm uppercase py-3 px-6 border-4 border-neutral-950 hover:bg-neutral-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
      >
        Conclude Exploration &rarr;
      </button>
    </div>

    <div
      class="w-full max-w-7xl bg-white border-4 border-neutral-900 p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-8"
    >
      <div class="flex space-x-2">
        <button
          @click="jumpToExtremity(0)"
          class="px-4 py-2 border-2 border-neutral-900 font-black hover:bg-neutral-100 transition-colors"
        >
          |&larr;
        </button>
        <button
          @click="safeStepBack"
          :disabled="store.tickIndex === 0"
          class="px-5 py-2 border-2 border-neutral-900 font-black hover:bg-neutral-100 disabled:opacity-30 transition-colors"
        >
          &larr; Step
        </button>
        <button
          @click="safeStepForward"
          :disabled="store.tickIndex >= store.stateLedger.length - 1"
          class="px-5 py-2 bg-neutral-950 text-white border-2 border-neutral-900 font-black hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        >
          Step &rarr;
        </button>
        <button
          @click="jumpToExtremity(store.stateLedger.length - 1)"
          class="px-4 py-2 border-2 border-neutral-900 font-black hover:bg-neutral-100 transition-colors"
        >
          &rarr;|
        </button>
      </div>

      <div class="flex-grow flex flex-col justify-center pt-2">
        <input
          type="range"
          min="0"
          :max="store.stateLedger.length - 1"
          v-model.number="store.tickIndex"
          @input="jumpToExtremity(store.tickIndex)"
          class="w-full accent-neutral-950 cursor-pointer h-3 bg-neutral-200 border-2 border-neutral-400"
        />
        <div class="flex justify-between text-xs font-black uppercase mt-2 text-neutral-600">
          <span>Tick: 0</span>
          <span class="text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200"
            >Current Tick: {{ store.tickIndex }} ({{ progressPercentage }}%)</span
          >
          <span>Max: {{ store.stateLedger.length - 1 }}</span>
        </div>
      </div>
    </div>

    <MatchingGrid :isStatic="isStatic" />
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
  animation: fadeIn 0.4s ease-out forwards;
}
</style>
