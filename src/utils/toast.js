// Simple toast implementation
const toast = {
  success: (message) => {
    console.log('✅ Success:', message);
    // Create a temporary div for better notifications
    const toastDiv = document.createElement('div');
    toastDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      toastDiv.remove();
    }, 3000);
  },
  error: (message) => {
    console.error('❌ Error:', message);
    // Create a temporary div for better notifications
    const toastDiv = document.createElement('div');
    toastDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      toastDiv.remove();
    }, 3000);
  },
  info: (message) => {
    console.log('ℹ️ Info:', message);
    // Create a temporary div for better notifications
    const toastDiv = document.createElement('div');
    toastDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      toastDiv.remove();
    }, 3000);
  }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default toast;