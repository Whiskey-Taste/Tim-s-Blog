let currentLang = "en";
let currentPage = 0;
const pageSize = 3;
let allNews = [];
let stackNews = [];

function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.getAttribute("data-" + lang);
  });
  currentPage = 0;
  loadNews();
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

async function loadNews() {
  const rssUrls = {
    tech: {
      en: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/index.xml",
      zh: "https://api.rss2json.com/v1/api.json?rss_url=https://www.ithome.com/rss/",
    },
    stack: {
      en: "https://api.rss2json.com/v1/api.json?rss_url=https://thenewstack.io/feed/",
      zh: "https://api.rss2json.com/v1/api.json?rss_url=https://www.infoq.cn/feed.xml",
    }
  };

  document.getElementById("news-loading").style.display = "block";
  document.getElementById("stack-loading").style.display = "block";
  document.getElementById("news-loading").style.display = "none";
  document.getElementById("stack-loading").style.display = "none";

  try {
    const techRes = await fetch(rssUrls.tech[currentLang]);
    const techData = await techRes.json();
    allNews = techData.items;
    currentPage = 0;
    document.getElementById("news-section").innerHTML = "";
    renderNewsPage();

    const stackRes = await fetch(rssUrls.stack[currentLang]);
    const stackData = await stackRes.json();
    stackNews = stackData.items;
    stackPage = 0;
    document.getElementById("stack-news-section").innerHTML = "";
    renderStackNews(stackData.items);
  } catch (err) {
    console.error("Failed to load news:", err);
    document.getElementById("news-loading").textContent = "Failed to load news.";
  }

  setTimeout(() => {
    if (document.getElementById("stack-news-section").childElementCount === 0 && stackNews.length > 0) {
      renderStackNews(stackNews);
    }
  }, 300);
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
                      ${item.thumbnail
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

let stackPage = 0;

function renderStackNews(stackItems) {
  const container = document.getElementById("stack-news-section");
  const start = stackPage * pageSize;
  const end = start + pageSize;
  const itemsToRender = stackItems.slice(start, end);

  itemsToRender.forEach((item) => {
    let image = item.thumbnail;

    if (!image && item.description) {
      const match = item.description.match(/<img[^>]+src="([^">]+)"/);
      if (match && match[1]) {
        image = match[1];
      }
    }

    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <a href="${item.link}" target="_blank">
        ${image ? `<img src="${image}" loading="lazy" alt="thumbnail">` : ""}
        <h3>${item.title}</h3>
        <p>${stripHTML(item.description).slice(0, 120)}...</p>
      </a>
    `;
    container.appendChild(card);
  });

  stackPage++;
}

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && stackNews.length > 0) {
    renderStackNews(stackNews);
  }
}, {
  rootMargin: "100px"
}).observe(document.getElementById("stack-news-sentinel"));

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