<template>
  <div class="time-dimension dashboard-card">
    <div class="card-title">时间维度分析 (Time Dimension)</div>
    
    <!-- 2.2.1 上部分：整体陈述 -->
    <div class="dimension-summary">
      <p>{{ data.summary }}</p>
    </div>

    <!-- 2.2.1 下部分：时间线 -->
    <div class="timeline-wrapper scrollbar-tech">
      <div class="timeline-horizontal">
        <div 
          v-for="(node, index) in data.timeline" 
          :key="index"
          :class="['timeline-node-box', activeNodeIdx === index ? 'active' : '']"
          @click="selectNode(index)"
        >
          <div class="node-time">{{ node.date }}</div>
          <div class="node-marker">
            <div class="node-dot"></div>
            <div class="node-line" v-if="index !== data.timeline.length - 1"></div>
          </div>
          <div class="node-event">{{ node.event }}</div>
        </div>
      </div>
    </div>

    <!-- 2.2.2 交互：显示关联要素 -->
    <Transition name="fade-slide">
      <div v-if="activeNodeIdx !== null" class="associated-factors">
        <div class="factor-header">关联要素分析 ({{ data.timeline[activeNodeIdx].date }})</div>
        <div class="factor-tags">
          <span 
            v-for="factor in data.timeline[activeNodeIdx].factors" 
            :key="factor"
            class="factor-tag"
          >{{ factor }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      summary: '',
      timeline: []
    })
  }
});

const activeNodeIdx = ref(0); // 默认选中第一个

const selectNode = (idx) => {
  activeNodeIdx.value = idx;
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
  margin-bottom: 15px;
  border-left: 4px solid #00f2ff;
  padding-left: 12px;
}

.dimension-summary {
  background: rgba(255, 255, 255, 0.03);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dimension-summary p {
  font-size: 14px;
  color: #cfd9e5;
  line-height: 1.6;
  margin: 0;
}

.timeline-wrapper {
  overflow-x: auto;
  padding: 20px 0;
  margin-bottom: 20px;
}

.timeline-horizontal {
  display: flex;
  min-width: max-content;
  padding: 0 40px;
}

.timeline-node-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  cursor: pointer;
  transition: all 0.3s;
}

.node-time {
  font-family: monospace;
  font-size: 13px;
  color: #88b0ea;
  margin-bottom: 10px;
}

.node-marker {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  height: 20px;
}

.node-dot {
  width: 12px;
  height: 12px;
  background: rgba(0, 242, 255, 0.3);
  border: 2px solid #00f2ff;
  border-radius: 50%;
  z-index: 2;
  transition: all 0.3s;
}

.timeline-node-box.active .node-dot {
  background: #00f2ff;
  box-shadow: 0 0 15px #00f2ff;
  transform: scale(1.3);
}

.node-line {
  position: absolute;
  left: calc(50% + 6px);
  width: calc(100% - 12px);
  height: 2px;
  background: linear-gradient(90deg, #00f2ff, rgba(0, 242, 255, 0.1));
  z-index: 1;
}

.node-event {
  margin-top: 15px;
  font-size: 12px;
  color: #cfd9e5;
  text-align: center;
  padding: 0 10px;
  transition: all 0.3s;
}

.timeline-node-box.active .node-event {
  color: #fff;
  font-weight: bold;
  transform: translateY(-2px);
}

/* 关联要素样式 */
.associated-factors {
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
}

.factor-header {
  font-size: 13px;
  color: #00f2ff;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.factor-header::before {
  content: "";
  width: 4px;
  height: 12px;
  background: #00f2ff;
}

.factor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.factor-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #88b0ea;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-tech::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 10px;
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
