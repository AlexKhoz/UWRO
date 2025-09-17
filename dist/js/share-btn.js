document.addEventListener("DOMContentLoaded", () => {
  const shareBtnRoller = document.querySelector(".share-btn__roller");
  const shareBtnText = document.querySelector(".share-btn__text");

  if (!shareBtnRoller || !shareBtnText) return;

  shareBtnRoller.addEventListener("click", () => {
    shareBtnRoller.classList.remove("share-btn__roller--down");
    shareBtnText.classList.remove("share-btn__text--down"); 
    shareBtnRoller.classList.add("share-btn__roller--up");
    shareBtnText.classList.add("share-btn__text--up");
  });

  shareBtnText.addEventListener("click", () => {
    shareBtnRoller.classList.remove("share-btn__roller--up");
    shareBtnText.classList.remove("share-btn__text--up"); 
    shareBtnRoller.classList.add("share-btn__roller--down");
    shareBtnText.classList.add("share-btn__text--down"); 
  });
});