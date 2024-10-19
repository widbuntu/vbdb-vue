<template>
  <div>
    <h2 class="text-center">Results 2024</h2>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="container-fluid">
        <div class="row mb-3">
          <div class="col-md-3">
            <label for="conferenceShort">Conference:</label>
            <select v-model="selectedConference" @change="updateTeamDropdown" class="form-select form-select-sm">
              <option value="">All Conferences</option>
              <option v-for="conf in conferences" :key="conf" :value="conf">{{ conf }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="team">Team:</label>
            <select v-model="selectedTeam" class="form-select form-select-sm">
              <option value="">All Teams</option>
              <option v-for="team in filteredTeams" :key="team.team_id" :value="team.team_short">{{ team.team_short }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="startDate">Start Date:</label>
            <input type="date" v-model="startDate" class="form-control form-select-sm">
          </div>
          <div class="col-md-3">
            <label for="endDate">End Date:</label>
            <input type="date" v-model="endDate" class="form-control form-select-sm">
          </div>
        </div>
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
              <td v-html="row.match"></td>
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

const conferences = [
  'A-10', 'AAC', 'ACC', 'AE', 'ASUN', 'BE', 'BSC', 'BWC', 'Big 12', 'Big Ten',
  'C-USA', 'CAA', 'HL', 'Ivy', 'MAAC', 'MAC', 'MEAC', 'MVC', 'MW', 'NEC', 'OVC',
  'PL', 'Pac-12', 'SBC', 'SEC', 'SLC', 'SWAC', 'SoCon', 'Summit', 'WAC', 'WCC'
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
        const conferenceMatch = !selectedConference.value || row.match.includes(`(${selectedConference.value})`);
        const teamMatch = !selectedTeam.value || row.match.includes(selectedTeam.value);
        const dateMatch = rowDate >= new Date(startDate.value) && rowDate <= new Date(endDate.value);

        // Check if the current row's match has been seen before
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
      // Log current conference selection for debugging
      console.log("Selected Conference:", selectedConference.value);
      
      if (!selectedConference.value) return teams.value;

      // Check if teams array has the expected structure
      if (teams.value.length > 0 && teams.value[0].conference_short !== undefined) {
        return teams.value.filter(team => team.conference_short === selectedConference.value);
      } else {
        console.error("Invalid team structure or conference_short is undefined");
        return [];
      }
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
