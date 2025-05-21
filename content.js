console.log("✅ WhatsBlitz content script injected");

setTimeout(() => {
  const messageBox = document.querySelector('[contenteditable="true"]');
  console.log("Message Input Box:", messageBox);
}, 2000);