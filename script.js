let currentLang = "en";
let currentPage = 0;
const pageSize = 3;
let allNews = [];

function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.getAttribute("data-" + lang);
  });
  currentPage = 0;
  loadTechNews();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  document.getElementById("back-to-top").style.display =
    window.scrollY > 300 ? "block" : "none";
});

function openModal(title, content) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-content").innerHTML = content;
  document.getElementById("news-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("news-modal").style.display = "none";
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

async function loadTechNews() {
  const rssUrls = {
    en: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/index.xml",
    zh: "https://api.rss2json.com/v1/api.json?rss_url=https://www.ithome.com/rss/",
  };

  document.getElementById("news-loading").style.display = "block";
  try {
    const res = await fetch(rssUrls[currentLang]);
    const data = await res.json();
    allNews = data.items;
    currentPage = 0;
    document.getElementById("news-section").innerHTML = "";
    document.getElementById("news-loading").style.display = "none";
    renderNewsPage();
  } catch (err) {
    console.error("Failed to load news:", err);
    document.getElementById("news-loading").textContent =
      "Failed to load news.";
  }
}

function renderNewsPage() {
  const newsSection = document.getElementById("news-section");
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const newsToRender = allNews.slice(start, end);

  newsToRender.forEach((item) => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `<a href="${item.link}" target="_blank">
                      ${
                        item.thumbnail
                          ? `<img src="${item.thumbnail}" loading="lazy" alt="thumbnail">`
                          : ""
                      }
                      <h3>${item.title}</h3>
                      <p>${item.description.slice(0, 120)}...</p>
                    </a>`;
    newsSection.appendChild(card);
  });

  currentPage++;
}

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) renderNewsPage();
  },
  {
    rootMargin: "100px",
  }
);

observer.observe(document.getElementById("news-sentinel"));

switchLanguage("en");