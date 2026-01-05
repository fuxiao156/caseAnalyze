<template>
  <div v-if="visible" class="dashboard-root">
    <div class="dashboard-scale-wrapper" :style="scaleStyle">
      <!-- 头部：大屏标题与全局指标 -->
      <header class="dashboard-header">
        <div class="header-title">案件全维度监测分析系统</div>
        <div class="header-meta">
          <span class="meta-item">Acc: {{ metrics.accuracy }}</span>
          <span class="meta-item">F1: {{ metrics.f1_score }}</span>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </header>

      <div class="dashboard-body">
        <!-- 左侧：多要素 (1/3 宽度) -->
        <aside class="dashboard-left">
          <!-- 1.1 事件描述 -->
          <EventDescriptionCard 
            class="event-description-section"
            :title="analysisData.title"
            :detail="analysisData.detail"
            @open-eval="openEval"
          />
          
          <!-- 1.2 事件画像与成因分析 -->
          <EventFactorCard 
            :profiling="analysisData.事件画像" 
            :causes="analysisData.核心成因分析" 
            @open-eval="openEval"
          />
        </aside>

        <!-- 右侧：多维度展示 (2/3 宽度) - 上中下结构 -->
        <main class="dashboard-right-container">
          <!-- 2.1 维度选择 (上部分) -->
          <div class="right-top-nav">
            <DimensionSwitch 
              :dimensions="analysisData.维度配置" 
              v-model:active-id="activeDimensionId"
            />
          </div>

          <!-- 维度详情 (中部分) -->
          <div class="right-middle-content" :class="{ 'full-height': activeDimensionId === 'duty' || activeDimensionId === 'info' }">
            <Transition name="fade-content" mode="out-in">
              <!-- 时间维度 -->
              <TimeDimensionCard 
                v-if="activeDimensionId === 'time'"
                :data="analysisData.时间维度数据"
                v-model:active-index="activeTimeNodeIndex"
                @open-eval="openEval"
              />

              <!-- 权责维度 (占据右侧全部) -->
              <ResponsibilityDimension
                v-else-if="activeDimensionId === 'duty'"
                :data="analysisData.权责维度数据"
                @open-eval="openEval"
                @highlight-factor="handleFactorSelect"
              />

              <!-- 信息维度 (占据右侧全部) -->
              <InformationDimension
                v-else-if="activeDimensionId === 'info'"
                :data="analysisData.信息维度数据"
                @open-eval="openEval"
              />
              
              <!-- 其他维度占位 -->
              <div v-else class="placeholder-card-large">
                {{ analysisData.维度配置?.find(d => d.id === activeDimensionId)?.name }} 维度详情分析中...
              </div>
            </Transition>
          </div>

          <!-- 要素模块横向轮播 (下部分) - 权责维度/信息维度下隐藏 -->
          <div v-if="activeDimensionId !== 'duty' && activeDimensionId !== 'info'" class="right-bottom-carousel">
            <FactorCarousel 
              :factors="currentFactors"
              :active-factor-name="activeFactorName"
              @open-eval="openEval"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- 评估 Modal -->
    <AnnotationModal
      v-if="evalModalVisible"
      :visible="evalModalVisible"
      :sectionName="activeSection.name"
      :sectionId="activeSection.id"
      @close="evalModalVisible = false"
      @submit="handleEvalSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import EventFactorCard from './EventFactorCard.vue';
import EventDescriptionCard from './EventDescriptionCard.vue';
import DimensionSwitch from './DimensionSwitch.vue';
import TimeDimensionCard from './TimeDimensionCard.vue';
import FactorCarousel from './FactorCarousel.vue';
import ResponsibilityDimension from './ResponsibilityDimension.vue';
import InformationDimension from './InformationDimension.vue';
import AnnotationModal from '../AnnotationModal.vue';

const props = defineProps({
  visible: Boolean,
  analysisData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

// 评估 Modal 状态
const evalModalVisible = ref(false);
const activeSection = ref({ name: '', id: '' });

const openEval = (name, id) => {
  activeSection.value = { name, id };
  evalModalVisible.value = true;
};

const handleEvalSubmit = (data) => {
  console.log('提交评估数据:', data);
  // 这里可以添加将评估数据保存到后端的逻辑
  evalModalVisible.value = false;
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
  // 如果当前是时间维度，且选中了某个节点，且该节点有特定要素详情
  if (activeDimensionId.value === 'time' && 
      props.analysisData.时间维度数据?.timeline?.[activeTimeNodeIndex.value]?.nodeFactors) {
    return props.analysisData.时间维度数据.timeline[activeTimeNodeIndex.value].nodeFactors;
  }
  // 否则显示全局要素详情
  return props.analysisData.要素详情 || [];
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

.meta-item {
  color: #00f2ff;
  font-family: monospace;
  font-size: 18px;
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

/* 切换动画 */
.fade-content-enter-active, .fade-content-leave-active {
  transition: all 0.3s ease;
}
.fade-content-enter-from { opacity: 0; transform: translateX(20px); }
.fade-content-leave-to { opacity: 0; transform: translateX(-20px); }
</style>

