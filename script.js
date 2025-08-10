document.addEventListener('DOMContentLoaded', function() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    const greetingText = document.getElementById('greetingText');
    const coursesGrid = document.getElementById('coursesGrid');
    const clearBtn = document.getElementById('clearBtn');
    const contactForm = document.getElementById('contactForm');

    const courses = [
        {
            id: 'mjc',
            name: 'MJC',
            subjects: ['Pol-Sci', 'History', 'Economics', 'English', 'Hindi', 'Urdu', 'Philosophy', 'Sociology', 'Psychology', 'Zoology', 'Chemistry', 'Physics', 'Mathematics', 'Botany']
        },
        {
            id: 'mic',
            name: 'MIC',
            subjects: ['MIC-History', 'MIC-Pol-Sci', 'MIC-Urdu', 'MIC-Economics', 'MIC-Hindi', 'MIC-English', 'MIC-Philosophy', 'MIC-Zoology', 'MIC-Chemistry', 'MIC-Physics', 'MIC-Botany']
        },
        {
            id: 'mdc',
            name: 'MDC',
            subjects: ['MDC-History', 'MDC-Pol-Sci', 'MDC-Urdu', 'MDC-Economics', 'MDC-Hindi', 'MDC-English', 'MDC-Philosophy', 'MDC-Zoology', 'MDC-Chemistry', 'MDC-Physics', 'MDC-Botany']
        },
        {
            id: 'sec',
            name: 'SEC',
            subjects: ['Personality-Development-&-Communication']
        },
        {
            id: 'aec',
            name: 'AEC',
            subjects: ['Environmental-Science']
        },
        {
            id: 'vac',
            name: 'VAC',
            subjects: ['Constitutional-Values-&-Fuandamental-Duties']
        }
    ];

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    const savedName = localStorage.getItem('userName');
    const savedRollNo = localStorage.getItem('userRollNo');
    if (savedName && savedRollNo) {
        welcomeScreen.style.display = 'none';
        mainContent.style.display = 'block';
        greetingText.textContent = `Hlw 👋, ${sanitizeInput(savedName)}!`;
        generateCourseCards();
    }

    function postToGoogle(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const department = document.getElementById('department').value.trim();
        const rollNo = document.getElementById('rollNo').value.trim();

        if (!name || !department || !rollNo) {
            alert("Please fill all fields.");
            return false;
        }

        if (rollNo.length !== 8 || isNaN(rollNo)) {
            alert("Roll number must be exactly 8 digits.");
            document.getElementById('rollNo').focus();
            return false;
        }

        const existingRollNos = JSON.parse(localStorage.getItem('rollNos') || '[]');
        if (existingRollNos.includes(rollNo)) {
            alert("This roll number is already registered. Please use a different one.");
            document.getElementById('rollNo').focus();
            return false;
        }

        const formData = new FormData();
        formData.append("entry.668301457", name);
        formData.append("entry.719129946", department);
        formData.append("entry.2057467438", rollNo);

        fetch("https://docs.google.com/forms/d/e/1FAIpQLSdZAGfjU4jjojVuWEfZ8QbErl0yzXLZBzXWvh5FnLHp2vbrkw/formResponse", {
            method: "POST",
            mode: "no-cors",
            body: formData
        })
        .then(() => {
            existingRollNos.push(rollNo);
            localStorage.setItem('rollNos', JSON.stringify(existingRollNos));
            localStorage.setItem("userName", name);
            localStorage.setItem("userRollNo", rollNo);

            welcomeScreen.style.display = "none";
            mainContent.style.display = "block";
            greetingText.textContent = `Hello, ${name}!`;
            generateCourseCards();
        })
        .catch((error) => {
            console.error("Error!", error);
            alert("Submission failed.");
        });

        return false;
    }

    contactForm.addEventListener("submit", postToGoogle);

    function generateCourseCards() {
        coursesGrid.innerHTML = '';

        courses.forEach((course, index) => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.style.setProperty('--index', index);

            const savedSubject = localStorage.getItem(course.id);

            card.innerHTML = `
                <h3>${course.name}</h3>
                <select class="course-select" id="${course.id}-select" ${savedSubject ? 'disabled' : ''}>
                    <option value="" disabled ${!savedSubject ? 'selected' : ''}>Select a subject</option>
                    ${course.subjects.map(subject =>
                        `<option value="${subject}" ${savedSubject === subject ? 'selected' : ''}>${subject}</option>`
                    ).join('')}
                </select>
                ${savedSubject ? `<button class="subject-btn" data-subject="${savedSubject}">Open ${savedSubject} Page</button>` : ''}
            `;

            coursesGrid.appendChild(card);

            const select = card.querySelector(`#${course.id}-select`);
            select.addEventListener('change', function() {
                const subject = this.value;
                if (subject) {
                    try {
                        localStorage.setItem(course.id, subject);
                        this.disabled = true;

                        const btn = document.createElement('button');
                        btn.className = 'subject-btn';
                        btn.textContent = `Open ${subject} Page`;
                        btn.dataset.subject = subject;

                        btn.addEventListener('click', function() {
                            const subjectName = this.dataset.subject;
                            const fileName = subjectName.replace(/ /g, '_') + '.html';
                            window.location.href = fileName;
                        });

                        this.parentNode.appendChild(btn);
                        btn.style.opacity = '0';
                        btn.style.transform = 'translateY(10px)';
                        btn.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

                        requestAnimationFrame(() => {
                            btn.style.opacity = '1';
                            btn.style.transform = 'translateY(0)';
                        });
                    } catch (e) {
                        console.error('Error in subject selection:', e);
                        alert('An error occurred while selecting the subject.');
                    }
                }
            });

            const existingBtn = card.querySelector('.subject-btn');
            if (existingBtn) {
                existingBtn.addEventListener('click', function() {
                    const subjectName = this.dataset.subject;
                    const fileName = subjectName.replace(/ /g, '_') + '.html';
                    window.location.href = fileName;
                });
            }
        });
    }

    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all selected subjects?')) {
            try {
                courses.forEach(course => {
                    localStorage.removeItem(course.id);
                });
                generateCourseCards();
            } catch (e) {
                console.error('Error clearing selections:', e);
                alert('An error occurred while clearing selections.');
            }
        }
    });
});