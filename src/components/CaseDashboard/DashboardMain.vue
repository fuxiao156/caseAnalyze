<template>
  <div v-if="visible" class="dashboard-root">
    <div class="dashboard-scale-wrapper" :style="scaleStyle">
      <!-- 头部：大屏标题与全局指标 -->
      <header class="dashboard-header">
        <div class="header-title">案件归因分析表盘</div>
        <div class="header-meta">
          <button class="accuracy-detail-btn" @click="accuracyModalVisible = true">
            <span class="btn-icon">📈</span>
            <span>归因分析数据概览</span>
          </button>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </header>

      <div class="dashboard-body">
        <!-- 加载蒙层 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">
              <span class="main-text">归因分析中...</span>
              <span class="percent-text">{{ analysisData?.progress || 0 }}%</span>
            </div>
            
            <!-- 进度条 -->
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: `${analysisData?.progress || 0}%` }"></div>
            </div>

            <!-- 步骤详情列表 -->
            <div class="steps-container">
              <div v-for="(step, index) in analysisData?.steps_log" :key="index" class="step-item" :class="step.status">
                <div class="step-icon">
                  <span v-if="step.status === 'done'">✓</span>
                  <span v-else-if="step.status === 'running'" class="step-spinner"></span>
                  <span v-else-if="step.status === 'skipped'">○</span>
                  <span v-else-if="step.status === 'error'">✕</span>
                  <span v-else>●</span>
                </div>
                <div class="step-info">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-status-text" v-if="step.status === 'running'">{{ step.error || '正在处理...' }}</div>
                  <div class="step-status-text" v-else-if="step.status === 'done'">已完成 (耗时 {{ step.cost }}s)</div>
                  <div class="step-status-text" v-else-if="step.status === 'skipped'">已跳过</div>
                </div>
              </div>
            </div>

            <div class="loading-subtext">预计需要 1-2 分钟，当前：{{ analysisData?.message }}</div>
          </div>
        </div>

        <!-- 左侧：多要素 (1/3 宽度) -->
        <aside class="dashboard-left">
          <!-- 1.1 事件描述 -->
          <EventDescriptionCard 
            class="event-description-section"
            :title="analysisData?.title"
            :detail="analysisData?.detail"
          />
          
          <!-- 1.2 事件画像与成因分析 -->
          <EventFactorCard 
            :profiling="analysisData?.事件画像" 
            :causes="analysisData?.成因分析" 
            @open-correction="openCorrection"
          />
        </aside>

        <!-- 右侧：多维度展示 (2/3 宽度) - 上中下结构 -->
        <main class="dashboard-right-container">
          <!-- 2.1 维度选择 (上部分) -->
          <div class="right-top-nav">
            <DimensionSwitch 
              :dimensions="dimensions" 
              v-model:active-id="activeDimensionId"
            />
          </div>

          <!-- 维度详情 (中部分) -->
          <div class="right-middle-content" :class="{ 'full-height': ['duty', 'info', 'person', 'time'].includes(activeDimensionId) }">
            <Transition name="fade-content" mode="out-in">
              <!-- 时间维度 -->
              <TimeDimensionCard 
                v-if="activeDimensionId === 'time'"
                :data="analysisData?.时间维度数据"
                :factors="currentFactors"
                :active-factor-name="activeFactorName"
                v-model:active-index="activeTimeNodeIndex"
                @open-correction="openCorrection"
              />

              <!-- 人物维度 (占据右侧全部) -->
              <PersonDimension
                v-else-if="activeDimensionId === 'person'"
                :data="analysisData?.人物维度数据"
                @open-correction="openCorrection"
              />

              <!-- 权责维度 (占据右侧全部) -->
              <ResponsibilityDimension
                v-else-if="activeDimensionId === 'duty'"
                :data="analysisData?.驱动力维度数据"
                @open-correction="openCorrection"
                @highlight-factor="handleFactorSelect"
              />

              <!-- 信息维度 (占据右侧全部) -->
              <InformationDimension
                v-else-if="activeDimensionId === 'info'"
                :data="analysisData?.信息维度数据"
                @open-correction="openCorrection"
              />

              <!-- 其他维度占位 -->
              <div v-else class="placeholder-card-large">
                {{ dimensions.find(d => d.id === activeDimensionId)?.name }} 维度详情分析中...
              </div>
            </Transition>
          </div>
        </main>
      </div>
    </div>

    <!-- 数据校正 Modal -->
    <DataCorrectionModal
      v-if="correctionModalVisible"
      :visible="correctionModalVisible"
      :sectionName="activeSection.name"
      :sectionId="activeSection.id"
      :allData="analysisData"
      @close="correctionModalVisible = false"
      @update-all="handleDataUpdate"
    />

    <!-- 归因分析数据概览 Modal -->
    <AccuracyDetailModal
      v-if="accuracyModalVisible"
      :visible="accuracyModalVisible"
      @close="accuracyModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import EventFactorCard from './EventFactorCard.vue';
import EventDescriptionCard from './EventDescriptionCard.vue';
import DimensionSwitch from './DimensionSwitch.vue';
import TimeDimensionCard from './TimeDimensionCard.vue';
import ResponsibilityDimension from './ResponsibilityDimension.vue';
import InformationDimension from './InformationDimension.vue';
import PersonDimension from './PersonDimension.vue';
import DataCorrectionModal from '../DataCorrectionModal.vue';
import AccuracyDetailModal from '../AccuracyDetailModal.vue';

const props = defineProps({
  visible: Boolean,
  loading: Boolean,
  analysisData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'update-data']);

const dimensions = [
  { id: 'time', name: '时间维度' },
  { id: 'person', name: '人物维度' },
  { id: 'duty', name: '驱动力维度' },
  { id: 'info', name: '信息维度' }
];

// 数据校正 Modal 状态
const correctionModalVisible = ref(false);
const accuracyModalVisible = ref(false);
const activeSection = ref({ name: '', id: '' });

const openCorrection = (name, id) => {
  activeSection.value = { name, id };
  correctionModalVisible.value = true;
};

const handleDataUpdate = (newData) => {
  console.log('收到全量校正数据:', newData);
  emit('update-data', newData);
  // 这里可以根据需要进行本地状态更新或重新请求
};

// 设计稿尺寸
const DESIGN_WIDTH = 1820;
const DESIGN_HEIGHT = 880;

const scale = ref(1);

const updateScale = () => {
  const ww = window.innerWidth / DESIGN_WIDTH;
  const wh = window.innerHeight / DESIGN_HEIGHT;
  // 取最小比例，确保内容完整显示（等比例缩放，会有黑边）
  scale.value = ww < wh ? ww : wh;
};

const scaleStyle = computed(() => ({
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  transform: `scale(${scale.value}) translate(-50%, -50%)`,
  position: 'absolute',
  left: '50%',
  top: '50%',
  transformOrigin: '0 0',
  transition: 'transform 0.1s ease-out'
}));

onMounted(() => {
  updateScale();
  window.addEventListener('resize', updateScale);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScale);
});

const metrics = ref({ accuracy: '86.4%', f1_score: '0.86' });
const activeDimensionId = ref('time'); // 默认选中时间维度
const activeFactorName = ref('');
const activeTimeNodeIndex = ref(0); // 当前选中的时间节点索引

const currentFactors = computed(() => {
  // 如果当前是时间维度，且选中了某个节点，且该节点有特定要素拆解
  if (activeDimensionId.value === 'time' && 
      props.analysisData?.时间维度数据?.timeline?.[activeTimeNodeIndex.value]?.nodeFactors) {
    return props.analysisData?.时间维度数据?.timeline?.[activeTimeNodeIndex.value]?.nodeFactors || [];
  }
  // 否则返回空数组
  return [];
});

const handleFactorSelect = (name) => {
  activeFactorName.value = name;
};
</script>

<style scoped>
.dashboard-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1b3e 0%, #050a19 100%);
  color: #fff;
  z-index: 2000;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dashboard-scale-wrapper {
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  height: 70px;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  border-bottom: 2px solid rgba(0, 242, 255, 0.2);
  flex-shrink: 0;
}

.header-title {
  color: #00f2ff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.6);
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 25px;
}

.dashboard-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.dashboard-left > * {
  flex: 1;
  min-height: 0; /* 允许子项在 flex 容器中收缩 */
}

.event-description-section {
  flex: 0 0 320px; /* 固定高度为 320px */
}

.dashboard-right-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.right-top-nav {
  flex: 0 0 auto;
}

.right-middle-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.right-middle-content.full-height {
  flex: 1 1 100%;
}

/* 确保 TimeDimensionCard 或占位符填充父容器 */
.right-middle-content > * {
  flex: 1;
  height: 100%;
}

.right-bottom-carousel {
  flex: 0 0 280px; /* 增加固定高度，防止交互时抖动 */
  min-height: 0;
}

.placeholder-card-large {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.1);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: #88b0ea;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}
.close-btn:hover { color: #fff; }

.accuracy-detail-btn {
  background: rgba(0, 242, 255, 0.15);
  border: 1px solid rgba(0, 242, 255, 0.4);
  color: #00f2ff;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.1);
}

.accuracy-detail-btn:hover {
  background: rgba(0, 242, 255, 0.25);
  border-color: #00f2ff;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
  transform: translateY(-1px);
}

.accuracy-detail-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

/* 加载蒙层 */
.loading-overlay {
  position: absolute;
  top: 70px; /* header height */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 10, 25, 0.9);
  backdrop-filter: blur(12px);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 242, 255, 0.1);
  border-top: 3px solid #00f2ff;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  display: flex;
  align-items: baseline;
  gap: 12px;
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.main-text {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
}

.percent-text {
  font-size: 18px;
  font-family: 'DIN Alternate', sans-serif;
  opacity: 0.8;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0072ff, #00f2ff);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
  transition: width 0.5s ease;
}

.steps-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.step-item.running {
  opacity: 1;
  color: #00f2ff;
}

.step-item.done {
  opacity: 0.8;
  color: #4ade80;
}

.step-item.skipped {
  opacity: 0.4;
}

.step-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.step-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 242, 255, 0.2);
  border-top-color: #00f2ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.step-info {
  flex: 1;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
}

.step-status-text {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}

.loading-subtext {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  text-align: center;
}

/* 切换动画 */
.fade-content-enter-active, .fade-content-leave-active {
  transition: all 0.3s ease;
}
.fade-content-enter-from { opacity: 0; transform: translateX(20px); }
.fade-content-leave-to { opacity: 0; transform: translateX(-20px); }
</style>

