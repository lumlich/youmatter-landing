const navLinks = document.querySelectorAll('a[href^="#"]');
const galleryButtons = document.querySelectorAll(".gallery-card");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const openLightbox = (image) => {
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
};

galleryButtons.forEach((button) => {
  const image = button.querySelector("img");
  button.setAttribute("aria-label", image?.alt || "Open image in full view");

  button.addEventListener("click", () => {
    if (image) {
      openLightbox(image);
    }
  });
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target === lightboxClose) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    closeLightbox();
  }
});
