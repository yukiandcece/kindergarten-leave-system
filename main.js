const tabButtons = document.querySelectorAll(".terminal-tabs .tab");
const currentTerminalText = document.getElementById("currentTerminalText");
const phoneInput = document.getElementById("phone");
const codeInput = document.getElementById("code");
const getCodeBtn = document.getElementById("getCodeBtn");
const loginBtn = document.getElementById("loginBtn");

let selectedTarget = "entry-shoot";

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((item) => item.classList.remove("tab-active"));
    btn.classList.add("tab-active");
    const terminalLabel = btn.dataset.terminalLabel || "";
    selectedTarget = btn.dataset.target || "entry-shoot";
    currentTerminalText.textContent = `当前终端：${terminalLabel}`;
  });
});

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  });
}

if (codeInput) {
  codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 4);
  });
}

if (getCodeBtn) {
  let countdownTimer = null;
  getCodeBtn.addEventListener("click", () => {
    if (!phoneInput || phoneInput.value.length !== 11) {
      alert("请先输入11位手机号");
      return;
    }
    if (countdownTimer) return;
    let remain = 60;
    getCodeBtn.disabled = true;
    getCodeBtn.textContent = `${remain}s`;

    countdownTimer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        getCodeBtn.disabled = false;
        getCodeBtn.textContent = "获取验证码";
        return;
      }
      getCodeBtn.textContent = `${remain}s`;
    }, 1000);
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const code = codeInput ? codeInput.value.trim() : "";

    if (phone.length !== 11) {
      alert("手机号必须为11位数字");
      return;
    }
    if (code.length !== 4) {
      alert("验证码必须为4位数字");
      return;
    }

    if (selectedTarget === "leave-detail.html") {
      window.location.href = "./leave-detail.html";
      return;
    }

    alert("登录成功（演示）");
  });
}
