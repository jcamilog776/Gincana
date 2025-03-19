// Questions handler - Updated: 2025-03-17 17:05:16
// Current User: camilog26

document.addEventListener('DOMContentLoaded', () => {
    const accessForm = document.getElementById('access-form');
    const questionForm = document.getElementById('question-form');

    if (accessForm) {
        accessForm.addEventListener('submit', validateAccess);
    }

    if (questionForm) {
        questionForm.addEventListener('submit', handleQuestionSubmit);
    }
});

async function validateAccess(e) {
    e.preventDefault();
    
    const accessKey = document.getElementById('access-key').value;
    
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

        // Mostrar la pregunta
        document.getElementById('access-validation').style.display = 'none';
        document.getElementById('question-content').style.display = 'block';

    } catch (error) {
        console.error('Error al validar acceso:', error);
        alert('Error al validar acceso');
    }
}

async function handleQuestionSubmit(e) {
    e.preventDefault();

    const teamId = localStorage.getItem('currentTeamId');
    if (!teamId) {
        alert('Error: No se ha identificado el equipo');
        return;
    }

    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        alert('Por favor seleccione una respuesta');
        return;
    }

    const answer = {
        teamId: teamId,
        question: window.location.pathname.split('/').pop(),
        answer: selectedAnswer.value,
        timestamp: new Date().toISOString(),
        answeredBy: 'camilog26'
    };

    try {
        // Verificar si ya respondió esta pregunta
        const previousAnswers = await db.collection('answers')
            .where('teamId', '==', teamId)
            .where('question', '==', answer.question)
            .get();

        if (!previousAnswers.empty) {
            alert('Esta pregunta ya ha sido respondida por su equipo');
            window.location.href = 'index.html';
            return;
        }

        // Guardar la respuesta
        await db.collection('answers').add(answer);

        // Actualizar puntos del equipo
        const teamRef = db.collection('teams').doc(teamId);
        await db.runTransaction(async (transaction) => {
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new Error('El equipo no existe');
            }

            const currentPoints = teamDoc.data().points || 0;
            transaction.update(teamRef, {
                points: currentPoints + 10,
                updatedAt: new Date().toISOString()
            });
        });

        alert('Respuesta registrada correctamente');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error al registrar respuesta:', error);
        alert('Error al registrar la respuesta');
    }
}