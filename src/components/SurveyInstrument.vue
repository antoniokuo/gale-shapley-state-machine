<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/sessionStore'

const session = useSessionStore()

const props = defineProps<{
  conditionLabel: 'Static View' | 'Interactive DAG View'
}>()

const emit = defineEmits<{
  (
    e: 'submit-survey',
    payload: { nasaTlx: Record<string, number>; sus: Record<number, number> },
  ): void
}>()

// --- NASA-TLX State (21-point discrete scale: 0 to 20) ---
const tlxDimensions = [
  {
    key: 'mentalDemand',
    label: '1. Mental Demand',
    desc: 'How much mental and perceptual activity was required (e.g., thinking, deciding, calculating, remembering, looking, searching)?',
  },
  {
    key: 'physicalDemand',
    label: '2. Physical Demand',
    desc: 'How much physical activity was required (e.g., pushing, pulling, turning, controlling, activating)?',
  },
  {
    key: 'temporalDemand',
    label: '3. Temporal Demand',
    desc: 'How much time pressure did you feel due to the rate or pace at which the tasks or task elements occurred?',
  },
  {
    key: 'performance',
    label: '4. Performance',
    desc: 'How successful do you think you were in accomplishing the goals of the task set by the experimenter? (0 = Perfect, 20 = Failure)',
  },
  {
    key: 'effort',
    label: '5. Effort',
    desc: 'How hard did you have to work (mentally and physically) to accomplish your level of performance?',
  },
  {
    key: 'frustration',
    label: '6. Frustration Level',
    desc: 'How insecure, discouraged, irritated, stressed, and annoyed versus secure, gratified, content, relaxed, and complacent did you feel?',
  },
]

const nasaTlxResponses = ref<Record<string, number>>({
  mentalDemand: 10,
  physicalDemand: 10,
  temporalDemand: 10,
  performance: 10,
  effort: 10,
  frustration: 10,
})

// --- System Usability Scale State (5-point Likert: 1 to 5) ---
const susStems = [
  { id: 1, text: 'I think that I would like to use this system frequently.' },
  { id: 2, text: 'I found the system unnecessarily complex.' },
  { id: 3, text: 'I thought the system was easy to use.' },
  {
    id: 4,
    text: 'I think that I would need the support of a technical person to be able to use this system.',
  },
  { id: 5, text: 'I found the various functions in this system were well integrated.' },
  { id: 6, text: 'I thought there was too much inconsistency in this system.' },
  { id: 7, text: 'I would imagine that most people would learn to use this system very quickly.' },
  { id: 8, text: 'I found the system very cumbersome to use.' },
  { id: 9, text: 'I felt very confident using the system.' },
  { id: 10, text: 'I needed to learn a lot of things before I could get going with this system.' },
]

const susResponses = ref<Record<number, number>>({
  1: 3,
  2: 3,
  3: 3,
  4: 3,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 3,
  10: 3,
})

const submitSurveyData = () => {
  emit('submit-survey', {
    nasaTlx: { ...nasaTlxResponses.value },
    sus: { ...susResponses.value },
  })
}
</script>

<template>
  <div
    class="w-full max-w-3xl mx-auto bg-white border-4 border-neutral-950 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-mono text-black animate-fade-in"
  >
    <div class="border-b-4 border-neutral-950 pb-4 mb-8">
      <span
        class="text-xs font-black uppercase tracking-widest text-white bg-neutral-950 px-3 py-1 border-2 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Psychometric Evaluation Gateway
      </span>
      <h2 class="text-3xl font-black mt-3 uppercase tracking-tight">Condition Survey</h2>
      <p
        class="text-sm font-sans font-bold text-red-600 mt-2 leading-relaxed bg-neutral-50 p-3 border-2 border-dashed border-neutral-400"
      >
        <strong>CRITICAL DIRECTIVE:</strong> Please complete the following scales evaluating
        <span class="underline uppercase font-mono font-black">SOLELY</span> the specific interface
        mode you <span class="underline uppercase font-mono font-black">JUST</span> completed in the
        preceding task ({{ props.conditionLabel }}). Do not evaluate the platform as a whole or
        prior task modes.
      </p>
    </div>

    <div class="space-y-6 mb-10">
      <h3
        class="text-xl font-black uppercase bg-neutral-100 p-2 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        Part 1: Task Load Index (NASA-TLX) [cite: 42]
      </h3>

      <div
        v-for="dim in tlxDimensions"
        :key="dim.key"
        class="border-2 border-neutral-900 p-4 bg-neutral-50"
      >
        <label class="block text-base font-black uppercase mb-1">{{ dim.label }}</label>
        <p class="text-xs font-sans font-bold text-neutral-600 mb-3 leading-snug">{{ dim.desc }}</p>

        <div class="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            v-model.number="nasaTlxResponses[dim.key]"
            class="flex-grow accent-neutral-950 h-2 bg-neutral-200 border border-neutral-400 cursor-pointer"
          />
          <span
            class="text-sm font-black bg-white px-3 py-1 border-2 border-neutral-900 min-w-[50px] text-center"
          >
            {{ nasaTlxResponses[dim.key] }}
          </span>
        </div>
        <div
          class="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-1 font-sans"
        >
          <span>{{ dim.key === 'performance' ? 'Perfect (0)' : 'Very Low (0)' }}</span>
          <span>{{ dim.key === 'performance' ? 'Failure (20)' : 'Very High (20)' }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-6 mb-8">
      <h3
        class="text-xl font-black uppercase bg-neutral-100 p-2 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        Part 2: System Usability Scale (SUS) [cite: 58]
      </h3>

      <div
        v-for="stem in susStems"
        :key="stem.id"
        class="border-2 border-neutral-900 p-4 bg-neutral-50 flex flex-col space-y-3"
      >
        <p class="text-sm font-bold leading-normal">
          <span class="font-mono font-black text-neutral-400 mr-1">{{ stem.id }}.</span>
          {{ stem.text }}
        </p>

        <div class="grid grid-cols-5 gap-2 text-center">
          <label
            v-for="val in [1, 2, 3, 4, 5]"
            :key="val"
            :class="[
              'border-2 p-2 text-xs font-black cursor-pointer transition-colors',
              susResponses[stem.id] === val
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100',
            ]"
          >
            <input
              type="radio"
              :name="'sus-' + stem.id"
              :value="val"
              v-model.number="susResponses[stem.id]"
              class="hidden"
            />
            <span>{{ val }}</span>
          </label>
        </div>
        <div
          class="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-sans px-1"
        >
          <span>Strongly Disagree (1)</span>
          <span>Neutral (3)</span>
          <span>Strongly Agree (5)</span>
        </div>
      </div>
    </div>

    <button
      @click="submitSurveyData"
      class="w-full font-black uppercase py-4 bg-neutral-950 text-white text-lg border-4 border-neutral-950 hover:bg-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
    >
      Commit Psychometric Record &rarr;
    </button>
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
