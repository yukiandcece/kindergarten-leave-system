/**
 * 前端集成示例 - 在离园系统中使用
 */

// 在 leave-detail.js 中添加这些函数

/**
 * 从数据库查询学生联系人信息
 * @param {number} studentId - 学生ID
 */
async function queryStudentContactFromDB(studentId) {
  try {
    const response = await fetch(`/api/student-contacts/${studentId}`);

    if (!response.ok) {
      throw new Error('查询失败');
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      console.error('查询失败:', result.message);
      return null;
    }
  } catch (error) {
    console.error('请求错误:', error);
    return null;
  }
}

/**
 * 批量查询联系人信息
 * @param {Array} studentIds - 学生ID数组
 */
async function queryMultipleContacts(studentIds) {
  try {
    const response = await fetch('/api/student-contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: studentIds })
    });

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('批量查询失败:', error);
    return [];
  }
}

/**
 * 智能获取手机号（优先从数据库查询）
 * @param {Object} candidate - 接送人信息
 */
async function getPhoneNumber(candidate) {
  // 1. 优先从数据库查询真实手机号
  if (candidate.id) {
    const dbResult = await queryStudentContactFromDB(candidate.id);
    if (dbResult && dbResult.cellphone) {
      console.log('✅ 从数据库获取手机号:', dbResult.cellphone);
      return dbResult.cellphone;
    }
  }

  // 2. 回退到候选数据中的手机号
  if (candidate.phone) {
    console.log('⚠️ 使用候选数据中的手机号');
    return candidate.phone;
  }

  // 3. 都没有则返回null
  console.warn('❌ 未找到手机号');
  return null;
}

/**
 * 拨打电话（集成数据库查询）
 * 修改现有的 handleCallPhone 函数
 */
async function handleCallPhoneWithDB() {
  const candidate = selectedCandidateData;
  if (!candidate) {
    alert('未选择接送人');
    return;
  }

  try {
    // 从数据库查询真实手机号
    const phone = await getPhoneNumber(candidate);

    if (!phone) {
      alert('未找到该联系人的电话号码');
      closeCardActionMenu();
      return;
    }

    closeCardActionMenu();

    // 确认拨打电话
    if (confirm(`确定要拨打 ${candidate.parent}（${candidate.relation}）的电话吗？\n电话：${phone}`)) {
      window.location.href = `tel:${phone}`;

      // 记录拨打电话的操作
      addAbnormal(`已拨打 ${candidate.parent}（${candidate.relation}）电话：${phone}`, currentChild);
    }
  } catch (error) {
    console.error('查询电话失败:', error);
    alert('查询电话号码失败，请稍后重试');
  }
}

/**
 * 页面加载时预加载联系人数据
 */
async function preloadContactData() {
  try {
    const response = await fetch('/api/student-contacts?page=1&pageSize=100');
    const result = await response.json();

    if (result.success) {
      console.log(`✅ 预加载 ${result.data.length} 条联系人数据`);

      // 缓存到 localStorage
      localStorage.setItem('contactCache', JSON.stringify(result.data));
    }
  } catch (error) {
    console.error('预加载失败:', error);
  }
}

// 在页面加载时执行
// window.addEventListener('DOMContentLoaded', preloadContactData);
