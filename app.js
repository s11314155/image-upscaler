const $ = (s) => document.querySelector(s);
const fileInput = $("#file"), drop = $("#drop"), list = $("#list"), statusEl = $("#status");
const startBtn = $("#start"), zipBtn = $("#zip");

let items = []; // { file, name, srcUrl, resultUrl, el }
const upscalers = {};

function getModel(quality, scale) {
  const map = {
    slim: { 2: window.ESRGANSlim2x, 4: window.ESRGANSlim4x },
    medium: { 2: window.ESRGANMedium2x, 4: window.ESRGANMedium4x },
  };
  return map[quality][scale];
}

function getUpscaler(quality, scale) {
  const key = quality + scale;
  if (!upscalers[key]) upscalers[key] = new Upscaler({ model: getModel(quality, scale) });
  return upscalers[key];
}

function addFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const srcUrl = URL.createObjectURL(file);
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="compare">
        <figure><img src="${srcUrl}" /><figcaption>原圖</figcaption></figure>
        <figure class="out"><div class="placeholder">等待處理</div><figcaption>放大後</figcaption></figure>
      </div>
      <div class="meta"><span class="name"></span><span class="info"></span></div>
      <progress value="0" max="1"></progress>`;
    el.querySelector(".name").textContent = file.name;
    const img = el.querySelector("img");
    img.onload = () => (el.querySelector(".info").textContent = `${img.naturalWidth} × ${img.naturalHeight}`);
    list.appendChild(el);
    items.push({ file, name: file.name, srcUrl, resultUrl: null, el });
  }
  startBtn.disabled = items.length === 0;
}

fileInput.addEventListener("change", (e) => addFiles(e.target.files));
["dragover", "dragenter"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

startBtn.addEventListener("click", async () => {
  const scale = Number(document.querySelector("input[name=scale]:checked").value);
  const quality = document.querySelector("input[name=quality]:checked").value;
  startBtn.disabled = zipBtn.disabled = true;
  statusEl.textContent = "載入 AI 模型中…（第一次較久）";

  const upscaler = getUpscaler(quality, scale);
  let done = 0;
  for (const item of items) {
    if (item.resultUrl) { done++; continue; }
    const bar = item.el.querySelector("progress");
    const out = item.el.querySelector(".out");
    statusEl.textContent = `處理中 ${done + 1} / ${items.length}：${item.name}`;
    try {
      const img = await loadImage(item.srcUrl);
      const result = await upscaler.upscale(img, {
        output: "base64",
        patchSize: 64,
        padding: 4,
        awaitNextFrame: true,
        progress: (p) => (bar.value = p),
      });
      item.resultUrl = result;
      const outImg = await loadImage(result);
      const base = item.name.replace(/\.[^.]+$/, "");
      out.innerHTML = `<a href="${result}" download="${base}_${scale}x.png" title="點擊下載"><img src="${result}" /></a>
        <figcaption>放大後 ${outImg.naturalWidth} × ${outImg.naturalHeight}（點圖下載）</figcaption>`;
      item.downloadName = `${base}_${scale}x.png`;
      bar.value = 1;
    } catch (err) {
      console.error(err);
      out.querySelector(".placeholder").textContent = "處理失敗：" + err.message;
    }
    done++;
  }
  statusEl.textContent = "✅ 全部完成！";
  startBtn.disabled = false;
  zipBtn.disabled = !items.some((i) => i.resultUrl);
});

zipBtn.addEventListener("click", async () => {
  const zip = new JSZip();
  for (const i of items) {
    if (i.resultUrl) zip.file(i.downloadName, i.resultUrl.split(",")[1], { base64: true });
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "upscaled_images.zip";
  a.click();
});
