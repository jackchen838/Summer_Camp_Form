const classSelect = document.getElementById('classSelect');
const studentSelect = document.getElementById('studentSelect');
const medicineList = document.getElementById('medicineList');
const addMedBtn = document.getElementById('addMedBtn');
const submitBtn = document.getElementById('submitBtn');
const msg = document.getElementById('msg');

function medTemplate() {
  const wrap = document.createElement('div');
  wrap.className = 'med-item';
  wrap.innerHTML = `
    <label>藥品名稱<input class="med-name" placeholder="例如：感冒藥" /></label>
    <div class="times">
      ${['早上','中午','晚上','睡前'].map(t => `<label><input type="checkbox" value="${t}"/>${t}</label>`).join('')}
    </div>
    <label>備註<input class="med-note" placeholder="劑量/注意事項" /></label>
    <button type="button" class="delete">刪除</button>
  `;
  wrap.querySelector('.delete').addEventListener('click', () => wrap.remove());
  return wrap;
}

addMedBtn.addEventListener('click', () => medicineList.appendChild(medTemplate()));
medicineList.appendChild(medTemplate());

classSelect.addEventListener('change', async () => {
  const className = classSelect.value;
  studentSelect.innerHTML = '<option value="">載入中...</option>';
  studentSelect.disabled = true;
  if (!className) {
    studentSelect.innerHTML = '<option value="">請先選班級</option>';
    return;
  }
  const res = await fetch(`/api/students?class_name=${encodeURIComponent(className)}`);
  const students = await res.json();
  studentSelect.innerHTML = '<option value="">請選擇學生</option>';
  students.forEach(s => {
    const op = document.createElement('option');
    op.value = s.id;
    op.textContent = s.name;
    studentSelect.appendChild(op);
  });
  studentSelect.disabled = false;
});

submitBtn.addEventListener('click', async () => {
  const meds = Array.from(document.querySelectorAll('.med-item')).map(item => ({
    name: item.querySelector('.med-name').value,
    note: item.querySelector('.med-note').value,
    times: Array.from(item.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value)
  }));

  const payload = {
    class_name: classSelect.value,
    student_id: Number(studentSelect.value),
    medicines: meds
  };

  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  msg.textContent = data.message;
  msg.style.color = data.ok ? 'green' : 'red';
});
