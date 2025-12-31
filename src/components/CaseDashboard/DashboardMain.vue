<template>
  <div v-if="visible" class="dashboard-root">
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
        <!-- 1.1 事件画像与成因分析 -->
        <EventFactorCard 
          :profiling="analysisData.事件画像" 
          :causes="analysisData.核心成因分析" 
        />
        
        <!-- 1.2 要素雷达图 -->
        <FactorRadarCard 
          :data="analysisData.要素雷达数据"
          :active-factor="activeFactorName"
          @select-factor="handleFactorSelect"
        />
        
        <!-- 1.3 - 1.9 要素详细块 -->
        <FactorDetailBlocks 
          :factors="analysisData.要素详情"
          :active-factor-name="activeFactorName"
          :psychology-data="analysisData.心理情绪数据"
          @focus-timeline="handleFocusTimeline"
        />
      </aside>

      <!-- 右侧：多维度展示 (2/3 宽度) -->
      <main class="dashboard-right">
        <!-- 2.1 维度列表开关 -->
        <DimensionSwitch 
          :dimensions="analysisData.维度配置" 
          v-model:active-ids="activeDimensions"
        />

        <!-- 2.2 时间维度 -->
        <TimeDimensionCard 
          v-if="activeDimensions.includes('time')"
          :data="analysisData.时间维度数据"
          :focused-time="focusedTime"
        />
        
        <!-- 2.3 - 2.6 其他维度 (未来集成) -->
        <div v-if="activeDimensions.includes('duty')" class="placeholder-card-large">2.5 权责维度展示区</div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import EventFactorCard from './EventFactorCard.vue';
import DimensionSwitch from './DimensionSwitch.vue';
import TimeDimensionCard from './TimeDimensionCard.vue';
import FactorRadarCard from './FactorRadarCard.vue';
import FactorDetailBlocks from './FactorDetailBlocks.vue';

const props = defineProps({
  visible: Boolean,
  analysisData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

const metrics = ref({ accuracy: '86.4%', f1_score: '0.86' });
const activeDimensions = ref(['time', 'duty']); 
const activeFactorName = ref('');
const focusedTime = ref('');

const handleFactorSelect = (name) => {
  activeFactorName.value = name;
};

const handleFocusTimeline = (time) => {
  focusedTime.value = time;
  // 如果时间维度未开启，则开启
  if (!activeDimensions.value.includes('time')) {
    activeDimensions.value.push('time');
  }
};
</script>

<style scoped>
.dashboard-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1b3e 0%, #050a19 100%);
  display: flex;
  flex-direction: column;
  color: #fff;
  z-index: 2000;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dashboard-header {
  height: 70px;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  border-bottom: 2px solid rgba(0, 242, 255, 0.2);
}

.header-title {
  font-size: 26px;
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

.dashboard-left, .dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.placeholder-card {
  background: rgba(16, 35, 78, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.1);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.placeholder-card-large {
  background: rgba(16, 35, 78, 0.4);
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
</style>
