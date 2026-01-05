<template>
  <div v-if="visible" class="annotation-modal-mask" @click.self="$emit('close')">
    <div class="annotation-modal-container slide-in">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">维度效能评估 - {{ sectionName }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body scrollbar-tech">
        <!-- 核心指标评分 -->
        <div class="eval-group">
          <div class="eval-label">核心指标评分 (Core Metrics)</div>
          <div class="metrics-scores">
            <div v-for="(val, metric) in scores" :key="metric" class="metric-score-item">
              <div class="metric-info">
                <span class="m-name">{{ metricMap[metric] }}</span>
                <span class="m-val">{{ val }} / 5</span>
              </div>
              <div class="score-stars">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  :class="['star', star <= val ? 'active' : '']"
                  @click="scores[metric] = star"
                >★</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细维度判定 -->
        <div class="eval-group">
          <div class="eval-label">逻辑合理性判定</div>
          <div class="judgment-grid">
            <button 
              v-for="opt in judgmentOptions" 
              :key="opt.value"
              :class="['judgment-btn', assessment.judgment === opt.value ? 'active' : '']"
              @click="assessment.judgment = opt.value"
            >
              <span class="opt-icon">{{ opt.icon }}</span>
              <span class="opt-text">{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <!-- 偏差类型标注 -->
        <div class="eval-group" v-if="assessment.judgment !== 'perfect'">
          <div class="eval-label">偏差类型标注 (Bias Types)</div>
          <div class="bias-tags">
            <span 
              v-for="bias in biasTypes" 
              :key="bias"
              :class="['bias-tag', assessment.biases.includes(bias) ? 'active' : '']"
              @click="toggleBias(bias)"
            >{{ bias }}</span>
          </div>
        </div>

        <!-- 专家修正建议 -->
        <div class="eval-group">
          <div class="eval-label">专家修正与优化建议</div>
          <textarea 
            v-model="assessment.feedback" 
            class="tech-textarea" 
            placeholder="请结合法理依据，提供更精准的修正意见..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="$emit('close')">取消</button>
          <button class="submit-btn" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '正在同步效能数据...' : '提交评估报告' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const props = defineProps({
  visible: Boolean,
  sectionName: String,
  sectionId: String
});

const emit = defineEmits(['close', 'submit']);

const submitting = ref(false);

const metricMap = {
  logic: '逻辑严密性',
  accuracy: '事实准确度',
  relevance: '法律关联性',
  completeness: '维度完备程度'
};

const scores = reactive({
  logic: 5,
  accuracy: 5,
  relevance: 5,
  completeness: 5
});

const judgmentOptions = [
  { value: 'perfect', label: '逻辑完美', icon: '💎' },
  { value: 'minor', label: '细微偏差', icon: '🔍' },
  { value: 'major', label: '逻辑断层', icon: '⚠️' },
  { value: 'error', label: '事实错误', icon: '❌' }
];

const biasTypes = ['主体认定模糊', '因果推导牵强', '法律适用不当', '金额测算偏差', '时间节点错位', '情绪定性过激'];

const assessment = reactive({
  judgment: 'perfect',
  biases: [],
  feedback: ''
});

const toggleBias = (bias) => {
  const index = assessment.biases.indexOf(bias);
  if (index > -1) {
    assessment.biases.splice(index, 1);
  } else {
    assessment.biases.push(bias);
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  await new Promise(r => setTimeout(r, 800));
  submitting.value = false;
  emit('submit', {
    sectionId: props.sectionId,
    scores: { ...scores },
    assessment: { ...assessment }
  });
  emit('close');
};
</script>

<style scoped>
.annotation-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100; /* 高于 analyze.vue */
}

.annotation-modal-container {
  width: 500px;
  max-height: 90vh;
  background: linear-gradient(145deg, #1a3a7a 0%, #0d1b3e 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 242, 255, 0.3);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(0, 242, 255, 0.15);
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
  width: 8px; height: 8px; background: #00f2ff; border-radius: 50%;
  box-shadow: 0 0 10px #00f2ff;
}
.title-text { color: #fff; font-size: 18px; font-weight: bold; letter-spacing: 1px; }

.modal-body {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

.eval-group { margin-bottom: 25px; }
.eval-label { color: #00f2ff; font-size: 14px; font-weight: bold; margin-bottom: 15px; border-left: 3px solid #00f2ff; padding-left: 10px; }

.metrics-scores { display: flex; flex-direction: column; gap: 12px; }
.metric-score-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 15px; border-radius: 8px; }
.m-name { color: #88b0ea; font-size: 13px; }
.m-val { color: #00f2ff; font-weight: bold; font-family: monospace; }
.score-stars { color: rgba(255,255,255,0.1); font-size: 18px; cursor: pointer; }
.star.active { color: #ffcf40; text-shadow: 0 0 8px rgba(255, 207, 64, 0.5); }

.judgment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.judgment-btn {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 12px; color: #88b0ea; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s;
}
.judgment-btn.active { border-color: #00f2ff; background: rgba(0, 242, 255, 0.1); color: #fff; }
.opt-icon { font-size: 20px; }
.opt-text { font-size: 12px; font-weight: bold; }

.bias-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.bias-tag {
  padding: 4px 12px; border-radius: 15px; font-size: 11px;
  background: rgba(255, 77, 79, 0.05); color: #ff4d4f; border: 1px solid rgba(255, 77, 79, 0.2);
  cursor: pointer; transition: all 0.2s;
}
.bias-tag.active { background: #ff4d4f; color: #fff; }

.tech-textarea {
  width: 100%; height: 80px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #fff; padding: 12px; box-sizing: border-box; resize: none; font-size: 13px;
}

.modal-footer {
  margin-top: 10px; display: flex; gap: 15px;
}
.cancel-btn { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #88b0ea; cursor: pointer; }
.submit-btn {
  flex: 2; padding: 12px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff); color: white; font-weight: bold; cursor: pointer;
}

.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.3s ease-out; }
</style>
