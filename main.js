// Constants
const ADMIN_USER = 'PatrimonioBuga';
const ADMIN_KEY = 'BUGA-0001';
const CURRENT_DATETIME = '2025-03-17 17:02:13';
const CURRENT_USER = 'camilog26';

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (!window.db) {
        console.error('Base de datos no disponible');
        alert('Error de conexión con la base de datos. Por favor, recarga la página.');
        return;
    }

    // Actualizar UI
    document.getElementById('current-datetime').textContent = CURRENT_DATETIME;
    document.getElementById('current-user').textContent = CURRENT_USER;

    // Setup event listeners
    setupEventListeners();

    // Mostrar sección inicial
    showWelcomeSection();
}

function setupEventListeners() {
    // Botones principales
    document.getElementById('admin-button')?.addEventListener('click', showAdminLogin);
    document.getElementById('register-button')?.addEventListener('click', showRegistrationForm);
    document.getElementById('start-game-button')?.addEventListener('click', startGame);

    // Formularios
    document.getElementById('admin-login-form')?.addEventListener('submit', handleAdminLogin);
    document.getElementById('register-team-form')?.addEventListener('submit', handleTeamRegistration);
    document.getElementById('register-students-form')?.addEventListener('submit', handleStudentsRegistration);

    // Tabs del panel de admin
    document.querySelectorAll('.tab-button').forEach(button => {
        button?.addEventListener('click', () => switchAdminTab(button.dataset.tab));
    });
}

// Funciones de navegación
function hideAllSections() {
    const sections = [
        'welcome',
        'admin-panel',
        'admin-dashboard',
        'register-team',
        'register-students',
        'access-key',
        'questions-menu'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

function showWelcomeSection() {
    hideAllSections();
    document.getElementById('welcome').style.display = 'block';
}

function showAdminLogin() {
    hideAllSections();
    document.getElementById('admin-panel').style.display = 'block';
}

function showRegistrationForm() {
    hideAllSections();
    document.getElementById('register-team').style.display = 'block';
}

function showAdminDashboard() {
    hideAllSections();
    document.getElementById('admin-dashboard').style.display = 'block';
    loadTeamsData();
    loadScoresData();
}

// Funciones de administración
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('admin-user').value;
    const key = document.getElementById('admin-key').value;

    if (username === ADMIN_USER && key === ADMIN_KEY) {
        showAdminDashboard();
    } else {
        alert('Credenciales de administrador inválidas');
    }
}

function switchAdminTab(tabName) {
    const panels = {
        'teams': document.getElementById('teams-panel'),
        'scores': document.getElementById('scores-panel')
    };

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    Object.entries(panels).forEach(([name, panel]) => {
        if (panel) {
            panel.style.display = name === tabName ? 'block' : 'none';
        }
    });

    if (tabName === 'teams') {
        loadTeamsData();
    } else if (tabName === 'scores') {
        loadScoresData();
    }
}

// Funciones de manejo de equipos
async function loadTeamsData() {
    const teamsList = document.querySelector('.teams-list');
    if (!teamsList) return;

    teamsList.innerHTML = '<div class="loading">Cargando equipos...</div>';

    try {
        const teamsSnapshot = await db.collection('teams').get();
        let teamsHTML = '';

        teamsSnapshot.forEach(doc => {
            const team = doc.data();
            teamsHTML += `
                <div class="team-card" data-team-id="${doc.id}">
                    <h4>${team.teamName}</h4>
                    <p>Colegio: ${team.schoolName}</p>
                    <p>Puntos: ${team.points}</p>
                    <p>QR Encontrados: ${team.qrFound}</p>
                    <div class="team-actions">
                        <button onclick="window.viewTeamDetails('${doc.id}')">Ver Detalles</button>
                        <button onclick="window.editTeam('${doc.id}')">Editar</button>
                        <button onclick="window.deleteTeam('${doc.id}')">Eliminar</button>
                    </div>
                </div>
            `;
        });

        teamsList.innerHTML = teamsHTML || '<p>No hay equipos registrados</p>';
    } catch (error) {
        console.error('Error al cargar equipos:', error);
        teamsList.innerHTML = '<p class="error">Error al cargar los equipos</p>';
    }
}

async function loadScoresData() {
    const scoresTable = document.querySelector('.scores-table');
    if (!scoresTable) return;

    scoresTable.innerHTML = '<div class="loading">Cargando puntajes...</div>';

    try {
        const teamsSnapshot = await db.collection('teams')
            .orderBy('points', 'desc')
            .get();

        let scoresHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Posición</th>
                        <th>Equipo</th>
                        <th>Colegio</th>
                        <th>Puntos</th>
                        <th>QR Encontrados</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let position = 1;
        teamsSnapshot.forEach(doc => {
            const team = doc.data();
            scoresHTML += `
                <tr>
                    <td>${position}</td>
                    <td>${team.teamName}</td>
                    <td>${team.schoolName}</td>
                    <td>${team.points}</td>
                    <td>${team.qrFound}</td>
                </tr>
            `;
            position++;
        });

        scoresHTML += '</tbody></table>';
        scoresTable.innerHTML = scoresHTML;
    } catch (error) {
        console.error('Error al cargar puntajes:', error);
        scoresTable.innerHTML = '<p class="error">Error al cargar los puntajes</p>';
    }
}

async function viewTeamDetails(teamId) {
    try {
        const teamDoc = await db.collection('teams').doc(teamId).get();
        const studentsSnapshot = await db.collection('students')
            .where('teamId', '==', teamId)
            .get();
        
        const team = teamDoc.data();
        let studentsHTML = '';
        
        studentsSnapshot.forEach(doc => {
            const student = doc.data();
            studentsHTML += `
                <div class="student-detail">
                    <p>Nombre: ${student.name}</p>
                    <p>Grado: ${student.grade}</p>
                    <p>Edad: ${student.age}</p>
                </div>
            `;
        });

        const detailsHTML = `
            <div class="team-details-modal">
                <h3>${team.teamName}</h3>
                <p>Colegio: ${team.schoolName}</p>
                <p>Responsable: ${team.responsibleName}</p>
                <p>ID Responsable: ${team.responsibleId}</p>
                <p>Clave de Acceso: ${team.accessKey}</p>
                <p>Puntos: ${team.points}</p>
                <p>QR Encontrados: ${team.qrFound}</p>
                <h4>Estudiantes:</h4>
                ${studentsHTML}
            </div>
        `;

        showModal(detailsHTML);
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar los detalles del equipo');
    }
}

async function editTeam(teamId) {
    try {
        const teamDoc = await db.collection('teams').doc(teamId).get();
        const team = teamDoc.data();
        
        const editFormHTML = `
            <div class="edit-team-form">
                <h3>Editar Equipo</h3>
                <form id="edit-team-form" onsubmit="window.handleTeamEdit(event, '${teamId}')">
                    <div class="form-group">
                        <label for="edit-school-name">Colegio:</label>
                        <select id="edit-school-name" required>
                            <option value="Académico" ${team.schoolName === 'Académico' ? 'selected' : ''}>Académico</option>
                            <option value="Normal" ${team.schoolName === 'Normal' ? 'selected' : ''}>Normal Superior</option>
                            <option value="SanVicente" ${team.schoolName === 'SanVicente' ? 'selected' : ''}>San Vicente</option>
                            <option value="LaPaz" ${team.schoolName === 'LaPaz' ? 'selected' : ''}>La Paz</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-team-name">Nombre del Equipo:</label>
                        <input type="text" id="edit-team-name" value="${team.teamName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-responsible-name">Nombre del Responsable:</label>
                        <input type="text" id="edit-responsible-name" value="${team.responsibleName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-responsible-id">Identificación del Responsable:</label>
                        <input type="text" id="edit-responsible-id" value="${team.responsibleId}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-points">Puntos:</label>
                        <input type="number" id="edit-points" value="${team.points}" required min="0">
                    </div>
                    <div class="form-group">
                        <label for="edit-qr-found">QR Encontrados:</label>
                        <input type="number" id="edit-qr-found" value="${team.qrFound}" required min="0">
                    </div>
                    <button type="submit">Guardar Cambios</button>
                </form>
            </div>
        `;
        
        showModal(editFormHTML);
    } catch (error) {
        console.error('Error al cargar equipo para editar:', error);
        alert('Error al cargar los datos del equipo');
    }
}

async function deleteTeam(teamId) {
    if (!confirm('¿Está seguro de eliminar este equipo? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const batch = db.batch();
        
        const studentsSnapshot = await db.collection('students')
            .where('teamId', '==', teamId)
            .get();
        
        studentsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        batch.delete(db.collection('teams').doc(teamId));
        await batch.commit();
        loadTeamsData();
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        alert('Error al eliminar el equipo');
    }
}

function handleTeamEdit(e, teamId) {
    e.preventDefault();

    const updatedTeamData = {
        schoolName: document.getElementById('edit-school-name').value,
        teamName: document.getElementById('edit-team-name').value,
        responsibleName: document.getElementById('edit-responsible-name').value,
        responsibleId: document.getElementById('edit-responsible-id').value,
        points: parseInt(document.getElementById('edit-points').value),
        qrFound: parseInt(document.getElementById('edit-qr-found').value),
        updatedAt: CURRENT_DATETIME,
        updatedBy: CURRENT_USER
    };

    db.collection('teams').doc(teamId).update(updatedTeamData)
        .then(() => {
            closeModal();
            loadTeamsData();
            alert('Equipo actualizado exitosamente');
        })
        .catch(error => {
            console.error('Error al actualizar equipo:', error);
            alert('Error al actualizar el equipo');
        });
}

// Funciones de registro
function generateAccessKey() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BUGA-${random.toString().padStart(4, '0')}`;
}

async function handleTeamRegistration(e) {
    e.preventDefault();

    const teamData = {
        schoolName: document.getElementById('school-name').value,
        teamName: document.getElementById('team-name').value,
        responsibleName: document.getElementById('responsible-name').value,
        responsibleId: document.getElementById('responsible-id').value,
        accessKey: generateAccessKey(),
        createdAt: CURRENT_DATETIME,
        registeredBy: CURRENT_USER,
        points: 0,
        qrFound: 0,
        status: 'registered'
    };

    try {
        const docRef = await db.collection('teams').add(teamData);
        localStorage.setItem('currentTeamId', docRef.id);
        localStorage.setItem('currentTeamData', JSON.stringify(teamData));
        showStudentsRegistration();
    } catch (error) {
        console.error('Error al registrar equipo:', error);
        alert('Error al registrar el equipo. Por favor intente nuevamente.');
    }
}

function showStudentsRegistration() {
    hideAllSections();
    generateStudentFields();
    document.getElementById('register-students').style.display = 'block';
}

function generateStudentFields() {
    const container = document.getElementById('students-container');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student-entry';
        studentDiv.innerHTML = `
            <h3>Estudiante ${i}</h3>
            <div class="form-group">
                <label for="student${i}-name">Nombre:</label>
                <input type="text" id="student${i}-name" required>
            </div>
            <div class="form-group">
                <label for="student${i}-grade">Grado:</label>
                <select id="student${i}-grade" required>
                    <option value="">Seleccione el grado</option>
                    <option value="10">10°</option>
                    <option value="11">11°</option>
                </select>
            </div>
            <div class="form-group">
                <label for="student${i}-age">Edad:</label>
                               <input type="number" id="student${i}-age" required min="14" max="20">
            </div>
        `;
        container.appendChild(studentDiv);
    }
}

async function handleStudentsRegistration(e) {
    e.preventDefault();

    const teamId = localStorage.getItem('currentTeamId');
    if (!teamId) {
        alert('Error: No se encontró el ID del equipo');
        return;
    }

    const students = [];
    for (let i = 1; i <= 5; i++) {
        students.push({
            name: document.getElementById(`student${i}-name`).value,
            grade: document.getElementById(`student${i}-grade`).value,
            age: document.getElementById(`student${i}-age`).value,
            teamId: teamId,
            registeredAt: CURRENT_DATETIME,
            registeredBy: CURRENT_USER
        });
    }

    try {
        const batch = db.batch();
        
        students.forEach(student => {
            const studentRef = db.collection('students').doc();
            batch.set(studentRef, student);
        });

        await batch.commit();
        showAccessKey();
    } catch (error) {
        console.error('Error al registrar estudiantes:', error);
        alert('Error al registrar estudiantes. Por favor intente nuevamente.');
    }
}

function showAccessKey() {
    hideAllSections();
    const teamData = JSON.parse(localStorage.getItem('currentTeamData'));
    const keyElement = document.getElementById('team-key');
    if (keyElement) {
        keyElement.textContent = teamData.accessKey;
    }
    document.getElementById('access-key').style.display = 'block';
}

// Funciones del juego
async function startGame() {
    const accessKey = prompt('Ingrese la clave de su equipo:');
    if (!accessKey) return;

    try {
        const teamQuery = await db.collection('teams')
            .where('accessKey', '==', accessKey)
            .get();

        if (teamQuery.empty) {
            alert('Clave de acceso inválida');
            return;
        }

        const teamDoc = teamQuery.docs[0];
        const teamData = teamDoc.data();

        localStorage.setItem('currentTeamId', teamDoc.id);
        localStorage.setItem('currentTeamData', JSON.stringify(teamData));

        showQuestionsMenu();
    } catch (error) {
        console.error('Error al validar acceso:', error);
        alert('Error al validar acceso');
    }
}

function showQuestionsMenu() {
    hideAllSections();
    const questionsMenu = document.getElementById('questions-menu');
    if (questionsMenu) {
        questionsMenu.style.display = 'block';
    }
}

// Funciones modales
function showModal(content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        ${content}
        <button class="modal-close" onclick="window.closeModal()">Cerrar</button>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

// Exportar funciones necesarias para el ámbito global
window.viewTeamDetails = viewTeamDetails;
window.editTeam = editTeam;
window.deleteTeam = deleteTeam;
window.handleTeamEdit = handleTeamEdit;
window.closeModal = closeModal;
window.showQuestionsMenu = showQuestionsMenu;