<template>
    <div id="rankings" class="container-fluid">
        <h2 class="text-center">Rankings</h2>
        <div class="row mb-3">
            <div class="col-auto">
                <select class="form-select form-select-sm" v-model="selectedConference" @change="filterByConference">
                    <option value="">Select a Conference</option>
                    <option v-for="conference in conferences" :key="conference" :value="conference">
                        {{ conference }}
                    </option>
                </select>
            </div>
        </div>
        <div class="table-responsive" style="overflow-x: auto">
            <table id="rankingsTable" class="table table-dark table-hover table-striped">
                <thead>
                    <tr>
                        <th @click="sortTable(0)">Team</th>
                        <th @click="sortTable(1)">W</th>
                        <th @click="sortTable(2)">L</th>
                        <th @click="sortTable(3)">ConfRec</th>
                        <th @click="sortTable(4)">Conf</th>
                        <th @click="sortTable(5)">FigStats RPI</th>
                        <th @click="sortTable(6)">NCAA Rank</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in filteredRankingRows" :key="index">
                        <td v-for="(cell) in row">
                            <span>{{ cell }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Rankings',
    data() {
        return {
            allRankingRows: [],
            filteredRankingRows: [],
            selectedConference: '',
            conferences: [],
            startDate: '',
            endDate: '',
            currentSortColumn: -1,
            currentSortDirection: 'asc',
        };
    },
    mounted() {
        this.loadRankingsData();
    },
    methods: {
        loadRankingsData() {
            const csvUrl = 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/fig_stats.csv';
            this.fetchTableData(csvUrl).then(rows => {
                this.allRankingRows = rows;
                this.filteredRankingRows = rows; // Initially show all rows
                this.setupConferenceFilter();
                this.sortTable(5); // Initially sort by FigStats RPI
            }).catch(error => console.error("Error loading ranking data:", error));
        },
        fetchTableData(url) {
            return fetch(url)
                .then(response => response.text())
                .then(csvData => {
                    const rows = csvData.split("\n").filter(row => row.trim() !== "");
                    return rows.slice(1).map(row => row.split(',').map(cell => cell.trim()));
                });
        },
        setupConferenceFilter() {
            const conferencesSet = new Set();
            this.allRankingRows.forEach(row => {
                const conferenceValue = row[4]; // Assuming index 4 is 'Conf'
                if (conferenceValue) {
                    conferencesSet.add(conferenceValue);
                }
            });
            this.conferences = Array.from(conferencesSet).sort();
        },
        filterByConference() {
            this.filteredRankingRows = this.allRankingRows.filter(row => {
                return this.selectedConference === '' || row[4] === this.selectedConference; // Assuming index 4 is 'Conf'
            });
        },
        sortTable(columnIndex) {
            const table = this.filteredRankingRows;
            // Toggle sort direction if clicking the same column
            if (columnIndex === this.currentSortColumn) {
                this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSortDirection = 'asc';
            }
            this.currentSortColumn = columnIndex;

            // Sort the rows
            table.sort((a, b) => {
                const aValue = a[columnIndex];
                const bValue = b[columnIndex];

                if (columnIndex === 0) { // Team column
                    return this.currentSortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else { // Numeric columns
                    const aNum = parseFloat(aValue) || 0;
                    const bNum = parseFloat(bValue) || 0;
                    return this.currentSortDirection === 'asc'
                        ? aNum - bNum
                        : bNum - aNum;
                }
            });

            this.filteredRankingRows = [...table]; // Update filtered rows after sorting
        },
        ensureProtocol(url) {
            return url.startsWith('http') ? url : 'http://' + url;
        }
    }
};
</script>
