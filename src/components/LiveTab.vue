<template>
      <v-container class="container-fluid">
        <v-card class="custom-card">
          <v-card-title class="text-center custom-title">
            <h2>Today's Scores</h2>
          </v-card-title>
          <div class="container-fluid">
          <v-row class="mb-3 align-center">
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="selectedConference"
                :items="conferencesWithAll"
                item-title="title"
                item-value="value"
                label="Select a Conference"
                class="custom-dropdown form-select-sm"
                :transition="false"
                variant="outlined"
                return-object
              >
                <template v-slot:selection="{ item }">
                  {{ item?.title || 'Select Conference' }}
                </template>
              </v-select>
            </v-col>
          </v-row>

            <v-table
              class="custom-table"
              :items-per-page="-1"
              fixed-header height="480px" :hover="true" :striped="true"
            >
              <thead>
                <tr>
                  <th class="text-left" width="60%;">Match</th>
                  <th class="text-left" width="40%;">Results</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in filteredData" :key="index">
                  <td>{{ row.match.trim() }}</td>
                  <td>
                    {{ row.results.trim() }}
                    <v-btn
                      :href="row.box_score_url.trim()"
                      target="_blank"
                      variant="text"
                      density="compact"
                      color="primary"
                    >
                      View
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="filteredData.length === 0">
                  <td colspan="2" class="text-center">No matches found</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>
      </v-container>
</template>

<script>
export default {
  name: 'LiveScores',
  
  data() {
    return {
      allLiveData: [],
      fetchInterval: null,
      selectedConference: { title: 'All Conferences', value: 'all' }, // Default selection
      conferences: [],
      loading: false,
      error: null
    }
  },

  computed: {
    conferencesWithAll() {
      // Add "All Conferences" as the first option
      return [
        { title: 'All Conferences', value: 'all' },
        ...this.conferences
      ];
    },

    filteredData() {
      if (!this.selectedConference || this.selectedConference.value === 'all') {
        return this.allLiveData;
      }

      const selectedConferenceValue = this.selectedConference.value;
      
      return this.allLiveData.filter(item => {
        const matchConferenceRegex = /\(([^)]+)\)/g;
        let matchConference;
        while ((matchConference = matchConferenceRegex.exec(item.match)) !== null) {
          if (matchConference[1].trim().toLowerCase() === selectedConferenceValue.toLowerCase()) {
            return true;
          }
        }
        return false;
      });
    }
  },

  methods: {
    async fetchDataAndPopulate() {
      this.loading = true;
      try {
        const response = await fetch('https://test-api-42b6a9daeff2.herokuapp.com/');
        const data = await response.json();
        this.allLiveData = data.data;
        this.updateConferences();
        console.log('Data refreshed at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Error loading data. Please try again later.';
      } finally {
        this.loading = false;
      }
    },

    updateConferences() {
      const conferenceSet = new Set();
      
      this.allLiveData.forEach(item => {
        const conferenceRegex = /\(([^)]+)\)/g;
        let match;
        while ((match = conferenceRegex.exec(item.match)) !== null) {
          conferenceSet.add(match[1].trim());
        }
      });

      // Convert conferences to the format expected by v-select
      this.conferences = Array.from(conferenceSet)
        .sort()
        .map(conference => ({
          title: conference,
          value: conference
        }));
    },

    startPeriodicFetch() {
      this.fetchDataAndPopulate();
      this.fetchInterval = setInterval(this.fetchDataAndPopulate, 45000);
    },

    stopPeriodicFetch() {
      if (this.fetchInterval) {
        clearInterval(this.fetchInterval);
        this.fetchInterval = null;
      }
    },

    handleVisibilityChange() {
      if (document.hidden) {
        this.stopPeriodicFetch();
      } else {
        this.startPeriodicFetch();
      }
    }
  },

  created() {
    this.startPeriodicFetch();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },

  beforeUnmount() {
    this.stopPeriodicFetch();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

.table-dark {
  background-color: #212529;
  color: white;
}

.v-table {
  border-collapse: collapse;
  width: 100%;
}

.v-table th,
.v-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left !important;
}

.v-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.075);
}
</style>