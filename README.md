# 🖼️ 圖片解析度提升工具

純網頁版 AI 圖片放大工具，直接在瀏覽器中執行，**圖片不會上傳到任何伺服器**。

👉 **線上使用：https://s11314155.github.io/image-upscaler/**

## 功能
- 🚀 AI 放大（ESRGAN）：快速 / 高畫質兩種模式
- 🔍 支援 2x / 4x 倍率
- 📁 可一次拖曳多張圖片批次處理，一鍵下載 ZIP
- 🔒 完全在本機瀏覽器處理，保護隱私
- 📱 電腦、手機都能用

## 技術
- [UpscalerJS](https://upscalerjs.com/) + [TensorFlow.js](https://www.tensorflow.org/js)
- [JSZip](https://stuk.github.io/jszip/)

## 部署到 GitHub Pages
1. 將專案上傳到 GitHub
2. 進入 **Settings → Pages**
3. Source 選 **Deploy from a branch**，Branch 選 `main` / `(root)`，按 Save
4. 約 1 分鐘後即可透過 `https://s11314155.github.io/image-upscaler/` 使用

## 注意事項
- 大圖片處理時間較長，有獨立顯示卡的電腦會快很多
- 第一次使用需下載 AI 模型，請稍候

## 授權
MIT License
