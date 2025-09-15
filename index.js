// index.js - Logika utama aplikasi

class PterodactylAPI {
    constructor(panelUrl, apiKey, isClientAPI = true) {
        this.panelUrl = panelUrl;
        this.apiKey = apiKey;
        this.isClientAPI = isClientAPI;
        this.basePath = isClientAPI ? '/api/client' : '/api/application';
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.panelUrl}${this.basePath}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Client API methods
    async getServers() {
        if (!this.isClientAPI) {
            throw new Error('getServers is only available for Client API');
        }
        
        return this.request('');
    }
    
    async getServerResources(serverId) {
        if (!this.isClientAPI) {
            throw new Error('getServerResources is only available for Client API');
        }
        
        return this.request(`/servers/${serverId}/resources`);
    }
    
    // Application API methods
    async createServer(serverData) {
        if (this.isClientAPI) {
            throw new Error('createServer is only available for Application API');
        }
        
        return this.request('/servers', {
            method: 'POST',
            body: JSON.stringify(serverData)
        });
    }
    
    async getNodes() {
        if (this.isClientAPI) {
            throw new Error('getNodes is only available for Application API');
        }
        
        return this.request('/nodes');
    }
}

class PanelUI {
    constructor() {
        this.api = null;
        this.initializeEventListeners();
        this.checkSettingsAndLoadServers();
    }
    
    initializeEventListeners() {
        const serverForm = document.getElementById('server-create-form');
        if (serverForm) {
            serverForm.addEventListener('submit', (e) => this.handleServerCreate(e));
        }
        
        // Cek apakah pengaturan sudah disimpan dan muat server
        window.addEventListener('storage', (e) => {
            if (e.key === 'pterodactylSettings') {
                this.checkSettingsAndLoadServers();
            }
        });
    }
    
    async checkSettingsAndLoadServers() {
        const settings = settingsManager.getSettings();
        
        if (settingsManager.isConfigured()) {
            // Coba gunakan Client API terlebih dahulu
            if (settings.clientApiKey) {
                this.api = new PterodactylAPI(settings.panelUrl, settings.clientApiKey, true);
                await this.loadServers();
            } 
            // Jika tidak ada Client API tetapi ada Application API
            else if (settings.applicationApiKey) {
                this.api = new PterodactylAPI(settings.panelUrl, settings.applicationApiKey, false);
                // Tidak bisa load servers dengan Application API di konteks ini
            }
        }
    }
    
    async loadServers() {
        try {
            const servers = await this.api.getServers();
            this.displayServers(servers.data);
        } catch (error) {
            console.error('Failed to load servers:', error);
            settingsManager.showNotification('Gagal memuat server. Periksa pengaturan API.', 'error');
        }
    }
    
    displayServers(servers) {
        const serverGrid = document.getElementById('server-grid');
        
        if (!servers || servers.length === 0) {
            serverGrid.innerHTML = '<p class="no-servers">Anda belum memiliki server.</p>';
            return;
        }
        
        serverGrid.innerHTML = servers.map(server => `
            <div class="server-card">
                <h3>${server.attributes.name}</h3>
                <p>${server.attributes.description || 'Tidak ada deskripsi'}</p>
                <div class="server-details">
                    <p>ID: ${server.attributes.identifier}</p>
                    <p>Status: <span class="server-status ${server.attributes.status === 'running' ? 'status-online' : 'status-offline'}">${server.attributes.status || 'unknown'}</span></p>
                </div>
                <button class="btn-primary" onclick="viewServerDetails('${server.attributes.identifier}')">Kelola</button>
            </div>
        `).join('');
    }
    
    async handleServerCreate(e) {
        e.preventDefault();
        
        const settings = settingsManager.getSettings();
        if (!settings.applicationApiKey) {
            settingsManager.showNotification('Membutuhkan Application API Key untuk membuat server', 'error');
            return;
        }
        
        // Gunakan Application API
        const api = new PterodactylAPI(settings.panelUrl, settings.applicationApiKey, false);
        
        const formData = new FormData(e.target);
        const serverData = {
            name: formData.get('name'),
            description: formData.get('description'),
            limits: {
                cpu: parseInt(formData.get('limits[cpu]')),
                memory: parseInt(formData.get('limits[memory]')),
                disk: parseInt(formData.get('limits[disk]'))
            },
            egg: parseInt(formData.get('egg')),
            image: formData.get('image'),
            startup: formData.get('startup'),
            // Anda perlu menambahkan field lain seperti node_id, allocation, dll.
            // Ini adalah contoh minimal
        };
        
        try {
            const result = await api.createServer(serverData);
            settingsManager.showNotification('Server berhasil dibuat!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Muat ulang daftar server jika menggunakan Client API
            if (settings.clientApiKey) {
                await this.loadServers();
            }
        } catch (error) {
            console.error('Failed to create server:', error);
            settingsManager.showNotification('Gagal membuat server. Periksa pengaturan dan data yang dimasukkan.', 'error');
        }
    }
}

// Fungsi global untuk melihat detail server
function viewServerDetails(serverId) {
    const settings = settingsManager.getSettings();
    if (settings.panelUrl) {
        // Arahkan ke panel Pterodactyl asli untuk manajemen detail
        window.open(`${settings.panelUrl}/server/${serverId}`, '_blank');
    }
}

// Inisialisasi UI saat DOM sudah dimuat
document.addEventListener('DOMContentLoaded', () => {
    new PanelUI();
});

// Animasi scroll reveal
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');
    
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', revealElements);
// Jalankan sekali saat dimuat
revealElements();
