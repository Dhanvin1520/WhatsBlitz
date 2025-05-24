document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    chrome.storage.local.set({ contacts: jsonData }, () => {
      alert("Contacts loaded. Now click Start Messaging.");
    });
  };
  reader.readAsArrayBuffer(file);
});

document.getElementById("startBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => window.dispatchEvent(new Event("start-whatsblitz"))
    });
  });
});
