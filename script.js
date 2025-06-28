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
  let storedEmail = '';
  let storedCode = '';

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

  sendForm.addEventListener('submit', e => {
    e.preventDefault();
    emailError.textContent = '';
    if (!emailInput.checkValidity()) {
      emailError.textContent = 'Please enter a valid email address.';
      return;
    }
    storedEmail = emailInput.value.trim();
    storedCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1).join('');
    codeDisplay.textContent = storedCode;
    phoneticDisplay.textContent = storedCode.split('').map(n => phoneticMap[n]).join(', ');
    sendForm.classList.add('hidden');
    codeResult.classList.remove('hidden');
    let timeLeft = 15 * 60;
    timerDisplay.textContent = '15:00';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const seconds = String(timeLeft % 60).padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert('Code expired. Please restart.');
      }
    }, 1000);
  });

  restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    sendForm.classList.remove('hidden');
    codeResult.classList.add('hidden');
    emailInput.value = '';
  });

  retrieveForm.addEventListener('submit', e => {
    e.preventDefault();
    codeError.textContent = '';
    if (codeInput.value.trim() !== storedCode) {
      codeError.textContent = 'Invalid or expired code.';
      return;
    }
    emailDisplay.textContent = storedEmail;
    retrieveForm.classList.add('hidden');
    emailResult.classList.remove('hidden');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(storedEmail);
    });
    mailtoBtn.addEventListener('click', () => {
      window.location.href = `mailto:${storedEmail}`;
    });
  });
});
