document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE NAVEGACIÓN Y BOTÓN INICIAL ---
    const startButton = document.getElementById('startButton');

    if (startButton) {
        startButton.addEventListener('click', () => {
            // Guarda el progreso para saber dónde empezar (Acto 1)
            localStorage.setItem('storyProgress', 'acto1');
            window.location.href = 'acto1.html';
        });
    }

    // Función para actualizar la navegación y los botones según el progreso guardado
    function updateNavigation() {
        const progress = localStorage.getItem('storyProgress');
        const navButtons = document.querySelectorAll('.nav-button');

        navButtons.forEach(button => {
            const targetAct = button.getAttribute('data-act');
            
            // Lógica de activación de botones basada en el progreso
            if (progress === 'acto1' && targetAct === 'acto1' ||
                progress === 'acto2' && (targetAct === 'acto1' || targetAct === 'acto2') ||
                progress === 'acto3' && (targetAct === 'acto1' || targetAct === 'acto2' || targetAct === 'acto3')) {
                
                button.classList.remove('nav-disabled');
                
            } else if (progress === 'acto_final' || progress === 'fail') {
                 button.classList.remove('nav-disabled'); // Activos al final
            }
        });
    }

    // Ejecuta la actualización de la navegación en cada página
    updateNavigation();


    // --- 2. LÓGICA DEL ACTO II (Video y Mensaje) ---
    const showStoryBtn = document.getElementById('showStoryBtn');
    const hiddenStoryArea = document.getElementById('hiddenStoryArea');

    if (showStoryBtn && hiddenStoryArea) {
        
        localStorage.setItem('storyProgress', 'acto2');
        updateNavigation(); 

        showStoryBtn.addEventListener('click', () => {
            hiddenStoryArea.classList.toggle('visible');
            
            if (hiddenStoryArea.classList.contains('visible')) {
                showStoryBtn.textContent = '👆 Volver a ocultar';
            } else {
                showStoryBtn.textContent = '💌 Abrir mensaje oculto';
            }
        });
    }
    
    
    // --- 3. LÓGICA DEL ACTO III (Botones "Oye guapa" de la galería) - FUNCIONAL ---
    const messageToggleBtns = document.querySelectorAll('.message-toggle-btn');

    if (messageToggleBtns.length > 0) {
        
        localStorage.setItem('storyProgress', 'acto3');
        updateNavigation();

        messageToggleBtns.forEach(button => {
            const message = button.getAttribute('data-message');
            const tooltip = document.createElement('div');
            tooltip.className = 'message-tooltip';
            tooltip.textContent = message;
            
            // Aseguramos que el tooltip se añada al contenedor principal del ítem de la galería
            button.closest('.gallery-item-final').appendChild(tooltip);

            button.addEventListener('click', () => {
                // Alternamos la clase 'visible'
                tooltip.classList.toggle('visible');
            });
        });
    }


    // --- 4. CONTROL DE MÚSICA EN CADA ACTO (SOLUCIÓN DE PERSISTENCIA) ---
    const music = document.getElementById('backgroundMusic');
    const musicBtn = document.getElementById('musicControlBtn');
    const currentPath = window.location.pathname;
    
    const isActo1 = currentPath.includes('acto1.html');


    if (music && musicBtn) { 
        
        let isPlaying = localStorage.getItem('musicPlaying') === 'true';

        if (!isActo1 && isPlaying) {
            music.muted = false; 
            music.play().catch(error => {
                 localStorage.setItem('musicPlaying', 'false');
                 musicBtn.innerHTML = '▶️ Reproducir Música';
            });
            musicBtn.innerHTML = '⏸️ Pausar Música';
        } 
        
        musicBtn.addEventListener('click', () => {
            isPlaying = localStorage.getItem('musicPlaying') === 'true';

            if (isPlaying) {
                music.pause();
                musicBtn.innerHTML = '▶️ Reproducir Música';
                isPlaying = false;
            } else {
                music.muted = false; 
                music.play()
                    .then(() => {
                        musicBtn.innerHTML = '⏸️ Pausar Música';
                        isPlaying = true;
                    })
                    .catch(error => {
                        console.error("Error al intentar reproducir la música:", error);
                        alert("¡Uy! No puedo reproducir la música. Verifica la ruta.");
                    });
            }
            localStorage.setItem('musicPlaying', isPlaying ? 'true' : 'false');
        });
        
        if (isPlaying) {
             musicBtn.innerHTML = '⏸️ Pausar Música';
        } else {
             musicBtn.innerHTML = '▶️ Reproducir Música';
        }
    }


    // --- 5. LÓGICA DE INTERACCIÓN FINAL (SÍ/NO) ---
    const yesButton = document.getElementById('yesBtn');
    const noButton = document.getElementById('noBtn');

    if (yesButton && noButton) {
        
        // Variables de estado para el botón NO
        let opacity = 1.0;
        let scale = 1.0;

        // 5A. Lógica del botón SÍ (Redirección directa)
        yesButton.addEventListener('click', () => {
            if(music) music.pause(); 
            localStorage.setItem('musicPlaying', 'false'); 
            
            localStorage.setItem('storyProgress', 'acto_final');
            window.location.href = 'final.html'; 
        });


        // 5B. Lógica del botón NO (Salto, Encogimiento y Desvanecimiento por cada CLIC)
        noButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Si ya desapareció, salimos
            if (opacity <= 0) {
                noButton.style.display = 'none';
                return;
            }

            const container = document.querySelector('.final-buttons');
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const buttonRect = noButton.getBoundingClientRect();
            
            // Calculamos nuevas posiciones aleatorias
            const margin = 10;
            const rangeX = containerRect.width - buttonRect.width - (2 * margin);
            const rangeY = containerRect.height - buttonRect.height - (2 * margin);
            
            // Nos aseguramos de que el rango sea válido
            if (rangeX <= 0 || rangeY <= 0) return;

            // Se mantiene el centrado vertical del CSS, solo movemos la posición horizontal
            const newX = (Math.random() * rangeX) + margin;
            // newY debe ser 0 para que no afecte el 'top: 50% / transform: translateY(-50%)' del CSS
            const newY = 0; 
            
            // Reducir opacidad y escala con cada clic
            opacity = Math.max(0, opacity - 0.2); // Reducimos 0.2 de opacidad (5 clics para desaparecer)
            scale = Math.max(0, scale - 0.15);    // Reducimos 0.15 de escala (aproximadamente 6 clics para encogerse totalmente)
            
            // Aplicar la transformación de posición y escala
            noButton.style.transform = `translate(${newX}px, ${newY}px) scale(${scale})`;
            noButton.style.opacity = opacity;

            // Si la opacidad llega a 0, deshabilitamos el botón completamente
            if (opacity <= 0) {
                 noButton.style.pointerEvents = 'none';
                 noButton.style.display = 'none';
            }
        });
    }
});