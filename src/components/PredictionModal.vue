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
    class="fixed bottom-8 right-8 z-50 max-w-sm w-full border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce-short"
  >
    <div class="border-b-4 border-neutral-950 pb-3 mb-5 font-mono">
      <span
        class="text-xs font-black uppercase tracking-widest text-white bg-red-600 px-2 py-1 border-2 border-red-950"
        >System Halted</span
      >
      <h2 class="text-2xl font-black mt-2 text-black tracking-tight">State Prediction</h2>
    </div>

    <p class="text-sm text-black font-bold font-sans mb-5 leading-relaxed">
      Evaluate the matrix. Input the immediate next algorithmic resolution to resume execution.
    </p>

    <div class="space-y-4 mb-6 font-sans">
      <div>
        <label
          class="block text-xs font-black uppercase tracking-widest text-neutral-900 mb-1.5 font-mono"
          >Predicted Action</label
        >
        <select
          v-model="selectedAction"
          class="w-full border-4 border-neutral-950 bg-neutral-50 p-3 text-base font-bold text-black focus:ring-0 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
        >
          <option disabled value="">Select operation...</option>
          <option value="ACCEPT">Target Accepts Applicant</option>
          <option value="REJECT">Target Rejects Applicant</option>
          <option value="DISPLACE">Target Displaces Occupant</option>
        </select>
      </div>

      <div>
        <label
          class="block text-xs font-black uppercase tracking-widest text-neutral-900 mb-1.5 font-mono"
          >Affected Target Node</label
        >
        <input
          v-model="selectedTarget"
          type="text"
          placeholder="e.g. R1 or P12"
          class="w-full border-4 border-neutral-950 bg-neutral-50 p-3 text-base font-bold text-black focus:ring-0 focus:border-blue-600 focus:bg-white outline-none uppercase placeholder:text-neutral-400 placeholder:normal-case"
        />
      </div>
    </div>

    <button
      :disabled="!selectedAction || !selectedTarget"
      @click="executeSubmission"
      class="w-full font-mono font-black uppercase py-4 px-4 text-base border-4 border-neutral-950 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
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
