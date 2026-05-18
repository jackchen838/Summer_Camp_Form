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

## 環境變數與 Secret
部署到 Cloud Run 時，不需要把 `.env` 上傳到 GitHub，也不建議把資料庫密碼寫進程式或 Docker image。

建議做法：
1. 本機開發可以複製 `.env.example` 成 `.env`。
2. `.env` 只留在本機，已由 `.gitignore` 排除。
3. Cloud Run 請到服務設定的「變數與密鑰」填入環境變數。
4. `DB_PASSWORD` 建議放在 Secret Manager，再掛到 Cloud Run 環境變數。

必要環境變數：
- `DB_HOST`
- `DB_PORT`（預設 3306）
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Cloud Run 注意事項
- Container 必須監聽 Cloud Run 指定的 `PORT`，目前 Dockerfile 會用 `gunicorn --bind 0.0.0.0:${PORT} main:app` 啟動。
- 如果使用 Cloud SQL，請確認 Cloud Run 有連到 Cloud SQL 的權限與網路設定。
- 不要把 `.env`、資料庫密碼或服務帳號金鑰 commit 到 GitHub。

## Local run
```bash
pip install -r requirements.txt
flask --app main run --debug
```

## MySQL：家長聯絡登記資料表
新增的家長聯絡登記頁會寫入 `parent_contact_registrations`，此表以 `student_id` 關聯既有的 `student(id)`，並建立學生與日期查詢用索引。可直接執行：

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < sql/create_parent_contact_registrations.sql
```

主要欄位：
- `student_id`：對應 `student.id`。
- `contact_0703`、`contact_0704`、`contact_0705`：家長聯絡登記日期。
- `note`：家長聯絡備註。
