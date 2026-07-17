const galleryImages = [
  {
    src: "assets/gallery/01-wedding-film.jpg",
    alt: "Anteprima wedding film",
    title: "Wedding Film",
    tone: "#2f2922",
  },
  {
    src: "assets/gallery/02-music-video.jpg",
    alt: "Anteprima videoclip musicale",
    title: "Music Video",
    tone: "#23333b",
  },
  {
    src: "assets/gallery/03-brand-story.jpg",
    alt: "Anteprima brand story",
    title: "Brand Story",
    tone: "#3a2c27",
  },
  {
    src: "assets/gallery/04-event-reportage.jpg",
    alt: "Anteprima reportage evento",
    title: "Event Reportage",
    tone: "#29352e",
  },
  {
    src: "assets/gallery/05-portrait-session.jpg",
    alt: "Anteprima sessione ritratto",
    title: "Portrait Session",
    tone: "#382b36",
  },
  {
    src: "assets/gallery/06-commercial.jpg",
    alt: "Anteprima contenuto commerciale",
    title: "Commercial",
    tone: "#34343a",
  },
  {
    src: "assets/gallery/07-drone-view.jpg",
    alt: "Anteprima riprese drone",
    title: "Drone View",
    tone: "#283d40",
  },
  {
    src: "assets/gallery/08-editorial-photo.jpg",
    alt: "Anteprima fotografia editoriale",
    title: "Editorial Photo",
    tone: "#3b3227",
  },
  {
    src: "assets/gallery/09-behind-scenes.jpg",
    alt: "Anteprima backstage",
    title: "Behind Scenes",
    tone: "#2c2f32",
  },
];

const track = document.querySelector("#carouselTrack");
let startIndex = 0;

function createCard(image, className = "") {
  const article = document.createElement("article");
  article.className = `gallery-card ${className}`.trim();
  article.dataset.title = image.title;
  article.style.setProperty("--card-tone", image.tone);

  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt;
  img.loading = "eager";
  img.addEventListener("error", () => img.remove());

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
