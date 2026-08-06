<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useGaleShapleyStore as useEngineStore } from '../stores/galeShapleyStore'

const store = useEngineStore()
const isDevMode = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  isDevMode.value = params.get('mode') === 'dev'
})

// Computed state to trigger the global dimming effect
const isSpotlightActive = computed(() => store.activeProposerId !== null)

const getProposerStatusClass = (status: string) => {
  switch (status) {
    case 'PROPOSING':
      return 'bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] scale-105 z-10'
    case 'HELD':
      return 'bg-emerald-400 text-black border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]'
    case 'REJECTED':
      return 'bg-red-600 text-white border-red-950 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] opacity-90'
    default:
      return 'bg-white text-black border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
  }
}

// Safely access the array we passed from App.vue
const getProposerPrefs = (proposerId: string) => {
  // Due to our initialization mapping, proposer preferences are stored here
  return store.receiverPreferences[proposerId] || []
}

// Computes the visual strike-through logic for the live tracer
const getPrefVisualState = (proposerId: string, currentTargetInArray: string) => {
  if (!store.activeTargetReceiverId) return 'PENDING'

  const prefs = getProposerPrefs(proposerId)
  const activeTargetIndex = prefs.indexOf(store.activeTargetReceiverId)
  const checkingIndex = prefs.indexOf(currentTargetInArray)

  if (checkingIndex < activeTargetIndex) return 'REJECTED' // Strikethrough
  if (checkingIndex === activeTargetIndex) return 'ACTIVE' // Highlight
  return 'PENDING' // Normal
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col space-y-6 font-mono text-black">
    <div
      class="w-full border-4 border-neutral-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-base font-sans font-bold leading-relaxed transition-all duration-300"
      :class="isSpotlightActive ? 'ring-4 ring-blue-500 ring-offset-4 scale-[1.01]' : ''"
    >
      <span
        class="font-black uppercase text-black font-mono block text-sm tracking-widest mb-2 border-b-2 border-neutral-900 pb-1"
        >&sect; Active Experimental Task Objective</span
      >
      <span v-if="!isSpotlightActive"
        >Observe the background execution vectors. The engine is running autonomously.</span
      >
      <span v-else class="text-blue-700"
        >System halted. Evaluate the isolated node states below and submit your prediction to
        resume.</span
      >
    </div>

    <div
      v-if="isDevMode"
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
            >{{ store.tickRate }}ms</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6 pt-2 items-start">
      <div class="col-span-4 space-y-4 relative">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-2">
          Receivers (Cap: 3)
        </h3>

        <div
          v-for="(holds, receiverId) in store.receiverHolds"
          :key="receiverId"
          :class="[
            'border-4 border-neutral-900 bg-neutral-100 p-4 min-h-[120px] flex flex-col justify-between transition-all duration-500 ease-in-out',
            isSpotlightActive && store.activeTargetReceiverId !== receiverId
              ? 'opacity-25 grayscale blur-[1px] shadow-none'
              : 'opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          ]"
        >
          <span
            class="font-black text-sm text-black bg-neutral-300 px-3 py-1 border-2 border-neutral-900 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >{{ receiverId }}</span
          >

          <TransitionGroup name="list-flip" tag="div" class="flex flex-wrap gap-2 mt-4 relative">
            <div
              v-for="proposerId in holds"
              :key="proposerId"
              class="px-3 py-2 bg-emerald-400 text-black border-4 border-emerald-950 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
            >
              {{ proposerId }}
            </div>
            <div
              v-if="holds.length === 0"
              :key="'empty-' + receiverId"
              class="text-neutral-500 font-bold text-sm font-sans italic py-1"
            >
              Awaiting offers...
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="col-span-5 relative">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
          Proposers Pool
        </h3>

        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="proposer in store.proposers"
            :key="proposer.id"
            :class="[
              'border-4 p-3 flex flex-col items-center justify-center font-black transition-all duration-500 ease-in-out min-h-[85px]',
              getProposerStatusClass(proposer.status),
              isSpotlightActive && store.activeProposerId !== proposer.id
                ? 'opacity-25 grayscale blur-[1px]'
                : 'opacity-100',
            ]"
          >
            <span class="text-xl tracking-tight">{{ proposer.id }}</span>

            <span
              class="text-[10px] uppercase font-black tracking-tighter mt-1 border-t-2 border-current pt-1 w-full text-center block"
            >
              <template v-if="proposer.status === 'PROPOSING'"
                >Proposing &rarr; {{ proposer.activeTarget }}</template
              >
              <template v-else-if="proposer.status === 'HELD'"
                >Held by {{ proposer.activeTarget }}</template
              >
              <template v-else-if="proposer.status === 'REJECTED'">Rejected</template>
              <template v-else>Idle Pool</template>
            </span>
          </div>
        </div>
      </div>

      <div class="col-span-3">
        <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
          Priority Map
        </h3>

        <div
          class="border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[700px] overflow-y-auto text-sm space-y-3 transition-all duration-500"
        >
          <div v-if="!isSpotlightActive" class="text-center py-10 space-y-2 opacity-50">
            <span class="block text-2xl font-black animate-pulse">...</span>
            <span
              class="block text-xs font-black uppercase font-sans tracking-widest text-neutral-500"
              >Matrix tracking hidden vectors</span
            >
            <span class="block text-[10px] italic font-sans font-bold text-neutral-400"
              >Context will isolate upon breakpoint</span
            >
          </div>

          <div v-else class="animate-fade-in">
            <div
              class="font-black uppercase border-b-2 border-neutral-950 pb-1 text-center bg-blue-100 text-blue-900 py-1 mb-4 border-2 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]"
            >
              Active Target Isolation
            </div>

            <div
              class="flex flex-col border-2 border-neutral-900 bg-neutral-50 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <span
                class="font-black text-blue-700 text-xl border-b-2 border-neutral-300 pb-2 mb-3 text-center"
                >Proposer: {{ store.activeProposerId }}</span
              >

              <div class="flex flex-col space-y-2 font-mono text-sm font-bold text-black">
                <div
                  v-for="(receiverObj, idx) in getProposerPrefs(store.activeProposerId)"
                  :key="idx"
                  class="flex items-center justify-between px-2 py-1.5 transition-all duration-300"
                  :class="[
                    getPrefVisualState(store.activeProposerId!, receiverObj) === 'REJECTED'
                      ? 'opacity-40 line-through bg-neutral-200'
                      : '',
                    getPrefVisualState(store.activeProposerId!, receiverObj) === 'ACTIVE'
                      ? 'bg-blue-200 border-2 border-blue-900 shadow-[2px_2px_0px_0px_rgba(30,58,138,1)] -translate-y-0.5'
                      : '',
                    getPrefVisualState(store.activeProposerId!, receiverObj) === 'PENDING'
                      ? 'opacity-70'
                      : '',
                  ]"
                >
                  <span class="text-xs text-neutral-500 w-6">{{ idx + 1 }}.</span>
                  <span class="font-black tracking-widest text-base">{{ receiverObj }}</span>
                  <span class="w-6 text-right text-[10px] uppercase">
                    {{
                      getPrefVisualState(store.activeProposerId!, receiverObj) === 'ACTIVE'
                        ? 'Target'
                        : ''
                    }}
                  </span>
                </div>
              </div>
            </div>

            <p
              class="text-[11px] font-sans font-bold text-neutral-600 mt-4 leading-tight italic text-center"
            >
              Historical rejections are struck through. Current active target is highlighted.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-flip-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.list-flip-enter-active,
.list-flip-leave-active {
  transition: all 0.3s ease;
}
.list-flip-enter-from,
.list-flip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.list-flip-leave-active {
  position: absolute;
}

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
