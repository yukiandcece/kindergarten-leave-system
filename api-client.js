/**
 * 前端API客户端 - 查询学生联系人数据
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 查询学生联系人列表
 * @param {number} page - 页码
 * @param {number} pageSize - 每页条数
 */
async function getStudentContacts(page = 1, pageSize = 100) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/student-contacts?page=${page}&pageSize=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ 查询成功: 第 ${result.pagination.page}/${result.pagination.totalPages} 页`);
      console.log(`📊 总记录数: ${result.pagination.total}`);
      console.log(`📋 当前页记录数: ${result.data.length}`);

      return result;
    } else {
      throw new Error(result.message || '查询失败');
    }

  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
}

/**
 * 根据ID查询单个联系人
 * @param {number|string} id - 联系人ID
 */
async function getContactById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/student-contacts/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ 查询成功: ID=${result.data.id}, 手机号=${result.data.cellphone}`);
      return result.data;
    } else {
      throw new Error(result.message || '查询失败');
    }

  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
}

/**
 * 检查API服务状态
 */
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();

    if (result.success) {
      console.log('✅ API服务正常');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ API服务不可用:', error);
    return false;
  }
}

// ==================== 使用示例 ====================

// 示例1：查询第一页数据
// (async () => {
//   try {
//     const result = await getStudentContacts(1, 50);
//     console.log('数据:', result.data);
//   } catch (error) {
//     console.error('执行失败');
//   }
// })();

// 示例2：查询所有数据（分页获取）
// (async () => {
//   try {
//     let allData = [];
//     let page = 1;
//     let hasMore = true;

//     while (hasMore) {
//       const result = await getStudentContacts(page, 100);
//       allData = allData.concat(result.data);
//
//       hasMore = page < result.pagination.totalPages;
//       page++;
//     }
//
//     console.log(`✅ 总共获取 ${allData.length} 条记录`);
//     console.log('数据:', allData);
//   } catch (error) {
//     console.error('执行失败');
//   }
// })();

// 示例3：根据ID查询
// (async () => {
//   try {
//     const contact = await getContactById(1);
//     console.log('联系人信息:', contact);
//   } catch (error) {
//     console.error('执行失败');
//   }
// })();

// 示例4：在HTML页面中使用
// async function loadContacts() {
//   const result = await getStudentContacts(1, 20);
//   const tbody = document.getElementById('contactTableBody');
//
//   tbody.innerHTML = result.data.map(row => `
//     <tr>
//       <td>${row.id}</td>
//       <td>${row.cellphone}</td>
//     </tr>
//   `).join('');
// }
