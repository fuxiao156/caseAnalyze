<template>
  <div class="time-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">时间维度分析 (Time Dimension)</div>
      <button class="eval-trigger-btn" @click="$emit('open-correction', '时间维度分析', 'time-dimension')">
        <span class="eval-icon">📝</span> 数据校正
      </button>
    </div>
    
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
          :class="['timeline-node-box', activeIndex === index ? 'active' : '']"
          @click="selectNode(index)"
        >
          <div v-if="node.date" class="node-time">{{ node.date }}</div>
          <div class="node-marker">
            <div class="node-dot"></div>
            <div class="node-line" v-if="index !== data.timeline.length - 1"></div>
          </div>
          <div class="node-event">{{ node.event }}</div>
        </div>
      </div>
    </div>

    <!-- 2.2.2 要素详细拆解融合 -->
    <div class="factor-details-section">
      <div class="card-title-row">
        <div class="card-title">当前节点要素拆解 (Factor Dissection)</div>
      </div>
      
      <div class="accordion-container">
        <div class="accordion-wrapper">
          <TransitionGroup name="list-complete">
            <div 
              v-for="factor in factors" 
              :key="factor.content"
              :class="['accordion-item', openIds.includes(factor.content) ? 'open' : '', activeFactorName === factor.name ? 'active-highlight' : '']"
            >
              <!-- 侧边/头部标签 - 仅此处点击可触发展开/收起 -->
              <div class="item-tab" @click="toggleId(factor.content)">
                <span class="tab-icon">📋</span>
                <span class="tab-title">{{ factor.name }}</span>
              </div>

              <!-- 内容区域 - 点击此处不触发伸缩 -->
              <div class="item-content-wrapper scrollbar-tech" v-show="openIds.includes(factor.content)">
                <div class="block-header">
                  <span class="block-title">{{ factor.name }} 详细分析</span>
                </div>
                <div class="block-content">
                  <p class="generic-content">{{ factor.content }}</p>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      summary: '',
      timeline: []
    })
  },
  activeIndex: {
    type: Number,
    default: 0
  },
  factors: {
    type: Array,
    default: () => []
  },
  activeFactorName: String
});

const emit = defineEmits(['open-correction', 'update:activeIndex']);

const openIds = ref([]);

// 初始化展开第一个要素
onMounted(() => {
  if (props.factors && props.factors.length > 0) {
    openIds.value = [props.factors[0].content];
  }
});

// 监听数据变化，重置索引
watch(() => props.data.timeline, (newTimeline) => {
  if (props.activeIndex >= newTimeline.length) {
    emit('update:activeIndex', newTimeline.length > 0 ? 0 : null);
  }
}, { deep: true });

// 监听 factors 变化，自动展开所有要素
watch(() => props.factors, (newFactors) => {
  if (newFactors && newFactors.length > 0) {
    openIds.value = newFactors.map(f => f.content);
  }
}, { immediate: true, deep: true });

// 监听外部选中的要素
watch(() => props.activeFactorName, (newName) => {
  if (newName) {
    const factor = props.factors.find(f => f.name === newName);
    if (factor && !openIds.value.includes(factor.content)) {
      toggleId(factor.content, true);
    }
  }
});

const toggleId = (content, forceOpen = false) => {
  const index = openIds.value.indexOf(content);
  if (index > -1 && !forceOpen) {
    openIds.value.splice(index, 1);
  } else if (index === -1) {
    openIds.value.push(content);
    if (openIds.value.length > 3) {
      openIds.value.shift();
    }
  }
};

const selectNode = (idx) => {
  emit('update:activeIndex', idx);
};
</script>

<style scoped>
.dashboard-card {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
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

.eval-icon {
  font-size: 14px;
}

.dimension-summary {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex: 0 0 auto;
}

.dimension-summary p {
  font-size: 15px;
  color: #cfd9e5;
  line-height: 1.6;
  margin: 0;
}

.timeline-wrapper {
  overflow-x: auto;
  padding: 10px 0;
  margin-bottom: 20px;
  flex: 0 0 150px; /* 固定时间轴高度 */
  display: flex;
  align-items: center;
  min-height: 0;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
}

.timeline-horizontal {
  display: flex;
  min-width: max-content;
  padding: 0 40px;
  align-items: center;
}

.timeline-node-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 0 0 auto;
}

.node-time {
  font-family: monospace;
  font-size: 14px;
  color: #88b0ea;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.timeline-node-box:hover .node-time,
.timeline-node-box.active .node-time {
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
  transform: translateY(-2px);
}

.node-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  height: 30px;
}

.node-dot {
  width: 18px;
  height: 18px;
  background: rgba(10, 27, 62, 0.8);
  border: 3px solid rgba(0, 242, 255, 0.4);
  border-radius: 50%;
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
}

.node-dot::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid rgba(0, 242, 255, 0);
  transition: all 0.3s;
}

.timeline-node-box:hover .node-dot {
  border-color: #00f2ff;
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.5);
}

.timeline-node-box.active .node-dot {
  background: #00f2ff;
  border-color: #fff;
  box-shadow: 0 0 20px #00f2ff, 0 0 40px rgba(0, 242, 255, 0.4);
  transform: scale(1.4);
  animation: node-pulse 2s infinite;
}

@keyframes node-pulse {
  0% {
    box-shadow: 0 0 20px #00f2ff, 0 0 0 0 rgba(0, 242, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 25px #00f2ff, 0 0 0 15px rgba(0, 242, 255, 0);
  }
  100% {
    box-shadow: 0 0 20px #00f2ff, 0 0 0 0 rgba(0, 242, 255, 0);
  }
}

.node-line {
  position: absolute;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 4px;
  background: rgba(0, 242, 255, 0.15);
  z-index: 1;
  border-radius: 2px;
}

.node-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, transparent, #00f2ff, transparent);
  background-size: 200% 100%;
  animation: flow 3s linear infinite;
  border-radius: 2px;
}

.node-line::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 8px solid rgba(0, 242, 255, 0.6);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

@keyframes flow {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.node-event {
  margin-top: 15px;
  font-size: 15px;
  color: #cfd9e5;
  text-align: center;
  padding: 0 10px;
  transition: all 0.3s;
  max-width: 160px;
  line-height: 1.4;
}

.timeline-node-box.active .node-event {
  color: #fff;
  font-weight: bold;
}

/* 要素拆解区域 */
.factor-details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.header-title {
  font-size: 14px;
  color: #00f2ff;
  font-weight: bold;
}

.accordion-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.accordion-wrapper {
  display: flex;
  height: 100%;
  gap: 12px;
  position: relative;
  align-items: flex-start; /* 确保子元素顶部对齐 */
}

.accordion-item {
  flex: 0 0 auto;
  min-width: 50px;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  position: relative;
  will-change: flex, transform; /* 优化性能 */
}

.accordion-item.open {
  flex: 1;
  min-width: 260px;
  background: rgba(255, 255, 255, 0.05);
}

.accordion-item.active-highlight {
  border-color: #00f2ff;
  background: rgba(0, 242, 255, 0.08);
}

.item-tab {
  width: 50px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  cursor: pointer; /* 仅此处可点击 */
}

.tab-icon {
  font-size: 18px;
  margin-bottom: 12px;
}

.tab-title {
  writing-mode: vertical-lr;
  color: #88b0ea;
  font-size: 16px;
  letter-spacing: 4px;
  opacity: 0.7;
}

.open .tab-title {
  color: #00f2ff;
  opacity: 1;
  font-weight: bold;
}

.item-content-wrapper {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  opacity: 0;
  animation: fadeIn 0.3s forwards 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.block-header {
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
}

.block-title {
  font-size: 16px;
  font-weight: bold;
  color: #00f2ff;
}

.generic-content {
  font-size: 16px;
  color: #e5ecf5;
  line-height: 1.6;
}

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.scrollbar-tech::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 10px;
}

/* 列表过渡动画 - 关键：使用与 FactorCarousel 一致的平滑逻辑 */
.list-complete-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-complete-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute; /* 离开时脱离文档流，防止挤压 */
  width: calc(100% / 3); /* 给予离开元素合理的预期宽度 */
  z-index: 0;
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.list-complete-move {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
