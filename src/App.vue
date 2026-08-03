<script setup lang="ts">
import { useSessionStore } from './stores/sessionStore'

// We will create and import these components in the next step
// import PISView from './components/PISView.vue';
// import ConsentGateway from './components/ConsentGateway.vue';
// import DebriefView from './components/DebriefView.vue';

const session = useSessionStore()
</script>

<template>
  <main class="app-container">
    <div v-if="session.currentPhase === 'PIS'">
      <h1>Participant Information Sheet (Placeholder)</h1>
      <button @click="session.advanceTo('CONSENT')">Read and Continue</button>
    </div>

    <div v-else-if="session.currentPhase === 'CONSENT'">
      <h1>Digital Consent Gateway (Placeholder)</h1>
      <button @click="session.initializeSession()">I Consent - Begin Session</button>
    </div>

    <div v-else-if="session.currentPhase === 'TASK_1'">
      <h1>Executing Task 1 ({{ session.task1Type }})</h1>
      <p>UUID: {{ session.uuid }}</p>
      <p>Group: {{ session.sequenceGroup }}</p>
      <button @click="session.advanceTo('DEBRIEF')">Simulate Task Completion</button>
    </div>

    <div v-else-if="session.currentPhase === 'DEBRIEF'">
      <h1>Debriefing Statement (Placeholder)</h1>
    </div>
  </main>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}
</style>
