window.addEventListener("start-whatsblitz", () => {
  chrome.storage.local.get("contacts", ({ contacts }) => {
    if (!contacts || !Array.isArray(contacts)) {
      alert("No contacts found.");
      return;
    }
    
    let index = 0;

    function sendMessage() {
      if (index >= contacts.length) {
        alert("All messages sent!");
        return;
      }

      const { Name, Phone, Message } = contacts[index];
      const personalizedMsg = Message.replace(/\{\{name\}\}/gi, Name);

      // Step 1: Search contact
      const searchBox = document.querySelector("div[contenteditable='true'][data-tab='3']");
      if (!searchBox) {
        alert("WhatsApp Web is not ready.");
        return;
      }
      searchBox.focus();
      document.execCommand("insertText", false, Phone);

      setTimeout(() => {
        const contact = document.querySelector("span[title='" + Phone + "']");
        if (contact) {
          contact.click();

          setTimeout(() => {
            const msgBox = document.querySelector("div[contenteditable='true'][data-tab='10']");
            if (msgBox) {
              msgBox.focus();
              document.execCommand("insertText", false, personalizedMsg);
              const sendBtn = document.querySelector("span[data-icon='send']");
              if (sendBtn) {
                sendBtn.click();
              }
              index++;
              const delay = Math.floor(Math.random() * 10000) + 5000;
              setTimeout(sendMessage, delay);
            } else {
              alert("Message box not found.");
            }
          }, 2000);
        } else {
          alert("Contact not found: " + Phone);
        }
      }, 3000);
    }

    sendMessage();
  });
});