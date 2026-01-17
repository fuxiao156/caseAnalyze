import axios from 'axios';

const BASE_URL = 'http://10.100.5.251:16666';

/**
 * 启动分析任务
 * @param {Object} params { content: string, id?: number }
 * @returns {Promise}
 */
export const analyzeCase = (params) => {
  return axios({
    method: 'post',
    url: `${BASE_URL}/api/model_infer/analyze`,
    data: params,
  }).then(res => res.data);
};

/**
 * 查询任务进度
 * @param {string} taskId 任务ID
 * @returns {Promise}
 */
export const queryTaskProgress = (taskId, id) => {
  return axios({
    method: 'get',
    url: `${BASE_URL}/api/model_infer/query`,
    params: {
      task_id: taskId,
      id: id
    }
  }).then(res => res.data);
};

/**
 * 获取分析结果详情
 * @param {number} id 任务ID
 * @returns {Promise}
 */
export const getAnalysisDetail = (id) => {
  return axios({
    method: 'get',
    url: `${BASE_URL}/api/model_infer/detail`,
    params: { id }
  }).then(res => res.data);
};

/**
 * 提交数据校正
 * @param {Object} params
 * @returns {Promise}
 */
export const correctAnalysis = (params) => {
  return axios({
    method: 'post',
    url: `${BASE_URL}/api/model_infer/correct`,
    data: params
  }).then(res => res.data);
};

/**
 * 获取统计数据
 * @returns {Promise}
 */
export const getStatistics = () => {
  return axios({
    method: 'get',
    url: `${BASE_URL}/api/model_infer/stat`,
  }).then(res => res.data);
};
