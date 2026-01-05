<template>
  <div class="factor-card dashboard-card">
    <div class="card-title-row">
      <div class="card-title">事件画像与成因分析</div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '事件画像与成因分析', 'event-factor')">
        <span class="eval-icon">📊</span> 评测
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
        <div ref="profilePieRef" class="pie-chart"></div>
        <div class="chart-label">画像占比</div>
      </div>
      <div class="chart-container">
        <div ref="causePieRef" class="pie-chart"></div>
        <div class="chart-label">成因占比</div>
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

const emit = defineEmits(['open-eval']);

const profilePieRef = ref(null);
const causePieRef = ref(null);
let profileChart = null;
let causeChart = null;

const activeProfileIdx = ref(0);
const activeCauseIdx = ref(0);
let rotationTimer = null;
const lastInteractionTime = ref(Date.now());

const getPieOption = (title, data, activeIdx) => {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      name: title,
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#0a1b3e',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
          color: '#fff',
          formatter: '{b}\n{d}%'
        }
      },
      data: data.map((item, idx) => ({
        value: item.count,
        name: item.tag,
        selected: idx === activeIdx,
        itemStyle: {
          color: idx === activeIdx ? '#00f2ff' : 'rgba(0, 242, 255, 0.2)'
        }
      }))
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
    profileChart.setOption(getPieOption('画像', props.profiling, activeProfileIdx.value));
  }
};

const updateCauseChart = () => {
  if (causeChart && props.causes) {
    causeChart.setOption(getPieOption('成因', props.causes, activeCauseIdx.value));
  }
};

const selectProfile = (idx) => {
  activeProfileIdx.value = idx;
  lastInteractionTime.value = Date.now();
  updateProfileChart();
};

const selectCause = (idx) => {
  activeCauseIdx.value = idx;
  lastInteractionTime.value = Date.now();
  updateCauseChart();
};

const startRotation = () => {
  rotationTimer = setInterval(() => {
    // 如果 5 秒内没有操作，则轮播
    if (Date.now() - lastInteractionTime.value > 5000) {
      if (props.profiling && props.profiling.length > 0) {
        activeProfileIdx.value = (activeProfileIdx.value + 1) % props.profiling.length;
        updateProfileChart();
      }
      if (props.causes && props.causes.length > 0) {
        activeCauseIdx.value = (activeCauseIdx.value + 1) % props.causes.length;
        updateCauseChart();
      }
    }
  }, 3000);
};

onMounted(() => {
  nextTick(() => {
    initCharts();
    startRotation();
  });
});

onUnmounted(() => {
  if (rotationTimer) clearInterval(rotationTimer);
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
  font-size: 12px;
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
  color: #88b0ea;
  font-size: 12px;
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
  font-size: 12px;
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
  background: rgba(255, 207, 64, 0.1);
  color: #ffcf40;
}
.tech-tag.cause.active, .tech-tag.cause:hover {
  background: #ffcf40;
  color: #000;
  box-shadow: 0 0 10px rgba(255, 207, 64, 0.5);
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
}

.pie-chart {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.chart-label {
  font-size: 11px;
  color: #88b0ea;
  margin-top: 5px;
  flex: 0 0 auto;
}

.tag-section {
  flex: 0 0 auto;
}
</style>
