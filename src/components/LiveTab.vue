<template>
    <div id="live">
      <h2 class="text-center">Today's scores</h2>
      <div class="container-fluid">
        <div class="row">
          <div class="col-auto mb-3">
            <select class="form-select form-select-sm" id="conference-live-dropdown" v-model="selectedConference">
              <option value="">All Conferences</option>
              <option v-for="conference in sortedConferences" :key="conference" :value="conference">{{ conference }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="table-responsive" style="overflow-x: auto">
        <table id="liveTable" class="table table-dark table-hover table-striped">
          <thead>
            <tr>
              <th>Match</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredData" :key="index">
              <td style="width:60%">{{ row.match.trim() }}</td>
              <td style="width:40%">
                {{ row.results.trim() }} <a :href="row.box_score_url.trim()" target="_blank">View</a>
              </td>
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
        allLiveData: [],
        fetchInterval: null,
        selectedConference: '',
      };
    },
    computed: {
      sortedConferences() {
        const conferences = new Set();
        this.allLiveData.forEach(item => {
          const match = item.match;
          const conferenceRegex = /\(([^)]+)\)/g;
          let match_;
          while ((match_ = conferenceRegex.exec(match)) !== null) {
            conferences.add(match_[1].trim());
          }
        });
        return Array.from(conferences).sort();
      },
      filteredData() {
        if (this.selectedConference === '') {
          return this.allLiveData;
        }
        return this.allLiveData.filter(item => {
          const matchConferenceRegex = /\(([^)]+)\)/g;
          let matchConference;
          while ((matchConference = matchConferenceRegex.exec(item.match)) !== null) {
            if (matchConference[1].trim().toLowerCase() === this.selectedConference.toLowerCase()) {
              return true;
            }
          }
          return false;
        });
      },
    },
    methods: {
      fetchDataAndPopulate() {
        fetch('https://test-api-42b6a9daeff2.herokuapp.com/')
          .then(response => response.json())
          .then(data => {
            this.allLiveData = data.data;
            console.log('Data refreshed at', new Date().toLocaleTimeString());
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            const tableBody = document.querySelector('#liveTable tbody');
            tableBody.innerHTML = '<tr><td colspan="2">Error loading data. Please try again later.</td></tr>';
          });
      },
      startPeriodicFetch() {
        this.fetchDataAndPopulate();
        this.fetchInterval = setInterval(this.fetchDataAndPopulate, 45000);
      },
      stopPeriodicFetch() {
        clearInterval(this.fetchInterval);
      },
    },
    created() {
      this.startPeriodicFetch();
    },
    beforeDestroy() {
      this.stopPeriodicFetch();
    },
    watch: {
      selectedConference() {
        this.filteredData;
      },
    },
  };
  </script>
  
  <style scoped>
  .table-responsive {
    overflow-x: auto;
  }
  </style>
  