<template>
  <div v-if="visible" class="tech-modal-mask" @click.self="$emit('close')">
    <div class="tech-modal-container">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">AI 语义分析与标注效能评估</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="content-section scrollbar-tech">
          <div class="section-title">生成结果展示</div>
          
          <div v-if="!analysisData.是否满足深度分析条件" class="warning-box">
            <div class="status-tag">分析中断提示</div>
            <p class="reason">{{ analysisData.不可分析原因 }}</p>
          </div>

          <div v-else class="data-grid">
            <div class="info-card">
              <div class="label">事件画像</div>
              <div class="tag-group">
                <span v-for="tag in analysisData.事件画像" :key="tag" class="tech-tag profile">{{ tag }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="label">核心成因分析</div>
              <div class="tag-group">
                <span v-for="cause in analysisData.事件成因分析" :key="cause" class="tech-tag cause">{{ cause }}</span>
              </div>
            </div>

            <div class="detail-block">
              <div class="sub-module-header">多维度分析 (Dimensions)</div>
              <div v-for="dim in analysisData.多维度分析" :key="dim.维度名" class="dim-item">
                <span class="dim-name">{{ dim.维度名 }}</span>
                <span class="dim-content">{{ dim.分析内容 }}</span>
              </div>
            </div>

            <div class="detail-block">
              <div class="sub-module-header">多要素分析 (Factors)</div>
              <div v-for="factor in analysisData.多要素分析" :key="factor.要素名" class="factor-item">
                <div class="factor-header">
                  <span class="factor-name-tag">{{ factor.要素名 }}</span>
                </div>
                <div class="factor-weight-row">
                  <div class="weight-bar-container">
                    <div class="weight-fill" :style="{ width: (factor.关键性权重 * 100) + '%' }"></div>
                  </div>
                  <span class="weight-highlight-num">{{ (factor.关键性权重 * 100).toFixed(0) }}%</span>
                </div>
                <p class="factor-desc">{{ factor.分析内容 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="evaluation-section  scrollbar-tech">
          <div class="section-title">效能指标与标注</div>
          
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
            <span>样本总计: <b>{{ metrics.total_evals }}</b></span>
            <span>正确匹配: <b>{{ metrics.correct_count }}</b></span>
          </div>

          <div class="divider"></div>

          <div class="annotation-area">
            <div class="sub-module-header">人工数据标注</div>
            <div class="form-group">
              <label>结论合理性判定</label>
              <div class="radio-group">
                <button 
                  :class="['opt-btn', annotation.is_correct === true ? 'active-yes' : '']"
                  @click="annotation.is_correct = true"
                >准确 / 合理</button>
                <button 
                  :class="['opt-btn', annotation.is_correct === false ? 'active-no' : '']"
                  @click="annotation.is_correct = false"
                >存在偏差</button>
              </div>
            </div>
            
            <div class="form-group flex-fill">
              <label>修正评价意见</label>
              <textarea v-model="annotation.feedback" placeholder="请在此输入您的专业评价或修正建议..." class="tech-input"></textarea>
            </div>

            <button class="submit-btn" @click="handleSubmmit" :disabled="submitting">
              {{ submitting ? '正在同步数据...' : '确认并提交标注' }}
            </button>

            <div style="height: 18px; opacity: 0;">占位符</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const props = defineProps({ visible: Boolean, caseId: String });
const emit = defineEmits(['close', 'success']);

const analysisData = ref({});
const metrics = ref({});
const submitting = ref(false);
const annotation = reactive({ is_correct: null, feedback: '' });

const fetchData = async () => {
  await new Promise(r => setTimeout(r, 300));
  // 模拟数据
  analysisData.value = {
    "是否满足深度分析条件": true,
    "事件成因分析": ["合同条款缺失", "利益分配争议", "法律认知偏差"],
    "事件画像": ["合同纠纷", "赔偿纠纷"],
    "多维度分析": [
      { "维度名": "时间维度", "分析内容": "纠纷起始于2012年，跨度长达5年，具有明显的历史遗留特征。" },
      { "维度名": "权责维度", "分析内容": "核心争议点在于合同补充协议的法律效力认定不一。" }
    ],
    "多要素分析": [
      { "要素名": "经济要素", "分析内容": "涉及土地补偿金分配，是核心驱动力。", "关键性权重": 0.6 },
      { "要素名": "心理要素", "分析内容": "双方对调解结果存在预期落差，情绪波动大。", "关键性权重": 0.4 }
    ]
  };
  metrics.value = { total_evals: 1250, correct_count: 1080, precision: "88.2%", accuracy: "86.4%", recall: "84.5%", f1_score: "0.86" };
};

const handleSubmmit = async () => {
  if (annotation.is_correct === null) return alert("请先进行合理性判定");
  submitting.value = true;
  await new Promise(r => setTimeout(r, 600));
  submitting.value = false;
  emit('close');
};

onMounted(fetchData);
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
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  padding: 25px;
  gap: 25px;
  overflow: hidden; /* 内部区域自滚动 */
}

/* 左侧：内容卡片化与圆角 */
.content-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  color: #00f2ff;
  font-size: 16px;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid #00f2ff;
}

.info-card {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
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

.sub-module-header {
  color: #00f2ff; font-size: 15px; font-weight: 600; margin: 25px 0 15px 0;
  display: flex; align-items: center;
}
.sub-module-header::after {
  content: ""; flex: 1; height: 1px; margin-left: 15px;
  background: linear-gradient(90deg, rgba(0, 242, 255, 0.3), transparent);
}

.dim-item {
  background: rgba(255, 255, 255, 0.04);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}
.dim-name { color: #00f2ff; font-weight: bold; margin-right: 12px; }
.dim-content { color: #cfd9e5; font-size: 13px; line-height: 1.5; }

/* 要素名高亮 */
.factor-name-tag {
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff; padding: 4px 12px; border-radius: 6px;
  font-size: 13px; font-weight: bold; border: 1px solid rgba(0, 242, 255, 0.2);
}

/* 权重高亮样式 */
.factor-weight-row { display: flex; align-items: center; gap: 15px; margin-top: 10px; }
.weight-bar-container { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
.weight-fill { height: 100%; background: linear-gradient(90deg, #0066ff, #00f2ff); box-shadow: 0 0 10px rgba(0, 242, 255, 0.5); }
.weight-highlight-num {
  min-width: 45px; color: #00f2ff; font-family: 'Courier New', Courier, monospace;
  font-weight: bold; font-size: 16px; text-shadow: 0 0 8px rgba(0, 242, 255, 0.6);
}

.factor-desc{
    margin-bottom: 10px;
}

/* 右侧：高度适配关键区 */
.evaluation-section {
  display: flex;
  flex-direction: column; /* 纵向排列 */
  background: rgba(16, 35, 78, 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 242, 255, 0.1);
  overflow-y: scroll;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.metric-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
    border-color: rgba(0, 242, 255, 0.4);
    background: rgba(0, 242, 255, 0.05); 
}

.metric-card .num { font-size: 22px; color: #00f2ff; font-weight: bold; }
.metric-card .name { font-size: 11px; color: #88b0ea; text-transform: uppercase; margin-top: 4px; }

.count-info{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

/* 标注表单：占据剩余高度 */
.annotation-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 防止溢出 */
}

.form-group { margin-bottom: 18px; }
.form-group.flex-fill {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label { display: block; color: #88b0ea; margin-bottom: 10px; font-size: 14px; }

.radio-group { display: flex; gap: 12px; }
.opt-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #88b0ea;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-btn.active-yes { border-color: #00f2ff; color: #fff; background: rgba(0, 242, 255, 0.15); box-shadow: 0 0 10px rgba(0, 242, 255, 0.1); }
.opt-btn.active-no { border-color: #ff4d4f; color: #fff; background: rgba(255, 77, 79, 0.15); }

.tech-input {
  width: 100%;
  flex: 1; /* 自动撑满表单剩余空间 */
  min-height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  padding: 12px;
  box-sizing: border-box;
  resize: none;
  font-family: inherit;
}

.submit-btn {
  width: 80%; padding: 14px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff);
  color: white; font-weight: bold; font-size: 16px; cursor: pointer;
  box-shadow: 0 5px 20px rgba(0, 102, 255, 0.4);
  margin-left: 10%;
  margin-bottom: 20px;
}

.submit-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }
.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
</style>