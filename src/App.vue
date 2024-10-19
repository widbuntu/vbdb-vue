<template>
  <div class="container mt-5">
    <NavBar />
    <div class="tab-content" id="myTabContent">
      <TabPane id="vbdb" eventName="vbdb-tab" isActive>
        <VBDBTab />
      </TabPane>
      <TabPane id="results" eventName="results-tab">
        <ResultsTab />
      </TabPane>
      <TabPane id="rankings" eventName="rankings-tab">
        <Rankings />
      </TabPane>
      <TabPane id="teams" eventName="teams-tab">
        <TeamsTab />
      </TabPane>
      <TabPane id="players" eventName="players-tab">
        <PlayersTab /> <!-- Corrected from TeamsTab to PlayersTab -->
      </TabPane>
      <TabPane id="live" eventName="live-tab">
        <LiveTab /> <!-- Corrected from TeamsTab to PlayersTab -->
      </TabPane>
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import TabPane from './components/TabPane.vue';
import ResultsTab from './components/ResultsTab.vue';
import TeamsTab from './components/TeamsTab.vue';
import VBDBTab from './components/VBDBTab.vue';
import Rankings from './components/Rankings.vue';
import PlayersTab from './components/PlayersTab.vue';
import LiveTab from './components/LiveTab.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    TabPane,
    ResultsTab,
    TeamsTab,
    VBDBTab,
    Rankings,
    PlayersTab,
    LiveTab,
  },
};
</script>

<style>
.container {
  max-width: 1200px; /* Example max width */
}
</style>
