const page = document.body.dataset.page;
const classSelect = document.getElementById('classSelect');
const studentSelect = document.getElementById('studentSelect');
const msg = document.getElementById('msg');

function setMessage(text, ok) {
  if (!msg) return;
  msg.textContent = text;
  msg.classList.toggle('success', Boolean(ok));
  msg.classList.toggle('error', !ok);
}

function getSelectedStudentId() {
  return studentSelect ? studentSelect.value.trim() : '';
}

function hasClassAndStudent() {
  if (!classSelect.value || !getSelectedStudentId()) {
    setMessage('請先選擇班級與學生', false);
    return false;
  }
  return true;
}

async function loadStudents() {
  const className = classSelect.value;
  studentSelect.innerHTML = '<option value="">載入中...</option>';
  studentSelect.disabled = true;

  if (!className) {
    studentSelect.innerHTML = '<option value="">請先選班級</option>';
    return;
  }

  try {
    const res = await fetch(`/api/students?class_name=${encodeURIComponent(className)}`);
    const students = await res.json();
    studentSelect.innerHTML = '<option value="">請選擇學生</option>';
    students.forEach((student) => {
      const option = document.createElement('option');
      option.value = student.id;
      option.textContent = student.name;
      studentSelect.appendChild(option);
    });
    studentSelect.disabled = false;
  } catch (error) {
    studentSelect.innerHTML = '<option value="">學生載入失敗</option>';
    setMessage('學生資料載入失敗，請稍後再試', false);
  }
}

if (classSelect && studentSelect) {
  classSelect.addEventListener('change', loadStudents);
}

function medTemplate(index) {
  const wrap = document.createElement('div');
  wrap.className = 'med-item';
  wrap.innerHTML = `
    <span class="med-card-num">藥品 ${index}</span>
    <div class="field-group" style="margin-bottom:0.8rem">
      <label>藥品名稱</label>
      <input type="text" class="med-name" placeholder="例如：感冒藥、維生素 C" />
    </div>
    <span class="field-label">服藥時間</span>
    <div class="timing-row">
      ${['早上', '中午', '晚上', '睡前'].map((time) => `
        <label class="timing-chip">
          <input type="checkbox" value="${time}" />
          <span>${time}</span>
        </label>`).join('')}
    </div>
    <div class="field-group">
      <label>備　註</label>
      <textarea class="med-note" placeholder="劑量、注意事項…"></textarea>
    </div>
    <button type="button" class="delete">✕ 刪除此藥品</button>
  `;
  wrap.querySelector('.delete').addEventListener('click', () => {
    wrap.style.transition = 'opacity 0.25s, transform 0.25s';
    wrap.style.opacity = '0';
    wrap.style.transform = 'translateY(-6px)';
    setTimeout(() => wrap.remove(), 260);
  });
  return wrap;
}

function setupMedicinePage() {
  const medicineList = document.getElementById('medicineList');
  const addMedBtn = document.getElementById('addMedBtn');
  const submitBtn = document.getElementById('submitBtn');
  let medCount = 0;

  function addMedicine() {
    medCount += 1;
    medicineList.appendChild(medTemplate(medCount));
  }

  addMedBtn.addEventListener('click', addMedicine);
  addMedicine();

  submitBtn.addEventListener('click', async () => {
    if (!hasClassAndStudent()) return;

    const meds = Array.from(document.querySelectorAll('.med-item')).map((item) => ({
      name: item.querySelector('.med-name').value,
      note: item.querySelector('.med-note').value,
      times: Array.from(item.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox) => checkbox.value),
    }));

    const payload = {
      class_name: classSelect.value,
      student_id: getSelectedStudentId(),
      medicines: meds,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessage(data.message, data.ok);
    } catch (error) {
      setMessage('送出失敗，請稍後再試', false);
    }
  });
}

function setupParentContactPage() {
  const submitBtn = document.getElementById('parentSubmitBtn');
  const parentNote = document.getElementById('parentNote');

  submitBtn.addEventListener('click', async () => {
    if (!hasClassAndStudent()) return;

    const selectedDays = Array.from(document.querySelectorAll('#contactDays input[type="checkbox"]:checked'))
      .map((checkbox) => checkbox.value);

    const payload = {
      class_name: classSelect.value,
      student_id: getSelectedStudentId(),
      contact_days: selectedDays,
      note: parentNote.value,
    };

    try {
      const res = await fetch('/api/parent-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessage(data.message, data.ok);
    } catch (error) {
      setMessage('送出失敗，請稍後再試', false);
    }
  });
}

if (page === 'medicine') {
  setupMedicinePage();
}

if (page === 'parent-contact') {
  setupParentContactPage();
}
