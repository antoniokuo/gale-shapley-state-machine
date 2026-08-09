<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMatchingStore } from '../stores/matchingStore'

const store = useMatchingStore()

const props = defineProps<{
  isStatic: boolean
}>()

const emit = defineEmits<{
  (
    e: 'submit',
    payload: { predictedAction: string; predictedTarget: string; latencyMs: number },
  ): void
}>()

const selectedAction = ref<'ACCEPT' | 'REJECT' | 'DISPLACE' | ''>('')
const selectedDisplacedNode = ref('')
const renderTimestamp = ref(0)

onMounted(() => {
  renderTimestamp.value = performance.now()
  window.addEventListener('keydown', handleKeyboardSubmit)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardSubmit)
})

const activeP = computed(() => store.activeProposerId || 'Unknown')
const activeR = computed(() => store.activeTargetReceiverId || 'Unknown')
const currentOccupants = computed(() => store.currentState?.receivers[activeR.value]?.matches || [])

const isFormValid = computed(() => {
  if (!selectedAction.value) return false
  if (selectedAction.value === 'DISPLACE' && !selectedDisplacedNode.value) return false
  return true
})

const executeSubmission = () => {
  if (!isFormValid.value) return

  const clickTimestamp = performance.now()
  const latencyMs = Math.max(1, Math.round(clickTimestamp - renderTimestamp.value))

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

// --------------------------------------------------
// MONOCHROME DYNAMIC STYLING COMPLIANCE (ADR 0003 & 0007)
// --------------------------------------------------
const getHeaderClass = () => {
  if (props.isStatic)
    return 'bg-neutral-950 text-white border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
  return 'bg-blue-600 text-white border-blue-950 shadow-[2px_2px_0px_0px_rgba(30,58,138,1)]'
}

const getContextBoxClass = () => {
  if (props.isStatic) return 'bg-white border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
  return 'bg-blue-50 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]'
}

const getProposerSpanClass = () => {
  if (props.isStatic) return 'text-neutral-950 font-black border-b-2 border-neutral-950'
  return 'font-black text-blue-700 bg-white px-1 border border-blue-900'
}

const getActionCardClass = (action: 'ACCEPT' | 'REJECT' | 'DISPLACE') => {
  const isSelected = selectedAction.value === action

  if (props.isStatic) {
    return isSelected
      ? 'bg-neutral-950 text-white border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.01]'
      : 'bg-white border-neutral-900 hover:bg-neutral-50 text-neutral-950'
  }

  if (!isSelected) return 'bg-neutral-50 border-neutral-900 hover:bg-neutral-100 text-black'

  switch (action) {
    case 'ACCEPT':
      return 'bg-emerald-400 border-emerald-950 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] scale-[1.01]'
    case 'REJECT':
      return 'bg-red-500 border-red-950 text-white shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] scale-[1.01]'
    case 'DISPLACE':
      return 'bg-amber-400 border-amber-950 shadow-[4px_4px_0px_0px_rgba(146,64,14,1)] scale-[1.01]'
  }
}
</script>

<template>
  <div
    class="w-full max-w-xl border-4 border-neutral-950 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-mono flex flex-col justify-between"
    style="height: 100%; min-height: 560px"
  >
    <div>
      <div class="border-b-4 border-neutral-950 pb-2 mb-4">
        <span
          class="text-xs font-black uppercase tracking-widest px-3 py-1 border-2"
          :class="getHeaderClass()"
        >
          System Halted
        </span>
        <h2 class="text-2xl font-black mt-2 text-neutral-950 tracking-tight uppercase">
          Prediction Required
        </h2>
      </div>

      <div class="border-2 p-3 mb-4 font-sans text-sm font-bold" :class="getContextBoxClass()">
        <p class="text-neutral-950 leading-relaxed">
          Proposer <span :class="getProposerSpanClass()">{{ activeP }}</span> is applying to
          Receiver <span :class="getProposerSpanClass()">{{ activeR }}</span
          >.
        </p>
      </div>

      <div class="space-y-2 mb-4">
        <label
          v-for="action in ['ACCEPT', 'REJECT', 'DISPLACE'] as const"
          :key="action"
          :class="[
            'border-4 p-3 flex flex-col cursor-pointer transition-all',
            getActionCardClass(action),
          ]"
        >
          <div class="flex items-center">
            <input type="radio" :value="action" v-model="selectedAction" class="hidden" />
            <span class="text-base font-black uppercase">{{ action }}</span>
          </div>
          <span class="text-xs font-sans mt-0.5 opacity-90">
            <template v-if="action === 'ACCEPT'"
              >Receiver has open slots and automatically accepts.</template
            >
            <template v-if="action === 'REJECT'"
              >Receiver targets current slots and rejects lower priority elements.</template
            >
            <template v-if="action === 'DISPLACE'"
              >Receiver is full but displaces an occupant based on preference dominance.</template
            >
          </span>
        </label>
      </div>

      <div
        v-if="selectedAction === 'DISPLACE'"
        class="mb-4 p-3 border-4 border-dashed border-neutral-900 bg-neutral-50 font-sans"
      >
        <label class="block text-xs font-black uppercase tracking-widest text-neutral-950 mb-2">
          Target Displacement Identity
        </label>
        <div class="grid grid-cols-3 gap-2">
          <label
            v-for="occ in currentOccupants"
            :key="occ"
            :class="[
              'border-2 p-2 text-center cursor-pointer font-black text-sm transition-all',
              selectedDisplacedNode === occ
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-neutral-950 border-neutral-900 hover:bg-neutral-100',
            ]"
          >
            <input type="radio" :value="occ" v-model="selectedDisplacedNode" class="hidden" />
            {{ occ }}
          </label>
        </div>
      </div>
    </div>

    <button
      :disabled="!isFormValid"
      @click="executeSubmission"
      class="w-full font-black uppercase py-4 px-4 text-base border-4 border-neutral-950 transition-all focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed bg-neutral-950 hover:bg-neutral-800 text-white active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none flex items-center justify-center space-x-2"
    >
      <span>Confirm Prediction Matrix</span>
      <span
        class="text-[10px] font-mono bg-neutral-800 px-2 py-0.5 border border-neutral-700 rounded-sm"
        >[Enter]</span
      >
    </button>
  </div>
</template>
