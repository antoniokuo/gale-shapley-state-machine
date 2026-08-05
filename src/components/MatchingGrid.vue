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
      return 'bg-blue-500 text-white border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] z-10 scale-105'
    case 'HELD':
      return 'bg-emerald-400 text-neutral-950 border-emerald-900 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] font-black'
    case 'REJECTED':
      return 'bg-red-500 text-white border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]'
    default:
      return 'bg-white text-neutral-900 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
  }
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col space-y-6 font-mono text-neutral-900">
    <div
      class="w-full border-4 border-neutral-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm leading-relaxed border-solid"
    >
      <span class="font-black uppercase text-neutral-950 block text-xs tracking-wider mb-1.5"
        >&sect; Active Experimental Task Objective</span
      >
      Observe the asymmetric state mutations below. When execution halts at predefined breakpoints,
      evaluate the current matching queue allocations and predict the immediate downstream proposal
      outcome via the floating panel.
    </div>

    <div
      v-if="isDevMode"
      class="w-full border-4 border-blue-900 bg-blue-50 p-4 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]"
    >
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-black text-blue-900 uppercase tracking-wider block"
            >Dev-Telemetry Panel Active</span
          >
          <p class="text-xs text-neutral-900 font-bold mt-0.5">
            Decoupled execution clock simulation. Use slider to verify V8 memory compilation speeds.
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <label class="text-xs font-black text-neutral-900">Tick Interval:</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            v-model.number="store.tickRate"
            class="accent-blue-600 cursor-pointer h-2 bg-neutral-300 border border-neutral-500 rounded-none w-48"
          />
          <span
            class="text-xs font-black bg-white px-2 py-1 border-2 border-blue-900 min-w-[65px] text-center"
            >{{ store.tickRate }}ms</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-8 pt-2">
      <div class="col-span-5 space-y-4">
        <h3 class="text-lg font-black uppercase border-b-4 border-neutral-900 pb-1 mb-2">
          Receivers (Capacity: 3)
        </h3>

        <div
          v-for="(holds, receiverId) in store.receiverHolds"
          :key="receiverId"
          class="border-4 border-neutral-900 bg-neutral-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[110px] flex flex-col justify-between"
        >
          <span
            class="font-black text-xs text-neutral-900 bg-neutral-300 px-2 py-1 border-2 border-neutral-900 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >{{ receiverId }}</span
          >

          <TransitionGroup name="list-flip" tag="div" class="flex flex-wrap gap-2 mt-4 relative">
            <div
              v-for="proposerId in holds"
              :key="proposerId"
              class="px-2.5 py-1.5 bg-emerald-400 text-neutral-950 border-2 border-emerald-900 text-xs font-black shadow-[2px_2px_0px_0px_rgba(6,78,59,1)] transition-all duration-300"
            >
              {{ proposerId }}
            </div>
            <div
              v-if="holds.length === 0"
              :key="'empty-' + receiverId"
              class="text-neutral-900 font-bold text-xs italic py-1"
            >
              Awaiting propositions...
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="col-span-2 flex flex-col items-center justify-start pt-10">
        <div
          class="text-center border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full"
        >
          <span class="block text-[10px] font-black uppercase tracking-widest text-neutral-900 mb-1"
            >Store Status</span
          >
          <span
            class="block text-xs font-black uppercase tracking-tight text-emerald-600 animate-pulse"
            >Processing</span
          >
        </div>
      </div>

      <div class="col-span-5">
        <h3 class="text-lg font-black uppercase border-b-4 border-neutral-900 pb-1 mb-4">
          Proposers Pool
        </h3>

        <div class="grid grid-cols-5 gap-3">
          <div
            v-for="proposer in store.proposers"
            :key="proposer.id"
            :class="[
              'border-2 px-1 py-3.5 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ease-out',
              getProposerStatusClass(proposer.status),
            ]"
          >
            <span class="tracking-tight font-black">{{ proposer.id }}</span>
            <span
              v-if="proposer.activeTarget"
              class="text-[9px] font-black mt-1 uppercase opacity-100"
            >
              &rarr; {{ proposer.activeTarget }}
            </span>
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
