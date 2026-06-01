const config = window.PAGE_VARIANT || {};

const modalBackdrop = document.getElementById("modalBackdrop");
const banner = document.getElementById("promoBanner");
const closeModalButton = document.getElementById("closeModal");
const closeBannerButton = document.getElementById("closeBanner");

const popupKicker = document.getElementById("popupKicker");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");
const popupButton = document.getElementById("popupButton");
const bannerTitle = document.getElementById("bannerTitle");
const bannerText = document.getElementById("bannerText");
const bannerLink = document.getElementById("bannerLink");
const variantField = document.getElementById("variantField");

const sessionKey = `popup-seen-${config.name || "default"}`;

function hasSeenThisSession() {
  return sessionStorage.getItem(sessionKey) === "1";
}

variantField.value = config.name || "";

if (config.type === "banner") {
  popupKicker.textContent = config.kicker || "";
  popupTitle.textContent = config.title || "";
  popupText.textContent = config.text || "";
  popupButton.textContent = config.buttonText || "Join beta";

  bannerTitle.textContent = config.bannerTitle || "Partner with us";
  bannerText.textContent = config.bannerText || "";
  bannerLink.textContent = config.buttonText || "Apply now";
  bannerLink.href = config.bannerHref || "/partners.html#collaboration-application";
}

function markSeen() {
  sessionStorage.setItem(sessionKey, "1");
}

function openModal() {
  if (hasSeenThisSession() || config.type === "banner") {
    return;
  }

  markSeen();
  modalBackdrop.hidden = false;
  modalBackdrop.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    const focusTarget = document.getElementById("leadName");
    if (focusTarget) {
      focusTarget.focus();
    }
  });
}

function closeModal() {
  modalBackdrop.hidden = true;
  modalBackdrop.setAttribute("aria-hidden", "true");
}

function openBanner() {
  if (hasSeenThisSession() || config.type !== "banner") {
    return;
  }

  markSeen();
  banner.hidden = false;
}

function closeBanner() {
  banner.hidden = true;
}

function scrollPercent() {
  const doc = document.documentElement;
  const maxScroll = doc.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) {
    return 0;
  }
  return window.scrollY / maxScroll;
}

function removeScrollListener(listener) {
  window.removeEventListener("scroll", listener);
}

function bindScrollTrigger(threshold, callback) {
  const onScroll = () => {
    if (scrollPercent() >= threshold) {
      removeScrollListener(onScroll);
      callback();
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function bindExitIntent(callback) {
  const onMouseOut = (event) => {
    if (event.relatedTarget || event.toElement) {
      return;
    }
    if (event.clientY <= 0) {
      document.removeEventListener("mouseout", onMouseOut);
      callback();
    }
  };

  document.addEventListener("mouseout", onMouseOut);
}

closeModalButton.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

closeBannerButton.addEventListener("click", closeBanner);

if (config.type === "banner") {
  bindScrollTrigger(Number(config.trigger?.value ?? 0.2), openBanner);
} else if (config.trigger?.kind === "delay") {
  window.setTimeout(openModal, Number(config.trigger.value ?? 12000));
} else if (config.trigger?.kind === "scroll") {
  bindScrollTrigger(Number(config.trigger.value ?? 0.6), openModal);
} else if (config.trigger?.kind === "exit") {
  bindExitIntent(openModal);
}
