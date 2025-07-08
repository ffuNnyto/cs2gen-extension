function createToastContainer() {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
}

function throwToast(message) {


    const toastContainer = document.getElementById("toast-container");


    const toast = document.createElement("div");
    toast.classList.add("toast", "show");
    toast.innerText = message;

  
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("show"); 
        setTimeout(() => { toast.remove();}, 500);
    }, 6000);

}