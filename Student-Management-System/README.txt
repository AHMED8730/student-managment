STUDENT MANAGEMENT SYSTEM — PROJECT GUIDE

Files
- index.html: page structure and form
- style.css: responsive VIP dashboard styling
- script.js: XML/JSON loading, searching, validation, rendering and adding students
- students.xml: five student records in XML
- students.json: the same five student records in JSON

Run in VS Code
1. Extract the ZIP.
2. Open the Student-Management-System folder in VS Code.
3. Install the "Live Server" extension if it is not already installed.
4. Right-click index.html and choose "Open with Live Server".
5. Use Load XML and Load JSON to load the local files.

Important project behavior
- XML is fetched from students.xml and parsed with DOMParser.
- JSON is fetched from students.json and parsed with response.json().
- Search filters student names as you type.
- The Add Student form validates its fields and adds the record to the page immediately.
- Because this assignment has no backend or database, newly added students exist only in the current browser session. They are not written back into the XML or JSON files. Refreshing the page resets those additions.
- Fetch may not work when index.html is opened directly using file://. Use VS Code Live Server.

GitHub Pages
Upload all five project files to the root of a public GitHub repository. In repository Settings > Pages, choose Deploy from a branch, select main and /(root), then save. Wait for the deployment link to appear.
