<template>
  <div class="container mt-5">
    <NavBar />
    <div class="tab-content" id="myTabContent">
      <TabPane id="results" eventName="results-tab">
        <ResultsTab />
      </TabPane>
      <!-- Add other TabPane components for other tabs as needed -->
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import TabPane from './components/TabPane.vue'
import ResultsTab from './components/ResultsTab.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    TabPane,
    ResultsTab
  }
}
</script>