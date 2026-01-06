<template>
  <div v-if="visible" class="accuracy-modal-mask" @click.self="$emit('close')">
    <div class="accuracy-modal-container slide-in">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">准确度详情说明</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body scrollbar-tech">
        <!-- 人工介入率分布图 -->
        <div class="chart-section">
          <div class="section-label">人工介入率分布图</div>
          <div ref="chartRef" class="distribution-chart"></div>
        </div>

        <!-- 准确率计算方式描述 -->
        <div class="info-section">
          <div class="section-label">计算方式</div>
          <p class="description-text">
            系统的准确度是通过对各个案件的<span class="highlight">人工介入率</span>进行综合统计计算而得。它反映了模型在自动处理案件时的可靠程度与自动化水平。
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="confirm-btn" @click="$emit('close')">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  visible: Boolean
});

defineEmits(['close']);

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  if (!chartRef.value) return;
  
  // 检查容器是否有宽度，如果没有则稍后再试
  if (chartRef.value.offsetWidth === 0) {
    setTimeout(initChart, 100);
    return;
  }
  
  // 如果已经初始化过，先销毁，防止容器变化导致的渲染问题
  if (myChart) {
    myChart.dispose();
  }
  
  myChart = echarts.init(chartRef.value);

  // 生成模拟数据：峰值在 90% 左右
  const xData = [];
  const yData = [];
  for (let i = 0; i <= 100; i += 5) {
    xData.push(i + '%');
    // 使用高斯分布公式模拟峰值在 90 附近的曲线
    // y = A * e^(- (x-mu)^2 / (2*sigma^2))
    const mu = 5;
    const sigma = 15;
    const amplitude = 1000;
    const val = amplitude * Math.exp(-Math.pow(i - mu, 2) / (2 * Math.pow(sigma, 2)));
    yData.push(Math.round(val + Math.random() * 50)); // 加一点随机波动
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 27, 62, 0.9)',
      borderColor: '#00f2ff',
      textStyle: { color: '#fff' },
      formatter: '{b} 介入率: {c} 个案件'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: 'rgba(0, 242, 255, 0.3)' } },
      axisLabel: { color: '#88b0ea', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '案件数量',
      nameTextStyle: { color: '#88b0ea', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 242, 255, 0.1)', type: 'dashed' } },
      axisLabel: { color: '#88b0ea' }
    },
    series: [
      {
        data: yData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#00f2ff' },
        lineStyle: { width: 3, color: '#00f2ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 242, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 242, 255, 0)' }
          ])
        },
        emphasis: {
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: '#00f2ff'
          }
        }
      }
    ]
  };

  myChart.setOption(option);
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 使用稍长的延迟确保 Modal 动画开始且 DOM 尺寸稳定
    setTimeout(() => {
      initChart();
    }, 100);
  }
}, { immediate: true });

const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>

<style scoped>
.accuracy-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.accuracy-modal-container {
  width: 650px;
  background: linear-gradient(145deg, #1a3a7a 0%, #0d1b3e 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 242, 255, 0.3);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);
  position: relative;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title { display: flex; align-items: center; gap: 12px; }
.icon-pulse {
  width: 10px; height: 10px; background: #00f2ff; border-radius: 50%;
  box-shadow: 0 0 10px #00f2ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.title-text { color: #fff; font-size: 18px; font-weight: bold; letter-spacing: 1px; }

.modal-body {
  flex: 1;
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
}

.info-section {
  margin: 30px 0;
}

.section-label {
  color: #00f2ff;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 15px;
  border-left: 3px solid #00f2ff;
  padding-left: 12px;
}

.description-text {
  color: #c8ddfb;
  font-size: 14px;
  line-height: 1.8;
  background: rgba(0, 242, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 255, 0.1);
}

.highlight {
  color: #00f2ff;
  font-weight: bold;
}

.distribution-chart {
  width: 100%;
  height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 242, 255, 0.1);
}

.confirm-btn {
  padding: 10px 30px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }

.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 2px; }
.scrollbar-tech::-webkit-scrollbar-track { background: transparent; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.3s ease-out; }
</style>

