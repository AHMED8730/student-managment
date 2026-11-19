const tableBody = document.getElementById("student-table-body");
const searchInput = document.getElementById("search-input");
const statusMessage = document.getElementById("status-message");
const form = document.getElementById("student-form");

let students = [];
let sessionStudents = [];
let currentSource = "Sample data";

const sampleStudents = [
    { id: "STU-1001", name: "Ayesha Khan", age: 19, department: "Computer Science", email: "ayesha.khan@example.com" },
    { id: "STU-1002", name: "Ahmed Raza", age: 20, department: "Software Engineering", email: "ahmed.raza@example.com" },
    { id: "STU-1003", name: "Fatima Noor", age: 18, department: "Information Technology", email: "fatima.noor@example.com" },
    { id: "STU-1004", name: "Hamza Ali", age: 21, department: "Business Administration", email: "hamza.ali@example.com" },
    { id: "STU-1005", name: "Zainab Malik", age: 19, department: "Data Science", email: "zainab.malik@example.com" }
];

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
}

function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = students.filter(student => student.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">${query ? "No students match your search." : "No student records available."}</td></tr>`;
    } else {
        tableBody.innerHTML = filtered.map(student => `
            <tr>
                <td><div class="student-cell"><div class="student-avatar">${escapeHTML(initials(student.name))}</div><div><div class="student-name">${escapeHTML(student.name)}</div><div class="student-sub">Student profile</div></div></div></td>
                <td><span class="id-pill">${escapeHTML(student.id)}</span></td>
                <td>${escapeHTML(student.age)} yrs</td>
                <td><span class="dept-pill">${escapeHTML(student.department)}</span></td>
                <td class="email-cell">${escapeHTML(student.email)}</td>
                <td class="row-menu" aria-label="Student record">•••</td>
            </tr>`).join("");
    }

    document.getElementById("total-count").textContent = String(students.length).padStart(2, "0");
    document.getElementById("department-count").textContent = String(new Set(students.map(s => s.department)).size).padStart(2, "0");
    const average = students.length ? students.reduce((sum, s) => sum + Number(s.age), 0) / students.length : 0;
    document.getElementById("average-age").textContent = students.length ? average.toFixed(1) : "—";
    document.getElementById("record-count").textContent = `Showing ${filtered.length} of ${students.length} students`;
    document.getElementById("source-label").textContent = currentSource;
}

function showMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
}

function normalizeStudent(student) {
    return {
        id: String(student.id || ""),
        name: String(student.name || "").trim(),
        age: Number(student.age),
        department: String(student.department || "").trim(),
        email: String(student.email || "").trim()
    };
}

async function loadXML() {
    const button = document.getElementById("load-xml");
    button.disabled = true;
    button.textContent = "Loading XML...";
    showMessage("");
    try {
        const response = await fetch("students.xml");
        if (!response.ok) throw new Error(`Could not load students.xml (HTTP ${response.status}).`);
        const xmlText = await response.text();
        const xmlDocument = new DOMParser().parseFromString(xmlText, "application/xml");

        if (xmlDocument.querySelector("parsererror")) {
            throw new Error("The XML file contains invalid XML syntax.");
        }

        const xmlStudents = [...xmlDocument.querySelectorAll("students > student")].map(node => ({
            id: node.querySelector("id")?.textContent ?? "",
            name: node.querySelector("name")?.textContent ?? "",
            age: node.querySelector("age")?.textContent ?? "",
            department: node.querySelector("department")?.textContent ?? "",
            email: node.querySelector("email")?.textContent ?? ""
        })).map(normalizeStudent);

        if (!xmlStudents.length) throw new Error("No student records were found in the XML file.");
        students = [...xmlStudents, ...sessionStudents];
        currentSource = "XML + session additions";
        renderStudents();
        showMessage(`Successfully loaded ${xmlStudents.length} student records from students.xml.`);
    } catch (error) {
        showMessage(`${error.message} Please run the project with VS Code Live Server.`, true);
    } finally {
        button.disabled = false;
        button.innerHTML = '<span class="file-icon xml-icon">X</span> Load XML';
    }
}

async function loadJSON() {
    const button = document.getElementById("load-json");
    button.disabled = true;
    button.textContent = "Loading JSON...";
    showMessage("");
    try {
        const response = await fetch("students.json");
        if (!response.ok) throw new Error(`Could not load students.json (HTTP ${response.status}).`);
        const data = await response.json();
        if (!data || !Array.isArray(data.students)) {
            throw new Error('Invalid JSON structure. Expected an object with a "students" array.');
        }
        const jsonStudents = data.students.map(normalizeStudent);
        students = [...jsonStudents, ...sessionStudents];
        currentSource = "JSON + session additions";
        renderStudents();
        showMessage(`Successfully loaded ${jsonStudents.length} student records from students.json.`);
    } catch (error) {
        showMessage(`${error.message} Please run the project with VS Code Live Server.`, true);
    } finally {
        button.disabled = false;
        button.innerHTML = '<span class="file-icon json-icon">{ }</span> Load JSON';
    }
}

document.getElementById("load-xml").addEventListener("click", loadXML);
document.getElementById("load-json").addEventListener("click", loadJSON);
searchInput.addEventListener("input", renderStudents);

form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const age = Number(formData.get("age"));
    const department = String(formData.get("department")).trim();
    const email = String(formData.get("email")).trim();

    if (name.length < 2 || !Number.isInteger(age) || age < 10 || age > 100 || !department || !email) {
        showMessage("Please enter valid details in every field.", true);
        return;
    }

    const nextNumber = Math.max(1000, ...students.map(s => Number(String(s.id).replace(/\D/g, "")) || 0), ...sessionStudents.map(s => Number(String(s.id).replace(/\D/g, "")) || 0)) + 1;
    const newStudent = { id: `STU-${nextNumber}`, name, age, department, email };
    sessionStudents.push(newStudent);
    students.push(newStudent);
    form.reset();
    searchInput.value = "";
    renderStudents();
    showMessage(`${name} has been added successfully with ID ${newStudent.id}.`);
    document.getElementById("records").scrollIntoView({ behavior: "smooth", block: "start" });
});

// Initial preview data makes the page useful before the XML or JSON button is clicked.
students = sampleStudents.map(student => ({ ...student }));
renderStudents();

// Keyboard shortcut: Ctrl/Command + K focuses the student search field.
document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.focus();
    }
});
