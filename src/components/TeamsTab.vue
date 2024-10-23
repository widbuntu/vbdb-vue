<template>
        <v-card class="custom-card">
          <v-card-title class="text-center custom-title">
            <h2>Teams Data</h2>
          </v-card-title>
          <v-spacer></v-spacer>
          <div class="container-fluid">
            <v-row class="mb-3 align-center">
              <v-col>
                <!-- Conference Dropdown -->
                <v-select v-model="selectedConference" :transition="false" :items="conferenceOptions"
                  label="Select a Conference" clearable class="custom-dropdown form-select-sm"
                  variant="outlined"></v-select>
              </v-col>
              <v-col>
                <!-- Search Text Field -->
                <v-text-field v-model="search" label="Search all..." :transition="false" single-line
                  class="custom-search form-select-sm" variant="outlined"></v-text-field>
              </v-col>
            </v-row>

            <v-data-table :headers="headers" :items="filteredTeams" :search="search" :items-per-page="-1"
              :loading="loading" class="custom-table" fixed-header height="480px" :hover="true" :striped="true">
              <template v-slot:[`item.school_athletic_url`]="{ item }">
                <a :href="`https://${item.school_athletic_url}`" target="_blank" class="custom-link">
                  {{ item.school_athletic_url }}
                </a>
              </template>
            </v-data-table>
          </div>
        </v-card>
</template>

<script>
import { ref, computed } from 'vue'
import Papa from 'papaparse'

export default {
  name: 'App',
  setup() {
    const search = ref('')
    const selectedConference = ref('All Conferences')  // Set default value to "All Conferences"
    const loading = ref(true)
    const teams = ref([])
    const headers = ref([
      { title: 'Team Name', align: 'start', sortable: true, key: 'team_name' },
      { title: 'Conference', align: 'start', sortable: true, key: 'conference_short' },
      // { title: 'Conference Name', align: 'start', sortable: true, key: 'conference_name' },
      { title: 'Athletic URL', align: 'start', sortable: true, key: 'school_athletic_url' },
      // { title: 'Division', align: 'start', sortable: true, key: 'division' }
    ])

    const conferenceOptions = ref([])

    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/teams.csv');
        const csvData = await response.text();

        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            // Filter out entries with blank team_name or conference_short
            const filteredData = results.data.filter(item =>
              item.team_name && item.conference_name // Check for truthy values
            );

            teams.value = filteredData; // Update teams with filtered data
            loading.value = false;
            populateConferenceOptions(filteredData); // Use filtered data for conference options
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
        loading.value = false;
      }
    };

    const populateConferenceOptions = (data) => {
      // Extract unique conference names from the filtered data
      const conferences = [...new Set(data.map(team => team.conference_name))].sort();
      conferenceOptions.value = ['All Conferences', ...conferences]; // Add "All Conferences"
    };

    // Filter teams based on the selected conference
    const filteredTeams = computed(() => {
      if (selectedConference.value === 'All Conferences') {
        return teams.value;
      }
      return teams.value.filter(team => team.conference_name === selectedConference.value);
    });

    fetchData()

    return {
      search,
      loading,
      teams,
      headers,
      conferenceOptions,
      selectedConference,
      filteredTeams
    }
  }
}
</script>

<style>
/* Global styles */
:root {
  --background-dark: #212529;
  --surface-dark: #343a40;
  --border-color: #495057;
  --text-color: #f8f9fa;
  --header-bg: #333;
}

.custom-theme {
  font-family: 'Hack Nerd Font', sans-serif !important;
  background-color: var(--background-dark) !important;
  color: var(--text-color) !important;
  max-height: 800px;
}

.custom-card {
  background-color: var(--surface-dark) !important;
  color: var(--text-color) !important;
  border: 1px solid var(--border-color) !important;
}

.custom-title {
  color: var(--text-color) !important;
  font-size: 1.25rem !important;
}

.custom-search {
  color: var(--text-color) !important;
}

.custom-search .v-field {
  color: var(--text-color) !important;
  background-color: var(--surface-dark) !important;
  border-color: var(--border-color) !important;
}

.custom-search .v-field__input {
  color: var(--text-color) !important;
}

.custom-search label {
  color: var(--text-color) !important;
}

.custom-dropdown {
  color: var(--text-color) !important;
}

.custom-table {
  background-color: var(--surface-dark) !important;
  color: var(--text-color) !important;
}


.custom-table .v-data-table-header {
  background-color: var(--header-bg) !important;
  position: sticky !important;
  top: 0 !important;
}

.custom-table th {
  color: white !important;
  font-weight: bold !important;
  background-color: var(--header-bg) !important;
  border: 1px solid var(--border-color) !important;
  text-align: center !important;
  padding: 6px !important;
}

.custom-table td {
  color: var(--text-color) !important;
  border: 1px solid #495057 !important;
  padding: 6px !important;
  font-size: 12px !important;
}

/* Striped rows */
.custom-table tr:nth-child(even) {
  background-color: #2b2b2b;
}

.custom-table tr:nth-child(odd) {
  background-color: var(--surface-dark);
}

.custom-link {
  color: #8ab4f8 !important;
  text-decoration: none;
}

.custom-link:hover {
  text-decoration: underline;
}
</style>
