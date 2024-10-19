<template>
  <ul class="nav nav-tabs" id="nav-items" role="tablist">
    <li v-for="item in navItems" :key="item.id" class="nav-item" role="presentation">
      <button 
        class="nav-link" 
        :class="{ active: item.isActive }"
        :id="`${item.id}-tab`"
        data-bs-toggle="tab"
        :data-bs-target="`#${item.id}`"
        type="button"
        role="tab"
        :aria-controls="item.id"
        :aria-selected="item.isActive.toString()"
      >
        {{ item.label }}
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      navItems: [
        { id: 'vbdb', label: 'VBDB', isActive: true },
        { id: 'live', label: 'Live', isActive: false },
        { id: 'results', label: 'Results', isActive: false },
        { id: 'rankings', label: 'Rankings', isActive: false },
        { id: 'teams', label: 'Teams', isActive: false },
        { id: 'players', label: 'Players', isActive: false },
      ],
    };
  },
};
</script>

<style scoped>
.nav-item {
  margin-right: 10px;
}
</style>
