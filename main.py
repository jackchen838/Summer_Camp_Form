from flask import Flask, render_template, request, jsonify
import os
import pymysql
from datetime import date

app = Flask(__name__)


REQUIRED_DB_ENV_VARS = ("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")


def get_required_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_conn():
    return pymysql.connect(
        host=get_required_env("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=get_required_env("DB_USER"),
        password=get_required_env("DB_PASSWORD"),
        database=get_required_env("DB_NAME"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def ensure_table(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS student_medicine_records (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                record_date DATE NOT NULL,
                medicine_name VARCHAR(255) NOT NULL,
                note VARCHAR(500) DEFAULT '',
                morning BOOLEAN DEFAULT FALSE,
                noon BOOLEAN DEFAULT FALSE,
                evening BOOLEAN DEFAULT FALSE,
                bedtime BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_student_date (student_id, record_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )


@app.get("/")
def index():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT DISTINCT className FROM student ORDER BY className")
            classes = [row["className"] for row in cur.fetchall()]
        return render_template("index.html", classes=classes)
    finally:
        conn.close()


@app.get('/api/students')
def get_students():
    class_name = request.args.get('class_name', '').strip()
    if not class_name:
        return jsonify([])

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name FROM student WHERE className=%s ORDER BY name",
                (class_name,),
            )
            rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()


@app.post('/api/submit')
def submit():
    payload = request.get_json(force=True)

    class_name = payload.get('class_name', '').strip()
    student_id = payload.get('student_id')
    medicines = payload.get('medicines', [])

    if not class_name or not student_id:
        return jsonify({"ok": False, "message": "班級或學生未填寫"}), 400

    valid_meds = []
    for med in medicines:
        name = (med.get('name') or '').strip()
        if not name:
            continue
        times = med.get('times', [])
        valid_meds.append({
            'name': name,
            'note': (med.get('note') or '').strip(),
            'morning': '早上' in times,
            'noon': '中午' in times,
            'evening': '晚上' in times,
            'bedtime': '睡前' in times,
        })

    if not valid_meds:
        return jsonify({"ok": False, "message": "至少要有一筆藥品資料"}), 400

    conn = get_conn()
    try:
        ensure_table(conn)
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM student WHERE id=%s AND className=%s",
                (student_id, class_name),
            )
            student = cur.fetchone()
            if not student:
                conn.rollback()
                return jsonify({"ok": False, "message": "找不到學生資料"}), 404

            today = date.today()
            cur.execute(
                "DELETE FROM student_medicine_records WHERE student_id=%s AND record_date=%s",
                (student_id, today),
            )

            insert_sql = (
                "INSERT INTO student_medicine_records "
                "(student_id, record_date, medicine_name, note, morning, noon, evening, bedtime) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            )
            for med in valid_meds:
                cur.execute(
                    insert_sql,
                    (
                        student_id,
                        today,
                        med['name'],
                        med['note'],
                        med['morning'],
                        med['noon'],
                        med['evening'],
                        med['bedtime'],
                    ),
                )

        conn.commit()
        return jsonify({"ok": True, "message": "提交成功"})
    except Exception as exc:
        conn.rollback()
        return jsonify({"ok": False, "message": f"寫入失敗: {exc}"}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', '8080')))
