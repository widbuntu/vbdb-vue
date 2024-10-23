<template>
      <v-container class="container-fluid">
        <v-card class="custom-card">
          <v-card-title class="text-center custom-title">
      <h2 class="text-center">VBDB Content</h2>
    </v-card-title>
    <p class="text-center">Welcome to VBDB!</p>
    <p class="text-center">Scores and Rankings updates for NCAA Division I Women's Volleyball! Results and Rankings
      updated daily.</p>
    <p class="text-center">Live updated every 45 seconds while open.</p>
    <hr>
    <h2 class="text-center">Data Downloads</h2>
    <div class="text-center">
      <p v-for="(item, index) in downloadLinks" :key="index">
        <a :href="item.url" target="_blank" style="color: white; text-decoration: underline;">
          {{ item.label }}
        </a>
      </p>
    </div>
    <hr>
    <h2 class="text-center">Data Sources</h2>
    <div class="text-center">
      <p v-for="(source, index) in dataSources" :key="index">
        <a :href="source.url" target="_blank" style="color: white; text-decoration: underline;">
          {{ source.label }}
        </a>
      </p>
      </div>
    </v-card>
      </v-container>
</template>

<script>
export default {
  name: 'VBDBTab',
  data() {
    return {
      downloadLinks: [
        { label: 'Results', url: 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/test_sch.csv' },
        { label: 'Rankings', url: 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/fig_stats.csv' },
        { label: 'Teams', url: 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/teams.csv' },
        { label: 'Players', url: 'https://raw.githubusercontent.com/widbuntu/vbdb-info/refs/heads/main/data/players.csv' }
      ],
      dataSources: [
        { label: 'NCAA Stats', url: 'https://stats.ncaa.org' },
        { label: 'NCAA RPI', url: 'https://www.ncaa.com/rankings/volleyball-women/d1/ncaa-womens-volleyball-rpi' },
        { label: 'Fig Stats', url: 'https://ncaastats.figstats.net/volleyball-rpi.cgi' }
      ]
    };
  }
};
</script>

<style scoped>
/* Add any necessary styles here */
</style>