<template>
  <v-container class="container-fluid">
        <v-card class="custom-card">
          <v-card-title class="text-center custom-title">
            <h2>Players 2024</h2>
          </v-card-title>
          <v-spacer></v-spacer>
          
          <div class="container-fluid">
            <v-row class="mb-3 align-center">
              <v-col v-for="dropdown in dropdowns" :key="dropdown.id">
                <v-select
                  v-model="selectedDropdown[dropdown.id]"
                  :items="dropdownOptions[dropdown.id]"
                  :label="dropdown.label"
                  clearable
                  class="custom-dropdown form-select-sm"
                  variant="outlined"
                  :transition="false"
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
            </v-row>
            <v-data-table
              :headers="headers"
              :items="filteredPlayerRows"
              :items-per-page="15"
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
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'

export default {
  name: 'Players',
  setup() {
    const loading = ref(true)
    const allPlayerRows = ref([])
    const filteredPlayerRows = ref([])

    const headers = ref([
      { title: 'Number', align: 'center', sortable: true, key: 'number' },
      { title: 'Player', align: 'start', sortable: true, key: 'player' },
      { title: 'Class', align: 'center', sortable: true, key: 'class' },
      { title: 'Position', align: 'center', sortable: true, key: 'position' },
      { title: 'Height', align: 'center', sortable: true, key: 'height' },
      { title: 'Hometown', align: 'start', sortable: true, key: 'hometown' },
      { title: 'High School', align: 'start', sortable: true, key: 'highSchool' },
      { title: 'Conference', align: 'start', sortable: true, key: 'conference' },
      { title: 'Team', align: 'start', sortable: true, key: 'team' }
    ])

    const dropdowns = [
      { id: 'conference-players', label: 'Select a Conference' },
      { id: 'team-players', label: 'Select a Team' },
      { id: 'class-players', label: 'Select a Class' },
      { id: 'position-players', label: 'Select a Position' },
    ]

    const selectedDropdown = reactive({
      'conference-players': '',
      'team-players': '',
      'class-players': '',
      'position-players': '',
    })

    const dropdownOptions = reactive({
      'conference-players': [],
      'team-players': [],
      'class-players': [],
      'position-players': [],
    })

    const parseCSV = (csvData) => {
      const rows = csvData.split("\n").filter(row => row.trim() !== "")
      return rows.slice(1).map(row => {
        const values = splitLine(row)
        return {
          number: values[0],
          player: values[1],
          class: values[2],
          position: values[3],
          height: values[4],
          hometown: values[5],
          highSchool: values[6],
          conference: values[7],
          team: values[8]
        }
      })
    }

    const splitLine = (line) => {
      const result = []
      let currentField = ""
      let inQuotes = false

      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(currentField.trim())
          currentField = ""
        } else {
          currentField += char
        }
      }
      result.push(currentField.trim())
      return result
    }

    const populateDropdownOptions = (data) => {
      const columns = {
        'conference-players': 'conference',
        'team-players': 'team',
        'class-players': 'class',
        'position-players': 'position',
      }

      Object.entries(columns).forEach(([key, value]) => {
    const uniqueOptions = new Set(data.map(row => row[value]).filter(Boolean));
    
    // Sort conference options
    if (key === 'conference-players') {
      dropdownOptions[key] = ['All', ...Array.from(uniqueOptions).sort()]; // Add "All" and sort
    } else {
      dropdownOptions[key] = ['All', ...Array.from(uniqueOptions)]; // Just add "All" for other options
      dropdownOptions[key].sort(); // Sort other dropdowns
    }
  });
};

    const updateTeamDropdownOptions = () => {
  const teams = new Set();

  if (!selectedDropdown['conference-players'] || selectedDropdown['conference-players'] === 'All') {
    allPlayerRows.value.forEach(row => {
      if (row.team) teams.add(row.team);
    });
  } else {
    allPlayerRows.value.forEach(row => {
      if (row.conference === selectedDropdown['conference-players'] && row.team) {
        teams.add(row.team);
      }
    });
  }

  dropdownOptions['team-players'] = ['All', ...Array.from(teams).sort()]; // Add "All" at the top
};

    const applyFilters = () => {
      filteredPlayerRows.value = allPlayerRows.value.filter(row => {
        return (
          (!selectedDropdown['conference-players'] || selectedDropdown['conference-players'] === 'All' || row.conference === selectedDropdown['conference-players']) &&
          (!selectedDropdown['team-players'] || selectedDropdown['team-players'] === 'All' || row.team === selectedDropdown['team-players']) &&
          (!selectedDropdown['class-players'] || selectedDropdown['class-players'] === 'All' || row.class === selectedDropdown['class-players']) &&
          (!selectedDropdown['position-players'] || selectedDropdown['position-players'] === 'All' || row.position === selectedDropdown['position-players'])
        )
      })
    }

    const loadTableData = async () => {
      try {
        const csvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/players.csv'
        const response = await fetch(csvUrl)
        const csvData = await response.text()
        
        allPlayerRows.value = parseCSV(csvData)
        filteredPlayerRows.value = allPlayerRows.value
        populateDropdownOptions(allPlayerRows.value)
        loading.value = false
      } catch (error) {
        console.error('Error loading player data:', error)
        loading.value = false
      }
    }

    watch(() => selectedDropdown['conference-players'], () => {
      updateTeamDropdownOptions()
      applyFilters()
    })

    onMounted(() => {
      loadTableData()
    })

    return {
      loading,
      headers,
      dropdowns,
      selectedDropdown,
      dropdownOptions,
      filteredPlayerRows,
      applyFilters
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