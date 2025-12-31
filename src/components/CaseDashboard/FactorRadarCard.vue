<template>
  <div class="radar-card dashboard-card">
    <div class="card-title-row">
      <div class="card-title">全要素冲突权重分析 (Factor Analysis)</div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '全要素权重分析', 'factor-radar')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>
    <div class="radar-content">
      <!-- 雷达图容器 -->
      <div ref="radarRef" class="radar-chart"></div>
      
      <!-- 权重列表 -->
      <div class="weight-list">
        <div 
          v-for="item in data" 
          :key="item.name"
          :class="['weight-item', activeFactor === item.name ? 'active' : '']"
          @click="$emit('select-factor', item.name)"
        >
          <div class="w-info">
            <span class="w-name">{{ item.name }}</span>
            <span class="w-val">{{ (item.value * 100).toFixed(0) }}%</span>
          </div>
          <div class="w-bar-bg">
            <div class="w-bar-fill" :style="{ width: item.value * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  activeFactor: String
});

const emit = defineEmits(['select-factor', 'open-eval']);

const radarRef = ref(null);
let myChart = null;

const initRadar = () => {
  if (!radarRef.value) return;
  myChart = echarts.init(radarRef.value);
  updateRadar();
  
  myChart.on('click', (params) => {
    // 监听雷达图点击（如果点击的是轴标签等）
    // 注意：雷达图区域点击较为复杂，主要通过旁边的列表或 indicator 点击
  });
};

const updateRadar = () => {
  if (!myChart || !props.data || props.data.length === 0) return;
  
  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: props.data.map(item => ({ 
        name: item.name, 
        max: 1,
        color: props.activeFactor === item.name ? '#00f2ff' : '#88b0ea'
      })),
      splitArea: {
        show: true,
        areaStyle: { color: ['rgba(0, 242, 255, 0.02)', 'rgba(0, 242, 255, 0.05)'] }
      },
      axisLine: { lineStyle: { color: 'rgba(0, 242, 255, 0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 242, 255, 0.2)' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: props.data.map(item => item.value),
        name: '要素权重',
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#00f2ff' },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(0, 242, 255, 0.1)' },
            { offset: 1, color: 'rgba(0, 242, 255, 0.4)' }
          ])
        },
        lineStyle: { width: 2, color: '#00f2ff' }
      }]
    }]
  };
  
  myChart.setOption(option);
};

onMounted(() => {
  nextTick(initRadar);
});

watch(() => props.data, updateRadar, { deep: true });
watch(() => props.activeFactor, updateRadar);

window.addEventListener('resize', () => myChart?.resize());
</script>

<style scoped>
.dashboard-card {
  background: rgba(16, 35, 78, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.15);
  border-radius: 8px;
  padding: 20px;
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

.radar-content {
  display: flex;
  flex: 1; /* 填充可用高度 */
  align-items: center;
  min-height: 0;
}

.radar-chart {
  flex: 1.2;
  height: 100%;
}

.weight-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-left: 20px;
  height: 100%;
  overflow-y: auto;
}

.weight-item {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.3s;
  border: 1px solid transparent;
  flex: 0 0 auto;
}

.weight-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.weight-item.active {
  background: rgba(0, 242, 255, 0.1);
  border-color: rgba(0, 242, 255, 0.3);
}

.w-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.w-name { color: #88b0ea; }
.w-val { color: #00f2ff; font-weight: bold; font-family: monospace; }

.weight-item.active .w-name { color: #fff; }

.w-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.w-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066ff, #00f2ff);
  box-shadow: 0 0 5px #00f2ff;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
