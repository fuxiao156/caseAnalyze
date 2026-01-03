<template>
  <div class="info-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">信息维度分析 (Information Dimension)</div>
      <div class="view-hint">
        <span class="hint-icon">💡</span>
        <span>悬停认知碎片，解码信息偏差</span>
      </div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '信息维度分析', 'info-dimension')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>

    <div class="dimension-summary">
      <p>{{ data.summary }}</p>
    </div>

    <div class="cognitive-container" :class="{ 'has-mediation': !!activeBiasId }">
      <div class="bias-comparison-grid">
        <!-- 科技背景：流动的数据流，置于 grid 中间列 -->
        <div class="data-stream-bg">
          <div 
            v-for="i in 3" 
            :key="i" 
            class="stream-ray" 
            :style="{ 
              '--delay': (i * 1.2) + 's', 
              '--top': (i * 24 + 20) + '%',
              '--duration': (3 + Math.random() * 1) + 's'
            }"
          ></div>
        </div>

        <!-- 左侧：主观认知 (Perception) -->
        <div class="column subjective-column">
          <div class="column-header">主观认知 (Subjective Perception)</div>
          <div class="fragment-list">
            <div 
              v-for="item in data.items" 
              :key="'sub-' + item.id"
              class="fragment-card subjective-card"
              :class="{ active: activeBiasId === item.id, 'other-active': activeBiasId && activeBiasId !== item.id }"
              @mouseenter="activeBiasId = item.id"
              @mouseleave="activeBiasId = null"
            >
              <div class="glitch-overlay"></div>
              <div class="card-category">{{ item.category }}</div>
              <div class="card-text">{{ item.subjective.text }}</div>
              <div class="card-tags">
                <span v-for="tag in item.subjective.tags" :key="tag" class="tag subjective-tag">{{ tag }}</span>
              </div>
              <div class="intensity-bar">
                <div class="intensity-fill" :style="{ width: (item.subjective.intensity * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：逻辑桥梁 (Logic Bridge) / 信息差障碍 -->
        <div class="column bridge-column">
          <div class="bridge-pillar">
            <Transition name="bridge-fade" mode="out-in">
              <div v-if="activeBiasId" class="bridge-content" key="bridge">
                <div class="bridge-icon">⚡</div>
                <div class="bridge-label">调解破局点</div>
                <div class="bridge-text">{{ activeBridgeText }}</div>
                <div class="bridge-pulse"></div>
              </div>
              <div v-else class="bridge-content obstacle-content" key="obstacle">
                <div class="bridge-icon obstacle-icon">🚧</div>
                <div class="bridge-label obstacle-label">信息差鸿沟</div>
                <div class="bridge-text">认知碎片与客观事实间存在巨大鸿沟，阻碍双方信息的透明与信任转化</div>
                <div class="obstacle-line"></div>
              </div>
            </Transition>
          </div>
          <!-- 动态连接线 SVG -->
          <svg class="connection-svg">
            <path 
              v-if="activeBiasId"
              :d="connectionPath"
              class="connection-path"
            />
          </svg>
        </div>

        <!-- 右侧：客观事实 (Objective Reality) -->
        <div class="column objective-column">
          <div class="column-header">客观事实 (Objective Reality)</div>
          <div class="fragment-list">
            <div 
              v-for="item in data.items" 
              :key="'obj-' + item.id"
              class="fragment-card objective-card"
              :class="{ active: activeBiasId === item.id, 'other-active': activeBiasId && activeBiasId !== item.id }"
              @mouseenter="activeBiasId = item.id"
              @mouseleave="activeBiasId = null"
            >
              <div class="grid-overlay"></div>
              <div class="card-category">{{ item.category }}</div>
              <div class="card-text">{{ item.objective.text }}</div>
              <div class="card-tags">
                <span v-for="tag in item.objective.tags" :key="tag" class="tag objective-tag">{{ tag }}</span>
              </div>
              <div class="certainty-indicator">
                <div class="certainty-dot" v-for="i in 5" :key="i" :class="{ filled: i <= (item.objective.certainty * 5) }"></div>
                <span class="certainty-label">事实置信度</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      summary: '',
      items: []
    })
  }
});

const emit = defineEmits(['open-eval']);

const activeBiasId = ref(null);

const activeBridgeText = computed(() => {
  const item = props.data.items?.find(i => i.id === activeBiasId.value);
  return item ? item.bridge : '';
});

// 计算 SVG 路径以连接两侧卡片 (简化的直线/曲线逻辑)
const connectionPath = computed(() => {
  if (!activeBiasId.value) return '';
  // 这里在实际开发中可能需要 getBoundingClientRect，这里用示意路径
  return "M 100 150 Q 200 150 300 150"; 
});

</script>

<style scoped>
.dashboard-card {
  background: rgba(16, 35, 78, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.15);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-dimension {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(5, 15, 40, 0.85) !important;
  border: 1px solid rgba(0, 242, 255, 0.2);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
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
}

.view-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 242, 255, 0.1);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #00f2ff;
}

.eval-trigger-btn {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dimension-summary {
  background: rgba(0, 242, 255, 0.03);
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 2px solid rgba(0, 242, 255, 0.5);
}

.dimension-summary p {
  font-size: 13px;
  color: #88b0ea;
  margin: 0;
  line-height: 1.5;
}

.cognitive-container {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.bias-comparison-grid {
  display: grid;
  grid-template-columns: 1fr 0.4fr 1fr;
  gap: 15px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  font-size: 12px;
  color: rgba(0, 242, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
}

.fragment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  height: 100%;
}

.fragment-card {
  background: rgba(16, 35, 78, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  padding: 15px;
  border-radius: 4px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
}

.fragment-card.active {
  transform: scale(1.05);
  z-index: 10;
  border-color: #00f2ff;
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.3);
  background: rgba(16, 35, 78, 0.9);
}

.fragment-card.other-active {
  opacity: 0.3;
  filter: blur(1px);
  transform: scale(0.95);
}

.card-category {
  font-size: 10px;
  color: #00f2ff;
  opacity: 0.6;
  margin-bottom: 8px;
  font-weight: bold;
}

.card-text {
  font-size: 13px;
  line-height: 1.6;
  color: #eee;
}

.card-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
}

/* 主观侧样式：紫色/红色/Glitch效果 */
.subjective-card {
  border-left: 3px solid #a29bfe;
}
.subjective-card.active {
  border-left-color: #ff4757;
  animation: card-shake 0.3s infinite;
}

.subjective-tag {
  background: rgba(162, 155, 254, 0.1);
  color: #a29bfe;
  border: 1px solid rgba(162, 155, 254, 0.3);
}

.intensity-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 12px;
}
.intensity-fill {
  height: 100%;
  background: linear-gradient(90deg, #a29bfe, #ff4757);
}

/* 客观侧样式：蓝色/绿色/稳定效果 */
.objective-card {
  border-left: 3px solid #2ed573;
}
.objective-card.active {
  border-left-color: #00f2ff;
}

.objective-tag {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.3);
}

.certainty-indicator {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.certainty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.certainty-dot.filled {
  background: #2ed573;
  box-shadow: 0 0 5px #2ed573;
}
.certainty-label {
  font-size: 10px;
  color: #888;
  margin-left: 6px;
}

/* 中间桥梁列 */
.bridge-column {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bridge-pillar {
  width: 100%;
  height: 80%;
  background: linear-gradient(180deg, transparent, rgba(0, 242, 255, 0.05), transparent);
  border-left: 1px dashed rgba(0, 242, 255, 0.2);
  border-right: 1px dashed rgba(0, 242, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bridge-content {
  background: rgba(0, 242, 255, 0.25);
  border: 1px solid #00f2ff;
  padding: 20px;
  width: 220px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 242, 255, 0.3), inset 0 0 20px rgba(0, 242, 255, 0.1);
  backdrop-filter: blur(15px);
  z-index: 5;
  position: relative;
  transition: all 0.3s ease;
}

.obstacle-content {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.6);
  box-shadow: 0 0 30px rgba(255, 107, 107, 0.2), inset 0 0 15px rgba(255, 107, 107, 0.1);
}

.bridge-icon {
  font-size: 24px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px #00f2ff;
}

.obstacle-icon {
  text-shadow: 0 0 10px #ff6b6b;
  filter: grayscale(0.5);
}

.bridge-label {
  font-size: 11px;
  color: #00f2ff;
  letter-spacing: 2px;
  margin-bottom: 8px;
  font-weight: bold;
}

.obstacle-label {
  color: #ff6b6b;
  opacity: 0.8;
}

.bridge-text {
  font-size: 12px;
  color: #fff;
  line-height: 1.6;
}

.obstacle-content .bridge-text {
  color: #88b0ea;
  font-style: italic;
}

.obstacle-line {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff6b6b, transparent);
  opacity: 0.5;
}

.bridge-pulse {
  position: absolute;
  inset: -5px;
  border: 1px solid #00f2ff;
  border-radius: 12px;
  animation: pulse-out 2s infinite;
}

@keyframes pulse-out {
  0% { transform: scale(0.95); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes card-shake {
  0%, 100% { transform: scale(1.05) translateX(0); }
  25% { transform: scale(1.05) translateX(-1px); }
  75% { transform: scale(1.05) translateX(1px); }
}

.bridge-fade-enter-active, .bridge-fade-leave-active {
  transition: all 0.5s ease;
}
.bridge-fade-enter-from, .bridge-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tech-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.05) 0%, transparent 80%);
  pointer-events: none;
}

/* 霓虹运动光线样式 */
.data-stream-bg {
  grid-column: 2 / 3; /* 明确指定起止网格线，防止延伸到最右侧 */
  position: absolute; /* 改为绝对定位，不占据 Grid 空间 */
  width: calc(100% + 30px); /* 宽度覆盖左侧 gap(15px) 和 右侧 gap(15px) */
  left: -15px; /* 向左偏移一个 gap 的距离，对齐左侧卡片右边缘 */
  top: 0;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.stream-ray {
  position: absolute;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f2ff, #00f2ff, transparent);
  box-shadow: 0 0 8px #00f2ff;
  opacity: 0;
  animation: ray-failure var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
  top: var(--top);
  transform-origin: left center;
}

.has-mediation .stream-ray {
  animation: ray-success var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}

@keyframes ray-failure {
  0% {
    width: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  45% {
    width: 50%; /* 延伸到中间 */
    background: #00f2ff;
    box-shadow: 0 0 8px #00f2ff;
    transform: translateY(0) skewX(0);
    opacity: 1;
  }
  48% {
    background: #ff4757;
    box-shadow: 0 0 12px #ff4757;
    transform: translateY(-4px) skewX(30deg);
  }
  51% {
    transform: translateY(4px) skewX(-30deg);
  }
  54% {
    transform: translateY(-2px) skewX(15deg);
    opacity: 1;
  }
  60% {
    width: 50%;
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  100% {
    opacity: 0;
  }
}

@keyframes ray-success {
  0% {
    width: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  45% {
    width: 50%; /* 经过中点 */
    opacity: 1;
  }
  85% {
    width: 100%; /* 延伸到右侧边界 */
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
}
</style>

