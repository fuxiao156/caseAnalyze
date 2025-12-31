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

      <div class="modal-body">
        <div class="content-section scrollbar-tech single-column">
          <div class="section-top-header">
            <div class="section-title">AI 深度分析引擎报告</div>
            <div class="overall-stats">
              <span>样本总计: <b>{{ metrics.total_evals }}</b></span>
              <span class="divider-pipe">|</span>
              <span>正确匹配: <b>{{ metrics.correct_count }}</b></span>
            </div>
          </div>
          
          <div v-if="!analysisData.是否满足深度分析条件" class="warning-box">
            <p class="reason">{{ analysisData.不可分析原因 }}</p>
          </div>

          <div v-else class="analysis-content-wrapper">
            <!-- 顶层画像与成因 -->
            <div class="top-row">
              <div class="info-card-mini fade-in">
                <div class="card-header-with-eval">
                  <div class="label">案件标签画像</div>
                  <button class="eval-trigger-btn" @click="openEval('案件标签画像', 'tags')">
                    <span class="eval-icon">📊</span> 评测
                  </button>
                </div>
                <div class="tag-group">
                  <span v-for="(tag, index) in analysisData.事件画像" :key="tag" class="tech-tag profile" :style="{ animationDelay: index * 0.1 + 's' }">{{ tag }}</span>
                </div>
              </div>

              <div class="info-card-mini fade-in">
                <div class="card-header-with-eval">
                  <div class="label">核心矛盾诱因</div>
                  <button class="eval-trigger-btn" @click="openEval('核心矛盾诱因', 'causes')">
                    <span class="eval-icon">📊</span> 评测
                  </button>
                </div>
                <div class="tag-group">
                  <span v-for="(cause, index) in analysisData.核心成因分析" :key="cause" class="tech-tag cause" :style="{ animationDelay: (index + 3) * 0.1 + 's' }">{{ cause }}</span>
                </div>
              </div>
            </div>

            <!-- 1. 时间轴维度 (Timeline) -->
            <div class="detail-block slide-up">
              <div class="sub-module-header">
                <span>案件演进时间轴 (Timeline)</span>
                <button class="eval-trigger-btn-small" @click="openEval('时间轴维度', 'timeline')">
                  <span class="eval-icon">📊</span> 维度评测
                </button>
              </div>
              <div class="timeline-container">
                <div v-for="(item, index) in analysisData.多维度分析?.[0]?.时间轴数据" :key="index" class="timeline-item">
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

            <!-- 2. 利益相关方分析 (Stakeholders) -->
            <div class="detail-block slide-up" style="animation-delay: 0.2s">
              <div class="sub-module-header">
                <span>利益相关方博弈分析 (Stakeholders)</span>
                <button class="eval-trigger-btn-small" @click="openEval('利益相关方分析', 'stakeholders')">
                  <span class="eval-icon">📊</span> 维度评测
                </button>
              </div>
              <div class="stakeholders-grid">
                <div v-for="party in analysisData.多维度分析?.[1]?.利益相关方" :key="party.party" class="stakeholder-card">
                  <div class="party-header">
                    <span class="party-name">{{ party.party }}</span>
                    <span class="party-role">{{ party.role }}</span>
                  </div>
                  <div class="party-detail">
                    <div class="detail-item">
                      <span class="detail-label">核心诉求:</span>
                      <span class="detail-val">{{ party.concern }}</span>
                    </div>
                    <div class="detail-item" v-if="party.emotion">
                      <span class="detail-label">情绪状态:</span>
                      <span class="detail-val emotion">{{ party.emotion }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 多要素雷达分析 (Factors Radar) -->
            <div class="detail-block slide-up" style="animation-delay: 0.3s">
              <div class="sub-module-header">
                <span>关键矛盾要素评估 (Factors Radar)</span>
                <button class="eval-trigger-btn-small" @click="openEval('要素评估分析', 'factors')">
                  <span class="eval-icon">📊</span> 维度评测
                </button>
              </div>
              <div class="radar-section">
                <div ref="radarChartRef" class="radar-chart"></div>
                <div class="factors-list">
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

            <!-- 4. 调解流程路径 (Mediation Flow) -->
            <div class="detail-block slide-up" style="animation-delay: 0.4s">
              <div class="sub-module-header">
                <span>调解策略路径推演 (Process Flow)</span>
                <button class="eval-trigger-btn-small" @click="openEval('调解策略路径', 'flow')">
                  <span class="eval-icon">📊</span> 维度评测
                </button>
              </div>
              <div class="flow-container">
                <div v-for="(step, index) in analysisData.调解流程" :key="index" class="flow-step">
                  <div class="step-num">{{ index + 1 }}</div>
                  <div class="step-info">
                    <div class="step-name">{{ step.step }}</div>
                    <div class="step-desc">{{ step.desc }}</div>
                  </div>
                  <div class="flow-arrow" v-if="index !== analysisData.调解流程.length - 1">➜</div>
                </div>
              </div>
            </div>

            <!-- 5. 结果预判展示 -->
            <div class="detail-block result-card slide-up" style="animation-delay: 0.5s">
                <div class="sub-module-header">
                  <span>调解方案执行结果 (Resolution)</span>
                  <button class="eval-trigger-btn-small" @click="openEval('执行结果预判', 'resolution')">
                    <span class="eval-icon">📊</span> 方案评测
                  </button>
                </div>
                <div class="result-summary" v-if="analysisData.调解结果展示">
                    <div class="res-amount">
                        <span class="res-label">总执行标的:</span>
                        <span class="res-val">¥{{ analysisData.调解结果展示.总补偿金额?.toLocaleString() }}</span>
                    </div>
                    <div class="res-details">
                        <div v-for="item in analysisData.调解结果展示.细分项" :key="item.label" class="res-item">
                            <span>{{ item.label }}:</span>
                            <b>¥{{ item.value?.toLocaleString() }}</b>
                        </div>
                    </div>
                    <div class="res-point">
                        <span class="point-label">变通突破点:</span>
                        <span class="point-val">{{ analysisData.调解结果展示.变通点 }}</span>
                    </div>
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
/* 全局变量：模糊感配色 */
.tech-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 窗体：加大尺寸 + 大圆角 + 柔化边框 */
.tech-modal-container {
  width: 92vw;
  height: 85vh;
  background: linear-gradient(145deg, #0a1633 0%, #050a19 100%);
  border-radius: 16px;
  border: 1px solid rgba(0, 242, 255, 0.15);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 242, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  height: 65px;
  padding: 0 30px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
}

.icon-pulse {
  width: 8px;
  height: 8px;
  background: #00f2ff;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 10px #00f2ff;
  display: inline-block;
}

.modal-body {
  flex: 1;
  display: flex; /* 改为 flex 布局以适应单栏 */
  padding: 25px;
  gap: 25px;
  overflow: hidden;
}

/* 左侧：内容卡片化与圆角 */
.content-section.single-column {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 30px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
  padding-bottom: 15px;
}

.overall-stats {
  font-size: 13px;
  color: #88b0ea;
  display: flex;
  align-items: center;
  gap: 10px;
}
.divider-pipe { color: rgba(0, 242, 255, 0.2); }

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mini-metrics {
  display: flex;
  gap: 15px;
  background: rgba(0, 242, 255, 0.05);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(0, 242, 255, 0.1);
}
.m-item { font-size: 12px; display: flex; gap: 4px; }
.m-l { color: #88b0ea; }
.m-v { color: #00f2ff; font-weight: bold; }

/* 评测按钮样式 */
.card-header-with-eval {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.eval-trigger-btn {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.2);
  color: #00f2ff;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.eval-trigger-btn:hover { background: rgba(0, 242, 255, 0.2); border-color: #00f2ff; }

.sub-module-header {
  color: #00f2ff; font-size: 15px; font-weight: 600; margin: 30px 0 15px 0;
  display: flex; align-items: center; justify-content: space-between;
}
.sub-module-header span { display: flex; align-items: center; }
/* .sub-module-header::after 已经由 flex justify-between 替代 */

.eval-trigger-btn-small {
  background: transparent;
  border: 1px solid rgba(136, 176, 234, 0.3);
  color: #88b0ea;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.eval-trigger-btn-small:hover { border-color: #00f2ff; color: #00f2ff; }

.reason{
  background-color: #ff4d5040;
  border-left: 3px solid #ff4d4f;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px;
}

.section-title {
  color: #00f2ff;
  font-size: 18px;
  padding-left: 12px;
  border-left: 4px solid #00f2ff;
  margin-bottom: 0; /* 在 top-header 中对齐 */
}

.info-card {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.info-card-mini {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}
.info-card-mini:hover { border-color: rgba(0, 242, 255, 0.2); background: rgba(255, 255, 255, 0.05); }

.top-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

/* 移除旧的右侧样式 */
/* ... existing styles below ... */

/* Timeline Styles */
.timeline-container {
  padding: 10px 0 10px 20px;
}
.timeline-item {
  display: flex;
  gap: 15px;
  min-height: 50px;
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

/* Stakeholders Styles */
.stakeholders-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.stakeholder-card {
  background: rgba(255, 255, 255, 0.04);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 255, 0.1);
  transition: all 0.3s;
}
.stakeholder-card:hover {
  background: rgba(0, 242, 255, 0.05);
  border-color: rgba(0, 242, 255, 0.3);
  transform: translateY(-2px);
}
.party-header { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; }
.party-name { color: #fff; font-weight: bold; font-size: 14px; }
.party-role { color: #00f2ff; font-size: 11px; background: rgba(0,242,255,0.1); padding: 1px 6px; border-radius: 4px; }
.detail-item { font-size: 12px; display: flex; gap: 6px; margin-top: 4px; }
.detail-label { color: #88b0ea; white-space: nowrap; }
.detail-val { color: #cfd9e5; }
.detail-val.emotion { color: #ffcf40; }

/* Radar Section */
.radar-section {
  display: flex;
  height: 220px;
  align-items: center;
}
.radar-chart {
  flex: 1;
  height: 100%;
}
.factors-list {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.factor-mini-item { display: flex; flex-direction: column; gap: 4px; }
.factor-name-row { display: flex; justify-content: space-between; font-size: 12px; }
.f-name { color: #88b0ea; }
.f-weight { color: #00f2ff; font-weight: bold; }
.f-bar-bg { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.f-bar-fill { height: 100%; background: linear-gradient(90deg, #0066ff, #00f2ff); box-shadow: 0 0 5px #00f2ff; }

/* Flow Styles */
.flow-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}
.flow-step {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255,255,255,0.03);
  padding: 10px 15px;
  border-radius: 6px;
  position: relative;
}
.step-num {
  width: 24px;
  height: 24px;
  background: #00f2ff;
  color: #050a19;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}
.step-info { flex: 1; }
.step-name { color: #fff; font-size: 13px; font-weight: bold; }
.step-desc { color: #88b0ea; font-size: 11px; margin-top: 2px; }
.flow-arrow { color: rgba(0, 242, 255, 0.3); font-size: 12px; transform: rotate(90deg); position: absolute; bottom: -12px; left: 20px; z-index: 1; }

/* Result Card */
.result-card {
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.05) 0%, rgba(0, 102, 255, 0.05) 100%);
  border: 1px solid rgba(0, 242, 255, 0.2);
}
.result-summary {
  padding: 15px;
}
.res-amount { margin-bottom: 15px; display: flex; align-items: baseline; gap: 10px; }
.res-label { color: #88b0ea; font-size: 14px; }
.res-val { color: #00f2ff; font-size: 24px; font-weight: bold; text-shadow: 0 0 15px rgba(0, 242, 255, 0.5); }
.res-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; }
.res-item { font-size: 12px; color: #cfd9e5; display: flex; flex-direction: column; }
.res-item b { color: #fff; font-size: 14px; margin-top: 2px; }
.res-point { display: flex; gap: 10px; align-items: center; border-top: 1px dashed rgba(0, 242, 255, 0.2); padding-top: 10px; }
.point-label { color: #ffcf40; font-size: 13px; font-weight: bold; }
.point-val { color: #fff; font-size: 13px; }

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
.slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.label { color: #88b0ea; font-size: 13px; margin-bottom: 10px; }

.tech-tag {
  padding: 4px 14px;
  border-radius: 15px;
  font-size: 12px;
  margin-right: 10px;
  display: inline-block;
}
.tech-tag.profile { background: rgba(0, 242, 255, 0.1); color: #00f2ff; border: 1px solid rgba(0, 242, 255, 0.3); }
.tech-tag.cause { background: rgba(255, 207, 64, 0.1); color: #ffcf40; border: 1px solid rgba(255, 207, 64, 0.3); }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }
.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
</style>