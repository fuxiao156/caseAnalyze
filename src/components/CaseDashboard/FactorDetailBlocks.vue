<template>
  <div class="factors-blocks-container">
    <TransitionGroup name="flip-list">
      <div 
        v-for="factor in sortedFactors" 
        :key="factor.id"
        :class="['factor-block-item', activeFactorId === factor.id ? 'active-highlight' : '']"
      >
        <div class="block-header">
          <span class="block-title">{{ factor.name }}</span>
          <span class="block-icon" v-if="factor.type === 'psychology'">🧠</span>
          <span class="block-icon" v-else>📋</span>
        </div>
        
        <div class="block-content">
          <!-- 心理要素特定展示 (1.5) -->
          <div v-if="factor.type === 'psychology'" class="psychology-blocks">
            <div 
              v-for="(emotion, eIdx) in psychologyData" 
              :key="eIdx"
              class="emotion-chip"
              @click="$emit('focus-timeline', emotion.time)"
            >
              <div class="e-person">{{ emotion.person }}</div>
              <div class="e-val" :style="{ color: getIntensityColor(emotion.intensity) }">
                {{ emotion.emotion }}
              </div>
              <div class="e-time">{{ emotion.time }}</div>
            </div>
          </div>
          
          <!-- 通用要素展示 -->
          <p v-else class="generic-content">{{ factor.content }}</p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  factors: Array,
  activeFactorName: String,
  psychologyData: Array
});

defineEmits(['focus-timeline']);

// 根据当前选中的要素名进行排序，选中的排在第一位 (1.2.2)
const sortedFactors = computed(() => {
  if (!props.activeFactorName) return props.factors;
  
  const factorsCopy = [...props.factors];
  const activeIdx = factorsCopy.findIndex(f => f.name === props.activeFactorName);
  
  if (activeIdx > -1) {
    const [activeItem] = factorsCopy.splice(activeIdx, 1);
    factorsCopy.unshift(activeItem);
  }
  return factorsCopy;
});

const activeFactorId = computed(() => {
  return props.factors.find(f => f.name === props.activeFactorName)?.id;
});

const getIntensityColor = (intensity) => {
  if (intensity > 0.8) return '#ff4d4f';
  if (intensity > 0.5) return '#ffcf40';
  return '#4dff88';
};
</script>

<style scoped>
.factors-blocks-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.factor-block-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.factor-block-item.active-highlight {
  border-color: #00f2ff;
  background: rgba(0, 242, 255, 0.05);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.1);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.block-title {
  font-size: 14px;
  font-weight: bold;
  color: #00f2ff;
}

.generic-content {
  font-size: 13px;
  color: #cfd9e5;
  line-height: 1.5;
  margin: 0;
}

/* 心理要素块状展示 (1.5) */
.psychology-blocks {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.emotion-chip {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.emotion-chip:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.e-person { font-size: 11px; color: #88b0ea; }
.e-val { font-size: 14px; font-weight: bold; margin: 4px 0; }
.e-time { font-size: 10px; color: rgba(255, 255, 255, 0.3); font-family: monospace; }

/* 翻转列表动画 */
.flip-list-move {
  transition: transform 0.6s ease;
}

/* 自定义滚动条 */
.factors-blocks-container::-webkit-scrollbar { width: 4px; }
.factors-blocks-container::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }
</style>
