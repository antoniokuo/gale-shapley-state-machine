<script setup lang="ts">
import { computed } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'

const store = useMatchingStore()

// Safely extract active pointer states
const activeP = computed(() => store.activeProposerId || 'Unknown')
const activeR = computed(() => store.activeTargetReceiverId || 'Unknown')

// Extract immutable historical ranks and current mutable occupants
const receiverRanks = computed(
  () => store.activeDataset?.receiverInvertedRanks[activeR.value] || {},
)
const currentOccupants = computed(() => store.currentState?.receivers[activeR.value]?.matches || [])

// Compute the isolated priority matrix: Current Occupants + The New Applicant
const relevantEntities = computed(() => {
  const entities = [...currentOccupants.value, activeP.value]

  return entities
    .map((id) => ({
      id,
      rank: receiverRanks.value[id] || 999,
      isApplicant: id === activeP.value,
    }))
    .sort((a, b) => a.rank - b.rank) // Sort mathematically: 1 is highest priority
})
</script>

<template>
  <div class="w-full h-full flex flex-col font-mono animate-fade-in">
    <div
      class="bg-blue-600 text-white p-3 border-4 border-blue-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] mb-6"
    >
      <span class="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
        Dynamic Context Isolation
      </span>
      <h4 class="text-lg font-black uppercase tracking-tight">
        Receiver {{ activeR }} Priority Queue
      </h4>
    </div>

    <div class="flex-grow flex flex-col space-y-3">
      <div
        v-for="(entity, index) in relevantEntities"
        :key="entity.id"
        :class="[
          'flex items-center justify-between p-3 border-4 transition-all duration-300',
          entity.isApplicant
            ? 'bg-blue-50 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] scale-[1.02] z-10'
            : 'bg-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        ]"
      >
        <div class="flex items-center space-x-4">
          <span class="text-xl font-black text-neutral-400 w-6">{{ index + 1 }}.</span>
          <span
            class="text-2xl font-black"
            :class="entity.isApplicant ? 'text-blue-700' : 'text-neutral-950'"
          >
            {{ entity.id }}
          </span>
        </div>

        <span
          class="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2"
          :class="
            entity.isApplicant
              ? 'bg-blue-600 text-white border-blue-950'
              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
          "
        >
          {{ entity.isApplicant ? 'Incoming Applicant' : 'Current Occupant' }}
        </span>
      </div>
    </div>

    <div
      class="mt-6 p-4 border-t-4 border-neutral-900 bg-neutral-50 text-xs font-bold font-sans text-neutral-700 leading-relaxed"
    >
      <span class="text-red-600 font-black uppercase tracking-widest block mb-1"
        >Evaluation Rule</span
      >
      If the Receiver has reached its quota (C=3), it will exclusively retain the top 3 ranked
      nodes. The 4th node is rejected or displaced.
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
