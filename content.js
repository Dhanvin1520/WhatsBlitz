function sendMessageToContact(contact) {
  const trySending = setInterval(() => {
    const searchBox = document.querySelector('div[title="Search input textbox"]');
    if (!searchBox) return;

    clearInterval(trySending);
    const contactIdentifier = contact.name || contact.number;
    const message = (contact.message || "").replace(/{{name}}/g, contact.name || "");

  
    searchBox.textContent = contactIdentifier;
    searchBox.focus();
    searchBox.dispatchEvent(new InputEvent('input', { bubbles: true }));

    setTimeout(() => {
      const result = document.querySelector(`span[title="${contactIdentifier}"]`);
      if (!result) return console.error("❌ Contact not found:", contactIdentifier);

      result.click();

      setTimeout(() => {
        const msgBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
        if (!msgBox) return console.error("❌ Message box not found");

        msgBox.textContent = message;
        msgBox.dispatchEvent(new InputEvent("input", { bubbles: true }));

        setTimeout(() => {
          const sendBtn = document.querySelector('span[data-icon="send"]');
          if (sendBtn) sendBtn.click();
          else console.error("❌ Send button not found");
        }, 500);
      }, 1500);
    }, 1500);
  }, 1000);
}