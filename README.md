# Summer Camp Medicine Form (Flask)

## 專案結構（Cloud Run）
```text
your-repo/
├── main.py
├── requirements.txt
└── Dockerfile
```

## Deploy to Google Cloud Run
### 方案 A：使用 Dockerfile（推薦）
直接部署此 repo 即可，Cloud Run 會使用 `Dockerfile` 建置。

### 方案 B：使用 Buildpacks
如果你選 Google Cloud Buildpacks：
- 建構作業的結構定義目錄：`/`
- 進入點：`gunicorn --bind :$PORT main:app`
- 函式目標：留白（這不是 Cloud Functions）

## 必要環境變數
請在 Cloud Run 服務設定：
- `DB_HOST`
- `DB_PORT`（預設 3306）
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Local run
```bash
pip install -r requirements.txt
flask --app main run --debug
```
