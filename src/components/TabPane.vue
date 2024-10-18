<template>
    <div 
      class="tab-pane fade" 
      :class="{ 'show active': isActive }"
      :id="id" 
      role="tabpanel" 
      :data-lta-event="eventName"
      data-lta-event-category="tab"
      :aria-labelledby="`${id}-tab`"
    >
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TabPane',
    props: {
      id: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: false
      },
      eventName: {
        type: String,
        required: true
      }
    }
  }
  </script>