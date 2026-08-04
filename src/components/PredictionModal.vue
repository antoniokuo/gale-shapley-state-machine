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

// Capture the precise timestamp when the modal hits the DOM
onMounted(() => {
  renderTimestamp.value = performance.now()
})

const executeSubmission = () => {
  const clickTimestamp = performance.now()
  // Isolate human cognitive processing latency (T_cognitive)
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
    class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm"
  >
    <div
      class="bg-white border-4 border-neutral-900 p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-mono"
    >
      <div class="border-b-4 border-neutral-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <span
            class="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-100 px-2 py-1 border border-red-300"
            >Execution Halted</span
          >
          <h2 class="text-2xl font-black mt-2 text-neutral-900">Predict Next State</h2>
        </div>
      </div>

      <p class="text-sm text-neutral-700 mb-6">
        Based on the current DAG topology, predict the immediate next algorithmic resolution.
      </p>

      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2"
            >Predicted Action</label
          >
          <select
            v-model="selectedAction"
            class="w-full border-2 border-neutral-900 bg-neutral-50 p-3 text-sm font-bold focus:ring-0 focus:border-blue-500 outline-none"
          >
            <option disabled value="">Select operation...</option>
            <option value="ACCEPT">Target Accepts Proposer</option>
            <option value="REJECT">Target Rejects Proposer</option>
            <option value="DISPLACE">Target Displaces Existing Hold</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2"
            >Affected Target (Receiver/Proposer)</label
          >
          <input
            v-model="selectedTarget"
            type="text"
            placeholder="e.g. R1 or P12"
            class="w-full border-2 border-neutral-900 bg-neutral-50 p-3 text-sm font-bold focus:ring-0 focus:border-blue-500 outline-none uppercase placeholder:normal-case"
          />
        </div>
      </div>

      <button
        :disabled="!selectedAction || !selectedTarget"
        @click="executeSubmission"
        class="w-full font-mono font-bold uppercase py-4 px-6 border-2 border-neutral-900 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-400 text-white active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
      >
        Submit Prediction & Resume
      </button>
    </div>
  </div>
</template>
