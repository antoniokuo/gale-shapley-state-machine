<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGaleShapleyStore as useEngineStore } from '../stores/galeShapleyStore'

const store = useEngineStore()

const emit = defineEmits<{
  (
    e: 'submit',
    payload: { predictedAction: string; predictedTarget: string; latencyMs: number },
  ): void
}>()

const selectedAction = ref<'ACCEPT' | 'REJECT' | 'DISPLACE' | ''>('')
const selectedDisplacedNode = ref('')
const renderTimestamp = ref(0)

// Global Keyboard Listener to bypass DOM focus bugs
onMounted(() => {
  renderTimestamp.value = performance.now()
  window.addEventListener('keydown', handleKeyboardSubmit)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardSubmit)
})

// Dynamic Context Helpers
const activeP = computed(() => store.activeProposerId || 'Unknown')
const activeR = computed(() => store.activeTargetReceiverId || 'Unknown')
const currentOccupants = computed(() => store.receiverHolds[activeR.value] || [])

// Validation Gate
const isFormValid = computed(() => {
  if (!selectedAction.value) return false
  if (selectedAction.value === 'DISPLACE' && !selectedDisplacedNode.value) return false
  return true
})

const executeSubmission = () => {
  if (!isFormValid.value) return

  const clickTimestamp = performance.now()
  const latencyMs = Math.max(1, Math.round(clickTimestamp - renderTimestamp.value))

  // Automatic telemetry mapping (Hides the complexity from the user)
  let target = ''
  if (selectedAction.value === 'ACCEPT') target = activeR.value
  else if (selectedAction.value === 'REJECT') target = activeP.value
  else if (selectedAction.value === 'DISPLACE') target = selectedDisplacedNode.value

  emit('submit', {
    predictedAction: selectedAction.value,
    predictedTarget: target,
    latencyMs,
  })
}

const handleKeyboardSubmit = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (isFormValid.value) {
      executeSubmission()
    }
  }
}
</script>

<template>
  <div
    class="w-full max-w-xl border-4 border-neutral-950 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-mono animate-bounce-short"
  >
    <div class="border-b-4 border-neutral-950 pb-3 mb-6">
      <span
        class="text-sm font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1 border-2 border-blue-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >System Halted</span
      >
      <h2 class="text-3xl font-black mt-3 text-black tracking-tight uppercase">
        Prediction Required
      </h2>
    </div>

    <div
      class="bg-blue-50 border-2 border-blue-900 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]"
    >
      <p class="text-lg text-black font-sans font-bold leading-relaxed">
        Proposer
        <span class="font-black font-mono text-blue-700 bg-white px-1 border border-blue-900">{{
          activeP
        }}</span>
        is actively applying to Receiver
        <span class="font-black font-mono text-blue-700 bg-white px-1 border border-blue-900">{{
          activeR
        }}</span
        >.
      </p>
      <p class="text-base font-black text-neutral-900 mt-2">What will Receiver {{ activeR }} do?</p>
    </div>

    <div class="space-y-4 mb-6 font-sans">
      <label
        :class="[
          'border-4 p-4 flex flex-col cursor-pointer transition-colors',
          selectedAction === 'ACCEPT'
            ? 'bg-emerald-400 border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] scale-[1.02]'
            : 'bg-neutral-50 border-neutral-900 hover:bg-neutral-100',
        ]"
      >
        <div class="flex items-center">
          <input type="radio" value="ACCEPT" v-model="selectedAction" class="hidden" />
          <span class="text-xl font-black text-black">ACCEPT</span>
        </div>
        <span class="text-sm font-bold text-neutral-800 mt-1"
          >Receiver has open seats and automatically accepts.</span
        >
      </label>

      <label
        :class="[
          'border-4 p-4 flex flex-col cursor-pointer transition-colors',
          selectedAction === 'REJECT'
            ? 'bg-red-500 border-red-950 text-white shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] scale-[1.02]'
            : 'bg-neutral-50 border-neutral-900 hover:bg-neutral-100',
        ]"
      >
        <div class="flex items-center">
          <input type="radio" value="REJECT" v-model="selectedAction" class="hidden" />
          <span
            class="text-xl font-black"
            :class="selectedAction === 'REJECT' ? 'text-white' : 'text-black'"
            >REJECT</span
          >
        </div>
        <span
          class="text-sm font-bold mt-1"
          :class="selectedAction === 'REJECT' ? 'text-red-100' : 'text-neutral-800'"
          >Receiver is full and prefers all current occupants over this new applicant.</span
        >
      </label>

      <label
        :class="[
          'border-4 p-4 flex flex-col cursor-pointer transition-colors',
          selectedAction === 'DISPLACE'
            ? 'bg-amber-400 border-amber-950 shadow-[4px_4px_0px_0px_rgba(146,64,14,1)] scale-[1.02]'
            : 'bg-neutral-50 border-neutral-900 hover:bg-neutral-100',
        ]"
      >
        <div class="flex items-center">
          <input type="radio" value="DISPLACE" v-model="selectedAction" class="hidden" />
          <span class="text-xl font-black text-black">DISPLACE</span>
        </div>
        <span class="text-sm font-bold text-neutral-800 mt-1"
          >Receiver is full, but prefers the new applicant over a current occupant.</span
        >
      </label>
    </div>

    <div
      v-if="selectedAction === 'DISPLACE'"
      class="mb-6 p-4 border-4 border-dashed border-neutral-900 bg-neutral-100 animate-fade-in font-sans"
    >
      <label class="block text-sm font-black uppercase tracking-widest text-black mb-3"
        >Who gets displaced?</label
      >
      <div v-if="currentOccupants.length === 0" class="text-sm font-bold text-red-600">
        Error: Cannot displace from an empty Receiver. Change action to ACCEPT.
      </div>
      <div v-else class="grid grid-cols-3 gap-3">
        <label
          v-for="occ in currentOccupants"
          :key="occ"
          :class="[
            'border-2 p-3 text-center cursor-pointer font-black text-lg transition-all',
            selectedDisplacedNode === occ
              ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-black border-neutral-900 hover:bg-neutral-200',
          ]"
        >
          <input type="radio" :value="occ" v-model="selectedDisplacedNode" class="hidden" />
          {{ occ }}
        </label>
      </div>
    </div>

    <button
      :disabled="!isFormValid"
      @click="executeSubmission"
      class="w-full font-black uppercase py-5 px-4 text-lg border-4 border-neutral-950 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed bg-neutral-950 hover:bg-neutral-800 text-white active:translate-x-0.5 active:translate-y-0.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none flex items-center justify-center space-x-2"
    >
      <span>Confirm Prediction</span>
      <span class="text-xs font-mono bg-neutral-800 px-2 py-1 border border-neutral-700 rounded-sm"
        >[Enter]</span
      >
    </button>
  </div>
</template>

<style scoped>
/* FIX: Animation converted back to standard vertical translation */
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
  animation: bounceShort 2.5s infinite ease-in-out;
}

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
