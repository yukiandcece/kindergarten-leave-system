const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const swipeTip = document.getElementById("swipeTip");
const pickupList = document.getElementById("pickupList");
const recordBody = document.getElementById("recordBody");
const abnormalList = document.getElementById("abnormalList");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const studentSelectSection = document.getElementById("studentSelectSection");
const studentSelectList = document.getElementById("studentSelectList");

let currentCandidates = [];
let currentChild = null; // 当前搜索的孩子信息
let searchMode = 'direct'; // 'direct' = 直接显示接送人, 'select' = 需要选择学生
let tempStudentsData = []; // 临时存储搜索到的学生数据

// NFC相关变量
let nfcScanner = null;
let isNfcScanning = false;
let currentNfcId = null;

// 关系映射表：将数据库中的关系代码转换为中文
const relationMap = {
  1: '爸爸',
  2: '妈妈',
  3: '爷爷',
  4: '奶奶',
  5: '外公',
  6: '外婆',
  7: '其他'
};

// ==================== NFC功能函数 ====================

// 初始化NFC扫描器
async function initializeNfcScanner() {
  const nfcModule = await import('./nfcDemo/nfc-core.js');

  nfcScanner = nfcModule.createNfcScanner({
    onReading: handleNfcReading,
    onReadingError: handleNfcReadingError
  });
}

// NFC读取成功处理
async function handleNfcReading({ serialNumber, records }) {
  console.log('NFC读取成功:', { serialNumber, records });

  // 查找包含nfc_id的记录
  const currentRecords = Array.isArray(records) ? records : [];
  const resolvedNfcId = extractNfcIdFromRecords(currentRecords);

  if (!resolvedNfcId) {
    swipeTip.textContent = 'NFC卡格式错误：未找到nfc_id字段';
    swipeTip.style.color = '#eb4335';
    return;
  }

  currentNfcId = resolvedNfcId;
  searchInput.value = currentNfcId; // 先显示nfc_id，查询成功后再更新为学生姓名+nfc_id

  swipeTip.textContent = `NFC读取成功：${currentNfcId}，正在查询...`;
  swipeTip.style.color = '#2f63a2';

  // 执行NFC搜索
  await performNfcSearch(currentNfcId);
}

// NFC读取错误处理
function extractNfcIdFromRecords(records) {
  for (const record of records) {
    const nfcId = extractNfcId(record);

    if (nfcId) {
      return nfcId;
    }
  }

  return '';
}

function extractNfcId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    const text = value.trim();

    if (/^\d+_\d{7,15}$/.test(text)) {
      return text;
    }

    const matched = text.match(/\b\d+_\d{7,15}\b/);
    if (matched) {
      return matched[0];
    }

    try {
      return extractNfcId(JSON.parse(text));
    } catch {
      return '';
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nfcId = extractNfcId(item);

      if (nfcId) {
        return nfcId;
      }
    }

    return '';
  }

  if (typeof value === 'object') {
    const direct = value.nfc_id || value.nfcId || value.text || value.rawText || value.url || value.rawJson;
    const directNfcId = extractNfcId(direct);

    if (directNfcId) {
      return directNfcId;
    }

    if (typeof value.rawHex === 'string') {
      const rawHexNfcId = extractNfcId(decodeRawHexText(value.rawHex));

      if (rawHexNfcId) {
        return rawHexNfcId;
      }
    }

    for (const item of Object.values(value)) {
      const nfcId = extractNfcId(item);

      if (nfcId) {
        return nfcId;
      }
    }
  }

  return '';
}

function decodeRawHexText(rawHex) {
  const bytes = rawHex
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseInt(part, 16))
    .filter((byte) => Number.isFinite(byte));

  if (bytes.length === 0) {
    return '';
  }

  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    return String.fromCharCode(...bytes);
  }
}

function handleNfcReadingError(error) {
  console.error('NFC读取错误:', error);
  swipeTip.textContent = `NFC读取失败：${error.message}`;
  swipeTip.style.color = '#eb4335';
}

// 执行NFC搜索
async function performNfcSearch(nfcId) {
  try {
    const response = await fetch(
      `/api/students/nfc-search?nfc_id=${encodeURIComponent(nfcId)}`
    );

    if (!response.ok) {
      throw new Error('搜索请求失败');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '搜索失败');
    }

    if (result.data.length === 0) {
      swipeTip.textContent = `未找到NFC卡对应的学生信息`;
      swipeTip.style.color = '#cc8a00';
      pickupList.innerHTML = '<p class="empty-text">未找到匹配的学生信息</p>';
      currentCandidates = [];
      currentChild = null;
      return;
    }

    const studentData = result.data[0];

    // 构建接送人数据（包含isMatch标记）
    const candidates = studentData.contacts.map(contact => ({
      child: studentData.student_name,
      parent: contact.parent_name,
      relation: contact.parent_role ? (relationMap[contact.parent_role] || '其他') : '',
      phone: contact.cellphone,
      isMatch: contact.isMatch, // 高亮标记
      photoUrl: buildAvatarDataUri(
        `${studentData.id}-${contact.parent_name}-${contact.parent_role}`,
        contact.parent_role ? (relationMap[contact.parent_role] || '其他') : ''
      ),
      studentId: studentData.id
    }));

    currentCandidates = candidates;
    currentChild = {
      id: studentData.id,
      name: studentData.student_name
    };

    // 渲染带高亮的卡片
    renderCandidatesWithHighlight(candidates);

    // 更新搜索输入框为 "{student_name} + {nfc_id}"
    searchInput.value = `${studentData.student_name} + ${nfcId}`;

    const matchCount = candidates.filter(c => c.isMatch).length;
    swipeTip.textContent = `找到学生：${studentData.student_name}，${candidates.length}位接送人（${matchCount}位匹配）`;
    swipeTip.style.color = '#1a9c5e';

  } catch (error) {
    swipeTip.textContent = `NFC搜索失败：${error.message}`;
    swipeTip.style.color = '#eb4335';
    console.error(error);
  }
}

// 启动NFC扫描
async function startNfcScanning() {
  try {
    // 动态导入NFC模块
    const nfcModule = await import('./nfcDemo/nfc-core.js');

    // 检查浏览器支持
    if (!nfcModule.isWebNfcSupported()) {
      swipeTip.textContent = '当前浏览器不支持Web NFC，请使用Android Chrome浏览器';
      swipeTip.style.color = '#eb4335';
      return;
    }

    // 检查推荐浏览器
    const browserInfo = nfcModule.detectNfcBrowser();
    if (!browserInfo.isRecommended) {
      swipeTip.textContent = `推荐使用Android Chrome浏览器，当前：${browserInfo.label}`;
      swipeTip.style.color = '#cc8a00';
    }

    // 初始化扫描器
    await initializeNfcScanner();

    // 启动扫描
    await nfcScanner.start();

    isNfcScanning = true;
    const startBtn = document.getElementById('startNfcBtn');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = '✓ NFC已启动';
    }

    swipeTip.textContent = 'NFC扫描已启动，请将NFC卡靠近手机背面...';
    swipeTip.style.color = '#2f63a2';

  } catch (error) {
    console.error('启动NFC失败:', error);

    // 收集诊断信息
    const nfcModule = await import('./nfcDemo/nfc-core.js');
    const diagnostics = await nfcModule.collectNfcDiagnostics({ error: error.message });
    console.error('NFC诊断信息:', diagnostics);

    swipeTip.textContent = `启动NFC失败：${nfcModule.explainNfcScanError(error, diagnostics)}`;
    swipeTip.style.color = '#eb4335';
  }
}

// 渲染带高亮的接送人卡片
function renderCandidatesWithHighlight(list) {
  pickupList.innerHTML = "";

  if (list.length === 0) {
    pickupList.innerHTML = '<p class="empty-text">暂无接送人信息</p>';
    return;
  }

  list.forEach((item, index) => {
    const card = document.createElement("article");
    const highlightClass = item.isMatch ? 'pickup-card-highlight' : '';
    card.className = `pickup-card ${highlightClass}`;

    card.innerHTML = `
      <div class="face-photo">
        <img src="${item.photoUrl}" alt="${item.parent || '接送人'}">
      </div>
      <p><strong>幼儿姓名：</strong>${item.child}</p>
      <p><strong>家长姓名：</strong>${item.parent || ''}</p>
      <p><strong>家长角色：</strong>${item.relation || ''}</p>
      <p><strong>电话号码：</strong>${item.phone || ''}</p>
      ${item.isMatch ? '<p class="match-badge">✓ NFC匹配</p>' : ''}
      <button class="confirm-btn" data-index="${index}">确认接送人</button>
    `;

    pickupList.appendChild(card);
  });

  // 绑定确认按钮事件
  document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      confirmPickup(index);
    });
  });
}

// ==================== 原有功能函数 ====================

const records = [];
const pageSize = 5;
let currentPage = 1;
let abnormalPageSize = 5;
let abnormalCurrentPage = 1;
let abnormalRecords = [];

function nowTime() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mmDate = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mmDate}-${dd} ${hh}:${mm}:${ss}`;
}

function addAbnormal(text, childInfo = null) {
  // 添加到数组
  abnormalRecords.unshift({
    timestamp: new Date().toISOString(),
    text,
    child: childInfo
  });

  // 重新渲染异常记录列表
  renderAbnormalRecords();
}

function addRecord(item, result) {
  records.unshift({
    time: nowTime(),
    child: item.child,
    parent: item.parent,
    relation: item.relation,
    result
  });
  currentPage = 1;
  renderRecordPage();
}

function renderRecordPage() {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = records.slice(start, end);

  if (!pageData.length) {
    recordBody.innerHTML = "<tr><td colspan='5'>暂无离园记录</td></tr>";
  } else {
    recordBody.innerHTML = pageData
      .map((row) => `
        <tr>
          <td>${row.time}</td>
          <td>${row.child}</td>
          <td>${row.parent}</td>
          <td>${row.relation}</td>
          <td>${row.result}</td>
        </tr>
      `)
      .join("");
  }

  if (pageInfo) {
    pageInfo.textContent = `共 ${records.length} 条，第 ${currentPage} / ${totalPages} 页`;
  }
  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

function generateCardNo16() {
  let no = "";
  for (let i = 0; i < 16; i += 1) {
    no += Math.floor(Math.random() * 10);
  }
  return no;
}

function buildAvatarDataUri(seedText, label) {
  const colors = ["#A7D8FF", "#B8F2D7", "#FFD9AE", "#E2D4FF", "#FFD0DE"];
  const color = colors[seedText.charCodeAt(0) % colors.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="140">
      <rect width="100%" height="100%" fill="${color}" />
      <circle cx="100" cy="52" r="28" fill="#ffffff" opacity="0.9" />
      <rect x="56" y="86" width="88" height="38" rx="18" fill="#ffffff" opacity="0.85" />
      <text x="100" y="132" text-anchor="middle" font-size="20" fill="#2d4a62">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPickupCandidates(nfcNo) {
  const childNames = ["王小贝", "李晨曦", "陈语桐", "赵一诺", "周子涵"];
  const classNames = ["大一班", "大二班", "中一班", "中二班", "小一班"];
  const familyNames = [
    ["张建国", "李美华", "张国强", "王秀兰"],
    ["李志强", "周晓敏", "李大山", "吴桂芬"],
    ["陈海峰", "赵丽华", "陈德顺", "刘玉兰"],
    ["王东升", "孙梅", "王福生", "孙秀英"]
  ];
  const relations = ["爸爸", "妈妈", "爷爷", "奶奶"];
  // 生成模拟手机号
  const generatePhone = () => '1' + Math.floor(Math.random() * 9 + 1) + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');

  const childIndex = Math.floor(Math.random() * childNames.length);
  const child = childNames[childIndex];
  const className = classNames[childIndex];
  const names = familyNames[Math.floor(Math.random() * familyNames.length)];

  return relations.map((relation, index) => ({
    child,
    className,
    parent: names[index],
    relation,
    phone: generatePhone(), // 添加电话号码
    photoUrl: buildAvatarDataUri(`${nfcNo}-${relation}-${Math.random()}`, relation)
  }));
}

/**
 * 从数据库查询学生及接送人信息
 * @param {string} studentName - 学生姓名（支持模糊搜索）
 * @returns {Promise<Array>} 学生及接送人信息数组
 */
async function fetchStudentsFromDB(studentName) {
  try {
    const response = await fetch(`/api/students/search?name=${encodeURIComponent(studentName)}`);

    if (!response.ok) {
      throw new Error('搜索请求失败');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '搜索失败');
    }

    return result.data;

  } catch (error) {
    console.error('搜索失败:', error);
    throw error;
  }
}

/**
 * 根据数据库查询结果构建接送人数据
 * @param {Array} studentsData - 从数据库查询的学生数据
 * @returns {Array} 接送人候选人数组
 */
async function buildPickupCandidatesFromDB(studentsData) {
  const candidates = [];

  studentsData.forEach(student => {
    student.contacts.forEach(contact => {
      // 处理空值情况
      const parentName = contact.parent_name || '';
      const relationCode = contact.relation;
      const relation = relationCode ? (relationMap[relationCode] || '其他') : '';
      const cellphone = contact.cellphone || '';

      candidates.push({
        child: student.student_name,
        parent: parentName,
        relation: relation,
        phone: cellphone,
        photoUrl: buildAvatarDataUri(
          `${student.id}-${parentName || '未知'}-${relationCode || 0}`,
          relation || '未知'
        ),
        studentId: student.id,
        contactId: contact.id
      });
    });
  });

  return candidates;
}

/**
 * 渲染学生选择列表
 * @param {Array} studentsData - 学生数据数组
 */
function renderStudentSelectList(studentsData) {
  studentSelectList.innerHTML = '';

  studentsData.forEach((student, index) => {
    const item = document.createElement('div');
    item.className = 'student-select-item';
    item.dataset.index = index;

    // 统计该学生的接送人数量
    const contactsCount = student.contacts ? student.contacts.length : 0;

    item.innerHTML = `
      <div class="student-info">
        <div class="student-name">${student.student_name}</div>
        <div class="student-meta">ID: ${student.id} · ${contactsCount} 位接送人</div>
      </div>
      <div class="select-arrow">→</div>
    `;

    item.addEventListener('click', () => {
      selectStudent(index);
    });

    studentSelectList.appendChild(item);
  });

  // 显示学生选择区域
  studentSelectSection.style.display = 'block';
}

/**
 * 选择学生并显示接送人信息
 * @param {number} index - 学生索引
 */
function selectStudent(index) {
  const selectedStudent = tempStudentsData[index];

  if (!selectedStudent) return;

  // 隐藏学生选择区域
  studentSelectSection.style.display = 'none';

  // 设置当前学生信息
  currentChild = {
    id: selectedStudent.id,
    name: selectedStudent.student_name
  };

  // 构建接送人数据
  buildPickupCandidatesFromDB([selectedStudent]).then(candidates => {
    currentCandidates = candidates;

    // 渲染接送人卡片
    renderCandidates(candidates);

    // 更新提示信息
    swipeTip.textContent = `已选择幼儿：${selectedStudent.student_name}，找到 ${candidates.length} 位接送人`;
    swipeTip.style.color = '#1a9c5e';
  });
}

function renderCandidates(list) {
  pickupList.innerHTML = "";
  list.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "pickup-card";
    card.dataset.index = index;
    card.innerHTML = `
      <div class="face-photo" onclick="showLargeImage('${item.photoUrl}', '${item.parent}')">
        <img src="${item.photoUrl}" alt="${item.parent} 人脸照片" style="cursor: pointer;">
      </div>
      <p><strong>幼儿姓名：</strong>${item.child}</p>
      <p><strong>家长姓名：</strong>${item.parent}</p>
      <p><strong>家长角色：</strong>${item.relation}</p>
      <button class="confirm-btn" data-index="${index}" type="button">确认接送人</button>
    `;

    // 添加卡片点击事件
    card.addEventListener('click', (e) => {
      // 如果点击的是确认按钮或人脸照片，不显示菜单
      if (e.target.classList.contains('confirm-btn') || e.target.closest('.face-photo')) {
        return;
      }
      showCardActionMenu(index);
    });

    pickupList.appendChild(card);
  });

  document.querySelectorAll(".confirm-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const index = Number(event.currentTarget.dataset.index);
      const selected = currentCandidates[index];
      if (!selected) return;

      addRecord(selected, "已确认离园");

      // 构建确认提示信息（处理空值情况）
      let confirmMessage = `已确认 ${selected.child}`;
      if (selected.parent || selected.relation) {
        confirmMessage += ` 由 `;
        if (selected.parent) {
          confirmMessage += `${selected.parent}`;
        }
        if (selected.parent && selected.relation) {
          confirmMessage += `（${selected.relation}）`;
        } else if (selected.relation) {
          confirmMessage += `${selected.relation}`;
        }
        confirmMessage += ` 接送离园`;
      } else {
        confirmMessage += ` 的电话号码 ${selected.phone} 接送离园`;
      }
      confirmMessage += `。`;

      swipeTip.textContent = confirmMessage;
      swipeTip.style.color = "#1a9c5e";

      // 清空搜索框和接送人列表
      if (searchInput) {
        searchInput.value = "";
      }
      pickupList.innerHTML = "<p class='empty-text'>请刷NFC，可以输入幼儿姓名或电话号码进行搜索...</p>";
      studentSelectSection.style.display = 'none'; // 隐藏学生选择区域
      currentCandidates = [];
      currentChild = null; // 清空孩子信息
      tempStudentsData = []; // 清空临时数据
    });
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', async () => {
    const searchName = searchInput.value.trim();

    if (!searchName) {
      swipeTip.textContent = '请输入幼儿姓名或电话号码，或使用NFC扫描';
      swipeTip.style.color = '#eb4335';
      return;
    }

    // 检测是否为NFC ID格式: {数字}_{数字}
    const isNfcId = /^\d+_\d{7,15}$/.test(searchName);

    if (isNfcId) {
      // 使用NFC搜索
      await performNfcSearch(searchName);
      return;
    }

    try {
      swipeTip.textContent = '正在搜索...';
      swipeTip.style.color = '#2f63a2';

      // 隐藏学生选择区域
      studentSelectSection.style.display = 'none';
      pickupList.innerHTML = '<p class="empty-text">请刷NFC，可以输入学生姓名或电话号码进行搜索...</p>';

      // 从数据库查询
      const studentsData = await fetchStudentsFromDB(searchName);

      if (studentsData.length === 0) {
        swipeTip.textContent = `未找到匹配的幼儿`;
        swipeTip.style.color = '#cc8a00';
        pickupList.innerHTML = '<p class="empty-text">未找到匹配的幼儿信息</p>';
        currentCandidates = [];
        currentChild = null;
        tempStudentsData = [];
        return;
      }

      // 判断是否是通过电话号码搜索且结果为多个学生
      const isPhoneNumberSearch = /^\d{7,15}$/.test(searchName.trim());
      const needsSelection = isPhoneNumberSearch && studentsData.length > 1;

      if (needsSelection) {
        // 需要选择学生
        tempStudentsData = studentsData;
        renderStudentSelectList(studentsData);

        swipeTip.textContent = `该电话号码对应 ${studentsData.length} 名学生，请选择`;
        swipeTip.style.color = '#2f63a2';
      } else {
        // 直接显示接送人
        const candidates = await buildPickupCandidatesFromDB(studentsData);
        currentCandidates = candidates;

        // 保存第一个学生的信息
        if (studentsData.length > 0) {
          currentChild = {
            id: studentsData[0].id,
            name: studentsData[0].student_name
          };
        }

        // 渲染接送人卡片
        renderCandidates(candidates);

        swipeTip.textContent = `找到 ${studentsData.length} 名幼儿，${candidates.length} 位接送人`;
        swipeTip.style.color = '#1a9c5e';
      }

    } catch (error) {
      swipeTip.textContent = `搜索失败：${error.message}`;
      swipeTip.style.color = '#eb4335';
      console.error(error);
    }
  });
}

// 支持回车键搜索
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
}

// NFC启动按钮
const startNfcBtn = document.getElementById('startNfcBtn');
if (startNfcBtn) {
  startNfcBtn.addEventListener('click', startNfcScanning);
}

prevPageBtn?.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  renderRecordPage();
});

nextPageBtn?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  if (currentPage >= totalPages) return;
  currentPage += 1;
  renderRecordPage();
});

renderRecordPage();

// 创建大图查看模态框
function createImageModal() {
  const modal = document.createElement("div");
  modal.id = "imageModal";
  modal.className = "image-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="closeImageModal()">&times;</span>
      <img id="modalImage" src="" alt="大图">
      <div id="modalCaption" class="modal-caption"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // 点击模态框背景关闭
  modal.addEventListener("click", (e) => {
    if (e.target.id === "imageModal") {
      closeImageModal();
    }
  });
}

// 显示大图
function showLargeImage(imageSrc, caption) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");

  if (!modal) {
    createImageModal();
  }

  modalImg.src = imageSrc;
  modalCaption.textContent = caption;
  document.getElementById("imageModal").style.display = "flex";
}

// 关闭大图
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// 按ESC键关闭模态框
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeImageModal();
  }
});

// 页面加载时创建模态框
createImageModal();

// 添加离园记录相关功能
const addRecordBtn = document.getElementById("addRecordBtn");
const addRecordModal = document.getElementById("addRecordModal");
const addRecordForm = document.getElementById("addRecordForm");
const recordChildInput = document.getElementById("recordChild");
const recordParentInput = document.getElementById("recordParent");
const recordRelationSelect = document.getElementById("recordRelation");

// 打开添加离园记录弹窗
addRecordBtn?.addEventListener("click", () => {
  if (!currentChild) {
    alert("请先搜索幼儿！");
    return;
  }
  recordChildInput.value = currentChild.name;
  recordParentInput.value = "";
  recordRelationSelect.value = "";
  addRecordModal.style.display = "flex";
  recordParentInput.focus();
});

// 关闭添加离园记录弹窗
function closeAddRecordModal() {
  addRecordModal.style.display = "none";
  addRecordForm.reset();
}

// 点击弹窗外部关闭
addRecordModal?.addEventListener("click", (e) => {
  if (e.target.id === "addRecordModal") {
    closeAddRecordModal();
  }
});

// 表单提交
addRecordForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const parent = recordParentInput.value.trim();
  const relation = recordRelationSelect.value;

  if (!parent || !relation) {
    alert("请填写完整信息！");
    return;
  }

  // 添加离园记录
  const record = {
    child: currentChild.name,
    parent: parent,
    relation: relation
  };
  addRecord(record, "已确认离园");

  // 关闭弹窗
  closeAddRecordModal();

  // 显示成功提示
  swipeTip.textContent = `已添加离园记录：${currentChild.name} 由 ${parent}（${relation}）接送离园。`;
  swipeTip.style.color = "#1a9c5e";
});

// 全局变量保存当前选中的接送人
let selectedCandidateData = null;

// 显示卡片操作菜单
function showCardActionMenu(index) {
  const candidate = currentCandidates[index];
  if (!candidate) return;

  selectedCandidateData = candidate;

  const menu = document.getElementById('cardActionMenu');
  if (menu) {
    menu.style.display = 'flex';
  }
}

// 关闭卡片操作菜单
function closeCardActionMenu() {
  const menu = document.getElementById('cardActionMenu');
  if (menu) {
    menu.style.display = 'none';
  }
  selectedCandidateData = null;
}

// 处理添加备注
function handleAddNote() {
  const candidate = selectedCandidateData;
  if (!candidate) {
    alert('未选择接送人');
    return;
  }

  closeCardActionMenu();

  const note = prompt(`请为 ${candidate.parent}（${candidate.relation}）添加备注：`);
  if (note && note.trim()) {
    addAbnormal(`添加备注：${candidate.parent}（${candidate.relation}）-${note.trim()}`, currentChild);
    alert('备注已添加');
  }
}

// 处理拨打电话
function handleCallPhone() {
  const candidate = selectedCandidateData;
  if (!candidate) {
    alert('未选择接送人');
    return;
  }

  if (!candidate.phone) {
    alert('该联系人暂无电话号码');
    closeCardActionMenu();
    return;
  }

  closeCardActionMenu();

  // 确认拨打电话
  if (confirm(`确定要拨打 ${candidate.parent}（${candidate.relation}）的电话吗？\n电话：${candidate.phone}`)) {
    // 使用 tel: 协议拨打电话
    window.location.href = `tel:${candidate.phone}`;

    // 记录拨打电话的操作
    addAbnormal(`已拨打 ${candidate.parent}（${candidate.relation}）电话：${candidate.phone}`, currentChild);
  }
}

// 绑定操作菜单按钮事件
document.getElementById('addNoteBtn')?.addEventListener('click', handleAddNote);
document.getElementById('callPhoneBtn')?.addEventListener('click', handleCallPhone);

// 点击操作菜单背景关闭
document.getElementById('cardActionMenu')?.addEventListener('click', (e) => {
  if (e.target.id === 'cardActionMenu') {
    closeCardActionMenu();
  }
});

// 异常记录分页相关函数
function renderAbnormalRecords() {
  if (!abnormalList) return;

  if (abnormalRecords.length === 0) {
    abnormalList.innerHTML = '<li>暂无异常记录</li>';
    updateAbnormalPageInfo();
    updateAbnormalPaginationButtons();
    return;
  }

  // 分页逻辑
  const totalPages = Math.max(1, Math.ceil(abnormalRecords.length / abnormalPageSize));
  if (abnormalCurrentPage > totalPages) abnormalCurrentPage = totalPages;

  const start = (abnormalCurrentPage - 1) * abnormalPageSize;
  const end = start + abnormalPageSize;
  const pageData = abnormalRecords.slice(start, end);

  // 渲染当前页数据
  abnormalList.innerHTML = pageData.map(record => {
    const date = new Date(record.timestamp);
    let displayText = nowTime();

    if (record.child && record.child.name) {
      displayText += ` ${record.child.name}`;
    }

    displayText += ` ${record.text}`;
    return `<li>${displayText}</li>`;
  }).join('');

  updateAbnormalPageInfo();
  updateAbnormalPaginationButtons();
}

function updateAbnormalPageInfo() {
  const totalPages = Math.max(1, Math.ceil(abnormalRecords.length / abnormalPageSize));
  const totalRecords = abnormalRecords.length;
  const abnormalPageInfo = document.getElementById('abnormalPageInfo');

  if (abnormalPageInfo) {
    abnormalPageInfo.textContent = `共 ${totalRecords} 条，第 ${abnormalCurrentPage} / ${totalPages} 页`;
  }
}

function updateAbnormalPaginationButtons() {
  const totalPages = Math.max(1, Math.ceil(abnormalRecords.length / abnormalPageSize));
  const abnormalPrevPageBtn = document.getElementById('abnormalPrevPageBtn');
  const abnormalNextPageBtn = document.getElementById('abnormalNextPageBtn');

  if (abnormalPrevPageBtn) {
    abnormalPrevPageBtn.disabled = abnormalCurrentPage <= 1;
  }

  if (abnormalNextPageBtn) {
    abnormalNextPageBtn.disabled = abnormalCurrentPage >= totalPages;
  }
}

// 异常记录翻页按钮事件
document.getElementById('abnormalPrevPageBtn')?.addEventListener('click', () => {
  if (abnormalCurrentPage <= 1) return;
  abnormalCurrentPage -= 1;
  renderAbnormalRecords();
});

document.getElementById('abnormalNextPageBtn')?.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(abnormalRecords.length / abnormalPageSize));
  if (abnormalCurrentPage >= totalPages) return;
  abnormalCurrentPage += 1;
  renderAbnormalRecords();
});

// 异常记录每页条数选择器事件
document.getElementById('abnormalPageSize')?.addEventListener('change', (e) => {
  abnormalPageSize = parseInt(e.target.value);
  abnormalCurrentPage = 1;
  renderAbnormalRecords();
  alert(`异常记录每页显示 ${abnormalPageSize} 条`);
});

// 离园记录每页条数选择器事件
document.getElementById('recordPageSize')?.addEventListener('change', (e) => {
  pageSize = parseInt(e.target.value);
  currentPage = 1;
  renderRecordPage();
  alert(`每页显示 ${pageSize} 条记录`);
});
