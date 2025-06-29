document.addEventListener('DOMContentLoaded', () => {
  // Grab all the elements by their exact IDs
  const sendTab        = document.getElementById('sendTab');
  const retrieveTab    = document.getElementById('retrieveTab');
  const sendSection    = document.getElementById('sendSection');
  const retrieveSection= document.getElementById('retrieveSection');
  const sendForm       = document.getElementById('sendForm');
  const emailInput     = document.getElementById('emailInput');
  const emailError     = document.getElementById('emailError');
  const codeResult     = document.getElementById('codeResult');
  const codeDisplay    = document.getElementById('codeDisplay');
  const phoneticDisplay= document.getElementById('phoneticDisplay');
  const timerDisplay   = document.getElementById('timerDisplay');
  const restartBtn     = document.getElementById('restartBtn');
  const retrieveForm   = document.getElementById('retrieveForm');
  const codeInput      = document.getElementById('codeInput');
  const codeError      = document.getElementById('codeError');
  const emailResult    = document.getElementById('emailResult');
  const emailDisplay   = document.getElementById('emailDisplay');
  const copyBtn        = document.getElementById('copyBtn');
  const copyMessage    = document.getElementById('copyMessage');
  const mailtoBtn      = document.getElementById('mailtoBtn');

  // Quick sanity check
  if (!sendTab || !retrieveTab || !sendForm || !retrieveForm) {
    console.error('One of the key elements is missing! Check your index.html IDs.');
    return;
  }

  let timerInterval;
  const phoneticMap = { '1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine' };

  // Tab switching
  function switchTab(tab) {
    if (tab === 'send') {
      sendTab.classList.add('active'); retrieveTab.classList.remove('active');
      sendSection.classList.remove('hidden'); retrieveSection.classList.add('hidden');
    } else {
      retrieveTab.classList.add('active'); sendTab.classList.remove('active');
      retrieveSection.classList.remove('hidden'); sendSection.classList.add('hidden');
    }
  }
  sendTab.addEventListener('click', () => switchTab('send'));
  retrieveTab.addEventListener('click', () => switchTab('retrieve'));

  // SEND flow
  sendForm.addEventListener('submit', async e => {
    e.preventDefault(); emailError.textContent = '';
    if (!emailInput.checkValidity()) {
      emailError.textContent = 'Please enter a valid email address.';
      return;
    }
    try {
      const resp = await fetch('/api/generate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: emailInput.value.trim().toLowerCase() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Generate failed');

      codeDisplay.textContent = data.code;
      phoneticDisplay.textContent = data.code.split('').map(n => phoneticMap[n]||n).join(', ');
      sendForm.classList.add('hidden'); codeResult.classList.remove('hidden');
      if (window.plausible) plausible('Generate Code');

      // timer
      let timeLeft = 300;
      timerDisplay.textContent = '05:00';
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        const mm = String(Math.floor(timeLeft/60)).padStart(2,'0');
        const ss = String(timeLeft%60).padStart(2,'0');
        timerDisplay.textContent = `${mm}:${ss}`;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          alert('Code expired. Please restart.');
        }
      }, 1000);

    } catch (err) {
      emailError.textContent = err.message;
    }
  });

  // Restart
  restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    sendForm.classList.remove('hidden'); codeResult.classList.add('hidden');
    emailInput.value = '';
  });

  // RETRIEVE flow
  retrieveForm.addEventListener('submit', async e => {
    e.preventDefault(); codeError.textContent = '';
    try {
      const resp = await fetch(`/api/retrieve?code=${encodeURIComponent(codeInput.value.trim())}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Retrieve failed');

      emailDisplay.textContent = data.email;
      retrieveForm.classList.add('hidden'); emailResult.classList.remove('hidden');
      if (window.plausible) plausible('Retrieve Email');

      // Copy
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(data.email).then(() => {
          copyMessage.classList.remove('hidden');
          if (window.plausible) plausible('Copy Email');
          setTimeout(() => copyMessage.classList.add('hidden'), 2000);
        });
      };
      // Mailto
      mailtoBtn.onclick = () => {
        window.location.href = `mailto:${data.email}`;
        if (window.plausible) plausible('Open Mailto');
      };

    } catch (err) {
      codeError.textContent = err.message;
    }
  });
});
