<template>
  <div class="dimension-switch dashboard-card-mini">
    <div class="switch-list">
      <div 
        v-for="dim in dimensions" 
        :key="dim.id"
        :class="['switch-item', activeId === dim.id ? 'active' : '']"
        @click="selectDimension(dim.id)"
      >
        <span class="status-indicator"></span>
        <span class="dim-name">{{ dim.name }}</span>
        <span class="toggle-icon">{{ activeId === dim.id ? 'ACTIVE' : 'SELECT' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dimensions: Array,
  activeId: String
});

const emit = defineEmits(['update:activeId']);

const selectDimension = (id) => {
  emit('update:activeId', id);
};
</script>

<style scoped>
.dashboard-card-mini {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 12px 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
}

.switch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.switch-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.switch-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.3);
}

.switch-item.active {
  background: rgba(0, 242, 255, 0.15);
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.switch-item.active .status-indicator {
  background: #00f2ff;
  box-shadow: 0 0 8px #00f2ff;
}

.dim-name {
  font-size: 13px;
  font-weight: bold;
  color: #88b0ea;
}

.switch-item.active .dim-name {
  color: #fff;
}

.toggle-icon {
  font-family: monospace;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 5px;
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.4);
}

.switch-item.active .toggle-icon {
  background: #00f2ff;
  color: #000;
  font-weight: bold;
}
</style>
