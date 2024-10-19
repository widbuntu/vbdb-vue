<template>
<div>
  <h2 class="text-center">Players 2024</h2>
  <div class="container-fluid">
    <div class="row">
      <!-- Generate dropdowns dynamically in one row -->
      <div v-for="dropdown in dropdowns" :key="dropdown.id" class="col mb-3">
        <select
          class="form-select form-select-sm"
          :id="`${dropdown.id}-dropdown`"
          v-model="selectedDropdown[dropdown.id]"
          @change="applyFilters"
        >
          <option value="">{{ dropdown.label }}</option>
          <option v-for="option in dropdownOptions[dropdown.id]" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>
  </div>

    <div class="table-responsive" style="overflow-x: auto;">
      <table id="playersTable" class="table table-dark table-hover table-striped">
        <thead>
          <tr>
            <!-- Table Headers with sorting functionality -->
            <th
              v-for="header in headers"
              :key="header"
              @click="sortTableBy(header)"
              :class="{ 'sort-asc': currentSortColumn === header && currentSortDirection === 'asc', 'sort-desc': currentSortColumn === header && currentSortDirection === 'desc' }"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Render filtered rows dynamically -->
          <tr v-for="(row, rowIndex) in filteredPlayerRows" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      dropdowns: [
        { id: 'conference-players', label: 'Select a Conference' },
        { id: 'team-players', label: 'Select a Team' },
        { id: 'class-players', label: 'Select a Class' },
        { id: 'position-players', label: 'Select a Position' },
        { id: 'hometown-players', label: 'Select a Hometown' }
      ],
      headers: ['Number', 'Player', 'Class', 'Position', 'Height', 'Hometown', 'High School', 'Conference', 'Team'],
      allPlayerRows: [],
      filteredPlayerRows: [],
      selectedDropdown: {
        'conference-players': '',
        'team-players': '',
        'class-players': '',
        'position-players': '',
        'hometown-players': ''
      },
      dropdownOptions: {
        'conference-players': [],
        'team-players': [],
        'class-players': [],
        'position-players': [],
        'hometown-players': []
      },
      currentSortColumn: null,
      currentSortDirection: 'asc',
      sortOrder: ['conference', 'team', 'number']
    };
  },

  watch: {
    'selectedDropdown.conference-players': function (newConference) {
      this.updateTeamDropdownOptions(newConference);
    }
  },

  mounted() {
    this.loadTableData();
  },
  methods: {

    updateTeamDropdownOptions(selectedConference) {
      if (selectedConference === '') {
        // Reset team options if no conference is selected
        this.dropdownOptions['team-players'] = [
          ...new Set(this.allPlayerRows.map(row => row[8]).filter(Boolean))
        ].sort();
      } else {
        // Filter teams based on selected conference
        this.dropdownOptions['team-players'] = [
          ...new Set(
            this.allPlayerRows
              .filter(row => row[7] === selectedConference)
              .map(row => row[8])
              .filter(Boolean)
          )
        ].sort();
      }
    },
    sortTableBy(columnName) {
      const columnIndex = this.headers.indexOf(columnName);
      if (columnIndex === -1) return;

      this.currentSortColumn = columnName;
      this.currentSortDirection = this.currentSortDirection === 'desc' ? 'asc' : 'asc';

      this.filteredPlayerRows.sort((a, b) => {
        for (let sortField of this.sortOrder) {
          const sortIndex = this.headers.indexOf(this.capitalizeFirstLetter(sortField));
          if (sortIndex === -1) continue;

          const valueA = a[sortIndex];
          const valueB = b[sortIndex];

          if (valueA !== valueB) {
            if (sortField === 'number') {
              return this.currentSortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
              return this.currentSortDirection === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            }
          }
        }
        return 0;
      });
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    applySorting() {
      this.sortTableBy('Conference');
    },
    loadTableData() {
      const csvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/players.csv';
      fetch(csvUrl)
        .then(response => response.text())
        .then(csvData => {
        this.allPlayerRows = this.parseCSV(csvData);
        this.filteredPlayerRows = this.allPlayerRows;
        this.populateDropdownOptions();
        this.applySorting();
        })
        .catch(error => console.error("Error loading player data:", error));
    },
    parseCSV(csvData) {
      const rows = csvData.split("\n").filter(row => row.trim() !== "");
      return rows.slice(1).map(row => this.splitLine(row));
    },
    splitLine(line) {
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
          currentField += char; // Accumulate characters in the current field
        }
      }
      result.push(currentField.trim()); // Push the last field
      return result;
    },
    populateDropdownOptions() {
      const columns = {
        'conference-players': 7,
        'class-players': 2,
        'position-players': 3,
        'hometown-players': 5
      };
      for (const key in columns) {
        this.dropdownOptions[key] = [
          ...new Set(this.allPlayerRows.map(row => row[columns[key]]).filter(Boolean))
        ].sort();
      }
      this.dropdownOptions['team-players'] = [
        ...new Set(this.allPlayerRows.map(row => row[8]).filter(Boolean))
      ].sort();
    },
    applyFilters() {
      this.applySorting();
      this.filteredPlayerRows = this.allPlayerRows.filter(row => {
        return (
          (this.selectedDropdown['conference-players'] === '' || row[7] === this.selectedDropdown['conference-players']) &&
          (this.selectedDropdown['team-players'] === '' || row[8] === this.selectedDropdown['team-players']) &&
          (this.selectedDropdown['class-players'] === '' || row[2] === this.selectedDropdown['class-players']) &&
          (this.selectedDropdown['position-players'] === '' || row[3] === this.selectedDropdown['position-players']) &&
          (this.selectedDropdown['hometown-players'] === '' || row[5].includes(this.selectedDropdown['hometown-players']))
      )},
      )}
    }};
</script>

<style scoped>
th {
  cursor: pointer;
}
.sort-asc::after {
  content: '↾';
}
.sort-desc::after {
  content: '⇂';
}
</style>
