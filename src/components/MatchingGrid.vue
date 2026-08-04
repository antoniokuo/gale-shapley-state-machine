<script setup lang="ts">
import { useGaleShapleyStore } from '../stores/sessionStore' // We will map this from the actual store path
import { useGaleShapleyStore as useEngineStore } from '../stores/galeShapleyStore'

const store = useEngineStore()

// ADR 0003: Strict Functional Color Tokens
const getProposerStatusClass = (status: string) => {
  switch (status) {
    case 'PROPOSING':
      return 'bg-blue-500 text-white border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] z-10 scale-105 transition-transform'
    case 'HELD':
      return 'bg-emerald-400 text-neutral-950 border-emerald-900 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] opacity-50'
    case 'REJECTED':
      return 'bg-red-500 text-white border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]'
    default:
      return 'bg-white text-neutral-900 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
  }
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto grid grid-cols-12 gap-8 font-mono">
    <div class="col-span-5 space-y-4">
      <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
        Receivers (Capacity: 3)
      </h3>
      <div
        v-for="(holds, receiverId) in store.receiverHolds"
        :key="receiverId"
        class="border-4 border-neutral-900 bg-neutral-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[100px] flex flex-col"
      >
        <span class="font-bold text-lg mb-2">{{ receiverId }}</span>
        <div class="flex flex-wrap gap-2 mt-auto">
          <div
            v-for="proposerId in holds"
            :key="proposerId"
            class="px-2 py-1 bg-emerald-400 text-neutral-950 border-2 border-emerald-900 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]"
          >
            {{ proposerId }}
          </div>
          <div v-if="holds.length === 0" class="text-neutral-400 text-sm italic">Empty</div>
        </div>
      </div>
    </div>

    <div class="col-span-2 flex flex-col items-center justify-start pt-12">
      <div
        class="text-center border-4 border-neutral-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full"
      >
        <span class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1"
          >Engine Pace</span
        >
        <span class="block text-2xl font-black">{{ store.tickRate }}ms</span>
      </div>
    </div>

    <div class="col-span-5">
      <h3 class="text-xl font-black uppercase border-b-4 border-neutral-900 pb-2 mb-4">
        Proposers
      </h3>
      <div class="grid grid-cols-5 gap-3">
        <div
          v-for="proposer in store.proposers"
          :key="proposer.id"
          :class="[
            'border-2 px-1 py-3 flex flex-col items-center justify-center text-sm font-bold cursor-default select-none',
            getProposerStatusClass(proposer.status),
          ]"
        >
          <span>{{ proposer.id }}</span>
          <span v-if="proposer.activeTarget" class="text-[10px] mt-1 tracking-tighter">
            &rarr; {{ proposer.activeTarget }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
