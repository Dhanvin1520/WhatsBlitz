document.getElementById("fileInput").addEventListener("change", handleFile, false);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const tableBody = document.querySelector("#previewTable tbody");
      tableBody.innerHTML = "";

      jsonData.forEach((row, index) => {
        if (!row || typeof row !== "object") return;

        const name = row["Name"] || "";
        const number = row["Number"] || "";
        const rawMessage = typeof row["Message"] === "string" ? row["Message"] : "";

        const message = rawMessage.replace("{{name}}", name);

        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${name}</td><td>${number}</td><td>${message}</td>`;
        tableBody.appendChild(tr);
      });

      console.log("Parsed Data:", jsonData);
    } catch (err) {
      console.error("Error parsing file:", err);
      alert("There was an error reading the file. Please check the format.");
    }
  };

  reader.readAsArrayBuffer(file);
}