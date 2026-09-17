const $ = (selector) => document.querySelector(selector);
const count = $('#userCount');
const bar = $('#progressBar');
const toast = $('#toast');

fetch('/api/stats').then(response => response.json()).then(stats => {
  count.textContent = stats.count;
  bar.style.width = `${Math.min(stats.count / stats.goal * 100, 100)}%`;
}).catch(() => {});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

$('#copyLink').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('https://orbit.so/join/yujeo'); } catch (_) {}
  showToast('초대 링크를 복사했어요');
});

$('#newCampaign').addEventListener('click', () => showToast('새 캠페인 설정은 곧 열립니다'));

$('#loadMore').addEventListener('click', (event) => {
  const row = document.createElement('tr');
  row.innerHTML = '<td><span class="person-avatar lilac">A</span><span class="person-name">Alex Morgan</span></td><td><span class="source-dot coral"></span> Friend referral</td><td><span class="tag confirmed">Confirmed</span></td><td class="muted">2 hrs ago</td>';
  $('#activityRows').appendChild(row);
  event.currentTarget.textContent = 'All activity loaded';
  event.currentTarget.disabled = true;
  showToast('활동 내역을 업데이트했어요');
});
