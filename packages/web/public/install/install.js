// Estado de la instalación
let currentStep = 0;
const totalSteps = 7;
const config = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    setupEventListeners();
});

function setupEventListeners() {
    // Toggle Redis config
    document.getElementById('enableRedis')?.addEventListener('change', function() {
        document.getElementById('redisUrlGroup').style.display = this.checked ? 'block' : 'none';
    });

    // Toggle Email config
    document.getElementById('enableEmail')?.addEventListener('change', function() {
        document.getElementById('emailConfig').style.display = this.checked ? 'block' : 'none';
    });

    // Validación en tiempo real de contraseña
    document.getElementById('adminPasswordConfirm')?.addEventListener('input', function() {
        const password = document.getElementById('adminPassword').value;
        const confirm = this.value;

        if (confirm && password !== confirm) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });
}

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function nextStep() {
    // Validar paso actual antes de continuar
    if (!validateCurrentStep()) {
        return;
    }

    // Guardar datos del paso actual
    saveCurrentStepData();

    // Ocultar paso actual
    document.getElementById('step' + currentStep).classList.remove('active');

    // Mostrar siguiente paso
    currentStep++;
    document.getElementById('step' + currentStep).classList.add('active');

    // Si es el paso de resumen, mostrar configuración
    if (currentStep === 5) {
        showConfigSummary();
    }

    updateProgress();
    window.scrollTo(0, 0);
}

function prevStep() {
    // Ocultar paso actual
    document.getElementById('step' + currentStep).classList.remove('active');

    // Mostrar paso anterior
    currentStep--;
    document.getElementById('step' + currentStep).classList.add('active');

    updateProgress();
    window.scrollTo(0, 0);
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        default:
            return true;
    }
}

function validateStep1() {
    const siteName = document.getElementById('siteName').value;
    const siteUrl = document.getElementById('siteUrl').value;
    const adminEmail = document.getElementById('adminEmail').value;

    if (!siteName || !siteUrl || !adminEmail) {
        alert('Por favor completa todos los campos obligatorios');
        return false;
    }

    if (!isValidEmail(adminEmail)) {
        alert('Por favor ingresa un email válido');
        return false;
    }

    return true;
}

function validateStep2() {
    const dbHost = document.getElementById('dbHost').value;
    const dbPort = document.getElementById('dbPort').value;
    const dbName = document.getElementById('dbName').value;
    const dbUser = document.getElementById('dbUser').value;
    const dbPassword = document.getElementById('dbPassword').value;

    if (!dbHost || !dbPort || !dbName || !dbUser || !dbPassword) {
        alert('Por favor completa todos los campos de la base de datos');
        return false;
    }

    return true;
}

function validateStep3() {
    const adminName = document.getElementById('adminName').value;
    const adminUsername = document.getElementById('adminUsername').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const adminPasswordConfirm = document.getElementById('adminPasswordConfirm').value;

    if (!adminName || !adminUsername || !adminPassword || !adminPasswordConfirm) {
        alert('Por favor completa todos los campos del administrador');
        return false;
    }

    if (adminPassword !== adminPasswordConfirm) {
        alert('Las contraseñas no coinciden');
        return false;
    }

    if (adminPassword.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveCurrentStepData() {
    switch(currentStep) {
        case 1:
            config.siteName = document.getElementById('siteName').value;
            config.siteUrl = document.getElementById('siteUrl').value;
            config.adminEmail = document.getElementById('adminEmail').value;
            break;
        case 2:
            config.dbHost = document.getElementById('dbHost').value;
            config.dbPort = document.getElementById('dbPort').value;
            config.dbName = document.getElementById('dbName').value;
            config.dbUser = document.getElementById('dbUser').value;
            config.dbPassword = document.getElementById('dbPassword').value;
            config.databaseUrl = `postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
            break;
        case 3:
            config.adminName = document.getElementById('adminName').value;
            config.adminUsername = document.getElementById('adminUsername').value;
            config.adminPassword = document.getElementById('adminPassword').value;
            break;
        case 4:
            config.enableRedis = document.getElementById('enableRedis').checked;
            if (config.enableRedis) {
                config.redisUrl = document.getElementById('redisUrl').value || 'redis://localhost:6379';
            }
            config.enableEmail = document.getElementById('enableEmail').checked;
            if (config.enableEmail) {
                config.smtpHost = document.getElementById('smtpHost').value;
                config.smtpPort = document.getElementById('smtpPort').value;
                config.smtpUser = document.getElementById('smtpUser').value;
                config.smtpPassword = document.getElementById('smtpPassword').value;
            }
            break;
    }
}

function showConfigSummary() {
    const summary = document.getElementById('configSummary');

    let html = '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">';

    html += '<h4 style="margin-bottom: 15px;">📝 Información General</h4>';
    html += '<div class="summary-item"><span class="summary-label">Nombre:</span><span class="summary-value">' + config.siteName + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label">URL:</span><span class="summary-value">' + config.siteUrl + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label">Email:</span><span class="summary-value">' + config.adminEmail + '</span></div>';

    html += '<h4 style="margin: 20px 0 15px 0;">🗄️ Base de Datos</h4>';
    html += '<div class="summary-item"><span class="summary-label">Host:</span><span class="summary-value">' + config.dbHost + ':' + config.dbPort + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label">Base de datos:</span><span class="summary-value">' + config.dbName + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label">Usuario:</span><span class="summary-value">' + config.dbUser + '</span></div>';

    html += '<h4 style="margin: 20px 0 15px 0;">👤 Administrador</h4>';
    html += '<div class="summary-item"><span class="summary-label">Nombre:</span><span class="summary-value">' + config.adminName + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label">Usuario:</span><span class="summary-value">' + config.adminUsername + '</span></div>';

    if (config.enableRedis || config.enableEmail) {
        html += '<h4 style="margin: 20px 0 15px 0;">⚙️ Opciones Adicionales</h4>';
        if (config.enableRedis) {
            html += '<div class="summary-item"><span class="summary-label">Redis:</span><span class="summary-value">✓ Habilitado</span></div>';
        }
        if (config.enableEmail) {
            html += '<div class="summary-item"><span class="summary-label">Email SMTP:</span><span class="summary-value">✓ Configurado</span></div>';
        }
    }

    html += '</div>';

    summary.innerHTML = html;
}

async function testDatabaseConnection() {
    const result = document.getElementById('dbTestResult');
    result.innerHTML = '<div style="color: #666;">⏳ Probando conexión...</div>';

    try {
        const response = await fetch('/api/install/test-db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                host: document.getElementById('dbHost').value,
                port: document.getElementById('dbPort').value,
                database: document.getElementById('dbName').value,
                user: document.getElementById('dbUser').value,
                password: document.getElementById('dbPassword').value,
            })
        });

        const data = await response.json();

        if (data.success) {
            result.innerHTML = '<div style="color: #28a745;">✓ Conexión exitosa</div>';
        } else {
            result.innerHTML = '<div style="color: #dc3545;">✗ Error: ' + data.error + '</div>';
        }
    } catch (error) {
        result.innerHTML = '<div style="color: #dc3545;">✗ Error al conectar: ' + error.message + '</div>';
    }
}

async function startInstallation() {
    // Cambiar a paso de instalación
    document.getElementById('step' + currentStep).classList.remove('active');
    currentStep++;
    document.getElementById('step' + currentStep).classList.add('active');
    updateProgress();

    const logDiv = document.getElementById('installLog');

    function addLog(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'log-line';

        let icon = '►';
        if (type === 'success') icon = '✓';
        if (type === 'error') icon = '✗';
        if (type === 'warning') icon = '⚠';

        line.textContent = `${icon} ${message}`;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    try {
        addLog('Enviando configuración al servidor...');

        const response = await fetch('/api/install/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        // Simular progreso de instalación
        const steps = [
            'Validando configuración',
            'Creando archivo de configuración',
            'Conectando a la base de datos',
            'Ejecutando migraciones',
            'Creando tablas',
            'Creando usuario administrador',
            'Generando secrets de seguridad',
            'Configurando servicios',
            'Iniciando aplicación',
            'Instalación completada'
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 800));
            addLog(step, 'success');
        }

        // Ir a paso final
        setTimeout(() => {
            document.getElementById('step' + currentStep).classList.remove('active');
            currentStep++;
            document.getElementById('step' + currentStep).classList.add('active');
            updateProgress();

            document.getElementById('finalUsername').textContent = config.adminUsername;
        }, 1000);

    } catch (error) {
        addLog('Error durante la instalación: ' + error.message, 'error');
        addLog('Por favor, revisa los logs del servidor', 'warning');
    }
}

// Función para simular instalación en desarrollo
async function mockInstallation() {
    const logDiv = document.getElementById('installLog');

    function addLog(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'log-line';

        let icon = '►';
        if (type === 'success') icon = '✓';
        if (type === 'error') icon = '✗';

        line.textContent = `${icon} ${message}`;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    const steps = [
        'Validando configuración',
        'Creando archivo .env',
        'Conectando a PostgreSQL',
        'Ejecutando migraciones de Prisma',
        'Creando esquema de base de datos',
        'Insertando datos iniciales',
        'Creando usuario administrador',
        'Generando JWT secret',
        'Configurando sesiones',
        'Compilando aplicación',
        'Instalación completada exitosamente'
    ];

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        addLog(step, 'success');
    }

    setTimeout(() => {
        document.getElementById('step' + currentStep).classList.remove('active');
        currentStep++;
        document.getElementById('step' + currentStep).classList.add('active');
        updateProgress();

        document.getElementById('finalUsername').textContent = config.adminUsername;
    }, 1000);
}
