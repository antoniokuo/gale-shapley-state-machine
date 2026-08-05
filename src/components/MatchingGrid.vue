<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGaleShapleyStore as useEngineStore } from '../stores/galeShapleyStore'

const store = useEngineStore()
const isDevMode = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  isDevMode.value = params.get('mode') === 'dev'
})

const getProposerStatusClass = (status: string) => {
  switch (status) {
    case 'PROPOSING':
      return 'bg-blue-600 text-white border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] scale-105 z-10'
    case 'HELD':
      return 'bg-emerald-400 text-neutral-950 border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] font-black'
    case 'REJECTED':
      return 'bg-red-600 text-white border-red-950 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]'
    default:
      return 'bg-white text-neutral-950 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
  }
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col space-y-6 font-mono text-neutral-950">
    <div
      class="w-full border-4 border-neutral-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm leading-relaxed border-solid"
    >
      <span
        class="font-black uppercase text-neutral-950 block text-xs tracking-widest mb-1.5 border-b-2 border-neutral-900 pb-1"
        >&sect; Active Experimental Task Objective</span
      >
      Evaluate the active proposal updates. If execution halts, reference the preference directory
      panel on the right margin to track candidate priority queues, then declare your state
      assertion via the floating entry pad.
    </div>

    <div
      v-if="isDevMode"
      class="w-full border-4 border-blue-950 bg-blue-100 p-4 shadow-[6px_6px_0px_0px_rgba(30,58,138,1)]"
    >
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-black text-blue-950 uppercase tracking-wider block"
            >Dev-Telemetry Panel Active</span
          >
          <p class="text-xs text-neutral-900 mt-0.5">
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
            class="accent-blue-700 cursor-pointer h-2 bg-neutral-300 border rounded-none w-48"
          />
          <span
            class="text-sm font-black bg-white px-2 py-1 border-2 border-blue-900 min-w-[65px] text-center"
            >{{ store.tickRate }}ms</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6 pt-2 items-start">
      <div class="col-span-4 space-y-4">
        <h3 class="text-base font-black uppercase border-b-4 border-neutral-900 pb-1 mb-2">
          Receivers (Capacity: 3)
        </h3>
        <div
          v-for="(holds, receiverId) in store.receiverHolds"
          :key="receiverId"
          class="border-4 border-neutral-900 bg-neutral-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[120px] flex flex-col justify-between"
        >
          <span
            class="font-black text-xs text-neutral-950 bg-neutral-300 px-3 py-1 border-2 border-neutral-900 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
            >{{ receiverId }}</span
          >
          <TransitionGroup name="list-flip" tag="div" class="flex flex-wrap gap-2 mt-4 relative">
            <div
              v-for="proposerId in holds"
              :key="proposerId"
              class="px-3 py-1.5 bg-emerald-400 text-neutral-950 border-2 border-emerald-950 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {{ proposerId }}
            </div>
            <div
              v-if="holds.length === 0"
              :key="'empty-' + receiverId"
              class="text-neutral-500 font-bold text-xs italic py-1"
            >
              Awaiting propositions...
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="col-span-5">
        <h3 class="text-base font-black uppercase border-b-4 border-neutral-900 pb-1 mb-4">
          Proposers Pool
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="proposer in store.proposers"
            :key="proposer.id"
            :class="[
              'border-4 flex flex-col transition-all duration-300 text-sm overflow-hidden min-h-[75px]',
              getProposerStatusClass(proposer.status),
            ]"
          >
            <div
              class="px-3 py-1.5 font-black bg-neutral-900 text-white text-base border-b-2 border-neutral-900 flex justify-between items-center"
            >
              <span>{{ proposer.id }}</span>
              <span
                class="text-[10px] bg-white text-black px-1.5 py-0.2 border border-black uppercase font-mono tracking-tighter"
                >{{ proposer.status }}</span
              >
            </div>
            <div
              class="p-2 flex-grow flex items-center justify-center font-bold text-center text-xs tracking-tight bg-white text-black"
            >
              <span
                v-if="proposer.status === 'PROPOSING'"
                class="text-blue-700 font-black uppercase"
              >
                Proposing &rarr; {{ proposer.activeTarget }}
              </span>
              <span
                v-else-if="proposer.status === 'HELD'"
                class="text-emerald-700 font-black uppercase"
              >
                Held by {{ proposer.activeTarget }}
              </span>
              <span
                v-else-if="proposer.status === 'REJECTED'"
                class="text-red-600 font-black uppercase"
              >
                Rejected
              </span>
              <span v-else class="text-neutral-500 italic"> Idle Pool </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-3">
        <h3 class="text-base font-black uppercase border-b-4 border-neutral-900 pb-1 mb-4">
          Preference Matrix
        </h3>
        <div
          class="border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[680px] overflow-y-auto text-xs space-y-2"
        >
          <div
            class="font-black uppercase border-b border-neutral-300 pb-1 text-center bg-neutral-100 mb-2 py-0.5 border"
          >
            Priority Vectors
          </div>

          <div
            v-for="proposer in store.proposers"
            :key="'matrix-' + proposer.id"
            class="flex items-center justify-between border-b border-neutral-200 pb-1.5 font-mono"
          >
            <span
              class="font-black text-neutral-950 border-r border-neutral-300 pr-2 min-w-[35px]"
              >{{ proposer.id }}</span
            >
            <div
              class="flex items-center space-x-1 pl-2 overflow-x-auto tracking-tighter text-[11px] font-bold text-neutral-800"
            >
              <span class="underline decoration-blue-500 decoration-2">R1</span> &rarr;
              <span>R2</span> &rarr; <span>R3</span> &rarr; <span>R4</span>
            </div>
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
</style>
