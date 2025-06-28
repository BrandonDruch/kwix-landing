document.addEventListener('DOMContentLoaded', () => {
  const sendTab = document.getElementById('sendTab');
  const retrieveTab = document.getElementById('retrieveTab');
  const sendSection = document.getElementById('sendSection');
  const retrieveSection = document.getElementById('retrieveSection');
  const sendForm = document.getElementById('sendForm');
  const emailInput = document.getElementById('emailInput');
  const emailError = document.getElementById('emailError');
  const codeResult = document.getElementById('codeResult');
  const codeDisplay = document.getElementById('codeDisplay');
  const phoneticDisplay = document.getElementById('phoneticDisplay');
  const timerDisplay = document.getElementById('timerDisplay');
  const restartBtn = document.getElementById('restartBtn');
  const retrieveForm = document.getElementById('retrieveForm');
  const codeInput = document.getElementById('codeInput');
  const codeError = document.getElementById('codeError');
  const emailResult = document.getElementById('emailResult');
  const emailDisplay = document.getElementById('emailDisplay');
  const copyBtn = document.getElementById('copyBtn');
  const mailtoBtn = document.getElementById('mailtoBtn');

  let timerInterval;

  const phoneticMap = {
    '1': 'One', '2': 'Two', '3': 'Three',
    '4': 'Four', '5': 'Five', '6': 'Six',
    '7': 'Seven', '8': 'Eight', '9': 'Nine'
  };

  function switchTab(tab) {
    if (tab === 'send') {
      sendTab.classList.add('active');
      retrieveTab.classList.remove('active');
      sendSection.classList.remove('hidden');
      retrieveSection.classList.add('hidden');
    } else {
      retrieveTab.classList.add('active');
      sendTab.classList.remove('active');
      retrieveSection.classList.remove('hidden');
      sendSection.classList.add('hidden');
    }
  }

  sendTab.addEventListener('click', () => switchTab('send'));
  retrieveTab.addEventListener('click', () => switchTab('retrieve'));

  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    emailError.textContent = '';

    // Front-end validation
    if (!emailInput.checkValidity()) {
      emailError.textContent = 'Please enter a valid email address.';
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate code.');
      }

      const code = data.code;
      codeDisplay.textContent = code;
      phoneticDisplay.textContent = code
        .split('')
        .map((n) => phoneticMap[n] || n)
        .join(', ');
      sendForm.classList.add('hidden');
      codeResult.classList.remove('hidden');

      // Plausible event
      if (window.plausible) plausible('Generate Code');

      // Start timer
      let timeLeft = 300;
      timerDisplay.textContent = '05:00';
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const ss = String(timeLeft % 60).padStart(2, '0');
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

  restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    sendForm.classList.remove('hidden');
    codeResult.classList.add('hidden');
    emailInput.value = '';
  });

  retrieveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    codeError.textContent = '';

    const code = codeInput.value.trim();
    try {
      const resp = await fetch(`/api/retrieve?code=${encodeURIComponent(code)}`);
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to retrieve email.');
      }

      emailDisplay.textContent = data.email;
      retrieveForm.classList.add('hidden');
      emailResult.classList.remove('hidden');

      // Plausible event
      if (window.plausible) plausible('Retrieve Email');

      copyBtn.onclick = () => navigator.clipboard.writeText(data.email);
      mailtoBtn.onclick = () => (window.location.href = `mailto:${data.email}`);

    } catch (err) {
      codeError.textContent = err.message;
    }
  });
});
