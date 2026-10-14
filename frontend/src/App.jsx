
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const COURSES = [
  "Computer Engineering",
  "IT",
  "Mechanical",
  "Civil",
  "Electrical",
];

const EMPTY = {
  name: "",
  rollNo: "",
  email: "",
  course: COURSES[0],
};

const COLORS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
];

const colorFor = (text) => {
  let sum = 0;

  for (const ch of text) {
    sum += ch.charCodeAt(0);
  }

  return COLORS[sum % COLORS.length];
};

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function App() {
  const [form, setForm] = useState(EMPTY);
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (ok, text) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStudents = () => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editId
      ? `/api/students/${editId}`
      : "/api/students";

    try {
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.saved) {
        showToast(true, "Saved in database: true");
        setForm(EMPTY);
        setEditId(null);
        loadStudents();
      } else {
        showToast(
          false,
          `Saved in database: false (${data.error})`
        );
      }
    } catch {
      showToast(
        false,
        "Saved in database: false (backend not reachable)"
      );
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);

    setForm({
      name: s.name,
      rollNo: s.rollNo,
      email: s.email,
      course: s.course,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.deleted) {
        showToast(true, "Student deleted");
        loadStudents();
      } else {
        showToast(false, data.error || "Failed to delete student");
      }
    } catch {
      showToast(false, "Backend not reachable");
    }
  };

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const matchCourse =
          courseFilter === "All" || s.course === courseFilter;

        const matchText = `${s.name} ${s.rollNo} ${s.email}`
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchCourse && matchText;
      }),
    [students, search, courseFilter]
  );

  const usedCourses = new Set(
    students.map((s) => s.course)
  ).size;

  const latest = students[0] ? students[0].name : "-";

  return (
    <>
      <div className="bg">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>

      <div className="page">
        <header className="hero">
          <h1>Student Management</h1>
          <p>
            A full-stack app deployed automatically with CI/CD
          </p>

          <div className="tags">
            {[
              "React",
              "Node.js",
              "MongoDB",
              "Docker",
              "GitHub Actions",
              "AWS EC2",
            ].map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </header>

        <div className="stats">
          <div className="stat">
            <div className="num">{students.length}</div>
            <div className="label">Total students</div>
          </div>

          <div className="stat">
            <div className="num">{usedCourses}</div>
            <div className="label">Courses in use</div>
          </div>

          <div className="stat">
            <div className="num small">{latest}</div>
            <div className="label">Latest added</div>
          </div>
        </div>

        <section className="glass">
          <h2>{editId ? "Edit student" : "Add a new student"}</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input
                name="name"
                placeholder="e.g. Student Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Roll number</label>
              <input
                name="rollNo"
                placeholder="e.g. 101"
                value={form.rollNo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Course</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="actions">
              <button type="submit" className="btn primary">
                {editId ? "Update student" : "Save student"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="glass">
          <div className="toolbar">
            <h2>Students ({filtered.length})</h2>

            <input
              className="search"
              placeholder="Search name, roll no, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chips">
            {["All", ...COURSES].map((c) => (
              <button
                key={c}
                className={
                  courseFilter === c ? "chip active" : "chip"
                }
                onClick={() => setCourseFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div className="big">&#127891;</div>
              <p>No students found. Add your first one above.</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((s) => (
                <div className="student" key={s._id}>
                  <div className="s-top">
                    <div
                      className="avatar"
                      style={{ background: colorFor(s.name) }}
                    >
                      {initials(s.name)}
                    </div>

                    <div>
                      <div className="s-name">{s.name}</div>
                      <div className="s-roll">
                        Roll No: {s.rollNo}
                      </div>
                    </div>
                  </div>

                  <div className="s-email">{s.email}</div>

                  <span className="badge">{s.course}</span>

                  <div className="s-actions">
                    <button
                      className="btn sm"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn sm danger"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="footer">
          Deployed with GitHub Actions to AWS EC2
        </div>
      </div>

      {toast && (
        <div className={toast.ok ? "toast ok" : "toast err"}>
          {toast.text}
        </div>
      )}
    </>
  );
}

export default App;
