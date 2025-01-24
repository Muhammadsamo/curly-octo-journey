gsap.registerPlugin(SplitText);
// on DOM ready
document.addEventListener("DOMContentLoaded", function () {
  const hero2Content = document.querySelector(".c-hero2 .content");

  // Hero-2 Split text
  const titleMaskingText = document.querySelectorAll(
    ".title .masking-text .line"
  );
  const centerMaskingText = document.querySelectorAll(
    ".center .masking-text .line"
  );
  const footerMaskingText = document.querySelectorAll(
    ".footer .masking-text .line"
  );
  const currentSlideNumber = document.querySelector(
    ".line-move.current .current_inner"
  );
  const previewLoading = document.querySelector(".preview_bar .preview_fill");

  const tl1 = gsap.timeline({
    defaults: { duration: 1, ease: "power2.inOut" },
  });

  const titleMaskingTextSplit = new SplitText(titleMaskingText, {
    type: "words,chars",
    charClass: "char",
  });

  const centerMaskingTextSplit = new SplitText(centerMaskingText, {
    type: "words,chars",
    charClass: "char",
  });

  const footerMaskingTextSplit = new SplitText(footerMaskingText, {
    type: "lines",
  });
  chars = titleMaskingTextSplit.chars;
  centerChars = centerMaskingTextSplit.chars;
  footerLines = footerMaskingTextSplit.lines;

  gsap.set(".masking-text .line", { perspective: 400 });

  tl1
    .from(chars, {
      duration: 0.6,
      y: 200,
      ease: "power1.out",
      stagger: 0.02,
    }, ">")
    .from(
      centerChars,
      {
        duration: 0.6,
        y: 200,
        ease: "power1.out",
        stagger: 0.02,
      },
      "<"
    )
    .from(
      footerLines,
      {
        duration: 0.6,
        y: 200,
        ease: "power1.out",
        stagger: 0.06,
      },
      "<"
    )
    .to(
      currentSlideNumber,
      {
        y: "-100%",
        duration: 0.6,
        ease: "power1.out",
      },
      "<"
    ).to(previewLoading, {
      duration: 4,
      transform: "scaleX(1)",
      ease: "none",
      onComplete: () => {
        tl1.restart();
      }
    });

  hero2Content.addEventListener("click", () => {
    tl1.restart();
  });
});

// Infinite Marquee Function
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);

  config = config || {};
  let tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
    totalWidth,
    curX,
    distanceToStart,
    distanceToLoop,
    item,
    i;
  gsap.set(items, {
    // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
          gsap.getProperty(el, "xPercent")
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });
  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      gsap.getProperty(items[length - 1], "scaleX") +
    (parseFloat(config.paddingRight) || 0);
  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, "scaleX"); // Original right to left Start
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    );

    tl.fromTo(
      item,
      {
        xPercent: snap(
          ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
        ),
      },
      {
        xPercent: xPercents[i],
        duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond
    )

      // Left to Right START
      //       tl.fromTo(item,
      //         {xPercent: snap((curX - distanceToLoop) / widths[i])},
      //         {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100),
      //          duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
      //          immediateRender: false}, 0)

      //      tl.fromTo(item,
      //         {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)},
      //         {xPercent: (snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)),
      //         duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
      //         immediateRender: false
      //         },
      //         distanceToLoop / pixelsPerSecond)
      // Right to left END

      .add("label" + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }
  function toIndex(index, vars) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2 &&
      (index += index > curIndex ? -length : length); // always go in the shortest direction
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      // if we're wrapping the timeline's playhead, make the proper adjustments
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }
  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true); // pre-render for performance
  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }
  return tl;
}
