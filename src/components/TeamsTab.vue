<template>
  <div>
    <h2 class="text-center">Teams 2024</h2>
    
    <div class="container-fluid mb-3">
      <div class="row">
        <div class="col-auto">
          <select
            class="form-select form-select-sm"
            v-model="selectedConference"
            @change="filterTeams"
          >
            <option value="">Select Conference</option>
            <option v-for="conference in uniqueConferences" :key="conference" :value="conference">
              {{ conference }}
            </option>
          </select>
        </div>
        <div class="col-auto">
          <input
            type="text"
            v-model="searchQuery"
            @input="filterTeams"
            placeholder="Search teams..."
            class="form-control form-control-sm"
            aria-label="Search teams"
          />
        </div>
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-striped">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Conference</th>
              <th>School URL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in filteredTeams" :key="team.team_name">
              <td>{{ team.team_name }}</td>
              <td>{{ team.conference_short }}</td>
              <td>
                <a :href="team.school_athletic_url" target="_blank">{{ team.school_athletic_url }}</a>
              </td>
            </tr>
            <tr v-if="filteredTeams.length === 0">
              <td colspan="3" class="text-center">No teams found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
function splitLine(line) {
  const result = [];
  let currentField = "";
  let inQuotes = false;

  for (let char of line) {
      if (char === '"') {
          inQuotes = !inQuotes; // Toggle quote state
      } else if (char === "," && !inQuotes) {
          result.push(currentField.trim()); // Push field and reset
          currentField = "";
      } else {
          currentField += char; // Accumulate characters in current field
      }
  }

  result.push(currentField.trim()); // Push the last field
  return result;
}

export default {
  data() {
    return {
      loading: true,
      teams: [],
      selectedConference: "",
      searchQuery: "", // For storing search input
      filteredTeams: [],
    };
  },
  computed: {
    uniqueConferences() {
      return [...new Set(this.teams.map(team => team.conference_name))];
    },
  },
  methods: {
    async fetchTeams() {
      try {
        const response = await fetch('https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/teams.csv');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const text = await response.text();
        const parsedData = this.parseCSV(text);
        
        console.log('Parsed Data:', parsedData);
        
        this.teams = parsedData;
        this.filteredTeams = parsedData; // Initially, show all teams
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        this.loading = false;
      }
    },
    parseCSV(csv) {
      const rows = csv.trim().split('\n').slice(1); // Trim and skip header
      return rows.map(row => {
        const cols = splitLine(row);
        return {
          team_name: cols[0].replace(/"/g, ''),
          conference_short: cols[1].replace(/"/g, ''),
          school_athletic_url: cols[2].replace(/"/g, ''),
          conference_name: cols[3].replace(/"/g, ''),
          division: cols[4].replace(/"/g, ''),
        };
      });
    },
    filterTeams() {
      // Filter teams based on the selected conference and search query
      this.filteredTeams = this.teams.filter(team => {
        const matchesConference = !this.selectedConference || team.conference_name === this.selectedConference;
        const matchesSearch = team.team_name.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesConference && matchesSearch;
      });
    },
  },
  created() {
    this.fetchTeams();
  },
};
</script>

<style scoped>
.form-control {
  border-radius: 0.375rem;
  border: 1px solid #ccc;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Modernizing the select dropdown */
.form-select {
  border-radius: 0.375rem;
  border: 1px solid #ccc;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
