/* js/pwa.js */

// Gestione PWA e stato online/offline
let deferredPrompt;

document.addEventListener('DOMContentLoaded', () => {
    // Registra il Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('[Service Worker] Registered', reg.scope))
            .catch(err => console.error('[Service Worker] Registration failed', err));
    }

    const installBtn = document.getElementById('btn-install');
    const statusBadge = document.getElementById('connection-status');
    
    // Intercetta l'evento di installazione
    window.addEventListener('beforeinstallprompt', (e) => {
        // Previene la comparsa automatica del prompt standard in alcuni browser
        e.preventDefault();
        // Salva l'evento per attivarlo successivamente
        deferredPrompt = e;
        // Mostra il pulsante di installazione personalizzato
        if (installBtn) {
            installBtn.classList.remove('hidden');
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Mostra il prompt
                deferredPrompt.prompt();
                // Attendi che l'utente risponda al prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // Abbiamo usato il prompt, scartiamo l'evento
                deferredPrompt = null;
                // Nascondi il pulsante di installazione
                installBtn.classList.add('hidden');
            }
        });
    }

    // Gestione indicatori di rete (Online / Offline)
    function updateOnlineStatus() {
        if (!statusBadge) return;
        
        if (navigator.onLine) {
            statusBadge.classList.remove('offline');
            statusBadge.classList.add('online');
            statusBadge.title = "Online";
            showToast('Connessione ristabilita.');
        } else {
            statusBadge.classList.remove('online');
            statusBadge.classList.add('offline');
            statusBadge.title = "Offline";
            showToast('Sei offline. Le modifiche rimarranno locali.');
        }
    }

    // Aggiungi listener per i cambiamenti di stato della rete
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Imposta lo stato iniziale senza mostrare il toast
    if (statusBadge) {
        if (navigator.onLine) {
            statusBadge.classList.remove('offline');
            statusBadge.classList.add('online');
            statusBadge.title = "Online";
        } else {
            statusBadge.classList.remove('online');
            statusBadge.classList.add('offline');
            statusBadge.title = "Offline";
        }
    }
});

// Funzione globale per mostrare messaggi Toast
window.showToast = function(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    // Fade-in trigger (necessita di un piccolo delay per la transizione CSS)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    // Rimuovi dopo il tempo indicato
    setTimeout(() => {
        toast.classList.remove('show');
        // Rimuovi dal DOM dopo che la transizione è terminata (0.3s come da CSS)
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, duration);
};
