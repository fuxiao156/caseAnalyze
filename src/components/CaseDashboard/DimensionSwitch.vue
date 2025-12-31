<template>
  <div class="dimension-switch dashboard-card">
    <div class="card-title">分析维度配置 (Dimension Configuration)</div>
    <div class="switch-list">
      <div 
        v-for="dim in dimensions" 
        :key="dim.id"
        :class="['switch-item', activeIds.includes(dim.id) ? 'active' : '']"
        @click="toggleDimension(dim.id)"
      >
        <span class="status-indicator"></span>
        <span class="dim-name">{{ dim.name }}</span>
        <span class="toggle-icon">{{ activeIds.includes(dim.id) ? 'ON' : 'OFF' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dimensions: Array,
  activeIds: Array
});

const emit = defineEmits(['update:activeIds']);

const toggleDimension = (id) => {
  const newIds = [...props.activeIds];
  const index = newIds.indexOf(id);
  if (index > -1) {
    newIds.splice(index, 1);
  } else {
    newIds.push(id);
  }
  emit('update:activeIds', newIds);
};
</script>

<style scoped>
.dashboard-card {
  background: rgba(16, 35, 78, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.15);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
}

.card-title {
  color: #00f2ff;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  border-left: 4px solid #00f2ff;
  padding-left: 12px;
}

.switch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.switch-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.switch-item.active .status-indicator {
  background: #00f2ff;
  box-shadow: 0 0 8px #00f2ff;
}

.dim-name {
  font-size: 14px;
  font-weight: bold;
  color: #88b0ea;
  transition: all 0.3s;
}

.switch-item.active .dim-name {
  color: #fff;
}

.toggle-icon {
  font-family: monospace;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.4);
}

.switch-item.active .toggle-icon {
  background: #00f2ff;
  color: #000;
  font-weight: bold;
}
</style>
