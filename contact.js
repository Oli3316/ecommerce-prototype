(function(){
  emailjs.init("SiJdhKM8cxQrVxJ7H"); 
})();

document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("form");
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
      .then(() => {
        form.reset();
        showToast("✅ Mensaje enviado correctamente");

       
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);

      }, (err) => {
        console.error("Error al enviar el mensaje:", err);
        showToast("❌ Error al enviar el mensaje", true);
      });
  });
});


function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.innerHTML = message;
  
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.backgroundColor = "#ffffff"; 
  toast.style.color = "#000000";           
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  toast.style.zIndex = "9999";
  toast.style.fontWeight = "bold";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);


  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

 
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}
