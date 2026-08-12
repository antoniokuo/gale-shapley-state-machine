<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'
import { useSessionStore } from '../stores/sessionStore'
import MatchingGrid from './MatchingGrid.vue'

const store = useMatchingStore()
const session = useSessionStore()

// State Management for Interstitial Gateway
const isSandboxUnlocked = ref(false)

// Enforce Interactive DAG View to maximize visual feedback during unconstrained exploration
const isStatic = false

// Qualitative Feedback State (Survey Instrument 3)
const qualitativeFeedback = ref('')

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

// Dynamic Affordance for Optional Submission
const isFeedbackEmpty = computed(() => qualitativeFeedback.value.trim().length === 0)

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

const concludeSession = async () => {
  if (session.uuid && !isFeedbackEmpty.value) {
    try {
      const payload = {
        session_uuid: session.uuid,
        qualitative_feedback: qualitativeFeedback.value.trim(),
      }
      console.table(payload) // Telemetry Hook: Ready for Supabase injection
    } catch (e) {
      console.error('Failed to log qualitative feedback:', e)
    }
  }

  await session.advanceTo('DEBRIEF')
}
</script>

<template>
  <div class="w-full relative min-h-screen">
    <div
      v-if="!isSandboxUnlocked"
      class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm p-6"
    >
      <div
        class="bg-white border-4 border-neutral-900 max-w-2xl w-full p-8 shadow-[12px_12px_0px_0px_rgba(30,58,138,1)] animate-fade-in text-neutral-950"
      >
        <span
          class="text-xs font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1 border-2 border-blue-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          System Notification
        </span>
        <h2 class="text-4xl font-black mt-4 mb-2 uppercase tracking-tight text-neutral-900">
          Measurement Phase Terminated
        </h2>
        <div class="bg-neutral-100 border-l-4 border-neutral-400 p-4 mb-6">
          <p class="text-base font-bold font-sans text-neutral-700 leading-relaxed">
            All strict telemetry logging and prediction task constraints have now been disabled. You
            have entered the <span class="text-neutral-950 font-black">Unconstrained Sandbox</span>.
          </p>
        </div>
        <p class="text-sm font-bold font-sans text-neutral-600 mb-8 leading-relaxed">
          You may now freely use the timeline controls to explore the Gale-Shapley matching
          algorithm. When you are finished exploring, you may optionally leave feedback at the
          bottom of the page to conclude the session.
        </p>
        <button
          @click="isSandboxUnlocked = true"
          class="w-full bg-blue-600 text-white text-xl font-black uppercase py-5 border-4 border-blue-950 hover:bg-blue-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Unlock Sandbox Ledger &rarr;
        </button>
      </div>
    </div>

    <div v-show="isSandboxUnlocked" class="w-full flex flex-col items-center animate-fade-in pb-20">
      <div class="w-full max-w-7xl border-b-4 border-neutral-900 pb-4 mb-6 pt-4">
        <span
          class="text-xs font-bold uppercase tracking-widest text-white bg-blue-600 px-3 py-1 border-2 border-blue-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Phase: Unconstrained Sandbox
        </span>
        <h1 class="text-3xl font-black tracking-tight mt-3 text-neutral-950 uppercase">
          Exploratory Time-Travel Module
        </h1>
      </div>

      <div
        class="w-full sticky top-0 z-40 bg-neutral-50/95 backdrop-blur-md border-b-4 border-neutral-900 py-4 mb-6 shadow-md transition-all"
      >
        <div class="max-w-7xl mx-auto flex items-center space-x-8 px-4">
          <div class="flex space-x-2">
            <button
              @click="jumpToExtremity(0)"
              class="px-4 py-2 border-2 border-neutral-900 bg-white font-black hover:bg-neutral-100 transition-colors"
            >
              |&larr;
            </button>
            <button
              @click="safeStepBack"
              :disabled="store.tickIndex === 0"
              class="px-5 py-2 border-2 border-neutral-900 bg-white font-black hover:bg-neutral-100 disabled:opacity-30 transition-colors"
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
              class="px-4 py-2 border-2 border-neutral-900 bg-white font-black hover:bg-neutral-100 transition-colors"
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
              <span class="text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 shadow-sm">
                Current Tick: {{ store.tickIndex }} ({{ progressPercentage }}%)
              </span>
              <span>Max: {{ store.stateLedger.length - 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <MatchingGrid :isStatic="isStatic" />

      <div
        class="w-full max-w-7xl mt-12 bg-white border-4 border-neutral-950 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <h3 class="text-2xl font-black uppercase tracking-tight mb-2">
          Survey Instrument 3: Qualitative Feedback (Optional)
        </h3>
        <div class="bg-amber-50 border-l-4 border-amber-600 p-3 mb-6">
          <p class="text-sm font-sans font-bold text-neutral-800">
            Please share any brief comments comparing the visual clarity, state-transition controls,
            or interface design experienced during the measured task conditions (Static View vs.
            Interactive DAG View).
          </p>
          <p class="text-sm font-sans font-black text-red-600 mt-2 uppercase tracking-wide">
            Warning: Do not include any personal names, student identifiers, or identifying details
            in your response.
          </p>
        </div>

        <textarea
          v-model="qualitativeFeedback"
          placeholder="Type your optional feedback here..."
          class="w-full h-32 p-4 font-sans font-bold text-sm bg-neutral-50 border-2 border-neutral-900 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:bg-white transition-all resize-none mb-6"
        ></textarea>

        <button
          @click="concludeSession"
          :class="[
            'w-full font-black uppercase py-5 text-xl border-4 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
            isFeedbackEmpty
              ? 'bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-100'
              : 'bg-blue-600 text-white border-blue-950 hover:bg-blue-700 shadow-[6px_6px_0px_0px_rgba(30,58,138,1)]',
          ]"
        >
          {{
            isFeedbackEmpty
              ? 'Skip Feedback & Conclude Session &rarr;'
              : 'Submit Feedback & Conclude Session &rarr;'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
</style>
