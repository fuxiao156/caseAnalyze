<template>
  <div class="responsibility-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">权责维度分析 (Responsibility Dimension)</div>
      <div class="state-selector">
        <button 
          v-for="state in data.states" 
          :key="state.id"
          :class="['state-btn', { active: activeStateId === state.id }]"
          @click="activeStateId = state.id"
        >
          {{ state.name }}
        </button>
      </div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '权责维度分析', 'responsibility-dimension')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>

    <div class="dimension-summary">
      <div class="status-badge" :class="currentState.id">
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
            <div class="settlement-indicator" :class="{ active: isEquilibrium }">
              <div class="indicator-light"></div>
              <span>和解均衡监测</span>
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
              <div class="platform-label">责任端 (厂方)</div>
              <div class="weights-container">
                <TransitionGroup name="weight-list">
                  <div 
                    v-for="w in currentState.leftWeights" 
                    :key="w.id"
                    class="weight-item-tech"
                    :class="[w.type, { floating: w.isFloating }]"
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
              <div class="platform-label">权益端 (刘某)</div>
              <div class="weights-container">
                <TransitionGroup name="weight-list">
                  <div 
                    v-for="w in currentState.rightWeights" 
                    :key="w.id"
                    class="weight-item-tech"
                    :class="w.type"
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
            <h4>砝码详情: {{ hoveredWeight.name }}</h4>
          </div>
          <div class="insight-content">
            <p>{{ getWeightDescription(hoveredWeight) }}</p>
            <div v-if="hoveredWeight.linkedFactor" class="link-notice">
              🔗 关联要素: <strong>{{ hoveredWeight.linkedFactor }}</strong> 已在左侧高亮
            </div>
          </div>
        </div>
      </Transition>

      <!-- 最终达成协议背景装饰 -->
      <Transition name="pulse-gold">
        <div v-if="currentState.id === 'final' && isEquilibrium" class="settlement-overlay">
          <div class="protocol-preview">
            <div class="protocol-header">调解协议书 (2017-12-13)</div>
            <div class="protocol-body">
              <p>1. 补偿金 43,000 元整...</p>
              <p>2. 失地农民养老保险变通...</p>
              <p>3. 支付保险费 97,020 元...</p>
            </div>
            <div class="protocol-seal">已锁定</div>
          </div>
        </div>
      </Transition>
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

const emit = defineEmits(['open-eval', 'highlight-factor']);

const activeStateId = ref('initial');
const hoveredWeight = ref(null);

const currentState = computed(() => {
  return props.data.states?.find(s => s.id === activeStateId.value) || props.data.states[0] || {};
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
  return diffPercentage.value < 0.05;
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
  const baseDesc = {
    'commitment': '厂方基于社会责任作出的承诺，但由于政策限制目前难以执行。',
    'responsibility': '用人单位应尽的法律义务及过往协议中的存续部分。',
    'claim': '劳动者基于《工伤保险条例》提出的法定经济补偿要求。',
    'obsession': '劳动者对特定身份待遇的原始诉求，受限于现行政策。',
    'concession': '厂方为达成和解而额外承担的经济赔偿部分。',
    'compromise': '劳动者接受变通方案，降低了执行难度。',
    'final_payment': '达成最终平衡的关键支付项。',
    'psychological_balance': '心态转变带来的虚拟重量，抵消了原始诉求的阻力。'
  };
  return baseDesc[w.type] || '权责争议砝码。';
};

watch(() => props.data, () => {
  if (props.data.states?.length > 0) {
    activeStateId.value = props.data.states[0].id;
  }
}, { immediate: true });

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

.responsibility-dimension {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: rgba(5, 15, 40, 0.6) !important;
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
  font-size: 12px;
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

.status-badge.initial { background: rgba(255, 71, 87, 0.2); color: #ff4757; }
.status-badge.mediating { background: rgba(255, 165, 2, 0.2); color: #ffa502; }
.status-badge.final { background: rgba(46, 213, 115, 0.2); color: #2ed573; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.dimension-summary p {
  font-size: 13px;
  color: #ccc;
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

.settlement-indicator.active {
  color: #2ed573;
}

.indicator-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #333;
}

.settlement-indicator.active .indicator-light {
  background: #2ed573;
  box-shadow: 0 0 10px #2ed573;
  animation: pulse-light 1s infinite;
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
  width: 140px;
  transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center -75px; /* 同步调整旋转中心 */
}

.left-platform { left: 50px; }
.right-platform { right: 50px; }

.platform-base {
  background: rgba(0, 242, 255, 0.05);
  border-bottom: 2px solid #00f2ff;
  border-left: 1px solid rgba(0, 242, 255, 0.2);
  border-right: 1px solid rgba(0, 242, 255, 0.2);
  min-height: 80px;
  padding: 10px;
  position: relative;
  backdrop-filter: blur(2px);
  width: 140px;
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
  font-size: 11px;
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
  font-size: 11px;
  color: #888;
}

.weight-value {
  font-size: 11px;
  font-family: monospace;
  color: #00f2ff;
  font-weight: bold;
}

.weight-item-tech.floating {
  animation: float 3s infinite ease-in-out;
  border-style: dashed;
  opacity: 0.8;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 状态色映射 */
.weight-item-tech.concession { border-left: 3px solid #2ed573; }
.weight-item-tech.claim { border-left: 3px solid #ffa502; }
.weight-item-tech.commitment { border-left: 3px solid #00f2ff; }
.weight-item-tech.obsession { border-left: 3px solid #ff4757; opacity: 0.6; }
.weight-item-tech.final_payment { border-left: 3px solid #00f2ff; background: rgba(0, 242, 255, 0.2); }

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
  font-size: 14px;
  color: #00f2ff;
}

.insight-content p {
  font-size: 12px;
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

/* 结算叠加层 */
.settlement-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: 200;
  pointer-events: none;
}

.protocol-preview {
  background: #fff;
  color: #333;
  width: 260px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transform: rotate(-1deg);
  border: 1px solid #ddd;
  position: relative;
  pointer-events: auto;
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
  font-size: 12px;
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
  transition: all 0.5s;
}
.weight-list-enter-from { opacity: 0; transform: translateY(-20px); }
.weight-list-leave-to { opacity: 0; transform: translateY(20px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.pulse-gold-enter-active {
  animation: pulse-gold 1s ease-out;
}

@keyframes pulse-gold {
  0% { transform: scale(0.8); opacity: 0; box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
  50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 100px 50px rgba(255, 215, 0, 0.3); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 50px rgba(255, 215, 0, 0.5); }
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
</style>
