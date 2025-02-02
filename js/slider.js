const defaultImages = [
  { src: "images/1.jpg", alt: "big cars" },
  { src: "images/2.jpg", alt: "car1" },
  { src: "images/3.jpg", alt: "car2" },
  { src: "images/4.jpg", alt: "car3" },
  { src: "images/5.jpg", alt: "car with parrot" }
];

function generateSliderLayout() {
  return `<div class="slider">
    <div class="slides"></div>

    <div class="controls">
      <button type="button" class="prev-btn" data-action="prev"></button>
      <button type="button" class="next-btn" data-action="next"></button>
    </div>
  
    <div class="indicators"></div>
  </div>`;
}

function initializeSlider(imagesArray = defaultImages) {
  const INTERVAL = 3000;
  let currentSlide = 0;
  const slidesElement = document.querySelector(".slides");
  const indicatorsElement = document.querySelector(".indicators");
  const DEFAULT_ACTION = "next";

  const dragging = {
    startX: 0,
    endX: 0
  };

  let isOnPause = false;

  function generateSlider() {
    imagesArray.forEach((image, index) => {
      // 1. generate slides
      generateSlide(image, index, slidesElement);

      // 2. generate indicators
      generateIndicator(index, indicatorsElement);
    });
  }

  function generateSlide(image, index, parent) {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    if (index === 0) {
      slide.classList.add("active");
    }

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    slide.appendChild(img);

    parent.appendChild(slide);
  }

  function generateIndicator(index, parent) {
    const indicator = document.createElement("div");
    indicator.classList.add("indicator");
    if (index === 0) {
      indicator.classList.add("active");
    }

    indicator.setAttribute("data-id", index);
    parent.appendChild(indicator);
  }

  generateSlider();

  function changeSlide(action = DEFAULT_ACTION, slideNumber = null) {
    slidesElement.children[currentSlide].classList.remove("active");
    indicatorsElement.children[currentSlide].classList.remove("active");

    if (action || slideNumber !== null) {
      clearInterval(timer);
      timer = setInterval(changeSlide, INTERVAL);
    }

    if (slideNumber !== null) {
      currentSlide = slideNumber;
    } else {
      const lastElement = slidesElement.children.length - 1;

      if (action === "prev") {
        currentSlide = currentSlide === 0 ? lastElement : currentSlide - 1;
      } else {
        currentSlide = currentSlide === lastElement ? 0 : currentSlide + 1;
      }
    }

    slidesElement.children[currentSlide].classList.add("active");
    indicatorsElement.children[currentSlide].classList.add("active");
  }

  let timer = setInterval(changeSlide, INTERVAL);

  document.querySelector(".prev-btn").addEventListener("click", () => {
    changeSlide("prev");
    document.activeElement.blur(); // Remove focus from the button
  });

  document.querySelector(".next-btn").addEventListener("click", () => {
    changeSlide("next");
    document.activeElement.blur();
  });

  document.querySelector(".indicators").addEventListener("click", (event) => {
    if (
      event.target.tagName === "DIV" &&
      event.target.classList.contains("indicator")
    ) {
      const indicatorId = parseInt(event.target.getAttribute("data-id"));

      changeSlide(null, indicatorId);
    }
  });

  document.querySelector(".controls").addEventListener("touchstart", (event) => {
    dragging.startX = event.touches[0].clientX;
  });

  document.querySelector(".controls").addEventListener("touchend", (event) => {
    dragging.endX = event.changedTouches[0].clientX;

    if (dragging.startX < dragging.endX) {
      changeSlide("prev");
    } else {
      changeSlide("next");
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") {
      changeSlide("prev");
    }

    if (event.code === "ArrowRight") {
      changeSlide("next");
    }

    if (event.code !== "Space") {
      return;
    }

    if (isOnPause) {
      if (!timer) {
        timer = setInterval(changeSlide, INTERVAL);
      }
    } else {
      clearInterval(timer);
      timer = null;
    }

    isOnPause = !isOnPause;
  });

}
