const createSidebar = () => {
  const sidebar = document.createElement('div');
  sidebar.id = 'whatsblitz-sidebar';
  sidebar.innerHTML = `
    <div class="whatsblitz-header">WhatsBlitz</div>
    <div class="whatsblitz-content">
      <p>Upload an Excel file (.xlsx or .csv) to start.</p>
      <input type="file" id="excel-upload" accept=".xlsx,.csv" />
      <div id="data-preview"></div>
      <button id="start-btn" disabled>Start Sending</button>
      <div id="progress-bar">Progress: 0%</div>
      <div id="status-log"></div>
    </div>
  `;
  document.body.appendChild(sidebar);


  const uploadInput = document.getElementById('excel-upload');
  uploadInput.addEventListener('dragover', (e) => e.preventDefault());
  uploadInput.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadInput.files = e.dataTransfer.files;
    uploadInput.dispatchEvent(new Event('change'));
  });
};


if (window.location.href.includes('web.whatsapp.com')) {
  createSidebar();
} else {
  alert('Please open WhatsApp Web (web.whatsapp.com) to use WhatsBlitz.');
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseExcel') {
    parseExcelFile(request.fileData);
  } else if (request.action === 'sendMessages') {
    sendMessages(request.contacts);
  }
});


let contacts = [];
function parseExcelFile(fileData) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);


    contacts = jsonData.map(row => ({
      phone: String(row['Number'] || '').replace(/\D/g, ''),
      name: row['Name'] || 'Unknown',
      message: row['Message'] || ''
    })).filter(row => row.phone && row.message && row.name !== 'Unknown');


    const previewDiv = document.getElementById('data-preview');
    previewDiv.innerHTML = `
      <h3>Parsed Contacts (${contacts.length})</h3>
      <table>
        <tr><th>Name</th><th>Number</th><th>Message</th></tr>
        ${contacts.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.message}</td></tr>`).join('')}
      </table>
    `;
    document.getElementById('start-btn').disabled = contacts.length === 0;
  };
  reader.readAsArrayBuffer(fileData);
}


async function sendMessages(contacts) {
  const statusLog = document.getElementById('status-log');
  const progressBar = document.getElementById('progress-bar');
  const searchInputSelector = 'div[title="Search input"]';
  const messageInputSelector = 'div[title="Type a message"]';
  const sendButtonSelector = 'button[aria-label="Send"]';

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const progress = ((i + 1) / contacts.length * 100).toFixed(1);
    progressBar.textContent = `Progress: ${progress}%`;

    try {
 
      let message = contact.message.replace(/{{name}}/g, contact.name);

  
      const searchInput = document.querySelector(searchInputSelector);
      if (!searchInput) throw new Error('Search bar not found');
      searchInput.focus();
      searchInput.textContent = contact.name;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for search results

   
      let contactElement = Array.from(document.querySelectorAll('span[title]')).find(
        el => el.textContent.toLowerCase().includes(contact.name.toLowerCase())
      );


      if (!contactElement) {
        statusLog.innerHTML += `<p style="color: orange;">Name '${contact.name}' not found, trying phone number...</p>`;
        searchInput.textContent = contact.phone;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 2000));

        contactElement = Array.from(document.querySelectorAll('span[title]')).find(
          el => el.textContent.includes(contact.phone)
        );
      }

      if (!contactElement) throw new Error(`Contact not found: ${contact.name} (${contact.phone})`);
      contactElement.click();
      await new Promise(resolve => setTimeout(resolve, 1000));


      const messageInput = document.querySelector(messageInputSelector);
      if (!messageInput) throw new Error('Message input not found');
      messageInput.focus();
      document.execCommand('insertText', false, message);
      await new Promise(resolve => setTimeout(resolve, 500));


      const sendButton = document.querySelector(sendButtonSelector);
      if (!sendButton) throw new Error('Send button not found');
      sendButton.click();

      statusLog.innerHTML += `<p>Sent to ${contact.name} (${contact.phone})</p>`;
    } catch (error) {
      statusLog.innerHTML += `<p style="color: red;">Error for ${contact.name} (${contact.phone}): ${error.message}</p>`;
    }

    
    const delay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  statusLog.innerHTML += `<p style="color: green;">All messages sent!</p>`;
  progressBar.textContent = 'Progress: 100%';
}