// setting.js - Mengelola pengaturan API

class SettingsManager {
    constructor() {
        this.settings = {
            panelUrl: '',
            clientApiKey: '',
            applicationApiKey: ''
        };
        
        this.loadSettings();
        this.attachEventListeners();
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('pterodactylSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.populateForm();
        }
    }
    
    saveSettings() {
        localStorage.setItem('pterodactylSettings', JSON.stringify(this.settings));
        this.showNotification('Pengaturan berhasil disimpan!', 'success');
    }
    
    populateForm() {
        document.getElementById('panel-url').value = this.settings.panelUrl || '';
        document.getElementById('client-api-key').value = this.settings.clientApiKey || '';
        document.getElementById('application-api-key').value = this.settings.applicationApiKey || '';
    }
    
    gatherFormData() {
        this.settings.panelUrl = document.getElementById('panel-url').value.trim();
        this.settings.clientApiKey = document.getElementById('client-api-key').value.trim();
        this.settings.applicationApiKey = document.getElementById('application-api-key').value.trim();
    }
    
    validateSettings() {
        if (!this.settings.panelUrl) {
            this.showNotification('Panel URL harus diisi', 'error');
            return false;
        }
        
        if (!this.settings.clientApiKey && !this.settings.applicationApiKey) {
            this.showNotification('Minimal satu API key harus diisi', 'error');
            return false;
        }
        
        return true;
    }
    
    attachEventListeners() {
        const apiForm = document.getElementById('api-settings-form');
        if (apiForm) {
            apiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.gatherFormData();
                
                if (this.validateSettings()) {
                    this.saveSettings();
                }
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Hapus notifikasi sebelumnya jika ada
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style notifikasi
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        if (type === 'success') {
            notification.style.background = '#48bb78';
        } else if (type === 'error') {
            notification.style.background = '#f56565';
        } else {
            notification.style.background = '#4299e1';
        }
        
        // Tambahkan ke DOM
        document.body.appendChild(notification);
        
        // Hapus otomatis setelah 3 detik
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    getSettings() {
        return this.settings;
    }
    
    // Validasi apakah settings sudah lengkap
    isConfigured() {
        return this.settings.panelUrl && 
              (this.settings.clientApiKey || this.settings.applicationApiKey);
    }
}

// Inisialisasi SettingsManager
const settingsManager = new SettingsManager();

// Fungsi toggleMenu untuk navigasi mobile
function toggleMenu() {
    const navLinks = document.getElementById('nav-links-sub');
    if (navLinks.style.left === '0px') {
        navLinks.style.left = '-200px';
    } else {
        navLinks.style.left = '0px';
    }
}
