<template>
  <div class="factor-card dashboard-card">
    <div class="card-title-row">
      <div class="card-title">事件画像与成因分析</div>
      <button class="eval-trigger-btn" @click="$emit('open-correction', '事件画像与成因分析', 'event-factor')">
        <span class="eval-icon">📝</span> 数据校正
      </button>
    </div>
    
    <!-- 上部：事件画像标签 -->
    <div class="tag-section top">
      <div class="mini-label">事件画像 (Profiling)</div>
      <div class="tag-cloud">
        <span 
          v-for="(item, index) in profiling" 
          :key="item.tag"
          :class="['tech-tag profile', activeProfileIdx === index ? 'active' : '']"
          @click="selectProfile(index)"
        >{{ item.tag }}</span>
      </div>
    </div>

    <!-- 中部：双饼图 -->
    <div class="charts-row">
      <div class="chart-container">
        <div class="chart-wrapper">
          <div class="chart-bg-ring"></div>
          <div class="chart-bg-ring-inner"></div>
          <div class="chart-scan-beam"></div>
          <div ref="profilePieRef" class="pie-chart"></div>
        </div>
        <div class="chart-label">画像全库占比</div>
      </div>
      <div class="chart-container">
        <div class="chart-wrapper">
          <div class="chart-bg-ring highlight"></div>
          <div class="chart-bg-ring-inner highlight"></div>
          <div class="chart-scan-beam highlight"></div>
          <div ref="causePieRef" class="pie-chart"></div>
        </div>
        <div class="chart-label">成因全库占比</div>
      </div>
    </div>

    <!-- 下部：事件成因分析标签 -->
    <div class="tag-section bottom">
      <div class="mini-label">核心成因 (Causes)</div>
      <div class="tag-cloud">
        <span 
          v-for="(item, index) in causes" 
          :key="item.tag"
          :class="['tech-tag cause', activeCauseIdx === index ? 'active' : '']"
          @click="selectCause(index)"
        >{{ item.tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  profiling: {
    type: Array,
    default: () => []
  },
  causes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['open-correction']);

const profilePieRef = ref(null);
const causePieRef = ref(null);
let profileChart = null;
let causeChart = null;

const activeProfileIdx = ref(0);
const activeCauseIdx = ref(0);

const getPieOption = (title, data, activeIdx, isYellow = false) => {
  const activeItem = data[activeIdx] || { tag: '未知', percentage: 0 };
  const percent = activeItem.percentage || 0;
  const themeColor = isYellow ? '#ffd700' : '#00f2ff';
  const shadowColor = isYellow ? 'rgba(255, 215, 0, 0.6)' : 'rgba(0, 242, 255, 0.6)';
  
  return {
    backgroundColor: 'transparent',
    // 启用动画
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    animationEasingUpdate: 'exponentialOut',
    title: {
      text: percent + '%',
      left: 'center',
      top: 'center',
      textStyle: {
        color: themeColor,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        textShadowBlur: 10,
        textShadowColor: shadowColor
      }
    },
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(10, 27, 62, 0.9)',
      borderColor: themeColor,
      textStyle: { color: '#fff' },
      formatter: (params) => {
        if (params.name === '全库其他案件') return null;
        return `${params.name}<br/>全库占比: ${params.value}%`;
      }
    },
    series: [{
      name: title,
      type: 'pie',
      radius: ['55%', '75%'],
      avoidLabelOverlap: false,
      // 科技感动画效果：展开进入
      animationType: 'expansion',
      animationDelay: 200,
      itemStyle: {
        borderRadius: 2,
        borderColor: '#0a1b3e',
        borderWidth: 1
      },
      emphasis: {
        scale: true,
        scaleSize: 5
      },
      label: { show: false },
      data: [
        {
          value: percent,
          name: activeItem.tag,
          itemStyle: {
            color: isYellow 
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ffd700' },
                  { offset: 1, color: '#ffa500' }
                ])
              : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00f2ff' },
                  { offset: 1, color: '#0066ff' }
                ]),
            shadowBlur: 15,
            shadowColor: shadowColor
          }
        },
        {
          value: 100 - percent,
          name: '全库其他案件',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          tooltip: { show: false }
        }
      ]
    }]
  };
};

const initCharts = () => {
  if (profilePieRef.value) {
    profileChart = echarts.init(profilePieRef.value);
    updateProfileChart();
  }
  if (causePieRef.value) {
    causeChart = echarts.init(causePieRef.value);
    updateCauseChart();
  }
};

const updateProfileChart = () => {
  if (profileChart && props.profiling) {
    profileChart.setOption(getPieOption('画像分布', props.profiling, activeProfileIdx.value, false));
  }
};

const updateCauseChart = () => {
  if (causeChart && props.causes) {
    causeChart.setOption(getPieOption('成因分布', props.causes, activeCauseIdx.value, true));
  }
};

const selectProfile = (idx) => {
  activeProfileIdx.value = idx;
  updateProfileChart();
};

const selectCause = (idx) => {
  activeCauseIdx.value = idx;
  updateCauseChart();
};

onMounted(() => {
  nextTick(() => {
    initCharts();
  });
});

onUnmounted(() => {
  profileChart?.dispose();
  causeChart?.dispose();
});

watch(() => props.profiling, updateProfileChart, { deep: true });
watch(() => props.causes, updateCauseChart, { deep: true });
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

.mini-label {
  font-size: 15px;
  color: #c8ddfb;
  margin-bottom: 8px;
  opacity: 0.8;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.tech-tag.profile {
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
}
.tech-tag.profile.active, .tech-tag.profile:hover {
  background: #00f2ff;
  color: #000;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.tech-tag.cause {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
}
.tech-tag.cause.active, .tech-tag.cause:hover {
  background: #ffd700;
  color: #000;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.charts-row {
  display: flex;
  flex: 1; /* 让图表区域自适应填充 */
  min-height: 120px;
  margin: 15px 0;
}

.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: chart-float 6s ease-in-out infinite;
}

.chart-bg-ring {
  position: absolute;
  width: 90px;
  height: 90px;
  border: 1px dashed rgba(0, 242, 255, 0.2);
  border-radius: 50%;
  animation: ring-rotate 15s linear infinite;
}

.chart-bg-ring::before {
  content: "";
  position: absolute;
  inset: -10px;
  border: 1px solid rgba(0, 242, 255, 0.05);
  border-radius: 50%;
  animation: ring-pulse 4s ease-in-out infinite;
}

.chart-bg-ring-inner {
  position: absolute;
  width: 65px;
  height: 65px;
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 50%;
  animation: ring-rotate-reverse 10s linear infinite;
}

.chart-bg-ring-inner::after {
  content: "";
  position: absolute;
  top: -2px;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #00f2ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00f2ff;
}

.chart-scan-beam {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0%, rgba(0, 242, 255, 0.1) 10%, transparent 20%);
  animation: ring-rotate 4s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.chart-bg-ring.highlight {
  border-color: rgba(255, 215, 0, 0.2);
}
.chart-bg-ring.highlight::before {
  border-color: rgba(255, 215, 0, 0.05);
}
.chart-bg-ring-inner.highlight {
  border-color: rgba(255, 215, 0, 0.1);
}
.chart-bg-ring-inner.highlight::after {
  background: #ffd700;
  box-shadow: 0 0 8px #ffd700;
}
.chart-scan-beam.highlight {
  background: conic-gradient(from 0deg, transparent 0%, rgba(255, 215, 0, 0.1) 10%, transparent 20%);
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ring-rotate-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0.6; }
}

@keyframes chart-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.pie-chart {
  width: 100%;
  height: 100%;
  z-index: 2;
}

.chart-label {
  font-size: 14px;
  color: #88b0ea;
  margin-top: 5px;
  flex: 0 0 auto;
}

.tag-section {
  flex: 0 0 auto;
}
</style>
