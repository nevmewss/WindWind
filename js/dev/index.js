(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
const input = document.querySelector("#phone");
const iti = window.intlTelInput(input, {
  initialCountry: "auto",
  // авто-визначення країни за IP (працює через сторонній сервіс); коментуйте, якщо не хочете авто
  geoIpLookup: function(callback) {
    callback("ua");
  },
  utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  separateDialCode: true,
  // показує код країни окремо поруч з прапорцем
  nationalMode: false,
  // зберігати міжнародний формат
  autoHideDialCode: false
  // не ховати код
});
function getE164() {
  if (iti.isValidNumber()) {
    return iti.getNumber();
  } else {
    return null;
  }
}
input.addEventListener("blur", () => {
  const e164 = getE164();
  if (e164) console.log("E.164:", e164);
  else console.log("Невалідний номер");
});
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".page__hero");
  const quiz = document.querySelector(".page__quiz");
  const startBtn = document.querySelector(".hero__btn");
  const questions = document.querySelectorAll(".quiz__ask");
  let current = 0;
  startBtn.addEventListener("click", () => {
    hero.classList.add("hide");
    quiz.classList.add("active");
    showQuestion(0);
  });
  function showQuestion(index) {
    questions.forEach((el, i) => {
      el.classList.remove("active", "hidden-left", "hidden-right");
      if (i < index) el.classList.add("hidden-left");
      if (i > index) el.classList.add("hidden-right");
    });
    questions[index].classList.add("active");
    current = index;
    setupValidation();
    updateButtons();
  }
  function setupValidation() {
    const currentQuestion = questions[current];
    const nextBtn = currentQuestion.querySelector(".quiz__next");
    const inputs = currentQuestion.querySelectorAll(
      "input[type='radio'], input[type='checkbox'], input[type='text'], textarea"
    );
    function checkState() {
      const anyChecked = [...inputs].some((input2) => {
        if (input2.type === "radio" || input2.type === "checkbox") {
          return input2.checked;
        }
        return input2.value.trim().length > 0;
      });
      nextBtn.disabled = !anyChecked;
    }
    checkState();
    inputs.forEach((input2) => {
      input2.addEventListener("input", checkState);
      input2.addEventListener("change", checkState);
    });
  }
  function updateButtons() {
    const prevBtn = questions[current].querySelector(".quiz__prev");
    const nextBtn = questions[current].querySelector(".quiz__next");
    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === questions.length - 1 ? "Завершити" : "Далі";
    prevBtn.onclick = () => {
      if (current > 0) showQuestion(current - 1);
    };
    nextBtn.onclick = () => {
      if (!nextBtn.disabled) {
        if (current < questions.length - 1) showQuestion(current + 1);
        else finishQuiz();
      }
    };
  }
  function finishQuiz() {
    console.log("Форма завершена ✅");
  }
});
