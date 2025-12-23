<template>
  <div v-if="visible" class="tech-modal-mask">
    <div class="tech-modal-container">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          大模型生成信息分析与评估系统
        </div>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="content-section scrollbar-tech">
          <div class="section-title">生成结果展示</div>
          
          <div v-if="!analysisData.是否满足深度分析条件" class="warning-box">
            <div class="status-tag">分析终止</div>
            <p class="reason">{{ analysisData.不可分析原因 }}</p>
          </div>

          <div v-else class="data-grid">
            <div class="info-card">
              <div class="label">事件画像</div>
              <div class="tag-group">
                <span v-for="tag in analysisData.事件画像" :key="tag" class="tech-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="label">核心成因</div>
              <div class="tag-group">
                <span v-for="cause in analysisData.事件成因分析" :key="cause" class="cause-tag">{{ cause }}</span>
              </div>
            </div>

            <div class="detail-block">
              <div class="sub-title">多维度分析 (Dimensions)</div>
              <div v-for="dim in analysisData.多维度分析" :key="dim.维度名" class="dim-item">
                <span class="dim-name">{{ dim.维度名 }}</span>
                <span class="dim-content">{{ dim.分析内容 }}</span>
              </div>
            </div>

            <div class="detail-block">
              <div class="sub-title">多要素分析 (Factors)</div>
              <div v-for="factor in analysisData.多要素分析" :key="factor.要素名" class="factor-item">
                <div class="factor-header">
                  <span class="factor-name">{{ factor.要素名 }}</span>
                  <span class="factor-weight">权重: {{ factor.关键性权重 }}</span>
                </div>
                <div class="weight-bar">
                  <div class="weight-fill" :style="{ width: (factor.关键性权重 * 100) + '%' }"></div>
                </div>
                <p class="factor-desc">{{ factor.分析内容 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="evaluation-section">
          <div class="section-title">评估指标与标注</div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="num">{{ metrics.precision }}</div>
              <div class="name">Precision</div>
            </div>
            <div class="metric-card">
              <div class="num">{{ metrics.recall }}</div>
              <div class="name">Recall</div>
            </div>
            <div class="metric-card">
              <div class="num">{{ metrics.f1_score }}</div>
              <div class="name">F1-Score</div>
            </div>
            <div class="metric-card highlight">
              <div class="num">{{ metrics.accuracy }}</div>
              <div class="name">Accuracy</div>
            </div>
          </div>

          <div class="count-info">
            <span>总评价数: <b>{{ metrics.total_evals }}</b></span>
            <span>正确数: <b>{{ metrics.correct_count }}</b></span>
          </div>

          <div class="divider"></div>

          <div class="annotation-area">
            <div class="sub-title">人工数据标注</div>
            <div class="form-group">
              <label>结论是否合理？</label>
              <div class="radio-group">
                <button 
                  :class="['opt-btn', annotation.is_correct === true ? 'active' : '']"
                  @click="annotation.is_correct = true"
                >准确</button>
                <button 
                  :class="['opt-btn', annotation.is_correct === false ? 'active' : '']"
                  @click="annotation.is_correct = false"
                >有误</button>
              </div>
            </div>
            <div class="form-group">
              <label>详细评价 / 修正意见</label>
              <textarea v-model="annotation.feedback" placeholder="请输入您的评价内容..." class="tech-input"></textarea>
            </div>
            <button class="submit-btn" @click="handleSubmmit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交标注' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';

const props = defineProps({
  visible: Boolean,
  caseId: String
});

const emit = defineEmits(['close', 'success']);

// --- 数据状态 ---
const analysisData = ref({});
const metrics = ref({});
const submitting = ref(false);
const annotation = reactive({
  is_correct: null,
  feedback: ''
});

// --- Mock 接口 1: 获取数据 ---
const fetchData = async () => {
  // 模拟 API 请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 这里返回您提供的 4.1 结构作为示例
  analysisData.value = {
    "是否满足深度分析条件": true,
    "不可分析原因": null,
    "事件成因分析": ["合同条款缺失", "利益分配争议", "法律认知偏差"],
    "事件画像": ["合同纠纷", "赔偿纠纷"],
    "多维度分析": [
      { "维度名": "时间维度", "分析内容": "土地互换发生在2012年，土地征用发生在2017年..." },
      { "维度名": "权责维度", "分析内容": "合同未明确约定补偿款归属，导致双方分歧。" }
    ],
    "多要素分析": [
      { "要素名": "经济要素", "分析内容": "土地补偿金共计40万元，是核心利益。", "关键性权重": 0.6 },
      { "要素名": "社会要素", "分析内容": "农村土地承包法规是调解依据。", "关键性权重": 0.3 }
    ]
  };

  metrics.value = {
    total_evals: 1250,
    correct_count: 1080,
    precision: "88.2%",
    accuracy: "86.4%",
    recall: "84.5%",
    f1_score: "86.3"
  };
};

// --- Mock 接口 2: 提交标注 ---
const handleSubmmit = async () => {
  if (annotation.is_correct === null) {
    alert("请先选择是否合理");
    return;
  }
  
  submitting.value = true;
  console.log("提交的标注数据:", { caseId: props.caseId, ...annotation });
  
  // 模拟请求
  await new Promise(resolve => setTimeout(resolve, 800));
  
  submitting.value = false;
  alert("标注提交成功！");
  emit('success');
  emit('close');
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 科技感深蓝配色变量 */
:host {
  --bg-dark: #060c20;
  --panel-blue: rgba(16, 35, 78, 0.8);
  --border-cyan: #00f2ff;
  --text-main: #e0f7ff;
  --accent-gold: #ffcf40;
}

.tech-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: 'Microsoft YaHei', sans-serif;
}

.tech-modal-container {
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  background: #060c20;
  border: 1px solid #1a5cad;
  box-shadow: 0 0 20px rgba(0, 150, 255, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 装饰线条 */
.tech-modal-container::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #00f2ff, transparent);
}

.modal-header {
  height: 60px;
  padding: 0 20px;
  background: rgba(26, 92, 173, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1a5cad;
}

.header-title {
  color: #00f2ff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
}

.icon-pulse {
  width: 10px;
  height: 10px;
  background: #00f2ff;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 10px #00f2ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.modal-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

.section-title {
  color: #00f2ff;
  font-size: 16px;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #00f2ff;
}

.sub-title {
  color: #88b0ea;
  font-size: 14px;
  margin: 15px 0 10px 0;
}

/* 左侧滚动区 */
.content-section {
  background: rgba(16, 35, 78, 0.4);
  padding: 20px;
  border-radius: 4px;
  overflow-y: auto;
}

.warning-box {
  border: 1px dashed #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  padding: 20px;
  text-align: center;
}

.status-tag { color: #ff4d4f; font-weight: bold; margin-bottom: 10px; }
.reason { color: #ccc; }

.tech-tag {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid #00f2ff;
  color: #00f2ff;
  padding: 4px 12px;
  margin-right: 8px;
  font-size: 12px;
}

.cause-tag {
  background: rgba(255, 207, 64, 0.1);
  border: 1px solid #ffcf40;
  color: #ffcf40;
  padding: 4px 12px;
  margin-right: 8px;
  font-size: 12px;
}

.dim-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  margin-bottom: 8px;
}

.dim-name { color: #00f2ff; font-weight: bold; margin-right: 15px; }
.dim-content { color: #b0c4de; font-size: 13px; }

.factor-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.factor-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.weight-bar { height: 4px; background: #1a3a63; margin: 8px 0; }
.weight-fill { height: 100%; background: linear-gradient(90deg, #00f2ff, #0066ff); }

/* 右侧评估区 */
.evaluation-section {
  background: rgba(16, 35, 78, 0.6);
  padding: 20px;
  border-left: 1px solid #1a5cad;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.metric-card {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  text-align: center;
  border: 1px solid #1a3a63;
}

.metric-card.highlight { border-color: #00f2ff; box-shadow: inset 0 0 10px rgba(0, 242, 255, 0.2); }
.metric-card .num { font-size: 24px; color: #00f2ff; font-family: 'Arial'; }
.metric-card .name { font-size: 12px; color: #88b0ea; }

.count-info {
  display: flex;
  justify-content: space-between;
  color: #ccc;
  font-size: 13px;
  margin-bottom: 20px;
}

.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }

/* 标注表单 */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; color: #88b0ea; margin-bottom: 10px; font-size: 14px; }

.radio-group { display: flex; gap: 10px; }
.opt-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: 1px solid #1a5cad;
  color: #88b0ea;
  cursor: pointer;
}

.opt-btn.active {
  background: #1a5cad;
  color: white;
  border-color: #00f2ff;
}

.tech-input {
  width: 100%;
  height: 100px;
  background: rgba(0,0,0,0.3);
  border: 1px solid #1a5cad;
  color: white;
  padding: 10px;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(180deg, #0096ff, #0055ff);
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover { filter: brightness(1.2); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: #1a5cad; }
.close-btn { background: none; border: none; color: #88b0ea; font-size: 24px; cursor: pointer; }
</style>