<template>
      <v-container class="container-fluid">
        <v-card class="custom-card">
          <v-card-title class="text-center custom-title">
            <h2>Results 2024</h2>
          </v-card-title>
          <v-spacer></v-spacer>

          <div class="container-fluid">
            <v-row class="mb-3 align-center">
              <v-col cols="12" md="3">
                <v-select v-model="selectedConference" :items="conferences" item-title="title" item-value="value"
                  label="Select a Conference" class="custom-dropdown form-select-sm" variant="outlined"
                  :transition="false" @update:model-value="updateTeamDropdown">
                  <template v-slot:selection="{ item }">
                    {{ item?.title || 'Select Conference' }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="selectedTeam" :items="filteredTeams" label="Select a Team" clearable
                  class="custom-dropdown form-select-sm" variant="outlined" :transition="false" item-title="team_short"
                  item-value="team_short">
                  <template v-slot:prepend-item>
                    <v-list-item title="All Teams" @click="selectedTeam = ''">
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field v-model="startDate" label="Start Date" type="date" class="custom-dropdown form-select-sm"
                  variant="outlined" :transition="false"></v-text-field>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field v-model="endDate" label="End Date" type="date" class="custom-dropdown form-select-sm"
                  variant="outlined" :transition="false"></v-text-field>
              </v-col>
            </v-row>

            <v-table class="custom-table" :items-per-page="-1" fixed-header height="480px" :hover="true"
              :striped="true">
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
                  <td v-html="row.match"></td>
                  <td>
                    {{ row.results }}
                    <a :href="row.boxScoreUrl" target="_blank" class="custom-link">View</a>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div v-if="filteredRows.length === 0" class="text-center pa-4">No results found.</div>
        </v-card>
      </v-container>
</template>
<script>
import { ref, onMounted, computed } from 'vue';

const conferences = [
  { title: 'All Conferences', value: '' },
  { title: 'A-10', value: 'A-10' },
  { title: 'AAC', value: 'AAC' },
  { title: 'ACC', value: 'ACC' },
  { title: 'AE', value: 'AE' },
  { title: 'ASUN', value: 'ASUN' },
  { title: 'BE', value: 'BE' },
  { title: 'BSC', value: 'BSC' },
  { title: 'BWC', value: 'BWC' },
  { title: 'Big 12', value: 'Big 12' },
  { title: 'Big Ten', value: 'Big Ten' },
  { title: 'C-USA', value: 'C-USA' },
  { title: 'CAA', value: 'CAA' },
  { title: 'HL', value: 'HL' },
  { title: 'Ivy', value: 'Ivy' },
  { title: 'MAAC', value: 'MAAC' },
  { title: 'MAC', value: 'MAC' },
  { title: 'MEAC', value: 'MEAC' },
  { title: 'MVC', value: 'MVC' },
  { title: 'MW', value: 'MW' },
  { title: 'NEC', value: 'NEC' },
  { title: 'OVC', value: 'OVC' },
  { title: 'PL', value: 'PL' },
  { title: 'Pac-12', value: 'Pac-12' },
  { title: 'SBC', value: 'SBC' },
  { title: 'SEC', value: 'SEC' },
  { title: 'SLC', value: 'SLC' },
  { title: 'SWAC', value: 'SWAC' },
  { title: 'SoCon', value: 'SoCon' },
  { title: 'Summit', value: 'Summit' },
  { title: 'WAC', value: 'WAC' },
  { title: 'WCC', value: 'WCC' },
];

export default {
  name: 'ResultsComponent',
  setup() {
    const allResultRows = ref([]);
    const selectedConference = ref('');
    const selectedTeam = ref('');
    const startDate = ref('2024-08-15');
    const endDate = ref('2024-12-15');
    const loading = ref(true);
    const teams = ref([]);

    const filteredRows = computed(() => {
      const uniqueRows = new Set();
      return allResultRows.value.filter(row => {
        const rowDate = new Date(row.date);

        // Conference and Team filtering logic
        const conferenceMatch = !selectedConference.value || row.match.includes(`(${selectedConference.value})`);
        const teamMatch = !selectedTeam.value || row.match.includes(selectedTeam.value);
        const dateMatch = rowDate >= new Date(startDate.value) && rowDate <= new Date(endDate.value);

        // Ensure unique rows
        const rowKey = `${row.date}-${row.match}`;
        const isUnique = !uniqueRows.has(rowKey);
        uniqueRows.add(rowKey);

        return conferenceMatch && teamMatch && dateMatch && isUnique;
      });
    });

    // Split a CSV line into an array
    function splitLine(line) {
      const result = [];
      let currentField = "";
      let inQuotes = false;

      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(currentField.trim());
          currentField = "";
        } else {
          currentField += char;
        }
      }
      result.push(currentField.trim());
      return result;
    }

    async function fetchResultsData(url) {
      const response = await fetch(url);
      const csvData = await response.text();
      const rows = csvData.split("\n").filter((row) => row.trim() !== "");

      return rows.slice(1).map(row => {
        const rowData = splitLine(row);
        if (rowData && rowData.length >= 4) {
          const [date, match, results, boxScoreUrl] = rowData.map(item => item.trim());
          return { date, match, results, boxScoreUrl };
        }
        return null;
      }).filter(row => row !== null);
    }

    async function fetchTeamsData(url) {
      const response = await fetch(url);
      const csvData = await response.text();
      return csvData.split('\n').slice(1).map(row => {
        const [team_id, conference_short, conference_name, team_name, division, team_short] = splitLine(row);
        return {
          team_id,
          conference_short: conference_short ? conference_short.trim() : '',
          conference_name: conference_name ? conference_name.trim() : '',
          team_name: team_name ? team_name.trim() : '',
          division: division ? division.trim() : '',
          team_short: team_short ? team_short.trim() : ''
        };
      }).filter(team => team.team_id); // Ensure team_id exists
    }

    const loadData = async () => {
      try {
        const schedulesCsvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/test_sch.csv';
        const teamsCsvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/main/data/teams2.csv';
        allResultRows.value = await fetchResultsData(schedulesCsvUrl);
        teams.value = await fetchTeamsData(teamsCsvUrl);

        // Debugging: Log fetched teams to console
        console.log("Fetched Teams:", teams.value);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        loading.value = false;
      }
    };

    // Update the team dropdown based on the selected conference
    const updateTeamDropdown = () => {
      // No further action needed; the filteredTeams computed property will update automatically
    };

    const filteredTeams = computed(() => {
      // If "All Conferences" is selected, return all teams
      if (!selectedConference.value) return teams.value;

      return teams.value.filter(team => team.conference_short === selectedConference.value);
    });

    onMounted(() => {
      loadData();
    });

    return {
      conferences,
      selectedConference,
      selectedTeam,
      startDate,
      endDate,
      filteredRows,
      loading,
      filteredTeams,
      updateTeamDropdown
    };
  }
}
</script>
<style>
.v-table th,
.v-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left !important;
}
</style>