<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (
    e: 'submit',
    payload: { predictedAction: string; predictedTarget: string; latencyMs: number },
  ): void
}>()

const selectedAction = ref('')
const selectedTarget = ref('')
const renderTimestamp = ref(0)

onMounted(() => {
  renderTimestamp.value = performance.now()
})

const executeSubmission = () => {
  const clickTimestamp = performance.now()
  const latencyMs = Math.max(1, Math.round(clickTimestamp - renderTimestamp.value))

  emit('submit', {
    predictedAction: selectedAction.value,
    predictedTarget: selectedTarget.value,
    latencyMs,
  })
}
</script>

<template>
  <div
    class="fixed bottom-6 right-6 z-50 max-w-sm w-full border-4 border-neutral-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono animate-bounce-short"
  >
    <div class="border-b-2 border-neutral-900 pb-2 mb-4">
      <span
        class="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-100 px-1.5 py-0.5 border border-red-300"
        >Machine Halted</span
      >
      <h2 class="text-lg font-black mt-1 text-neutral-900">Predict Next State</h2>
    </div>

    <p class="text-xs text-neutral-600 mb-4 leading-relaxed">
      Observe the matching grid in the background and input the next operational move.
    </p>

    <div class="space-y-3 mb-4">
      <div>
        <label class="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1"
          >Predicted Action</label
        >
        <select
          v-model="selectedAction"
          class="w-full border-2 border-neutral-900 bg-neutral-50 p-2 text-xs font-bold focus:ring-0 focus:border-blue-500 outline-none"
        >
          <option disabled value="">Select operation...</option>
          <option value="ACCEPT">Target Accepts Proposer</option>
          <option value="REJECT">Target Rejects Proposer</option>
          <option value="DISPLACE">Target Displaces Existing Hold</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1"
          >Affected Target (Receiver/Proposer)</label
        >
        <input
          v-model="selectedTarget"
          type="text"
          placeholder="e.g. R1 or P1"
          class="w-full border-2 border-neutral-900 bg-neutral-50 p-2 text-xs font-bold focus:ring-0 focus:border-blue-500 outline-none uppercase"
        />
      </div>
    </div>

    <button
      :disabled="!selectedAction || !selectedTarget"
      @click="executeSubmission"
      class="w-full font-mono font-bold uppercase py-2 px-4 text-xs border-2 border-neutral-900 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-400 text-white active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
    >
      Submit & Resume
    </button>
  </div>
</template>

<style scoped>
@keyframes bounceShort {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounce-short {
  animation: bounceShort 2s infinite ease-in-out;
}
</style>
