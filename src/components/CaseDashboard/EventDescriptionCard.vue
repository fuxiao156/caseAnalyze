<template>
  <div class="description-card dashboard-card">
    <div class="card-title-row">
      <div class="card-title">事件描述 (Description)</div>
    </div>
    <div class="description-content custom-scrollbar">
      <div class="event-title">{{ title }}</div>
      <div class="event-detail">{{ detail }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  detail: String
});
</script>

<style scoped>
.dashboard-card {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex: 0 0 auto;
}

.card-title {
  color: #00f2ff;
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #00f2ff;
  padding-left: 12px;
  margin-bottom: 0;
}

.eval-trigger-btn {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.eval-trigger-btn:hover {
  background: rgba(0, 242, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
}

.description-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.event-title {
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.4;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
  padding-bottom: 8px;
}

.event-detail {
  font-size: 15px;
  color: #c8ddfb;
  line-height: 1.8;
  text-align: justify;
  white-space: pre-wrap;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>

