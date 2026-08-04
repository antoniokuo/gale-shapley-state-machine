<script setup lang="ts">
import { useSessionStore } from './stores/sessionStore'
import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'

const session = useSessionStore()
</script>

<template>
  <main class="min-h-screen bg-neutral-50 p-6 flex flex-col items-center justify-center">
    <PISView v-if="session.currentPhase === 'PIS'" @continue="session.advanceTo('CONSENT')" />

    <ConsentGateway
      v-else-if="session.currentPhase === 'CONSENT'"
      @consented="session.initializeSession()"
    />

    <div
      v-else-if="session.currentPhase === 'TASK_1'"
      class="max-w-xl w-full border-4 border-neutral-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono"
    >
      <h2
        class="text-xl font-black mb-4 uppercase text-neutral-900 border-b-4 border-neutral-900 pb-2"
      >
        Session Initialised
      </h2>
      <div class="space-y-2 text-sm text-neutral-700">
        <p>
          <span class="font-bold text-neutral-900">Participant UUID:</span>
          <span class="bg-neutral-100 border border-neutral-300 px-1 font-mono text-xs">{{
            session.uuid
          }}</span>
        </p>
        <p>
          <span class="font-bold text-neutral-900">Sequence Allocation:</span> Group
          {{ session.sequenceGroup }}
        </p>
        <p>
          <span class="font-bold text-neutral-900">Period 1 Protocol:</span> Executing
          {{ session.task1Type }} Interface
        </p>
        <p>
          <span class="font-bold text-neutral-900">Period 2 Protocol:</span> Executing
          {{ session.task2Type }} Interface
        </p>
      </div>
      <div class="mt-6 border-t-2 border-neutral-200 pt-4 flex justify-between">
        <button
          @click="session.abortSession()"
          class="text-xs font-bold text-red-600 hover:underline"
        >
          Withdraw from Session
        </button>
        <button
          @click="session.advanceTo('DEBRIEF')"
          class="bg-neutral-900 text-white font-bold text-xs py-2 px-4 border border-neutral-900 hover:bg-neutral-800"
        >
          Simulate Task End
        </button>
      </div>
    </div>

    <DebriefView v-else-if="session.currentPhase === 'DEBRIEF'" />
  </main>
</template>
