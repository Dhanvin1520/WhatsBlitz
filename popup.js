document.addEventListener('DOMContentLoaded', () => {
  const uploadInput = document.getElementById('excel-upload');
  const startBtn = document.getElementById('start-btn');
  const statusDiv = document.getElementById('status');
  let contacts = [];

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);


      contacts = jsonData.map(row => ({
        phone: String(row['Number'] || '').replace(/\D/g, ''),
        name: row['Name'] || 'Unknown',
        message: row['Message'] || ''
      })).filter(row => row.phone && row.message && row.name !== 'Unknown');

      if (contacts.length > 0) {
        statusDiv.textContent = `Loaded ${contacts.length} valid contacts.`;
        startBtn.disabled = false;

        chrome.runtime.sendMessage({ action: 'uploadFile', file: file });
      } else {
        statusDiv.textContent = 'No valid contacts found in the file.';
        startBtn.disabled = true;
      }
    };
    reader.readAsArrayBuffer(file);
  });

  startBtn.addEventListener('click', () => {
    if (contacts.length > 0) {
      chrome.runtime.sendMessage({ action: 'startSending', contacts });
      statusDiv.textContent = 'Started sending messages...';
      startBtn.disabled = true;
    }
  });
});