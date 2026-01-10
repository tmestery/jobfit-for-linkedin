const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const DEFAULT_SKILLS = [
  "python","java","javascript","typescript",
  "c++","go","sql","react","node",
  "linux","docker","kubernetes",
  "aws","gcp","azure"
];

function getJobDescription() {
  const el = document.querySelector("#job-details");
  return el ? el.innerText.toLowerCase() : "";
}

function calculateMatch(jobText, skills) {
  let hits = 0;
  skills.forEach(skill => { if(jobText.includes(skill)) hits++; });
  return Math.min(100, Math.round((hits / skills.length) * 100));
}

function updateMeter(score) {
  let meter = document.getElementById("job-fit-meter");

  if (!meter) {
    const anchor = document.querySelector("h1");
    if (!anchor) return;

    meter = document.createElement("div");
    meter.id = "job-fit-meter";
    meter.innerHTML = `
      <span style="font-size:13px;color:#666;">Match</span>
      <div class="jfm-bar">
        <div class="jfm-fill"></div>
      </div>
      <span class="jfm-score"></span>
    `;
    anchor.parentElement.appendChild(meter);
  }

  meter.querySelector(".jfm-fill").style.width = `${score}%`;
  meter.querySelector(".jfm-score").innerText = `${score}%`;
}

async function recompute() {
  await sleep(300); // wait for React to render
  const jobText = getJobDescription();
  if (!jobText) return;

  const score = calculateMatch(jobText, DEFAULT_SKILLS);
  updateMeter(score);
}

// Observe panel changes (SPA navigation)
function observeJobPanel() {
  const target = document.querySelector("#job-details");
  if (!target) return;

  let lastText = target.innerText;

  new MutationObserver(() => {
    if (target.innerText !== lastText) {
      lastText = target.innerText;
      recompute();
    }
  }).observe(target, { childList: true, subtree: true });
}

// Observe full URL changes (real clicks)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(recompute, 1000);
    setTimeout(observeJobPanel, 1200);
  }
}).observe(document.body, { childList: true, subtree: true });

// Initial boot
(async function init() {
  await sleep(2000);
  recompute();
  observeJobPanel();
})();