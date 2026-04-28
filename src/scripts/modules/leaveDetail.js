/**
 * 离园考勤详情页面模块
 * 处理NFC刷卡、接送人确认、离园记录等功能
 */

import toast from '../utils/toast.js';
import modal from '../utils/modal.js';
import { Validators } from '../utils/validators.js';
import { formatDateTime, generateRandomNumber, paginate } from '../utils/helpers.js';
import { getIcon } from '../utils/icons.js';

class LeaveDetailModule {
  constructor() {
    // 数据状态
    this.state = {
      currentCandidates: [], // 当前待确认的接送人列表
      currentChild: null,    // 当前刷卡的孩子信息
      selectedCandidate: null, // 当前选中的接送人
      records: [],           // 离园记录
      abnormalRecords: [],   // 异常记录
      currentPage: 1,        // 离园记录当前页码
      abnormalCurrentPage: 1, // 异常记录当前页码
      pageSize: 5,           // 离园记录每页条数
      abnormalPageSize: 5     // 异常记录每页条数
    };

    this.elements = {};
    this.init();
  }

  /**
   * 初始化模块
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.createImageModal();
    this.loadSavedData();
    this.renderRecords();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      nfcInput: document.getElementById('nfcInput'),
      swipeBtn: document.getElementById('swipeBtn'),
      swipeTip: document.getElementById('swipeTip'),
      pickupList: document.getElementById('pickupList'),
      recordBody: document.getElementById('recordBody'),
      abnormalList: document.getElementById('abnormalList'),
      prevPageBtn: document.getElementById('prevPageBtn'),
      nextPageBtn: document.getElementById('nextPageBtn'),
      pageInfo: document.getElementById('pageInfo'),
      recordPageSize: document.getElementById('recordPageSize'),
      addRecordBtn: document.getElementById('addRecordBtn'),
      addRecordModal: document.getElementById('addRecordModal'),
      addRecordForm: document.getElementById('addRecordForm'),
      recordChildInput: document.getElementById('recordChild'),
      recordParentInput: document.getElementById('recordParent'),
      recordRelationSelect: document.getElementById('recordRelation'),
      cardActionMenu: document.getElementById('cardActionMenu'),
      addNoteBtn: document.getElementById('addNoteBtn'),
      callPhoneBtn: document.getElementById('callPhoneBtn'),
      abnormalPrevPageBtn: document.getElementById('abnormalPrevPageBtn'),
      abnormalNextPageBtn: document.getElementById('abnormalNextPageBtn'),
      abnormalPageInfo: document.getElementById('abnormalPageInfo'),
      abnormalPageSize: document.getElementById('abnormalPageSize')
    };
  }

  /**
   * 绑定事件监听
   */
  bindEvents() {
    // 模拟NFC刷卡按钮
    this.elements.swipeBtn?.addEventListener('click', () => this.handleNFCSwipe());

    // 翻页按钮
    this.elements.prevPageBtn?.addEventListener('click', () => this.handlePrevPage());
    this.elements.nextPageBtn?.addEventListener('click', () => this.handleNextPage());

    // 每页条数选择器
    this.elements.recordPageSize?.addEventListener('change', (e) => this.handlePageSizeChange(e));

    // 异常记录翻页按钮
    this.elements.abnormalPrevPageBtn?.addEventListener('click', () => this.handleAbnormalPrevPage());
    this.elements.abnormalNextPageBtn?.addEventListener('click', () => this.handleAbnormalNextPage());

    // 异常记录每页条数选择器
    this.elements.abnormalPageSize?.addEventListener('change', (e) => this.handleAbnormalPageSizeChange(e));

    // 添加离园记录按钮
    this.elements.addRecordBtn?.addEventListener('click', () => this.openAddRecordModal());

    // 表单提交
    this.elements.addRecordForm?.addEventListener('submit', (e) => this.handleAddRecord(e));

    // 点击模态框背景关闭
    this.elements.addRecordModal?.addEventListener('click', (e) => {
      if (e.target.id === 'addRecordModal') {
        this.closeAddRecordModal();
      }
    });

    // 卡片操作菜单按钮
    this.elements.addNoteBtn?.addEventListener('click', () => this.handleAddNote());
    this.elements.callPhoneBtn?.addEventListener('click', () => this.handleCallPhone());

    // 点击操作菜单背景关闭
    this.elements.cardActionMenu?.addEventListener('click', (e) => {
      if (e.target.id === 'cardActionMenu') {
        this.closeCardActionMenu();
      }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeImageModal();
        this.closeAddRecordModal();
      }
    });
  }

  /**
   * 加载保存的数据
   */
  loadSavedData() {
    // 这里可以从本地存储或API加载数据
    // 目前使用内存数据
  }

  /**
   * 处理NFC刷卡
   */
  handleNFCSwipe() {
    // 生成随机NFC卡号
    const nfcNo = 'NFC' + generateRandomNumber(16);

    // 更新输入框
    if (this.elements.nfcInput) {
      this.elements.nfcInput.value = nfcNo;
    }

    // 构建接送人候选项
    const candidates = this.buildPickupCandidates(nfcNo);
    this.state.currentCandidates = candidates;

    // 保存当前孩子信息
    if (candidates.length > 0) {
      this.state.currentChild = {
        name: candidates[0].child,
        className: candidates[0].className
      };
    }

    // 渲染接送人列表
    this.renderCandidates(candidates);

    // 更新提示信息（包含学生姓名）
    const childName = this.state.currentChild?.name || '';
    this.updateSwipeTip(`NFC卡号 ${nfcNo}，学生 ${childName}，请老师确认接送人`, 'success');

    // 启用操作按钮
    this.setAbnormalButtonsEnabled(true);
  }

  /**
   * 构建接送人候选项数据
   * @param {string} nfcNo - NFC卡号
   * @returns {Array} 接送人候选项列表
   */
  buildPickupCandidates(nfcNo) {
    // 模拟数据
    const childNames = ['王小贝', '李晨曦', '陈语桐', '赵一诺', '周子涵'];
    const classNames = ['大一班', '大二班', '中一班', '中二班', '小一班'];
    const familyNames = [
      ['张建国', '李美华', '张国强', '王秀兰'],
      ['李志强', '周晓敏', '李大山', '吴桂芬'],
      ['陈海峰', '赵丽华', '陈德顺', '刘玉兰'],
      ['王东升', '孙梅', '王福生', '孙秀英']
    ];
    const relations = ['爸爸', '妈妈', '爷爷', '奶奶'];
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
      photoUrl: this.buildAvatarDataUri(`${cardNo}-${relation}-${Math.random()}`, relation)
    }));
  }

  /**
   * 构建头像数据URI
   * @param {string} seedText - 种子文本
   * @param {string} label - 标签
   * @returns {string} SVG数据URI
   */
  buildAvatarDataUri(seedText, label) {
    const colors = ['#A7D8FF', '#B8F2D7', '#FFD9AE', '#E2D4FF', '#FFD0DE'];
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

  /**
   * 渲染接送人候选项
   * @param {Array} candidates - 接送人候选项列表
   */
  renderCandidates(candidates) {
    if (!this.elements.pickupList) return;

    this.elements.pickupList.innerHTML = candidates.map((item, index) => `
      <article class="pickup-card" data-index="${index}">
        <div class="face-photo" onclick="window.leaveDetailModule.showLargeImage('${item.photoUrl}', '${item.parent}')">
          <img src="${item.photoUrl}" alt="${item.parent} 人脸照片">
        </div>
        <p><strong>幼儿：</strong>${item.child}</p>
        <p><strong>接送人：</strong>${item.parent}</p>
        <p><strong>关系：</strong>${item.relation}</p>
        <button class="confirm-btn" data-index="${index}" type="button">确认接送人</button>
      </article>
    `).join('');

    // 绑定卡片点击事件（显示操作菜单）
    this.elements.pickupList.querySelectorAll('.pickup-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // 如果点击的是确认按钮或人脸照片，不显示菜单
        if (e.target.classList.contains('confirm-btn') || e.target.closest('.face-photo')) {
          return;
        }
        const index = parseInt(card.dataset.index);
        this.showCardActionMenu(index, e);
      });
    });

    // 绑定确认按钮事件
    this.elements.pickupList.querySelectorAll('.confirm-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleConfirmPickup(index);
      });
    });
  }

  /**
   * 处理确认接送人
   * @param {number} index - 接送人索引
   */
  handleConfirmPickup(index) {
    const selected = this.state.currentCandidates[index];
    if (!selected) return;

    // 添加离园记录
    this.addRecord({
      child: selected.child,
      parent: selected.parent,
      relation: selected.relation
    }, '已确认离园');

    // 更新提示信息
    this.updateSwipeTip(
      `已确认 ${selected.child} 由 ${selected.parent}（${selected.relation}）接送离园`,
      'success'
    );

    // 清空状态
    this.clearSwipeState();

    toast.success(`确认${selected.parent}接送${selected.child}`);
  }

  /**
   * 添加离园记录
   * @param {Object} data - 记录数据
   * @param {string} result - 结果描述
   */
  addRecord(data, result) {
    this.state.records.unshift({
      time: formatDateTime(),
      child: data.child,
      parent: data.parent,
      relation: data.relation,
      result
    });

    this.state.currentPage = 1;
    this.renderRecords();
  }

  /**
   * 渲染离园记录表格
   */
  renderRecords() {
    if (!this.elements.recordBody) return;

    const { data, currentPage, totalPages } = paginate(
      this.state.records,
      this.state.currentPage,
      this.state.pageSize
    );

    this.state.currentPage = currentPage;

    if (data.length === 0) {
      this.elements.recordBody.innerHTML = '<tr><td colspan="5">暂无离园记录</td></tr>';
    } else {
      this.elements.recordBody.innerHTML = data.map(row => `
        <tr>
          <td>${row.time}</td>
          <td>${row.child}</td>
          <td>${row.parent}</td>
          <td>${row.relation}</td>
          <td>${row.result}</td>
        </tr>
      `).join('');
    }

    this.updatePageInfo();
    this.updatePaginationButtons();
  }

  /**
   * 更新分页信息
   */
  updatePageInfo() {
    const totalPages = Math.max(1, Math.ceil(this.state.records.length / this.state.pageSize));
    const totalRecords = this.state.records.length;

    if (this.elements.pageInfo) {
      this.elements.pageInfo.textContent = `共 ${totalRecords} 条，第 ${this.state.currentPage} / ${totalPages} 页`;
    }
  }

  /**
   * 更新分页按钮状态
   */
  updatePaginationButtons() {
    const totalPages = Math.max(1, Math.ceil(this.state.records.length / this.state.pageSize));

    if (this.elements.prevPageBtn) {
      this.elements.prevPageBtn.disabled = this.state.currentPage <= 1;
    }

    if (this.elements.nextPageBtn) {
      this.elements.nextPageBtn.disabled = this.state.currentPage >= totalPages;
    }
  }

  /**
   * 处理上一页
   */
  handlePrevPage() {
    if (this.state.currentPage <= 1) return;
    this.state.currentPage -= 1;
    this.renderRecords();
  }

  /**
   * 处理下一页
   */
  handleNextPage() {
    const totalPages = Math.max(1, Math.ceil(this.state.records.length / this.state.pageSize));
    if (this.state.currentPage >= totalPages) return;
    this.state.currentPage += 1;
    this.renderRecords();
  }

  /**
   * 处理每页条数变化
   * @param {Event} e - 选择器变化事件
   */
  handlePageSizeChange(e) {
    const newPageSize = parseInt(e.target.value);
    if (newPageSize === this.state.pageSize) return;

    this.state.pageSize = newPageSize;
    this.state.currentPage = 1; // 重置到第一页
    this.renderRecords();

    toast.info(`每页显示 ${newPageSize} 条记录`);
  }

  /**
   * 清空NFC刷卡状态
   */
  clearSwipeState() {
    if (this.elements.nfcInput) {
      this.elements.nfcInput.value = '';
    }

    if (this.elements.pickupList) {
      this.elements.pickupList.innerHTML = '<p class="empty-text">NFC刷卡后展示接送人人脸与关系信息。</p>';
    }

    this.state.currentCandidates = [];
    this.state.currentChild = null;
    this.setAbnormalButtonsEnabled(false);
  }

  /**
   * 更新NFC刷卡提示信息
   * @param {string} message - 提示信息
   * @param {string} type - 类型: 'success', 'error', 'warning'
   */
  updateSwipeTip(message, type = 'info') {
    if (this.elements.swipeTip) {
      this.elements.swipeTip.textContent = message;

      // 设置颜色
      const colors = {
        success: '#1a9c5e',
        error: '#eb4335',
        warning: '#cc8a00',
        info: '#6b7f92'
      };
      this.elements.swipeTip.style.color = colors[type] || colors.info;
    }
  }

  /**
   * 设置异常记录按钮状态
   * @param {boolean} enabled - 是否启用
   */
  setAbnormalButtonsEnabled(enabled) {
    if (this.elements.addRecordBtn) {
      this.elements.addRecordBtn.disabled = !enabled;
    }
  }

  /**
   * 添加异常记录
   * @param {string} text - 异常描述
   */
  addAbnormalRecord(text) {
    const record = {
      time: formatDateTime(),
      childName: this.state.currentChild?.name || '',
      description: text
    };

    this.state.abnormalRecords.unshift(record);
    this.renderAbnormalRecords();
  }

  /**
   * 渲染异常记录
   */
  renderAbnormalRecords() {
    if (!this.elements.abnormalList) return;

    if (this.state.abnormalRecords.length === 0) {
      this.elements.abnormalList.innerHTML = '<li>暂无异常记录</li>';
    } else {
      this.elements.abnormalList.innerHTML = this.state.abnormalRecords.map(record => {
        const childInfo = record.childName ? ` ${record.childName}` : '';
        return `<li>${record.time}${childInfo} ${record.description}</li>`;
      }).join('');
    }
  }

  /**
   * 打开添加离园记录模态框
   */
  openAddRecordModal() {
    if (!this.state.currentChild) {
      toast.warning('请先刷卡获取幼儿信息');
      return;
    }

    if (this.elements.recordChildInput) {
      this.elements.recordChildInput.value = this.state.currentChild.name;
    }
    if (this.elements.recordParentInput) {
      this.elements.recordParentInput.value = '';
    }
    if (this.elements.recordRelationSelect) {
      this.elements.recordRelationSelect.value = '';
    }

    if (this.elements.addRecordModal) {
      this.elements.addRecordModal.style.display = 'flex';
      this.elements.recordParentInput?.focus();
    }
  }

  /**
   * 关闭添加离园记录模态框
   */
  closeAddRecordModal() {
    if (this.elements.addRecordModal) {
      this.elements.addRecordModal.style.display = 'none';
    }
    if (this.elements.addRecordForm) {
      this.elements.addRecordForm.reset();
    }
  }

  /**
   * 处理添加离园记录
   * @param {Event} e - 表单提交事件
   */
  handleAddRecord(e) {
    e.preventDefault();

    const parent = this.elements.recordParentInput?.value.trim();
    const relation = this.elements.recordRelationSelect?.value;

    if (!parent || !relation) {
      toast.error('请填写完整信息');
      return;
    }

    // 添加记录
    this.addRecord({
      child: this.state.currentChild.name,
      parent: parent,
      relation: relation
    }, '已确认离园');

    // 关闭模态框
    this.closeAddRecordModal();

    // 显示成功提示
    this.updateSwipeTip(
      `已添加离园记录：${this.state.currentChild.name} 由 ${parent}（${relation}）接送离园`,
      'success'
    );

    toast.success('离园记录已添加');
  }

  /**
   * 创建图片模态框
   */
  createImageModal() {
    const existingModal = document.getElementById('imageModal');
    if (existingModal) return;

    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close" onclick="window.leaveDetailModule.closeImageModal()">&times;</span>
        <img id="modalImage" src="" alt="大图">
        <div id="modalCaption" class="modal-caption"></div>
      </div>
    `;

    document.body.appendChild(modal);

    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'imageModal') {
        this.closeImageModal();
      }
    });
  }

  /**
   * 显示大图
   * @param {string} imageSrc - 图片地址
   * @param {string} caption - 图片说明
   */
  showLargeImage(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    if (modal && modalImg && modalCaption) {
      modalImg.src = imageSrc;
      modalCaption.textContent = caption;
      modal.style.display = 'flex';
    }
  }

  /**
   * 关闭图片模态框
   */
  closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * 显示卡片操作菜单
   * @param {number} index - 接送人索引
   * @param {Event} event - 点击事件
   */
  showCardActionMenu(index, event) {
    const candidate = this.state.currentCandidates[index];
    if (!candidate) return;

    // 保存当前选中的接送人信息
    this.state.selectedCandidate = candidate;

    // 显示菜单
    if (this.elements.cardActionMenu) {
      this.elements.cardActionMenu.style.display = 'flex';
    }
  }

  /**
   * 关闭卡片操作菜单
   */
  closeCardActionMenu() {
    if (this.elements.cardActionMenu) {
      this.elements.cardActionMenu.style.display = 'none';
    }
    this.state.selectedCandidate = null;
  }

  /**
   * 处理添加备注
   */
  async handleAddNote() {
    const candidate = this.state.selectedCandidate;
    if (!candidate) {
      toast.warning('未选择接送人');
      return;
    }

    this.closeCardActionMenu();

    const note = await modal.prompt(
      `请为 ${candidate.parent}（${candidate.relation}）添加备注：`,
      '添加备注',
      '',
      '添加备注'
    );

    if (note && note.trim()) {
      // 记录到异常记录，包含幼儿信息
      this.addAbnormalRecord(
        `${candidate.parent}（${candidate.relation}）备注：${note.trim()}`,
        this.state.currentChild
      );
      toast.success('备注已添加到异常记录');
    }
  }

  /**
   * 处理拨打电话
   */
  handleCallPhone() {
    const candidate = this.state.selectedCandidate;
    if (!candidate) {
      toast.warning('未选择接送人');
      return;
    }

    if (!candidate.phone) {
      toast.warning('该联系人暂无电话号码');
      this.closeCardActionMenu();
      return;
    }

    this.closeCardActionMenu();

    // 确认拨打电话
    modal.confirm(
      `确定要拨打 ${candidate.parent}（${candidate.relation}）的电话吗？\n电话：${candidate.phone}`,
      `拨打电话 - ${candidate.parent}`
    ).then(confirmed => {
      if (confirmed) {
        // 使用 tel: 协议拨打电话
        window.location.href = `tel:${candidate.phone}`;
        toast.info(`正在拨打 ${candidate.phone}`);

        // 记录到异常记录，包含幼儿信息
        this.addAbnormalRecord(
          `已拨打 ${candidate.parent}（${candidate.relation}）电话：${candidate.phone}`,
          this.state.currentChild
        );
      }
    });
  }

  /**
   * 添加异常记录
   * @param {string} text - 异常描述文本
   * @param {Object} childInfo - 幼儿信息（可选）
   */
  addAbnormalRecord(text, childInfo = null) {
    if (!this.elements.abnormalList) return;

    // 添加到状态数组
    this.state.abnormalRecords.unshift({
      timestamp: new Date().toISOString(),
      text,
      child: childInfo || this.state.currentChild
    });

    // 重新渲染异常记录列表
    this.renderAbnormalRecords();

    toast.success('已添加到异常记录');
  }

  /**
   * 渲染异常记录列表
   */
  renderAbnormalRecords() {
    if (!this.elements.abnormalList) return;

    if (this.state.abnormalRecords.length === 0) {
      this.elements.abnormalList.innerHTML = '<li>暂无异常记录</li>';
      this.updateAbnormalPageInfo();
      this.updateAbnormalPaginationButtons();
      return;
    }

    // 使用分页工具获取当前页数据
    const { data, currentPage, totalPages } = paginate(
      this.state.abnormalRecords,
      this.state.abnormalCurrentPage,
      this.state.abnormalPageSize
    );

    this.state.abnormalCurrentPage = currentPage;

    // 渲染当前页数据
    this.elements.abnormalList.innerHTML = data.map(record => {
      let displayText = formatDateTime(new Date(record.timestamp));

      if (record.child && record.child.name) {
        displayText += ` ${record.child.name}`;
      }

      displayText += ` ${record.text}`;

      return `<li>${displayText}</li>`;
    }).join('');

    this.updateAbnormalPageInfo();
    this.updateAbnormalPaginationButtons();
  }

  /**
   * 更新异常记录分页信息
   */
  updateAbnormalPageInfo() {
    const totalPages = Math.max(1, Math.ceil(this.state.abnormalRecords.length / this.state.abnormalPageSize));
    const totalRecords = this.state.abnormalRecords.length;

    if (this.elements.abnormalPageInfo) {
      this.elements.abnormalPageInfo.textContent = `共 ${totalRecords} 条，第 ${this.state.abnormalCurrentPage} / ${totalPages} 页`;
    }
  }

  /**
   * 更新异常记录分页按钮状态
   */
  updateAbnormalPaginationButtons() {
    const totalPages = Math.max(1, Math.ceil(this.state.abnormalRecords.length / this.state.abnormalPageSize));

    if (this.elements.abnormalPrevPageBtn) {
      this.elements.abnormalPrevPageBtn.disabled = this.state.abnormalCurrentPage <= 1;
    }

    if (this.elements.abnormalNextPageBtn) {
      this.elements.abnormalNextPageBtn.disabled = this.state.abnormalCurrentPage >= totalPages;
    }
  }

  /**
   * 处理异常记录上一页
   */
  handleAbnormalPrevPage() {
    if (this.state.abnormalCurrentPage <= 1) return;
    this.state.abnormalCurrentPage -= 1;
    this.renderAbnormalRecords();
  }

  /**
   * 处理异常记录下一页
   */
  handleAbnormalNextPage() {
    const totalPages = Math.max(1, Math.ceil(this.state.abnormalRecords.length / this.state.abnormalPageSize));
    if (this.state.abnormalCurrentPage >= totalPages) return;
    this.state.abnormalCurrentPage += 1;
    this.renderAbnormalRecords();
  }

  /**
   * 处理异常记录每页条数变化
   * @param {Event} e - 选择器变化事件
   */
  handleAbnormalPageSizeChange(e) {
    const newPageSize = parseInt(e.target.value);
    if (newPageSize === this.state.abnormalPageSize) return;

    this.state.abnormalPageSize = newPageSize;
    this.state.abnormalCurrentPage = 1; // 重置到第一页
    this.renderAbnormalRecords();

    toast.info(`异常记录每页显示 ${newPageSize} 条`);
  }
}

// 初始化模块并将实例挂载到window对象以便HTML中的onclick调用
let leaveDetailModule;
document.addEventListener('DOMContentLoaded', () => {
  leaveDetailModule = new LeaveDetailModule();
  window.leaveDetailModule = leaveDetailModule;
});

export default LeaveDetailModule;