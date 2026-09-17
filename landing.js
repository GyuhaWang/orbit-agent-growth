const form = document.querySelector('#signup');
const toast = document.querySelector('#toast');
const count = document.querySelector('#count');
const referral = new URLSearchParams(location.search).get('ref') || '';
document.querySelector('#referral').value = referral;

fetch('/api/stats').then(response => response.json()).then(stats => { count.textContent = stats.count; }).catch(() => {});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = '신청 중…';
  try {
    const response = await fetch('/api/signup', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'signup failed');
    count.textContent = Math.max(Number(count.textContent), result.position);
    toast.textContent = result.existing ? '이미 신청되어 있어요.' : `신청 완료! 대기 순번은 ${result.position}번입니다.`;
    toast.classList.add('show');
    form.reset();
  } catch (_) {
    toast.textContent = '잠시 후 다시 시도해주세요.';
    toast.classList.add('show');
  } finally {
    button.disabled = false;
    button.innerHTML = '무료 베타 신청하기 <span>→</span>';
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
});
