<template>
  <div class="responsibility-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">动力平衡分析 (Dynamics Analysis)</div>
      <div class="state-selector">
        <button 
          v-for="(state, index) in data.states" 
          :key="index"
          :class="['state-btn', { active: activeStateIndex === index }]"
          @click="activeStateIndex = index"
        >
          {{ state.name }}
        </button>
      </div>
      <button class="eval-trigger-btn" @click="$emit('open-correction', '动力平衡分析', 'responsibility-dimension')">
        <span class="eval-icon">📝</span> 数据校正
      </button>
    </div>

    <div class="dimension-summary">
      <div class="status-badge" :class="statusColorClass">
        <span class="status-dot"></span>
        {{ currentState.status }}
      </div>
      <p>{{ data.summary }}</p>
    </div>

    <div class="scale-container">
      <!-- 科技感背景网格 -->
      <div class="tech-grid"></div>

      <!-- 科技天平主体 -->
      <div class="scale-tech-wrapper">
        <!-- 横梁支架 (固定) -->
        <div class="scale-base-tech">
          <div class="pillar-tech"></div>
          <div class="foundation-tech">
            <div 
              class="settlement-indicator" 
              :class="imbalanceStatus"
              :style="imbalanceIndicatorStyle"
            >
              <div class="indicator-light"></div>
              <span>动力失衡检测</span>
            </div>
          </div>
        </div>

        <!-- 动态旋转部分 (横梁与托盘) -->
        <div class="scale-dynamic-part" :style="scaleRotationStyle">
          <!-- 科技横梁 -->
          <div class="beam-tech" :class="{ 'equilibrium-glow': isEquilibrium }">
            <div class="beam-center-tech">
              <div class="core-energy"></div>
            </div>
          </div>

          <!-- 左托盘平台 -->
          <div class="pan-platform left-platform" :style="reverseRotationStyle">
            <div class="platform-base">
              <div class="platform-label">驱动项 (Driving Factors)</div>
              <div class="weights-container">
                <TransitionGroup name="weight-list">
                  <div 
                    v-for="w in currentState.leftWeights" 
                    :key="w.name"
                    class="weight-item-tech"
                    @mouseenter="handleWeightHover(w)"
                    @mouseleave="hoveredWeight = null"
                  >
                    <div class="weight-glow"></div>
                    <div class="weight-info">
                      <div class="weight-name">{{ w.name }}</div>
                      <div class="weight-value">+{{ w.value }}</div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
            <!-- 连接细线 -->
            <div class="connection-line"></div>
          </div>

          <!-- 右托盘平台 -->
          <div class="pan-platform right-platform" :style="reverseRotationStyle">
            <div class="platform-base">
              <div class="platform-label">约束项 (Restraining Factors)</div>
              <div class="weights-container">
                <TransitionGroup name="weight-list">
                  <div 
                    v-for="w in currentState.rightWeights" 
                    :key="w.name"
                    class="weight-item-tech"
                    @mouseenter="handleWeightHover(w)"
                    @mouseleave="hoveredWeight = null"
                  >
                    <div class="weight-glow"></div>
                    <div class="weight-info">
                      <div class="weight-name">{{ w.name }}</div>
                      <div class="weight-value">+{{ w.value }}</div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
            <!-- 连接细线 -->
            <div class="connection-line"></div>
          </div>
        </div>
      </div>

      <!-- Hover Insight 浮层 -->
      <Transition name="fade">
        <div v-if="hoveredWeight" class="hover-insight">
          <div class="insight-header">
            <span class="insight-icon">🔍</span>
            <h4>{{ hoveredWeight.name }}</h4>
          </div>
          <div class="insight-content">
            <p>{{ getWeightDescription(hoveredWeight) }}</p>
            <div v-if="hoveredWeight.linkedFactor" class="link-notice">
              🔗 关联要素: <strong>{{ hoveredWeight.linkedFactor }}</strong> 已在左侧高亮
            </div>
          </div>
        </div>
      </Transition>

      <!-- 最终达成协议背景装饰 - 修改为可收缩组件 -->
      <div v-if="isEquilibrium" class="settlement-container">
        <button 
          class="protocol-toggle-btn" 
          @click="showProtocol = !showProtocol"
          :class="{ active: showProtocol }"
        >
          <span class="btn-icon">{{ showProtocol ? '✕' : '📜' }}</span>
          <span class="btn-text">致因冲突焦点分析</span>
        </button>

        <Transition name="slide-fade">
          <div v-if="showProtocol" class="protocol-preview">
            <div class="protocol-header">致因冲突焦点分析</div>
            <div class="protocol-body">
              <div v-if="currentState.analysis" class="dynamic-analysis">
                <p v-for="(line, idx) in currentState.analysis" :key="idx">{{ line }}</p>
              </div>
              <div v-else class="default-analysis">
                <p>1. 核心矛盾已通过外部变量实现对冲；</p>
                <p>2. 驱动力与约束力在当前节点达成动态平衡；</p>
                <p>3. 行为动机被有效抑制，案件触发风险降低。</p>
              </div>
            </div>
            <div class="protocol-seal">已归因</div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      summary: '',
      states: []
    })
  }
});

const emit = defineEmits(['open-correction', 'highlight-factor']);

const activeStateIndex = ref(0);
const hoveredWeight = ref(null);
const showProtocol = ref(false); // 控制协议预览的显示/隐藏

const currentState = computed(() => {
  return props.data.states?.[activeStateIndex.value] || {};
});

const leftTotal = computed(() => {
  return currentState.value.leftWeights?.reduce((sum, w) => sum + w.value, 0) || 0;
});

const rightTotal = computed(() => {
  return currentState.value.rightWeights?.reduce((sum, w) => sum + w.value, 0) || 0;
});

const diffPercentage = computed(() => {
  const total = leftTotal.value + rightTotal.value;
  if (total === 0) return 0;
  return Math.abs(leftTotal.value - rightTotal.value) / total;
});

const isEquilibrium = computed(() => {
  return rightTotal.value >= leftTotal.value;
});

// 计算所有状态中最大的重量差（左 - 右）
const maxWeightDiff = computed(() => {
  if (!props.data.states || props.data.states.length === 0) return 0;
  const diffs = props.data.states.map(s => {
    const left = s.leftWeights?.reduce((sum, w) => sum + w.value, 0) || 0;
    const right = s.rightWeights?.reduce((sum, w) => sum + w.value, 0) || 0;
    return left - right;
  });
  return Math.max(...diffs, 0);
});

// 根据重量差动态计算颜色类名
const statusColorClass = computed(() => {
  const diff = leftTotal.value - rightTotal.value;
  if (diff <= 0) return 'status-green';
  if (diff >= maxWeightDiff.value) return 'status-red';
  if (diff <= maxWeightDiff.value * 0.5) return 'status-yellow';
  return 'status-red';
});

const imbalanceStatus = computed(() => {
  return leftTotal.value > rightTotal.value ? 'imbalanced' : 'balanced';
});

const imbalanceIndicatorStyle = computed(() => {
  if (imbalanceStatus.value === 'balanced') return {};
  
  // 计算失衡程度 (驱动力超出约束力的比例)
  const diff = leftTotal.value - rightTotal.value;
  const intensity = Math.min(1, diff / 50); // 以 50 为最大强度基准
  
  return {
    '--imbalance-intensity': intensity,
    '--light-opacity': 0.3 + intensity * 0.7,
    '--light-glow': `0 0 ${5 + intensity * 15}px rgba(255, 71, 87, ${intensity})`
  };
});

// 计算天平旋转角度
const scaleRotationStyle = computed(() => {
  const maxAngle = 15; // 最大倾斜 15 度
  const diff = rightTotal.value - leftTotal.value;
  const ratio = Math.max(-1, Math.min(1, diff / 50)); // 以 50 为基准权重差
  const angle = ratio * maxAngle;
  return {
    transform: `rotate(${angle}deg)`
  };
});

// 计算反向旋转以保持托盘水平
const reverseRotationStyle = computed(() => {
  const maxAngle = 15;
  const diff = rightTotal.value - leftTotal.value;
  const ratio = Math.max(-1, Math.min(1, diff / 50));
  const angle = -ratio * maxAngle;
  return {
    transform: `rotate(${angle}deg)`
  };
});

const handleWeightHover = (weight) => {
  hoveredWeight.value = weight;
  if (weight.linkedFactor) {
    emit('highlight-factor', weight.linkedFactor);
  }
};

const getWeightDescription = (w) => {
  return w.describe || '动力平衡博弈要素。';
};

watch(() => props.data, () => {
  if (props.data.states?.length > 0) {
    activeStateIndex.value = 0;
  }
}, { immediate: true });

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

.responsibility-dimension {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: rgba(26, 58, 122, 0.6) !important;
  border: 1px solid rgba(0, 242, 255, 0.2);
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

.state-selector {
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 20px;
}

.state-btn {
  background: transparent;
  border: none;
  color: #aaa;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.state-btn.active {
  background: #00f2ff;
  color: #050a19;
  font-weight: bold;
}

.dimension-summary {
  background: rgba(0, 242, 255, 0.05);
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 2px solid #00f2ff;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.status-badge.status-red { background: rgba(255, 71, 87, 0.2); color: #ff4757; }
.status-badge.status-yellow { background: rgba(255, 165, 2, 0.2); color: #ffa502; }
.status-badge.status-green { background: rgba(46, 213, 115, 0.2); color: #2ed573; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.dimension-summary p {
  font-size: 15px;
  color: #c8ddfb;
  line-height: 1.6;
  margin: 0;
}

.scale-container {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.tech-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
}

.scale-tech-wrapper {
  position: relative;
  width: 800px;
  height: 500px; /* 增加高度 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 支架部分 */
.scale-base-tech {
  position: absolute;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.pillar-tech {
  width: 4px;
  height: 320px; /* 增加支柱高度 */
  background: linear-gradient(to bottom, #00f2ff, transparent);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.5);
  position: relative;
}

.pillar-tech::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #00f2ff;
  border-radius: 50%;
  box-shadow: 0 0 20px #00f2ff;
}

.foundation-tech {
  width: 160px;
  height: 30px;
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.settlement-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  transition: all 0.5s;
}

.settlement-indicator.balanced {
  color: #2ed573;
}

.settlement-indicator.imbalanced {
  color: #ff4757; /* 文本始终显示同一种红 */
}

.indicator-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #333;
  transition: all 0.5s;
}

.settlement-indicator.balanced .indicator-light {
  background: #2ed573;
  box-shadow: 0 0 10px #2ed573;
  animation: pulse-light 1s infinite;
}

.settlement-indicator.imbalanced .indicator-light {
  background: #ff4757;
  opacity: var(--light-opacity);
  box-shadow: var(--light-glow);
  animation: pulse-imbalance 1.5s infinite ease-in-out;
}

@keyframes pulse-imbalance {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes pulse-light {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 动态旋转部分 */
.scale-dynamic-part {
  position: absolute;
  top: 150px; /* 调整旋转中心位置 */
  width: 100%;
  height: 0;
  transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center center;
}

/* 横梁 */
.beam-tech {
  position: absolute;
  left: 50%;
  top: 0;
  width: 600px;
  height: 2px;
  background: rgba(0, 242, 255, 0.8);
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.beam-center-tech {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 2px solid #00f2ff;
  border-radius: 50%;
  background: rgba(5, 10, 25, 0.9);
}

.core-energy {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, #00f2ff 0%, transparent 70%);
  animation: core-pulse 2s infinite;
}

@keyframes core-pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* 托盘平台 */
.pan-platform {
  position: absolute;
  top: 75px; /* 缩短为 75px */
  width: 190px;
  transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center -75px; /* 同步调整旋转中心 */
}

.left-platform { left: 20px; }
.right-platform { right: 20px; }

.platform-base {
  background: rgba(0, 242, 255, 0.05);
  border-bottom: 2px solid #00f2ff;
  border-left: 1px solid rgba(0, 242, 255, 0.2);
  border-right: 1px solid rgba(0, 242, 255, 0.2);
  min-height: 120px;
  max-height: 260px; /* 设置最大高度 */
  display: flex;
  flex-direction: column;
  padding: 15px;
  position: relative;
  backdrop-filter: blur(2px);
  width: 190px;
}

.weights-container {
  flex: 1;
  overflow-y: auto; /* 开启竖向滚动 */
  overflow-x: hidden;
  padding-right: 4px;
  position: relative; /* 为离开的绝对定位元素提供参考 */
}

/* 内部滚动条美化 */
.weights-container::-webkit-scrollbar {
  width: 4px;
}
.weights-container::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.3);
  border-radius: 10px;
}
.weights-container::-webkit-scrollbar-track {
  background: transparent;
}

.platform-base::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00f2ff;
  box-shadow: 0 5px 15px #00f2ff;
}

.platform-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.connection-line {
  position: absolute;
  top: -75px; 
  left: 50%;
  width: 1px;
  height: 75px;
  background: rgba(0, 242, 255, 0.5);
}

/* 砝码样式调整 */
.weight-item-tech {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  padding: 4px 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.weight-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.2), transparent);
  transition: 0.5s;
}

.weight-item-tech:hover .weight-glow {
  left: 100%;
}

.weight-item-tech:hover {
  background: rgba(0, 242, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
  transform: translateX(5px);
}

.weight-info {
  display: flex;
  flex-direction: column;
}

.weight-name {
  font-size: 14px;
  color: #c8ddfb;
}

.weight-value {
  font-size: 13px;
  font-family: monospace;
  color: #00f2ff;
  font-weight: bold;
}


.equilibrium-glow {
  box-shadow: 0 0 20px #2ed573 !important;
}

/* Hover Insight */
.hover-insight {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 240px;
  background: rgba(0, 10, 30, 0.9);
  border: 1px solid #00f2ff;
  border-radius: 8px;
  padding: 15px;
  z-index: 100;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.3);
  padding-bottom: 8px;
}

.insight-header h4 {
  margin: 0;
  font-size: 16px;
  color: #00f2ff;
}

.insight-content p {
  font-size: 16px;
  color: #ccc;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.link-notice {
  font-size: 11px;
  color: #ffa502;
  background: rgba(255, 165, 2, 0.1);
  padding: 6px;
  border-radius: 4px;
}

/* 结算叠加层 - 修改为可收缩容器 */
.settlement-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.protocol-toggle-btn {
  background: rgba(0, 242, 255, 0.15);
  border: 1px solid #00f2ff;
  border-radius: 4px;
  color: #00f2ff;
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.protocol-toggle-btn:hover {
  background: rgba(0, 242, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.4);
  transform: translateY(-2px);
}

.protocol-toggle-btn.active {
  background: #ff4757;
  border-color: #ff4757;
  color: #fff;
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.3);
}

.protocol-preview {
  background: #fff;
  color: #333;
  width: 280px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid #ddd;
  position: relative;
  transform-origin: top left;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.protocol-header {
  font-family: serif;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 2px solid #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.protocol-body p {
  font-size: 13px;
  margin: 10px 0;
  line-height: 1.6;
}

.protocol-seal {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border: 3px solid #ff4757;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff4757;
  font-weight: bold;
  transform: rotate(20deg);
  opacity: 0.8;
}

/* 动画 */
.weight-list-enter-active, .weight-list-leave-active {
  transition: all 0.5s ease;
}
.weight-list-enter-from { 
  opacity: 0; 
  transform: translateY(-20px); 
}
.weight-list-leave-to { 
  opacity: 0; 
  transform: translateY(20px); 
}
.weight-list-leave-active {
  position: absolute;
  left: 0;
  right: 4px; /* 留出滚动条空间 */
  z-index: 0;
}
.weight-list-move {
  transition: transform 0.5s ease;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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
}
</style>
