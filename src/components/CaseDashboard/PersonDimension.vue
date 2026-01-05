<template>
  <div class="person-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">人物维度分析 (Character Attribution)</div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '人物维度分析', 'person-dimension')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>

    <!-- 上部：人物选择与概览 -->
    <div class="dimension-summary">
      <p>{{ data.summary }}</p>
    </div>

    <div class="person-container">
      <!-- 上半部分：人物卡片横向排列 -->
      <div class="person-selector">
        <div 
          v-for="person in data.characters" 
          :key="person.id"
          :class="['person-card', activePersonId === person.id ? 'active' : '']"
          @click="activePersonId = person.id"
        >
          <div class="person-avatar">{{ person.avatar }}</div>
          <div class="person-basic-info">
            <div class="person-name">{{ person.name }}</div>
            <div class="person-type-tag">{{ person.type }}</div>
          </div>
          <div class="selection-indicator"></div>
        </div>
      </div>

      <!-- 下半部分：深度致因分析面板 -->
      <div class="attribution-panel" v-if="activePerson">
        <Transition name="fade-slide" mode="out-in">
          <div :key="activePerson.id" class="attribution-grid">
            <!-- 左侧：动机与偏差 -->
            <div class="attr-left">
              <div class="attr-section">
                <div class="attr-label">利益原动力 (Core Drivers)</div>
                <div class="driver-list">
                  <div v-for="driver in activePerson.drivers" :key="driver.label" class="driver-item">
                    <span class="d-title">【{{ driver.label }}】</span>
                    <span class="d-desc">{{ driver.desc }}</span>
                  </div>
                </div>
              </div>

              <div class="attr-section">
                <div class="attr-label">认知偏差 (Cognitive Biases)</div>
                <div class="bias-list">
                  <div v-for="bias in activePerson.biases" :key="bias.title" class="bias-item">
                    <span class="b-title">【{{ bias.title }}】</span>
                    <span class="b-desc">{{ bias.desc }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：核心归因结论 -->
            <div class="attr-right">
              <div class="attribution-conclusion">
                <div class="conclusion-header">
                  <span class="c-icon">🔍</span>
                  核心致因归因 (Case Attribution)
                </div>
                <div class="conclusion-text">
                  {{ activePerson.attribution }}
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      summary: '',
      characters: []
    })
  }
});

const emit = defineEmits(['open-eval']);

const activePersonId = ref(null);

const activePerson = computed(() => {
  return props.data.characters?.find(p => p.id === activePersonId.value) || null;
});

watch(() => props.data.characters, (newChars) => {
  if (newChars && newChars.length > 0 && !activePersonId.value) {
    activePersonId.value = newChars[0].id;
  }
}, { immediate: true });
</script>

<style scoped>
.dashboard-card {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
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
}

.dimension-summary {
  background: rgba(0, 242, 255, 0.05);
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 2px solid #00f2ff;
}

.dimension-summary p {
  font-size: 13px;
  color: #88b0ea;
  margin: 0;
  line-height: 1.5;
}

.person-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

/* 人物选择器样式 */
.person-selector {
  display: flex;
  gap: 15px;
  flex: 0 0 auto;
}

.person-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.person-card:hover {
  background: rgba(0, 242, 255, 0.05);
  border-color: rgba(0, 242, 255, 0.3);
}

.person-card.active {
  background: rgba(0, 242, 255, 0.1);
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.person-avatar {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.person-name {
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  margin-bottom: 2px;
}

.person-type-tag {
  font-size: 11px;
  color: #88b0ea;
  background: rgba(136, 176, 234, 0.1);
  padding: 1px 6px;
  border-radius: 2px;
}

.selection-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #00f2ff;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.person-card.active .selection-indicator {
  transform: translateY(0);
}

/* 归因面板样式 */
.attribution-panel {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.attribution-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  height: 100%;
}

.attr-label {
  font-size: 14px;
  color: #00f2ff;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.attr-label::before {
  content: "";
  width: 3px;
  height: 12px;
  background: #00f2ff;
}

.attr-section {
  margin-bottom: 25px;
}

.driver-item {
  background: rgba(0, 242, 255, 0.05);
  border: 1px solid rgba(0, 242, 255, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.5;
}

.d-title { color: #00f2ff; font-weight: bold; }
.d-desc { color: #cfd9e5; }

.bias-item {
  background: rgba(255, 107, 107, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.5;
}

.b-title { color: #ff6b6b; font-weight: bold; }
.b-desc { color: #cfd9e5; }

/* 归因结论框 */
.attribution-conclusion {
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.conclusion-header {
  font-size: 16px;
  font-weight: bold;
  color: #00f2ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.conclusion-text {
  font-size: 14px;
  color: #fff;
  line-height: 1.8;
  text-align: justify;
  flex: 1;
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

/* 动画效果 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 滚动条美化 */
.attribution-panel::-webkit-scrollbar {
  width: 4px;
}
.attribution-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 2px;
}
</style>

