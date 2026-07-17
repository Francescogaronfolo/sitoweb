const galleryImages = [
  {
    src: "assets/gallery/01-wedding-film.jpg",
    alt: "Anteprima wedding film",
  },
  {
    src: "assets/gallery/02-music-video.jpg",
    alt: "Anteprima videoclip musicale",
  },
  {
    src: "assets/gallery/03-brand-story.jpg",
    alt: "Anteprima brand story",
  },
  {
    src: "assets/gallery/04-event-reportage.jpg",
    alt: "Anteprima reportage evento",
  },
  {
    src: "assets/gallery/05-portrait-session.jpg",
    alt: "Anteprima sessione ritratto",
  },
  {
    src: "assets/gallery/06-commercial.jpg",
    alt: "Anteprima contenuto commerciale",
  },
  {
    src: "assets/gallery/07-drone-view.jpg",
    alt: "Anteprima riprese drone",
  },
  {
    src: "assets/gallery/08-editorial-photo.jpg",
    alt: "Anteprima fotografia editoriale",
  },
  {
    src: "assets/gallery/09-behind-scenes.jpg",
    alt: "Anteprima backstage",
  },
];

const track = document.querySelector("#carouselTrack");
let startIndex = 0;

function createCard(image, className = "") {
  const article = document.createElement("article");
  article.className = `gallery-card ${className}`.trim();

  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt;
  img.loading = "eager";

  article.append(img);
  return article;
}

function visibleImages() {
  return [0, 1, 2].map((offset) => galleryImages[(startIndex + offset) % galleryImages.length]);
}

function renderInitialGallery() {
  track.replaceChildren(...visibleImages().map((image) => createCard(image)));
}

function rotateGallery() {
  const cards = [...track.children];
  const outgoing = cards[cards.length - 1];
  outgoing.classList.add("leaving");

  window.setTimeout(() => {
    outgoing.remove();
    startIndex = (startIndex + galleryImages.length - 1) % galleryImages.length;
    const incoming = createCard(galleryImages[startIndex], "entering");
    track.prepend(incoming);
    window.requestAnimationFrame(() => incoming.classList.remove("entering"));
  }, 540);
}

renderInitialGallery();
window.setInterval(rotateGallery, 3200);
