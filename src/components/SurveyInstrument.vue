<script setup lang="ts">
import { ref } from 'vue'

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
// --- NASA-TLX State (21-point discrete scale: 0 to 20) ---
const ttlxDimensions = [
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
    desc: 'How insecure, discouraged, irritated, stressed, and annoyed versus secure, gratified, content, relaxed, and complacent did you feel during the task?',
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

      <div
        class="mt-4 bg-blue-50 border-l-8 border-blue-800 p-4 shadow-[2px_2px_0px_0px_rgba(30,58,138,0.2)]"
      >
        <p class="text-base font-sans font-bold text-blue-950 leading-relaxed">
          <strong class="uppercase text-blue-800 tracking-wider">Critical Directive:</strong><br />
          Please complete the following scales evaluating
          <span class="underline uppercase font-mono font-black">SOLELY</span> the specific
          interface mode you
          <span class="underline uppercase font-mono font-black">JUST</span> completed in the
          preceding task (<strong class="bg-blue-200 px-1">{{ props.conditionLabel }}</strong
          >). Do not evaluate the platform as a whole or prior task modes.
        </p>
      </div>
    </div>

    <div class="space-y-6 mb-12">
      <h3
        class="text-2xl font-black uppercase bg-neutral-100 p-3 border-4 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-tight"
      >
        Part 1: Task Load Index (NASA-TLX)
      </h3>

      <div
        v-for="dim in ttlxDimensions"
        :key="dim.key"
        class="border-4 border-neutral-900 p-5 bg-neutral-50"
      >
        <label class="block text-lg font-black uppercase mb-2 text-neutral-950">{{
          dim.label
        }}</label>
        <p class="text-sm font-sans font-bold text-neutral-700 mb-5 leading-relaxed">
          {{ dim.desc }}
        </p>

        <div class="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            v-model.number="nasaTlxResponses[dim.key]"
            class="flex-grow accent-neutral-950 h-3 bg-neutral-300 border-2 border-neutral-500 cursor-pointer"
          />
          <span
            class="text-lg font-black bg-white px-4 py-2 border-4 border-neutral-900 min-w-[60px] text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {{ nasaTlxResponses[dim.key] }}
          </span>
        </div>
        <div
          class="flex justify-between text-xs font-black text-neutral-500 uppercase tracking-widest mt-2 font-sans"
        >
          <span>{{ dim.key === 'performance' ? 'Perfect (0)' : 'Very Low (0)' }}</span>
          <span>{{ dim.key === 'performance' ? 'Failure (20)' : 'Very High (20)' }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-6 mb-10">
      <h3
        class="text-2xl font-black uppercase bg-neutral-100 p-3 border-4 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-tight"
      >
        Part 2: System Usability Scale (SUS)
      </h3>

      <div
        v-for="stem in susStems"
        :key="stem.id"
        class="border-4 border-neutral-900 p-5 bg-neutral-50 flex flex-col space-y-4"
      >
        <p class="text-base font-bold leading-relaxed text-neutral-900">
          <span class="font-mono font-black text-neutral-500 mr-2 text-lg">{{ stem.id }}.</span>
          {{ stem.text }}
        </p>

        <div class="grid grid-cols-5 gap-3 text-center">
          <label
            v-for="val in [1, 2, 3, 4, 5]"
            :key="val"
            :class="[
              'border-4 p-3 text-sm font-black cursor-pointer transition-all',
              susResponses[stem.id] === val
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105'
                : 'bg-white border-neutral-400 text-neutral-700 hover:bg-neutral-200 hover:border-neutral-600',
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
          class="flex justify-between text-xs font-black text-neutral-500 uppercase tracking-widest font-sans px-1 pt-1"
        >
          <span>Strongly Disagree (1)</span>
          <span>Neutral (3)</span>
          <span>Strongly Agree (5)</span>
        </div>
      </div>
    </div>

    <button
      @click="submitSurveyData"
      class="w-full font-black uppercase py-5 bg-neutral-950 text-white text-xl border-4 border-neutral-950 hover:bg-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
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
