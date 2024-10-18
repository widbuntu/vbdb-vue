<template>
    <div>
      <h2 class="text-center">Results 2024</h2>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div class="container-fluid">
          <!-- ... (keep the existing dropdowns and date inputs) ... -->
        </div>
        <div class="table-responsive" style="overflow-x: auto">
          <table id="resultsTable" class="table table-dark table-hover table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Results</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.date + row.match">
                <td>{{ row.date }}</td>
                <td v-html="row.match" style="width: 35%;"></td>
                <td>
                  {{ row.results }}
                  <a :href="row.boxScoreUrl" target="_blank">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="filteredRows.length === 0">No results found.</div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { teamsData, extractTeamsFromCSV, filterRows, fetchResultsData } from '../utils/resultsUtils';
  
  export default {
    name: 'ResultsTab',
    setup() {
      const allResultRows = ref([]);
      const selectedConference = ref('');
      const selectedTeam = ref('');
      const startDate = ref('2024-08-15');
      const endDate = ref('2024-12-15');
      const loading = ref(true);
  
      const conferences = computed(() => [...new Set(teamsData.value.map(team => team.conference))].sort());
      const teams = computed(() => 
        selectedConference.value
          ? teamsData.value.filter(team => team.conference === selectedConference.value)
          : teamsData.value
      );
  
      const filteredRows = computed(() => {
        console.log('Filtering rows:', allResultRows.value.length);
        return filterRows(allResultRows.value, 'match', selectedConference.value, selectedTeam.value)
          .filter(row => {
            const rowDate = new Date(row.date);
            return rowDate >= new Date(startDate.value) && rowDate <= new Date(endDate.value);
          });
      });
  
      const loadData = async () => {
        try {
          const schedulesCsvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/test_sch.csv';
          const teamsCsvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/main/data/teams2.csv';
  
          allResultRows.value = await fetchResultsData(schedulesCsvUrl);
          teamsData.value = await extractTeamsFromCSV(teamsCsvUrl);
          console.log('Data loaded:', allResultRows.value.length, teamsData.value.length);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          loading.value = false;
        }
      };
  
      const filterResults = () => {
        console.log('Filtering results');
        // The filtering is handled by the computed property
      };
  
      onMounted(() => {
        loadData();
      });
  
      return {
        allResultRows,
        conferences,
        teams,
        selectedConference,
        selectedTeam,
        startDate,
        endDate,
        filteredRows,
        filterResults,
        loading
      };
    }
  }
  </script>