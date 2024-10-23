<template>
    <v-app class="custom-theme">
      <v-main>
        <v-container class="container-fluid">
          <v-card class="custom-card">
            <v-card-title class="text-center custom-title">
              <h2>Rankings</h2>
            </v-card-title>
            <v-spacer></v-spacer>
            <div class="container-fluid">
              <v-row class="mb-3 align-center">
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="selectedConference"
                    :items="conferenceOptions"
                    label="Select a Conference"
                    clearable
                    class="custom-dropdown form-select-sm"
                    variant="outlined"
                    :transition="false"
                  ></v-select>
                </v-col>
              </v-row>
            </div>
  
            <div class="container-fluid">
              <v-data-table
                :headers="headers"
                :items="filteredRankingRows"
                :items-per-page="-1"
                :loading="loading"
                class="custom-table"
                fixed-header
                height="480px"
                :hover="true"
                :striped="true"
              >
              </v-data-table>
            </div>
          </v-card>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  
  export default {
    name: 'Rankings',
    setup() {
      const loading = ref(true)
      const selectedConference = ref('All Conferences')
      const rankingRows = ref([])
      const headers = ref([
        { title: 'Team', align: 'start', sortable: true, key: 'team' },
        { title: 'W', align: 'center', sortable: true, key: 'wins' },
        { title: 'L', align: 'center', sortable: true, key: 'losses' },
        { title: 'ConfRec', align: 'center', sortable: true, key: 'confRecord' },
        { title: 'Conf', align: 'start', sortable: true, key: 'conference' },
        { title: 'FigStats RPI', align: 'center', sortable: true, key: 'figStatsRpi' },
        { title: 'NCAA Rank', align: 'center', sortable: true, key: 'ncaaRank' },
      ])
  
      const conferenceOptions = ref(['All Conferences'])
  
      const loadRankingsData = async () => {
        try {
          const csvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/fig_stats.csv';
          const response = await fetch(csvUrl);
          const csvData = await response.text();
          
          const rows = csvData.split('\n').filter(row => row.trim());
          const parsedRows = rows.slice(1).map(row => {
            const values = row.split(',').map(cell => cell.trim());
            return {
              team: values[0],
              wins: parseInt(values[1]),
              losses: parseInt(values[2]),
              confRecord: values[3],
              conference: values[4],
              figStatsRpi: parseFloat(values[5]),
              ncaaRank: parseInt(values[6])
            };
          });
  
          rankingRows.value = parsedRows;
          
          // Setup conference options
          const conferences = [...new Set(parsedRows.map(row => row.conference))].sort();
          conferenceOptions.value = ['All Conferences', ...conferences];
          
          loading.value = false;
        } catch (error) {
          console.error('Error loading ranking data:', error);
          loading.value = false;
        }
      };
  
      const filteredRankingRows = computed(() => {
        if (!selectedConference.value || selectedConference.value === 'All Conferences') {
          return rankingRows.value;
        }
        return rankingRows.value.filter(row => row.conference === selectedConference.value);
      });
  
      loadRankingsData();
  
      return {
        loading,
        headers,
        conferenceOptions,
        selectedConference,
        filteredRankingRows
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
  
  .custom-dropdown {
    color: var(--text-color) !important;
  }
  
  .custom-dropdown .v-field {
    color: var(--text-color) !important;
    background-color: var(--surface-dark) !important;
    border-color: var(--border-color) !important;
  }
  
  .custom-dropdown .v-field__input {
    color: var(--text-color) !important;
  }
  
  .custom-dropdown label {
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
  </style>