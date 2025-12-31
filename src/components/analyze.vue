<template>
  <div v-if="visible" class="tech-modal-mask" @click.self="$emit('close')">
    <div class="tech-modal-container">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">AI 语义分析与标注效能评估</span>
        </div>
        <div class="header-actions">
          <div class="mini-metrics">
            <div class="m-item"><span class="m-l">Acc:</span><span class="m-v">{{ metrics.accuracy }}</span></div>
            <div class="m-item"><span class="m-l">F1:</span><span class="m-v">{{ metrics.f1_score }}</span></div>
          </div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </div>

      <div class="modal-body dashboard-layout">
        <!-- 左侧栏：画像与时间演进 -->
        <div class="dashboard-col left-col">
          <div class="dashboard-card info-card-group fade-in">
            <div class="card-header-with-eval">
              <div class="label">案件画像与矛盾诱因</div>
              <button class="eval-trigger-btn" @click="openEval('画像与成因', 'top-info')">评测</button>
            </div>
            <div class="dual-tags">
              <div class="tag-section">
                <div class="mini-label">标签画像</div>
                <div class="tag-group">
                  <span v-for="(tag, index) in analysisData.事件画像" :key="tag" class="tech-tag profile" :style="{ animationDelay: index * 0.1 + 's' }">{{ tag }}</span>
                </div>
              </div>
              <div class="tag-section">
                <div class="mini-label">核心诱因</div>
                <div class="tag-group">
                  <span v-for="(cause, index) in analysisData.核心成因分析" :key="cause" class="tech-tag cause" :style="{ animationDelay: (index + 3) * 0.1 + 's' }">{{ cause }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card timeline-card slide-up">
            <div class="sub-module-header">
              <span>案件演进时间轴 (Timeline)</span>
              <button class="eval-trigger-btn-small" @click="openEval('时间轴维度', 'timeline')">评测</button>
            </div>
            <div class="timeline-container-compact">
              <div v-for="(item, index) in analysisData.多维度分析?.[0]?.时间轴数据" :key="index" class="timeline-item-compact">
                <div class="time-node">
                  <div class="node-dot" :class="item.type"></div>
                  <div class="node-line" v-if="index !== analysisData.多维度分析[0].时间轴数据.length - 1"></div>
                </div>
                <div class="time-content">
                  <span class="time-date">{{ item.date }}</span>
                  <span class="time-event">{{ item.event }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间栏：核心要素与博弈分析 -->
        <div class="dashboard-col center-col">
          <div class="dashboard-card radar-card fade-in">
            <div class="sub-module-header">
              <span>关键矛盾要素评估 (Factors Radar)</span>
              <button class="eval-trigger-btn-small" @click="openEval('要素评估分析', 'factors')">评测</button>
            </div>
            <div class="radar-display">
              <div ref="radarChartRef" class="radar-chart-large"></div>
              <div class="factors-mini-grid">
                <div v-for="factor in analysisData.多要素分析" :key="factor.要素名" class="factor-mini-item">
                  <div class="factor-name-row">
                    <span class="f-name">{{ factor.要素名 }}</span>
                    <span class="f-weight">{{ (factor.关键性权重 * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="f-bar-bg"><div class="f-bar-fill" :style="{ width: factor.关键性权重 * 100 + '%' }"></div></div>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card stakeholders-card slide-up" style="animation-delay: 0.2s">
            <div class="sub-module-header">
              <span>利益相关方博弈分析 (Stakeholders)</span>
              <button class="eval-trigger-btn-small" @click="openEval('利益相关方分析', 'stakeholders')">评测</button>
            </div>
            <div class="stakeholders-grid-dashboard">
              <div v-for="party in analysisData.多维度分析?.[1]?.利益相关方" :key="party.party" class="stakeholder-card-dashboard">
                <div class="party-header">
                  <span class="party-name">{{ party.party }}</span>
                  <span class="party-role">{{ party.role }}</span>
                </div>
                <div class="party-detail">
                  <div class="detail-item"><span class="detail-label">诉求:</span><span class="detail-val">{{ party.concern }}</span></div>
                  <div class="detail-item" v-if="party.emotion"><span class="detail-label">情绪:</span><span class="detail-val emotion">{{ party.emotion }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧栏：策略路径与执行结果 -->
        <div class="dashboard-col right-col">
          <div class="dashboard-card flow-card slide-up" style="animation-delay: 0.4s">
            <div class="sub-module-header">
              <span>调解策略路径推演 (Process Flow)</span>
              <button class="eval-trigger-btn-small" @click="openEval('调解策略路径', 'flow')">评测</button>
            </div>
            <div class="flow-container-dashboard">
              <div v-for="(step, index) in analysisData.调解流程" :key="index" class="flow-step-dashboard">
                <div class="step-num">{{ index + 1 }}</div>
                <div class="step-info">
                  <div class="step-name">{{ step.step }}</div>
                  <div class="step-desc">{{ step.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card resolution-card slide-up" style="animation-delay: 0.6s">
            <div class="sub-module-header">
              <span>调解方案执行结果 (Resolution)</span>
              <button class="eval-trigger-btn-small" @click="openEval('执行结果预判', 'resolution')">评测</button>
            </div>
            <div class="result-summary-dashboard" v-if="analysisData.调解结果展示">
              <div class="res-amount-large">
                <span class="res-label">总执行标的</span>
                <span class="res-val">¥{{ analysisData.调解结果展示.总补偿金额?.toLocaleString() }}</span>
              </div>
              <div class="res-details-grid">
                <div v-for="item in analysisData.调解结果展示.细分项" :key="item.label" class="res-item">
                  <span>{{ item.label }}</span>
                  <b>¥{{ item.value?.toLocaleString() }}</b>
                </div>
              </div>
              <div class="res-point-dashboard">
                <div class="point-label">关键变通突破点</div>
                <div class="point-val">{{ analysisData.调解结果展示.变通点 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 引用拆分出的标注 Modal -->
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import AnnotationModal from './AnnotationModal.vue';

const props = defineProps({ visible: Boolean, caseId: String, analysisData: Object });
const emit = defineEmits(['close', 'success']);

const analysisData = ref({});
const metrics = ref({});

// 评测 Modal 状态
const evalModalVisible = ref(false);
const activeSection = reactive({ name: '', id: '' });

const openEval = (name, id) => {
  activeSection.name = name;
  activeSection.id = id;
  evalModalVisible.value = true;
};

const handleEvalSubmit = (data) => {
  console.log('收到评测数据:', data);
  // 这里可以触发 API 保存评测结果
};

const radarChartRef = ref(null);
let myChart = null;

const initRadarChart = () => {
  if (!radarChartRef.value || !analysisData.value.多要素分析) return;
  
  if (myChart) {
    myChart.dispose();
  }
  
  myChart = echarts.init(radarChartRef.value);
  const data = analysisData.value.多要素分析;
  
  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: data.map(item => ({ name: item.要素名, max: 1 })),
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(0, 242, 255, 0.05)', 'rgba(0, 242, 255, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 242, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 242, 255, 0.3)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: data.map(item => item.关键性权重),
        name: '要素权重',
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#00f2ff'
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(0, 242, 255, 0.1)' },
            { offset: 1, color: 'rgba(0, 242, 255, 0.6)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: '#00f2ff'
        }
      }]
    }]
  };
  
  myChart.setOption(option);
};

const fetchData = async () => {
  await new Promise(r => setTimeout(r, 100));
  analysisData.value = props.analysisData;
  metrics.value = { total_evals: 1250, correct_count: 1080, precision: "88.2%", accuracy: "86.4%", recall: "84.5%", f1_score: "0.86" };
  
  nextTick(() => {
    initRadarChart();
  });
};

onMounted(fetchData);

watch(() => props.analysisData, () => {
  fetchData();
}, { deep: true });

window.addEventListener('resize', () => {
  myChart && myChart.resize();
});
</script>

<style scoped>
/* 窗体：全屏监测大屏样式 */
.tech-modal-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1b3e 0%, #050a19 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: none;
  border-radius: 0;
}

.modal-header {
  height: 80px;
  padding: 0 40px;
  background: linear-gradient(180deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid rgba(0, 242, 255, 0.2);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.title-text {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(0, 242, 255, 0.8);
  text-transform: uppercase;
}

.modal-body.dashboard-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 28% 44% 28%;
  gap: 20px;
  padding: 20px;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSVldmVub2RkIj48cGF0aCBkPSJNMCA0MGg0MFYwSDB2NDB6bTM5LTFIMVYxaDM4djM4eiIgZmlsbD0icmdiYSgwLCAyNDIsIDI1NSwgMC4wNSkiLz48L2c+PC9zdmc+');
  overflow: hidden;
}

.dashboard-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.dashboard-card {
  background: rgba(16, 35, 78, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.15);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.dashboard-card::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px; width: 15px; height: 15px;
  border-top: 2px solid #00f2ff; border-left: 2px solid #00f2ff;
}

.dashboard-card::after {
  content: "";
  position: absolute;
  bottom: -1px; right: -1px; width: 15px; height: 15px;
  border-bottom: 2px solid #00f2ff; border-right: 2px solid #00f2ff;
}

/* 左侧栏样式 */
.left-col .info-card-group { flex: 0 0 auto; }
.left-col .timeline-card { flex: 1; min-height: 0; }

.dual-tags { display: flex; flex-direction: column; gap: 15px; margin-top: 10px; }
.mini-label { color: #88b0ea; font-size: 12px; margin-bottom: 8px; opacity: 0.8; }

.timeline-container-compact {
  flex: 1;
  overflow: hidden;
  padding-top: 10px;
}
.timeline-item-compact {
  display: flex; gap: 12px; height: 18%;
}

.time-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.node-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #88b0ea;
  box-shadow: 0 0 8px rgba(136, 176, 234, 0.5);
  z-index: 2;
}
.node-dot.origin { background: #ffcf40; box-shadow: 0 0 8px #ffcf40; }
.node-dot.milestone { background: #00f2ff; box-shadow: 0 0 8px #00f2ff; }
.node-dot.success { background: #4dff88; box-shadow: 0 0 8px #4dff88; }

.node-line {
  width: 1px;
  flex: 1;
  background: rgba(136, 176, 234, 0.2);
}
.time-content {
  padding-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.time-date { color: #00f2ff; font-family: monospace; font-weight: bold; font-size: 14px; }
.time-event { color: #cfd9e5; font-size: 13px; margin-top: 2px; }

/* 中间栏样式 */
.center-col .radar-card { flex: 1.4; }
.center-col .stakeholders-card { flex: 1; }

.radar-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.radar-chart-large {
  width: 100%;
  height: 75%;
}
.factors-mini-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.stakeholders-grid-dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  flex: 1;
}
.stakeholder-card-dashboard {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 242, 255, 0.1);
}

/* 右侧栏样式 */
.right-col .flow-card { flex: 1.2; }
.right-col .resolution-card { flex: 1; }

.flow-container-dashboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.flow-step-dashboard {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: 8px 12px;
  border-radius: 4px;
}

.res-amount-large {
  text-align: center;
  padding: 15px;
  background: rgba(0, 242, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 15px;
}
.res-val {
  display: block;
  font-size: 32px;
  color: #00f2ff;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(0, 242, 255, 0.6);
}

.res-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}
.res-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.res-point-dashboard {
  border-top: 1px dashed rgba(0, 242, 255, 0.3);
  padding-top: 12px;
}
.point-label { color: #ffcf40; font-weight: bold; margin-bottom: 5px; font-size: 14px; }

/* 通用覆盖与动画 */
.scrollbar-tech::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; }

.sub-module-header {
  color: #00f2ff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #00f2ff;
  padding-left: 10px;
}

.tech-tag {
  padding: 4px 14px;
  border-radius: 15px;
  font-size: 12px;
  margin-right: 10px;
  display: inline-block;
}
.tech-tag.profile { background: rgba(0, 242, 255, 0.1); color: #00f2ff; border: 1px solid rgba(0, 242, 255, 0.3); }
.tech-tag.cause { background: rgba(255, 207, 64, 0.1); color: #ffcf40; border: 1px solid rgba(255, 207, 64, 0.3); }

/* 评测按钮大屏优化 */
.eval-trigger-btn, .eval-trigger-btn-small {
  background: rgba(0, 242, 255, 0.15);
  border: 1px solid #00f2ff;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
}
.eval-trigger-btn:hover { background: #00f2ff; color: #000; }

.mini-metrics {
  display: flex;
  gap: 20px;
  background: rgba(0, 242, 255, 0.1);
  padding: 8px 20px;
  border-radius: 30px;
  border: 1px solid rgba(0, 242, 255, 0.3);
}
.m-v { font-size: 18px; text-shadow: 0 0 10px #00f2ff; }

.close-btn { background: none; border: none; color: #88b0ea; font-size: 24px; cursor: pointer; }

/* 动画保持 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 1s ease-out forwards; }
.slide-up { animation: slideUp 1s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
</style>