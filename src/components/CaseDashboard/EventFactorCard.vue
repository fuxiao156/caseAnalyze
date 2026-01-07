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

    <!-- 中部：事件成因分析标签 -->
    <div class="tag-section middle">
      <div class="mini-label">核心成因分析 (Causes)</div>
      <div class="tag-cloud">
        <span 
          v-for="(item, index) in causes" 
          :key="item.tag"
          :class="['tech-tag cause', activeCauseIdx === index ? 'active' : '']"
          :style="getCauseTagStyle(index)"
          @click="selectCause(index)"
        >{{ item.tag }}</span>
      </div>
    </div>

    <!-- 下部：成因占比饼图 -->
    <div class="chart-section bottom">
      <div class="chart-container">
        <div class="chart-wrapper">
          <div class="chart-bg-ring highlight large"></div>
          <div class="chart-bg-ring-inner highlight large"></div>
          <div class="chart-scan-beam highlight large"></div>
          <div ref="causePieRef" class="pie-chart"></div>
        </div>
        <div class="chart-label">致因推动比例分布</div>
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

const causePieRef = ref(null);
let causeChart = null;

const activeProfileIdx = ref(0);
const activeCauseIdx = ref(0);

// 定义成因颜色调色盘
const CAUSE_COLORS = [
  { main: '#ffd700', grad: '#ffa500', glow: 'rgba(255, 215, 0, 0.3)' }, // 金黄
  { main: '#00f2ff', grad: '#0066ff', glow: 'rgba(0, 242, 255, 0.3)' }, // 青蓝
  { main: '#a29bfe', grad: '#6c5ce7', glow: 'rgba(162, 155, 254, 0.3)' }, // 浅紫
  { main: '#55efc4', grad: '#00b894', glow: 'rgba(85, 239, 196, 0.3)' }, // 翠绿
  { main: '#ff7675', grad: '#d63031', glow: 'rgba(255, 118, 117, 0.3)' }, // 珊瑚红
  { main: '#ffeaa7', grad: '#fdcb6e', glow: 'rgba(255, 234, 167, 0.3)' }  // 浅黄
];

const getCausePieOption = (data) => {
  const chartData = data.map((item, idx) => {
    const colorCfg = CAUSE_COLORS[idx % CAUSE_COLORS.length];
    return {
      name: item.tag,
      value: item.percentage,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorCfg.main },
          { offset: 1, color: colorCfg.grad }
        ]),
        shadowBlur: 10,
        shadowColor: colorCfg.glow
      }
    };
  });

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(10, 27, 62, 0.9)',
      borderColor: '#00f2ff',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}%'
    },
    series: [{
      name: '成因推动比例',
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: true,
      animationType: 'expansion',
      animationDelay: 200,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#0a1b3e',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        color: '#88b0ea',
        fontSize: 12,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 15,
        lineStyle: {
          color: 'rgba(0, 242, 255, 0.3)'
        }
      },
      emphasis: {
        scale: true,
        scaleSize: 8,
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: chartData
    }]
  };
};

const initCharts = () => {
  if (causePieRef.value) {
    causeChart = echarts.init(causePieRef.value);
    updateCauseChart();
  }
};

const updateCauseChart = () => {
  if (causeChart && props.causes?.length > 0) {
    causeChart.setOption(getCausePieOption(props.causes));
  }
};

const selectProfile = (idx) => {
  activeProfileIdx.value = idx;
};

const selectCause = (idx) => {
  activeCauseIdx.value = idx;
  // 联动高亮饼图
  if (causeChart) {
    // 循环取消所有扇区的高亮状态，确保彻底回缩
    props.causes.forEach((_, i) => {
      causeChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: i
      });
    });
    
    // 高亮当前选中的扇区
    causeChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: idx
    });
    // 自动显示对应的 tooltip
    causeChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: idx
    });
  }
};

const getCauseTagStyle = (idx) => {
  const colorCfg = CAUSE_COLORS[idx % CAUSE_COLORS.length];
  const isActive = activeCauseIdx.value === idx;
  
  if (isActive) {
    return {
      background: colorCfg.main,
      color: '#000',
      borderColor: colorCfg.main,
      boxShadow: `0 0 10px ${colorCfg.glow}`
    };
  }
  return {
    background: `${colorCfg.main}3a`, // 10% opacity
    color: colorCfg.main,
    borderColor: 'transparent'
  };
};

onMounted(() => {
  nextTick(() => {
    initCharts();
  });
});

onUnmounted(() => {
  causeChart?.dispose();
});

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

.tech-tag.cause:hover {
  filter: brightness(1.2);
}

.tag-section {
  flex: 0 0 auto;
  margin-bottom: 15px;
}

.chart-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
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
}

.chart-bg-ring {
  position: absolute;
  width: 120px;
  height: 120px;
  border: 1px dashed rgba(0, 242, 255, 0.2);
  border-radius: 50%;
  animation: ring-rotate 15s linear infinite;
}

.chart-bg-ring.large {
  width: 160px;
  height: 160px;
}

.chart-bg-ring::before {
  content: "";
  position: absolute;
  inset: -15px;
  border: 1px solid rgba(0, 242, 255, 0.05);
  border-radius: 50%;
  animation: ring-pulse 4s ease-in-out infinite;
}

.chart-bg-ring-inner {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 50%;
  animation: ring-rotate-reverse 10s linear infinite;
}

.chart-bg-ring-inner.large {
  width: 110px;
  height: 110px;
}

.chart-bg-ring-inner::after {
  content: "";
  position: absolute;
  top: -2px;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #00f2ff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00f2ff;
}

.chart-scan-beam {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0%, rgba(0, 242, 255, 0.1) 10%, transparent 20%);
  animation: ring-rotate 4s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.chart-scan-beam.large {
  width: 180px;
  height: 180px;
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
  50% { transform: scale(1.1); opacity: 0.5; }
}

.pie-chart {
  width: 100%;
  height: 100%;
  z-index: 2;
}

.chart-label {
  font-size: 15px;
  color: #00f2ff;
  margin-top: 5px;
  flex: 0 0 auto;
  font-weight: bold;
  letter-spacing: 1px;
}
</style>
