chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'uploadFile') {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes('web.whatsapp.com')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (fileData) => {
              chrome.runtime.sendMessage({ action: 'parseExcel', fileData });
            },
            args: [request.file]
          });
        } else {
          alert('Please open WhatsApp Web (web.whatsapp.com) first.');
        }
      });
    } else if (request.action === 'startSending') {
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes('web.whatsapp.com')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (contacts) => {
              chrome.runtime.sendMessage({ action: 'sendMessages', contacts });
            },
            args: [request.contacts]
          });
        }
      });
    }
  });