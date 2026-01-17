<template>
  <div v-if="visible" class="data-correction-modal-mask" @click.self="$emit('close')">
    <div class="data-correction-modal-container slide-in">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">数据校正 - {{ sectionName }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body scrollbar-tech">
        <!-- 提示信息 -->
        <div class="correction-info-tip">
          <span class="tip-icon">ℹ️</span>
          <span class="tip-text">您手动校正的数据将作为高质量语料用于模型微调（Fine-tuning），帮助系统在后续案件中提供更精准的分析效果。</span>
          <button v-if="canWithdraw" class="withdraw-btn" @click="handleWithdrawCorrection" :disabled="submitting">
            <span class="btn-icon">↩️</span> 撤回本模块校正
          </button>
        </div>

        <!-- 动态渲染不同的校正面板 -->
        <div v-if="sectionId === 'event-factor'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">事件画像 (Profiling)</div>
            <div class="factor-edit-list">
              <div v-for="(item, index) in localData.事件画像" :key="'profile-' + index" class="factor-edit-item">
                <select v-model="localData.事件画像[index]" class="tech-input small profile-select">
                  <option 
                    v-for="opt in profileOptions" 
                    :key="opt" 
                    :value="opt"
                    :disabled="localData.事件画像.includes(opt) && localData.事件画像[index] !== opt"
                  >
                    {{ opt }}
                  </option>
                </select>
                <button class="remove-btn" @click="localData.事件画像.splice(index, 1)">✕</button>
              </div>
              <button 
                v-if="localData.事件画像.length < 4" 
                class="add-btn" 
                @click="handleAddProfile"
              >
                + 添加画像标签 (最多4个)
              </button>
            </div>
          </div>

          <div class="panel-group">
            <div class="panel-label">核心成因分析 (Causes)</div>
            <div class="factor-edit-list">
              <div v-for="(item, index) in localData.成因分析" :key="'cause-' + index" class="factor-edit-item">
                <input v-model="item.tag" class="tech-input small" placeholder="成因标签" />
                <input v-model.number="item.percentage" type="number" class="tech-input weight-val-input" placeholder="权重%" />
                <button class="remove-btn" @click="localData.成因分析.splice(index, 1)">✕</button>
              </div>
              <button class="add-btn" @click="localData.成因分析.push({ tag: '', percentage: 0 })">+ 添加成因标签</button>
            </div>
          </div>
        </div>

        <div v-else-if="sectionId === 'time-dimension'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">事件时间轴 (Timeline)</div>
            <div class="timeline-edit-list">
              <div v-for="(node, index) in localData.时间维度数据.timeline" :key="'node-' + index" class="timeline-edit-card">
                <div class="card-header">
                  <span class="node-index">节点 {{ index + 1 }}</span>
                  <button class="remove-btn small" @click="localData.时间维度数据.timeline.splice(index, 1)">✕</button>
                </div>
                <div class="card-body">
                  <div class="input-row">
                    <input v-model="node.date" class="tech-input small" placeholder="时间 (如: 2024-01)" />
                    <input v-model="node.event" class="tech-input small" placeholder="事件简称" />
                  </div>
                  
                  <!-- 节点下要素校正 -->
                  <div class="node-factors-edit">
                    <div class="sub-label">影响要素 (Factors)</div>
                    <div v-for="(factor, fIdx) in node.nodeFactors" :key="'f-' + fIdx" class="factor-row">
                      <div class="factor-header">
                        <input v-model="factor.name" class="tech-input small" placeholder="要素名称" />
                        <button class="remove-btn mini" @click="node.nodeFactors.splice(fIdx, 1)">✕</button>
                      </div>
                      <textarea v-model="factor.content" class="tech-textarea custom-scrollbar tiny-height" placeholder="要素分析内容..."></textarea>
                    </div>
                    <button class="add-btn mini" @click="node.nodeFactors.push({ id: Date.now(), name: '', content: '' })">+ 添加影响要素</button>
                  </div>
                </div>
              </div>
              <button class="add-btn" @click="localData.时间维度数据.timeline.push({ date: '', event: '', nodeFactors: [] })">+ 添加时间节点</button>
            </div>
          </div>
        </div>

        <div v-else-if="sectionId === 'person-dimension'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">人物维度总结</div>
            <textarea 
              v-model="localData.人物维度数据.summary" 
              class="tech-textarea custom-scrollbar small-height" 
              placeholder="请输入人物维度总结..."
            ></textarea>
          </div>
          <div class="panel-group">
            <div class="panel-label">人物角色列表 (Characters)</div>
            <div class="person-edit-list">
              <div v-for="(person, index) in localData.人物维度数据.characters" :key="'person-' + index" class="person-edit-card">
                <div class="card-header">
                  <div class="person-main-info">
                    <select v-model="person.avatar" class="tech-input avatar-select">
                      <option v-for="opt in avatarOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input v-model="person.name" class="tech-input small" placeholder="姓名" />
                    <input v-model="person.type" class="tech-input small" placeholder="角色类型" />
                  </div>
                  <button class="remove-btn small" @click="localData.人物维度数据.characters.splice(index, 1)">✕</button>
                </div>
                
                <div class="card-body">
                  <!-- 利益原动力 -->
                  <div class="sub-section">
                    <div class="sub-label">利益原动力 (Drivers)</div>
                    <div v-for="(driver, dIdx) in person.drivers" :key="'d-' + dIdx" class="factor-row">
                      <div class="factor-header">
                        <input v-model="driver.label" class="tech-input small" placeholder="动力标签" />
                        <button class="remove-btn mini" @click="person.drivers.splice(dIdx, 1)">✕</button>
                      </div>
                      <textarea v-model="driver.desc" class="tech-textarea custom-scrollbar tiny-height" placeholder="动力详情描述..."></textarea>
                    </div>
                    <button class="add-btn mini" @click="person.drivers.push({ label: '', desc: '' })">+ 添加原动力</button>
                  </div>

                  <!-- 认知偏差 -->
                  <div class="sub-section">
                    <div class="sub-label">认知偏差 (Biases)</div>
                    <div v-for="(bias, bIdx) in person.biases" :key="'b-' + bIdx" class="factor-row">
                      <div class="factor-header">
                        <input v-model="bias.title" class="tech-input small" placeholder="偏差标题" />
                        <button class="remove-btn mini" @click="person.biases.splice(bIdx, 1)">✕</button>
                      </div>
                      <textarea v-model="bias.desc" class="tech-textarea custom-scrollbar tiny-height" placeholder="偏差详情描述..."></textarea>
                    </div>
                    <button class="add-btn mini" @click="person.biases.push({ title: '', desc: '' })">+ 添加认知偏差</button>
                  </div>

                  <!-- 核心归因结论 -->
                  <div class="sub-section">
                    <div class="sub-label">核心归因结论 (Attribution)</div>
                    <textarea v-model="person.attribution" class="tech-textarea custom-scrollbar small-height" placeholder="请输入核心归因结论..."></textarea>
                  </div>
                </div>
              </div>
              <button class="add-btn" @click="localData.人物维度数据.characters.push({ id: Date.now(), avatar: '👤', name: '', type: '', drivers: [], biases: [], attribution: '' })">+ 添加人物角色</button>
            </div>
          </div>
        </div>

        <div v-else-if="sectionId === 'responsibility-dimension'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">动力维度总结</div>
            <textarea 
              v-model="localData.驱动力维度数据.summary" 
              class="tech-textarea custom-scrollbar small-height" 
              placeholder="请输入动力维度总结..."
            ></textarea>
          </div>
          <div class="panel-group">
            <div class="panel-label">博弈阶段列表 (States)</div>
            <div class="state-edit-list">
              <div v-for="(state, index) in localData.驱动力维度数据.states" :key="'state-' + index" class="state-edit-card">
                <div class="card-header">
                  <div class="state-main-info">
                    <input v-model="state.name" class="tech-input small" placeholder="阶段名称" />
                    <input v-model="state.status" class="tech-input small" placeholder="状态描述" />
                  </div>
                  <button class="remove-btn small" @click="localData.驱动力维度数据.states.splice(index, 1)">✕</button>
                </div>
                
                <div class="card-body">
                  <div class="weights-edit-grid">
                    <!-- 左侧：驱动项 -->
                    <div class="sub-section">
                      <div class="sub-label">驱动项 (Driving Factors)</div>
                      <div v-for="(w, wIdx) in state.leftWeights" :key="'lw-' + wIdx" class="factor-row">
                        <div class="factor-header">
                          <input v-model="w.name" class="tech-input small" placeholder="要素名称" />
                          <input v-model.number="w.value" type="number" class="tech-input weight-val-input" placeholder="权重" />
                          <button class="remove-btn mini" @click="state.leftWeights.splice(wIdx, 1)">✕</button>
                        </div>
                        <textarea v-model="w.describe" class="tech-textarea custom-scrollbar tiny-height" placeholder="动力详情描述..."></textarea>
                      </div>
                      <button class="add-btn mini" @click="state.leftWeights.push({ id: Date.now(), name: '', value: 10, describe: '' })">+ 添加驱动项</button>
                    </div>

                    <!-- 右侧：约束项 -->
                    <div class="sub-section">
                      <div class="sub-label">约束项 (Restraining Factors)</div>
                      <div v-for="(w, wIdx) in state.rightWeights" :key="'rw-' + wIdx" class="factor-row">
                        <div class="factor-header">
                          <input v-model="w.name" class="tech-input small" placeholder="要素名称" />
                          <input v-model.number="w.value" type="number" class="tech-input weight-val-input" placeholder="权重" />
                          <button class="remove-btn mini" @click="state.rightWeights.splice(wIdx, 1)">✕</button>
                        </div>
                        <textarea v-model="w.describe" class="tech-textarea custom-scrollbar tiny-height" placeholder="约束详情描述..."></textarea>
                      </div>
                      <button class="add-btn mini" @click="state.rightWeights.push({ id: Date.now(), name: '', value: 10, describe: '' })">+ 添加约束项</button>
                    </div>
                  </div>

                  <!-- 阶段冲突分析 -->
                  <div class="sub-section full-width">
                    <div class="sub-label">致因冲突焦点分析 (Analysis)</div>
                    <div v-for="(line, lIdx) in state.analysis" :key="'line-' + lIdx" class="factor-row">
                      <div class="factor-header">
                        <input v-model="state.analysis[lIdx]" class="tech-input small" placeholder="分析条目内容" />
                        <button class="remove-btn mini" @click="state.analysis.splice(lIdx, 1)">✕</button>
                      </div>
                    </div>
                    <button class="add-btn mini" @click="state.analysis ? state.analysis.push('') : state.analysis = ['']">+ 添加分析条目</button>
                  </div>
                </div>
              </div>
              <button class="add-btn" @click="localData.驱动力维度数据.states.push({ id: 'new-state', name: '', status: '', leftWeights: [], rightWeights: [], analysis: [] })">+ 添加博弈阶段</button>
            </div>
          </div>
        </div>

        <div v-else-if="sectionId === 'info-dimension'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">认知差异总结</div>
            <textarea 
              v-model="localData.信息维度数据.summary" 
              class="tech-textarea custom-scrollbar small-height" 
              placeholder="请输入认知差异总结..."
            ></textarea>
          </div>
          <div class="panel-group">
            <div class="panel-label">认知比对列表 (Cognition Items)</div>
            <div class="info-edit-list">
              <div v-for="(item, index) in localData.信息维度数据.items" :key="'info-' + index" class="info-edit-card">
                <div class="card-header">
                  <input v-model="item.category" class="tech-input small" placeholder="对比范畴 (如: 补偿标准)" />
                  <button class="remove-btn small" @click="localData.信息维度数据.items.splice(index, 1)">✕</button>
                </div>
                
                <div class="card-body">
                  <div class="cognition-edit-grid">
                    <!-- 左侧：主观感知 -->
                    <div class="sub-section subjective-area">
                      <div class="sub-label">主观感知 (Subjective)</div>
                      <textarea v-model="item.subjective.text" class="tech-textarea custom-scrollbar tiny-height" placeholder="主观认知描述..."></textarea>
                      <div class="tags-edit">
                        <div v-for="(tag, tIdx) in item.subjective.tags" :key="'st-' + tIdx" class="tag-row">
                          <input v-model="item.subjective.tags[tIdx]" class="tech-input small" placeholder="标签" />
                          <button class="remove-btn mini" @click="item.subjective.tags.splice(tIdx, 1)">✕</button>
                        </div>
                        <button class="add-btn mini" @click="item.subjective.tags.push('')">+ 添加标签</button>
                      </div>
                    </div>

                    <!-- 右侧：客观事实 -->
                    <div class="sub-section objective-area">
                      <div class="sub-label">客观事实 (Objective)</div>
                      <textarea v-model="item.objective.text" class="tech-textarea custom-scrollbar tiny-height" placeholder="客观事实描述..."></textarea>
                      <div class="tags-edit">
                        <div v-for="(tag, tIdx) in item.objective.tags" :key="'ot-' + tIdx" class="tag-row">
                          <input v-model="item.objective.tags[tIdx]" class="tech-input small" placeholder="标签" />
                          <button class="remove-btn mini" @click="item.objective.tags.splice(tIdx, 1)">✕</button>
                        </div>
                        <button class="add-btn mini" @click="item.objective.tags.push('')">+ 添加标签</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button class="add-btn" @click="localData.信息维度数据.items.push({ id: Date.now(), category: '', subjective: { text: '', tags: [] }, objective: { text: '', tags: [] } })">+ 添加认知比对项</button>
            </div>
          </div>
        </div>

        <!-- 未来可以在这里添加其他模块的面板 -->
        <div v-else class="placeholder-text">
          {{ sectionName }} 的校正面板正在开发中...
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="submit-btn" @click="handleUpdate" :disabled="submitting">
          <span v-if="submitting" class="loading-icon">⏳</span>
          {{ submitting ? '正在保存修改...' : '提交数据校正' }}
        </button>
      </div>

      <!-- 提示信息 -->
      <Transition name="fade">
        <div v-if="message.text" :class="['toast-message', message.type]">
          {{ message.text }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  sectionName: String,
  sectionId: String,
  id: [Number, String],
  allData: {
    type: Object,
    default: () => ({})
  },
  originData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'update-all']);

import { correctAnalysis } from '../api';

const submitting = ref(false);
const message = reactive({ text: '', type: '' });
const localData = ref({});

const avatarOptions = ['👤', '👨‍💼', '👮', '👨‍⚖️', '👨‍🔧',  '👨‍⚕️', '🏢', '🏭'];
const profileOptions = ['矛盾纠纷', '劳动纠纷', '家庭纠纷', '医疗纠纷', '合同纠纷', '物业纠纷', '赔偿纠纷', '损害公共安全'];

const handleAddProfile = () => {
  if (localData.value.事件画像.length >= 4) return;
  // 寻找第一个未被使用的选项
  const nextAvailable = profileOptions.find(opt => !localData.value.事件画像.includes(opt));
  if (nextAvailable) {
    localData.value.事件画像.push(nextAvailable);
  }
};

// 监听 visible，打开时拷贝一份数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    const defaultData = {
      事件画像: [],
      成因分析: [],
      时间维度数据: { timeline: [] },
      人物维度数据: { summary: '', characters: [] },
      驱动力维度数据: { summary: '', states: [] },
      信息维度数据: { summary: '', items: [] }
    };
    localData.value = props.allData ? JSON.parse(JSON.stringify(props.allData)) : defaultData;
    console.log('localData', localData.value);
  }
}, { immediate: true });

const canWithdraw = computed(() => {
  if (!props.originData || !localData.value) return false;
  
  if (props.sectionId === 'event-factor') {
    const pChanged = JSON.stringify(localData.value.事件画像) !== JSON.stringify(props.originData.事件画像);
    const cChanged = JSON.stringify(localData.value.成因分析) !== JSON.stringify(props.originData.成因分析);
    return pChanged || cChanged;
  } else if (props.sectionId === 'time-dimension') {
    return JSON.stringify(localData.value.时间维度数据) !== JSON.stringify(props.originData.时间维度数据);
  } else if (props.sectionId === 'person-dimension') {
    return JSON.stringify(localData.value.人物维度数据) !== JSON.stringify(props.originData.人物维度数据);
  } else if (props.sectionId === 'responsibility-dimension') {
    return JSON.stringify(localData.value.驱动力维度数据) !== JSON.stringify(props.originData.驱动力维度数据);
  } else if (props.sectionId === 'info-dimension') {
    return JSON.stringify(localData.value.信息维度数据) !== JSON.stringify(props.originData.信息维度数据);
  }
  return false;
});

const handleWithdrawCorrection = async () => {
  if (!props.originData) return;
  
  if (confirm('确定要撤回该模块的校正信息，恢复到原始生成数据吗？')) {
    if (props.sectionId === 'event-factor') {
      localData.value.事件画像 = JSON.parse(JSON.stringify(props.originData.事件画像 || []));
      localData.value.成因分析 = JSON.parse(JSON.stringify(props.originData.成因分析 || []));
    } else if (props.sectionId === 'time-dimension') {
      localData.value.时间维度数据 = JSON.parse(JSON.stringify(props.originData.时间维度数据 || { timeline: [] }));
    } else if (props.sectionId === 'person-dimension') {
      localData.value.人物维度数据 = JSON.parse(JSON.stringify(props.originData.人物维度数据 || { summary: '', characters: [] }));
    } else if (props.sectionId === 'responsibility-dimension') {
      localData.value.驱动力维度数据 = JSON.parse(JSON.stringify(props.originData.驱动力维度数据 || { summary: '', states: [] }));
    } else if (props.sectionId === 'info-dimension') {
      localData.value.信息维度数据 = JSON.parse(JSON.stringify(props.originData.信息维度数据 || { summary: '', items: [] }));
    }
    
    // 执行更新逻辑
    await handleUpdate();
  }
};

const showMessage = (text, type = 'success') => {
  message.text = text;
  message.type = type;
  setTimeout(() => {
    message.text = '';
  }, 3000);
};

const handleUpdate = async () => {
  submitting.value = true;
  try {
    // 根据接口4的要求构造参数
    const isReasonChange = props.sectionId === 'event-factor' &&  judeIfReasonChange();
    const isGraghChange = props.sectionId === 'event-factor' &&  judeIfProfileChange();
    const params = {
      id: props.id,
      isReasonChange: isReasonChange,
      originReason: props.originData?.成因分析?.map(c => c.tag),
      newReason: localData.value.成因分析?.map(c => c.tag),
      isGraghChange: isGraghChange,
      originGragh: props.allData?.事件画像,
      newGragh: localData.value.事件画像,
      result: localData.value // 传入完整的修改后数据
    };
    
    const response = await correctAnalysis(params);
    
    if (response.status) {
      showMessage(response.msg || '数据同步成功', 'success');
      
      // 通知父组件更新全局数据，优先使用服务器返回的 new_result
      emit('update-all', response.data?.new_result || localData.value);
      
      // 延迟关闭，让用户看到成功提示
      setTimeout(() => {
        emit('close');
      }, 1000);
    } else {
      throw new Error(response.msg || '提交失败');
    }
  } catch (error) {
    showMessage(error.message || '网络传输异常，请稍后重试', 'error');
  } finally {
    submitting.value = false;
  }
};

const judeIfReasonChange = () => {
  // 判断核心成因标签是否修改, 忽略顺序修改
  const originReason = props.allData?.成因分析?.map(c => c.tag);
  const newReason = localData.value.成因分析?.map(c => c.tag);
  return originReason.sort().join(',') !== newReason.sort().join(',');
};

const judeIfProfileChange = () => {
  // 判断事件画像是否修改, 忽略顺序修改
  const originProfile = props.allData?.事件画像;
  const newProfile = localData.value.事件画像;
  return originProfile.sort().join(',') !== newProfile.sort().join(',');
};
</script>

<style scoped>
.data-correction-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
}

.data-correction-modal-container {
  width: 600px;
  max-height: 80vh;
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
  overflow-y: auto;
}

.panel-group {
  margin-bottom: 20px;
}

.panel-label {
  color: #00f2ff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  border-left: 3px solid #00f2ff;
  padding-left: 10px;
}

/* 顶部提示信息 */
.correction-info-tip {
  position: relative;
  background: rgba(0, 242, 255, 0.05);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 25px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.tip-icon {
  font-size: 16px;
  line-height: 1.4;
}

.tip-text {
  font-size: 13px;
  color: #c8ddfb;
  line-height: 1.6;
  text-align: justify;
}

.withdraw-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.4);
  color: #ffa502;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: auto;
}

.withdraw-btn:hover {
  background: rgba(255, 165, 2, 0.2);
  border-color: #ffa502;
  box-shadow: 0 0 10px rgba(255, 165, 2, 0.2);
}

.withdraw-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tech-input, .tech-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.tech-input:focus, .tech-textarea:focus {
  border-color: #00f2ff;
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
}

.tech-textarea {
  height: 200px;
  resize: vertical;
  line-height: 1.6;
  padding-right: 15px;
}

.tech-textarea.small-height {
  height: 80px;
}

.tech-textarea.tiny-height {
  height: 60px;
  font-size: 12px;
  margin-top: 5px;
}

/* 要素编辑列表样式 */
.factor-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-edit-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tech-input.small {
  padding: 8px 10px;
  font-size: 13px;
}

.add-btn {
  background: rgba(0, 242, 255, 0.05);
  border: 1px dashed rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.add-btn:hover {
  background: rgba(0, 242, 255, 0.1);
  border-color: #00f2ff;
}

.remove-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #ff4d4f;
  color: #fff;
}

.remove-btn.small {
  width: 20px;
  height: 20px;
  font-size: 10px;
}

.remove-btn.mini {
  width: 18px;
  height: 18px;
  font-size: 8px;
  padding: 0;
}

.add-btn.mini {
  padding: 4px 8px;
  font-size: 11px;
  margin-top: 5px;
}

/* 时间轴编辑样式 */
.timeline-edit-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.timeline-edit-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
}

.timeline-edit-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.node-index {
  font-size: 12px;
  color: #88b0ea;
  font-weight: bold;
}

.timeline-edit-card .input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

/* 人物维度编辑样式 */
.person-edit-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.person-edit-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
}

.person-edit-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 15px;
}

.person-main-info {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.avatar-select {
  width: 60px;
  text-align: center;
  flex-shrink: 0;
  appearance: none;
  cursor: pointer;
}

.avatar-select option, .profile-select option {
  background: #1a3a7a;
  color: #fff;
}

.profile-select {
  cursor: pointer;
}

/* 动力维度编辑样式 */
.state-edit-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.state-edit-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
}

.state-edit-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 15px;
}

.state-main-info {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.weights-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.sub-section.full-width {
  grid-column: 1 / -1;
}

.weight-val-input {
  width: 60px;
  flex-shrink: 0;
  text-align: center;
}

/* 信息维度编辑样式 */
.info-edit-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-edit-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
}

.info-edit-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 15px;
}

.cognition-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.subjective-area {
  border-left: 3px solid rgba(162, 155, 254, 0.3);
}

.objective-area {
  border-left: 3px solid rgba(46, 213, 115, 0.3);
}

.tags-edit {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tag-row {
  display: flex;
  gap: 5px;
  align-items: center;
}

.sub-section {
  margin-top: 15px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
}

.node-factors-edit {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 242, 255, 0.05);
}

.sub-label {
  font-size: 11px;
  color: #00f2ff;
  margin-bottom: 8px;
  opacity: 0.8;
  text-transform: uppercase;
}

.factor-row {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.factor-row:last-of-type {
  border-bottom: none;
}

.factor-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  gap: 15px;
  border-top: 1px solid rgba(0, 242, 255, 0.1);
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #88b0ea;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.submit-btn {
  flex: 2;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff);
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }

.placeholder-text {
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 40px 0;
  font-style: italic;
}

/* Toast Message */
.toast-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.toast-message.success {
  background: #52c41a;
  color: #fff;
}

.toast-message.error {
  background: #ff4d4f;
  color: #fff;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar,
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-tech::-webkit-scrollbar-thumb,
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 2px;
}
.scrollbar-tech::-webkit-scrollbar-track,
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.3s ease-out; }
</style>
