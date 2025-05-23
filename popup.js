let parsedData = [];

document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("sendFirst").addEventListener("click", () => {
  if (parsedData.length > 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: sendMessageToContact,
        args: [parsedData[0]]
      });
    });
  }
});

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: "binary" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    parsedData = XLSX.utils.sheet_to_json(firstSheet);

    showTable(parsedData);
  };

  reader.readAsBinaryString(file);
}

function showTable(data) {
  const table = document.getElementById("preview");
  table.innerHTML = "<tr><th>Name</th><th>Number</th><th>Message</th></tr>";
  data.forEach(row => {
    const name = row.name || row.Name || "";
    const number = row.number || row.Number || "";
    const message = row.message || row.Message || "";

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td><td>${number}</td><td>${message}</td>`;
    table.appendChild(tr);
  });
}