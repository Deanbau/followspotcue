/**
 * Followspot Cue Sheet App - Main JavaScript
 * Lightweight, offline-first followspot cue sheet for theatre lighting operations
 * Version: 1.0.0
 * License: MIT
 */

    // Main App State
    const app = {
        // Current data state
        cues: [],
        characters: [],
        locations: [],
        productionName: '',
        lightingDesigner: '',
        appVersion: '1.0.0',
        settings: {
            autoSave: false,
            autoSaveInterval: 120000, // 2 minutes
            lastSaved: null
        },

    // DOM Elements
    elements: {},

    // Initialize the application
    init() {
        console.log('Initializing Followspot Cue Sheet App...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Load data from localStorage or sample data
        this.loadData();

        // Set up auto-save if enabled
        this.setupAutoSave();

        // Initialize UI
        this.updateUI();

        // Show welcome message
        this.showToast('🎭 Followspot Cue Sheet Ready', 'info');
    },

    // Cache DOM elements for better performance
    cacheElements() {
        this.elements = {
            // Header
            productionName: document.getElementById('productionName'),
            lightingDesigner: document.getElementById('lightingDesigner'),
            saveStatus: document.getElementById('saveStatus'),
            autoSaveToggle: document.getElementById('autoSaveToggle'),
            versionInfo: document.getElementById('versionInfo'),
            btnNewFile: document.getElementById('btnNewFile'),

            // Toolbar
            btnSave: document.getElementById('btnSave'),
            btnLoad: document.getElementById('btnLoad'),
            fileInput: document.getElementById('fileInput'),
            btnExportPDF: document.getElementById('btnExportPDF'),
            pdfDropdown: document.getElementById('pdfDropdown'),
            btnSettings: document.getElementById('btnSettings'),
            searchInput: document.getElementById('searchInput'),
            searchFilter: document.getElementById('searchFilter'),

            // Tabs
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),

            // Master Table
            btnAddCue: document.getElementById('btnAddCue'),
            btnDouseSelected: document.getElementById('btnDouseSelected'),
            btnDuplicateSelected: document.getElementById('btnDuplicateSelected'),
            btnDeleteSelected: document.getElementById('btnDeleteSelected'),
            cueCount: document.getElementById('cueCount'),
            masterTableBody: document.getElementById('masterTableBody'),
            selectAll: document.getElementById('selectAll'),

            // Spot Tables
            spot1TableBody: document.getElementById('spot1TableBody'),
            spot2TableBody: document.getElementById('spot2TableBody'),
            spot3TableBody: document.getElementById('spot3TableBody'),
            spot4TableBody: document.getElementById('spot4TableBody'),
            spot1Count: document.getElementById('spot1Count'),
            spot2Count: document.getElementById('spot2Count'),
            spot3Count: document.getElementById('spot3Count'),
            spot4Count: document.getElementById('spot4Count'),

            // Modals
            settingsModal: document.getElementById('settingsModal'),
            cueModal: document.getElementById('cueModal'),
            closeSettings: document.getElementById('closeSettings'),
            closeCueModal: document.getElementById('closeCueModal'),

            // Settings Modal
            characterList: document.getElementById('characterList'),
            locationList: document.getElementById('locationList'),
            newCharacterInput: document.getElementById('newCharacterInput'),
            newLocationInput: document.getElementById('newLocationInput'),
            btnAddCharacter: document.getElementById('btnAddCharacter'),
            btnAddLocation: document.getElementById('btnAddLocation'),
            autoSaveInterval: document.getElementById('autoSaveInterval'),
            btnClearAll: document.getElementById('btnClearAll'),
            btnLoadSample: document.getElementById('btnLoadSample'),

            // Cue Modal
            cueForm: document.getElementById('cueForm'),
            cueModalTitle: document.getElementById('cueModalTitle'),
            cueId: document.getElementById('cueId'),
            cueNumber: document.getElementById('cueNumber'),
            cuePage: document.getElementById('cuePage'),
            cueTrigger: document.getElementById('cueTrigger'),
            cueCharacter: document.getElementById('cueCharacter'),
            cueLocation: document.getElementById('cueLocation'),
            cueSpot1: document.getElementById('cueSpot1'),
            cueSpot2: document.getElementById('cueSpot2'),
            cueSpot3: document.getElementById('cueSpot3'),
            cueSpot4: document.getElementById('cueSpot4'),
            cueSize: document.getElementById('cueSize'),
            cueColor: document.getElementById('cueColor'),
            cueIntensity: document.getElementById('cueIntensity'),
            cueNotes: document.getElementById('cueNotes'),
            cueFX: document.getElementById('cueFX'),
            btnCancelCue: document.getElementById('btnCancelCue'),

            // Toast container
            toastContainer: document.getElementById('toastContainer')
        };
    },

    // Set up all event listeners
    setupEventListeners() {
        // Header events
        this.elements.productionName.addEventListener('change', (e) => {
            this.productionName = e.target.value;
            this.saveToLocalStorage();
            this.updateSaveStatus('Production name updated');
        });

        this.elements.lightingDesigner.addEventListener('change', (e) => {
            this.lightingDesigner = e.target.value;
            this.saveToLocalStorage();
            this.updateSaveStatus('Lighting designer updated');
        });

        this.elements.autoSaveToggle.addEventListener('change', (e) => {
            this.settings.autoSave = e.target.checked;
            this.saveToLocalStorage();
            this.setupAutoSave();
            this.updateSaveStatus(`Auto-save ${this.settings.autoSave ? 'enabled' : 'disabled'}`);
        });

        // Toolbar events
        this.elements.btnNewFile.addEventListener('click', () => this.newFile());
        this.elements.btnSave.addEventListener('click', () => this.saveToFile());
        this.elements.btnLoad.addEventListener('click', () => {
            // Try File System Access API first for loading
            if ('showOpenFilePicker' in window) {
                this.loadFromFile();
            } else {
                // Fallback to file input
                this.elements.fileInput.click();
            }
        });
        this.elements.fileInput.addEventListener('change', (e) => this.loadFromFile(e));

        // PDF Export dropdown
        this.elements.btnExportPDF.addEventListener('click', () => {
            this.elements.pdfDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.btnExportPDF.contains(e.target)) {
                this.elements.pdfDropdown.classList.remove('show');
            }
        });

        // PDF export buttons
        this.elements.pdfDropdown.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const exportType = e.target.getAttribute('data-export');
                this.exportToPDF(exportType);
                this.elements.pdfDropdown.classList.remove('show');
            });
        });

        this.elements.btnSettings.addEventListener('click', () => this.openSettingsModal());

        // Search functionality
        this.elements.searchInput.addEventListener('input', () => this.filterCues());
        this.elements.searchFilter.addEventListener('change', () => this.filterCues());

        // Tab switching
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab')));
        });

        // Master table events
        this.elements.btnAddCue.addEventListener('click', () => this.openCueModal());
        this.elements.btnDouseSelected.addEventListener('click', () => this.douseSelectedCues());
        this.elements.btnDuplicateSelected.addEventListener('click', () => this.duplicateSelectedCues());
        this.elements.btnDeleteSelected.addEventListener('click', () => this.deleteSelectedCues());
        this.elements.selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Settings modal events
        this.elements.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.elements.btnAddCharacter.addEventListener('click', () => this.addCharacter());
        this.elements.btnAddLocation.addEventListener('click', () => this.addLocation());
        this.elements.autoSaveInterval.addEventListener('change', (e) => {
            this.settings.autoSaveInterval = parseInt(e.target.value);
            this.saveToLocalStorage();
            this.setupAutoSave();
        });
        this.elements.btnClearAll.addEventListener('click', () => this.clearAllData());
        this.elements.btnLoadSample.addEventListener('click', () => this.loadSampleData());

        // Cue modal events
        this.elements.closeCueModal.addEventListener('click', () => this.closeCueModal());
        this.elements.btnCancelCue.addEventListener('click', () => this.closeCueModal());
        this.elements.cueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCue();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveToLocalStorage();
                this.updateSaveStatus('Quick saved to localStorage');
            }

            // Ctrl/Cmd + N for new cue
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openCueModal();
            }

            // Ctrl/Cmd + D for douse selected cues
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.douseSelectedCues();
            }

            // Escape to cancel editing
            if (e.key === 'Escape') {
                this.closeCueModal();
            }
        });
    },

    // Load data from localStorage or create sample data
    loadData() {
        const savedData = localStorage.getItem('followspotData');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.cues = parsedData.cues || [];
                this.characters = parsedData.characters || [];
                this.locations = parsedData.locations || [];
                this.productionName = parsedData.productionName || '';
                this.lightingDesigner = parsedData.lightingDesigner || '';
                this.settings = parsedData.settings || this.settings;

                // Ensure we have default characters and locations
                if (this.characters.length === 0) {
                    this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
                }

                if (this.locations.length === 0) {
                    this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
                }

                this.showToast('Loaded saved data', 'success');
            } catch (error) {
                console.error('Error parsing saved data:', error);
                this.showToast('Error loading saved data', 'error');
                this.loadSampleData();
            }
        } else {
            // No saved data, load sample data
            this.loadSampleData();
        }

        // Update UI with loaded data
        this.updateUI();
    },

    // Load sample data for first-time users
    loadSampleData() {
        this.cues = [
            {
                id: 'cue-1',
                cueNumber: '1',
                page: 'p.12',
                trigger: 'LX 1 GO',
                character: 'Jesus',
                location: 'DSC',
                spot1: 'Pickup',
                spot2: 'Pickup',
                spot3: '',
                spot4: '',
                size: 'Full Body',
                color: 'L201',
                intensity: '100',
                notes: 'Opening number - full stage wash',
                fx: ''
            },
            {
                id: 'cue-2',
                cueNumber: '2',
                page: 'p.15',
                trigger: 'On lyric "rise again"',
                character: 'Jesus',
                location: 'CSR',
                spot1: 'Follow',
                spot2: 'Hold',
                spot3: 'Pickup',
                spot4: '',
                size: 'Mid',
                color: 'L201',
                intensity: '90',
                notes: 'Spot 1 follows Jesus to center stage',
                fx: ''
            },
            {
                id: 'cue-3',
                cueNumber: '3',
                page: 'p.18',
                trigger: 'LX 3 GO',
                character: 'Mary',
                location: 'DSL',
                spot1: 'Fade Out',
                spot2: 'Pickup',
                spot3: 'Hold',
                spot4: 'Pickup',
                size: 'Headshot',
                color: 'R60',
                intensity: '80',
                notes: 'Mary enters from stage left',
                fx: ''
            },
            {
                id: 'cue-4',
                cueNumber: '4',
                page: 'p.22',
                trigger: 'On "Hosanna"',
                character: 'Ensemble A',
                location: 'USC',
                spot1: 'Bump',
                spot2: 'Bump',
                spot3: 'Bump',
                spot4: 'Bump',
                size: 'Full Body',
                color: 'L201',
                intensity: '100',
                notes: 'All spots bump on "Hosanna"',
                fx: 'Strobe'
            },
            {
                id: 'cue-5',
                cueNumber: '5',
                page: 'p.25',
                trigger: 'LX 5 GO',
                character: 'Jesus',
                location: 'DSC',
                spot1: 'Snap',
                spot2: 'Snap',
                spot3: 'Snap',
                spot4: 'Snap',
                size: 'Tight',
                color: 'L201',
                intensity: '70',
                notes: 'Quick snap to Jesus for dramatic moment',
                fx: ''
            },
            {
                id: 'cue-6',
                cueNumber: '6',
                page: 'p.28',
                trigger: 'On "Crucify him"',
                character: 'Ensemble B',
                location: 'USR',
                spot1: 'Fade Out',
                spot2: 'Fade Out',
                spot3: 'Fade Out',
                spot4: 'Fade Out',
                size: 'Full Body',
                color: 'R60',
                intensity: '50',
                notes: 'All spots fade out during crucifixion scene',
                fx: 'Slow fade'
            },
            {
                id: 'cue-7',
                cueNumber: '7',
                page: 'p.32',
                trigger: 'LX 7 GO',
                character: 'Jesus',
                location: 'CSC',
                spot1: 'Pickup',
                spot2: 'Pickup',
                spot3: 'Pickup',
                spot4: 'Pickup',
                size: 'Full Body',
                color: 'L201',
                intensity: '100',
                notes: 'Resurrection - all spots on Jesus',
                fx: 'Color scroll'
            },
            {
                id: 'cue-8',
                cueNumber: '8',
                page: 'p.35',
                trigger: 'On "He is risen"',
                character: 'Mary',
                location: 'DSR',
                spot1: 'Follow',
                spot2: 'Follow',
                spot3: 'Follow',
                spot4: 'Follow',
                size: 'Mid',
                color: 'L201',
                intensity: '90',
                notes: 'Mary runs to Jesus',
                fx: ''
            }
        ];

        this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
        this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
        this.productionName = 'Sample Musical Production';
        this.settings.autoSave = true;

        this.saveToLocalStorage();
        this.showToast('Loaded sample data', 'success');
    },

    // Save data to localStorage
    saveToLocalStorage() {
        const data = {
            cues: this.cues,
            characters: this.characters,
            locations: this.locations,
            productionName: this.productionName,
            lightingDesigner: this.lightingDesigner,
            settings: this.settings,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('followspotData', JSON.stringify(data));
        this.updateSaveStatus('Saved to localStorage');
    },

    // Save to file using File System Access API or download
    async saveToFile() {
        try {
            const data = {
                cues: this.cues,
                characters: this.characters,
                locations: this.locations,
                productionName: this.productionName,
                settings: this.settings,
                version: '1.0.0',
                timestamp: new Date().toISOString()
            };

            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });

            // Try File System Access API first
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: `${this.productionName || 'Followspot_Cues'}_${new Date().toISOString().split('T')[0]}.json`,
                        types: [{
                            description: 'JSON Files',
                            accept: {
                                'application/json': ['.json']
                            }
                        }]
                    });

                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    this.showToast('File saved successfully!', 'success');
                    this.updateSaveStatus('Saved to file');
                    return;
                } catch (error) {
                    console.warn('File System Access API failed, falling back to download:', error);
                }
            }

            // Fallback to download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.productionName || 'Followspot_Cues'}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('File downloaded successfully!', 'success');
            this.updateSaveStatus('Downloaded file');

        } catch (error) {
            console.error('Error saving file:', error);
            this.showToast('Error saving file', 'error');
        }
    },

    // Load from file
    async loadFromFile(event) {
        // First try File System Access API for loading
        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json']
                        }
                    }]
                });

                const file = await fileHandle.getFile();
                const contents = await file.text();

                try {
                    const data = JSON.parse(contents);

                    // Validate and load data - reset to file contents, not merge
                    this.cues = data.cues || [];
                    this.characters = data.characters || [];
                    this.locations = data.locations || [];
                    this.productionName = data.productionName || '';
                    this.lightingDesigner = data.lightingDesigner || '';
                    this.settings = data.settings || this.settings;

                    // Ensure we have default characters and locations
                    if (this.characters.length === 0) {
                        this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
                    }

                    if (this.locations.length === 0) {
                        this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
                    }

                    this.saveToLocalStorage();
                    this.updateUI();
                    this.showToast('File loaded successfully!', 'success');
                    this.updateSaveStatus('Loaded from file');

                    return; // Successfully loaded with File System Access API

                } catch (error) {
                    console.error('Error parsing file:', error);
                    this.showToast('Error parsing file', 'error');
                    return;
                }

            } catch (error) {
                console.warn('File System Access API failed for loading, falling back to file input:', error);
                // Fall through to file input method
            }
        }

        // Fallback to file input method
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate and load data - reset to file contents, not merge
                    this.cues = data.cues || [];
                    this.characters = data.characters || [];
                    this.locations = data.locations || [];
                    this.productionName = data.productionName || '';
                    this.lightingDesigner = data.lightingDesigner || '';
                    this.settings = data.settings || this.settings;

                    // Ensure we have default characters and locations
                    if (this.characters.length === 0) {
                        this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
                    }

                    if (this.locations.length === 0) {
                        this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
                    }

                    this.saveToLocalStorage();
                    this.updateUI();
                    this.showToast('File loaded successfully!', 'success');
                    this.updateSaveStatus('Loaded from file');

                    // Clear file input
                    if (event?.target) {
                        event.target.value = '';
                    }

                } catch (error) {
                    console.error('Error parsing file:', error);
                    this.showToast('Error parsing file', 'error');
                }
            };

            reader.readAsText(file);

        } catch (error) {
            console.error('Error loading file:', error);
            this.showToast('Error loading file', 'error');
        }
    },

    // Set up auto-save
    setupAutoSave() {
        // Clear any existing auto-save interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Set up new interval if auto-save is enabled
        if (this.settings.autoSave) {
            this.autoSaveInterval = setInterval(() => {
                this.saveToLocalStorage();
                this.updateSaveStatus('Auto-saved');
            }, this.settings.autoSaveInterval);
        }
    },

    // Update save status display
    updateSaveStatus(message) {
        this.elements.saveStatus.textContent = message;
        this.elements.saveStatus.style.opacity = '1';

        // Fade out after 3 seconds
        setTimeout(() => {
            this.elements.saveStatus.style.opacity = '0.7';
        }, 3000);
    },

    // Update the entire UI
    updateUI() {
        // Update production name
        this.elements.productionName.value = this.productionName;

        // Update lighting designer
        this.elements.lightingDesigner.value = this.lightingDesigner;

        // Update version info
        this.elements.versionInfo.textContent = `v${this.appVersion}`;

        // Update auto-save toggle
        this.elements.autoSaveToggle.checked = this.settings.autoSave;

        // Update auto-save interval
        this.elements.autoSaveInterval.value = this.settings.autoSaveInterval;

        // Update character and location dropdowns
        this.updateDropdowns();

        // Render all tables
        this.renderMasterTable();
        this.renderSpotTables();

        // Update cue counts
        this.updateCueCounts();

        // Set up auto-save
        this.setupAutoSave();
    },

    // Update character and location dropdowns
    updateDropdowns() {
        // Update character dropdown in cue form
        this.updateDropdown(this.elements.cueCharacter, this.characters);

        // Update location dropdown in cue form
        this.updateDropdown(this.elements.cueLocation, this.locations);

        // Update character list in settings
        this.renderCharacterList();

        // Update location list in settings
        this.renderLocationList();
    },

    // Helper to update a dropdown
    updateDropdown(dropdown, items) {
        dropdown.innerHTML = '<option value="">-- Select --</option>';

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    },

    // Render character list in settings
    renderCharacterList() {
        this.elements.characterList.innerHTML = '';

        this.characters.forEach(character => {
            const item = document.createElement('div');
            item.className = 'character-item';
            item.innerHTML = `
                <span>${character}</span>
                <button class="delete-btn" data-character="${character}">×</button>
            `;
            this.elements.characterList.appendChild(item);
        });

        // Add event listeners to delete buttons
        this.elements.characterList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const character = e.target.getAttribute('data-character');
                this.deleteCharacter(character);
            });
        });
    },

    // Render location list in settings
    renderLocationList() {
        this.elements.locationList.innerHTML = '';

        this.locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <span>${location}</span>
                <button class="delete-btn" data-location="${location}">×</button>
            `;
            this.elements.locationList.appendChild(item);
        });

        // Add event listeners to delete buttons
        this.elements.locationList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const location = e.target.getAttribute('data-location');
                this.deleteLocation(location);
            });
        });
    },

    // Add new character
    addCharacter() {
        const newCharacter = this.elements.newCharacterInput.value.trim();
        if (newCharacter && !this.characters.includes(newCharacter)) {
            this.characters.push(newCharacter);
            this.characters.sort();
            this.saveToLocalStorage();
            this.updateDropdowns();
            this.elements.newCharacterInput.value = '';
            this.showToast(`Added character: ${newCharacter}`, 'success');
        } else if (this.characters.includes(newCharacter)) {
            this.showToast('Character already exists', 'warning');
        }
    },

    // Delete character
    deleteCharacter(character) {
        if (confirm(`Delete character "${character}"? This will not affect existing cues.`)) {
            this.characters = this.characters.filter(c => c !== character);
            this.saveToLocalStorage();
            this.updateDropdowns();
            this.showToast(`Deleted character: ${character}`, 'success');
        }
    },

    // Add new location
    addLocation() {
        const newLocation = this.elements.newLocationInput.value.trim();
        if (newLocation && !this.locations.includes(newLocation)) {
            this.locations.push(newLocation);
            this.locations.sort();
            this.saveToLocalStorage();
            this.updateDropdowns();
            this.elements.newLocationInput.value = '';
            this.showToast(`Added location: ${newLocation}`, 'success');
        } else if (this.locations.includes(newLocation)) {
            this.showToast('Location already exists', 'warning');
        }
    },

    // Delete location
    deleteLocation(location) {
        if (confirm(`Delete location "${location}"? This will not affect existing cues.`)) {
            this.locations = this.locations.filter(l => l !== location);
            this.saveToLocalStorage();
            this.updateDropdowns();
            this.showToast(`Deleted location: ${location}`, 'success');
        }
    },

    // New File - Start fresh with default data
    newFile() {
        if (confirm('Start a new file? Any unsaved changes will be lost.')) {
            this.cues = [];
            this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
            this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
            this.productionName = 'New Production';
            this.settings.autoSave = true;

            this.saveToLocalStorage();
            this.updateUI();
            this.showToast('New file created', 'success');
        }
    },

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
            this.cues = [];
            this.characters = ['Jesus', 'Mary', 'Ensemble A', 'Ensemble B', 'Narrator'];
            this.locations = ['DSR', 'DSL', 'DSC', 'USR', 'USL', 'USC', 'CSR', 'CSL', 'CSC'];
            this.productionName = '';
            this.settings.autoSave = false;

            this.saveToLocalStorage();
            this.updateUI();
            this.showToast('All data cleared', 'success');
        }
    },

    // Switch between tabs
    switchTab(tabName) {
        // Update tab buttons
        this.elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        // Update tab contents
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    },

    // Render master table
    renderMasterTable() {
        this.elements.masterTableBody.innerHTML = '';

        // Filter cues based on search
        const filteredCues = this.filterCues();

        filteredCues.forEach(cue => {
            const row = document.createElement('tr');
            row.dataset.cueId = cue.id;

            // Select checkbox
            row.innerHTML = `
                <td class="col-select">
                    <input type="checkbox" class="cue-checkbox" data-cue-id="${cue.id}">
                </td>
                <td class="col-cue editable-cell" data-field="cueNumber">${cue.cueNumber || ''}</td>
                <td class="col-page editable-cell" data-field="page">${cue.page || ''}</td>
                <td class="col-trigger editable-cell" data-field="trigger">${cue.trigger || ''}</td>
                <td class="col-character editable-cell" data-field="character">${cue.character || ''}</td>
                <td class="col-location editable-cell" data-field="location">${cue.location || ''}</td>
                <td class="col-spot editable-cell" data-field="spot1">${cue.spot1 || ''}</td>
                <td class="col-spot editable-cell" data-field="spot2">${cue.spot2 || ''}</td>
                <td class="col-spot editable-cell" data-field="spot3">${cue.spot3 || ''}</td>
                <td class="col-spot editable-cell" data-field="spot4">${cue.spot4 || ''}</td>
                <td class="col-size editable-cell" data-field="size">${cue.size || ''}</td>
                <td class="col-color editable-cell" data-field="color">${cue.color || ''}</td>
                <td class="col-intensity editable-cell" data-field="intensity">${cue.intensity || ''}</td>
                <td class="col-notes editable-cell" data-field="notes">${cue.notes || ''}</td>
                <td class="col-fx editable-cell" data-field="fx">${cue.fx || ''}</td>
                <td class="col-timer editable-cell" data-field="timer">${cue.timer || ''}</td>
                <td class="col-actions">
                    <button class="action-btn edit-btn" title="Edit" data-cue-id="${cue.id}">✏️</button>
                    <button class="action-btn delete-btn" title="Delete" data-cue-id="${cue.id}">🗑️</button>
                </td>
            `;

            this.elements.masterTableBody.appendChild(row);

            // Add event listener to checkbox for button state updates
            const checkbox = row.querySelector('.cue-checkbox');
            checkbox.addEventListener('change', () => this.updateDeleteButtonState());
        });

        // Add event listeners to editable cells
        this.setupEditableCells();

        // Add event listeners to action buttons
        this.setupActionButtons();

        // Update delete button state
        this.updateDeleteButtonState();
    },

    // Setup editable cells for inline editing
    setupEditableCells() {
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                // Don't edit if clicking on input/select already
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }

                this.makeCellEditable(cell);
            });
        });
    },

    // Make a cell editable
    makeCellEditable(cell) {
        const field = cell.getAttribute('data-field');
        const cueId = cell.closest('tr').dataset.cueId;
        const cue = this.cues.find(c => c.id === cueId);

        if (!cue) return;

        // Clear any existing editable cells
        document.querySelectorAll('.editable-cell.editing').forEach(c => {
            const input = c.querySelector('input, select, textarea');
            if (input) {
                this.saveEditableCell(c, input, c.closest('tr').dataset.cueId, c.getAttribute('data-field'));
            }
        });

        // Create appropriate input based on field type
        let input;
        if (field === 'notes') {
            input = document.createElement('textarea');
            input.value = cue[field] || '';
        } else if (['spot1', 'spot2', 'spot3', 'spot4', 'size', 'character', 'location'].includes(field)) {
            input = document.createElement('select');

            // Get options based on field
            let options = [];
            if (field === 'character') {
                options = this.characters;
            } else if (field === 'location') {
                options = this.locations;
            } else if (field === 'size') {
                options = ['Full Body', 'Mid', 'Headshot', 'Tight'];
            } else if (['spot1', 'spot2', 'spot3', 'spot4'].includes(field)) {
                options = ['', 'Pickup', 'Hold', 'Follow', 'Fade Up', 'Fade Out', 'Bump', 'Snap', 'Out'];
            }

            // Add options
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                if (option === cue[field]) {
                    opt.selected = true;
                }
                input.appendChild(opt);
            });
        } else {
            input = document.createElement('input');
            input.type = field === 'intensity' ? 'number' : 'text';
            input.value = cue[field] || '';
            if (field === 'intensity') {
                input.min = '0';
                input.max = '100';
            }
        }

        // Style the input
        input.className = 'editable-input';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.padding = '6px 8px';
        input.style.border = '1px solid #4a90e2';
        input.style.borderRadius = '4px';
        input.style.backgroundColor = '#3a3a3a';
        input.style.color = '#e0e0e0';
        input.style.fontSize = '14px';
        input.style.fontFamily = 'inherit';
        input.style.position = 'relative';
        input.style.zIndex = '101';

        // Store original value
        cell.setAttribute('data-value', cue[field] || '');

        // Keep the original text visible while editing
        const originalText = cell.textContent || '';
        cell.innerHTML = '';
        cell.appendChild(input);
        cell.classList.add('editing');
        input.focus();

        // Select all text in input for easy replacement
        if (input.type === 'text' || input.type === 'number') {
            input.select();
        }

        // Handle blur (save)
        input.addEventListener('blur', () => {
            this.saveEditableCell(cell, input, cueId, field);
        });

        // Handle Enter key (save)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.saveEditableCell(cell, input, cueId, field);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEditableCell(cell, input);
            }
        });
    },

    // Save editable cell changes
    saveEditableCell(cell, input, cueId, field) {
        const newValue = input.value;
        const cueIndex = this.cues.findIndex(c => c.id === cueId);

        if (cueIndex !== -1) {
            this.cues[cueIndex][field] = newValue;
            cell.innerHTML = newValue || '';
            cell.classList.remove('editing');

            this.saveToLocalStorage();
            this.updateSaveStatus(`Updated ${field} for cue ${this.cues[cueIndex].cueNumber}`);
            this.renderSpotTables(); // Update spot tables with new data
        }
    },

    // Cancel editable cell changes
    cancelEditableCell(cell, input) {
        const originalValue = cell.getAttribute('data-value') || '';
        cell.innerHTML = originalValue;
        cell.classList.remove('editing');
    },

    // Setup action buttons (edit/delete)
    setupActionButtons() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cueId = btn.getAttribute('data-cue-id');
                this.openCueModal(cueId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cueId = btn.getAttribute('data-cue-id');
                if (confirm('Delete this cue?')) {
                    this.deleteCue(cueId);
                }
            });
        });
    },

    // Open cue modal for adding/editing
    openCueModal(cueId = null) {
        const cue = cueId ? this.cues.find(c => c.id === cueId) : null;

        if (cue) {
            // Editing existing cue
            this.elements.cueModalTitle.textContent = `Edit Cue ${cue.cueNumber}`;
            this.elements.cueId.value = cue.id;
            this.elements.cueNumber.value = cue.cueNumber || '';
            this.elements.cuePage.value = cue.page || '';
            this.elements.cueTrigger.value = cue.trigger || '';
            this.elements.cueCharacter.value = cue.character || '';
            this.elements.cueLocation.value = cue.location || '';
            this.elements.cueSpot1.value = cue.spot1 || '';
            this.elements.cueSpot2.value = cue.spot2 || '';
            this.elements.cueSpot3.value = cue.spot3 || '';
            this.elements.cueSpot4.value = cue.spot4 || '';
            this.elements.cueSize.value = cue.size || '';
            this.elements.cueColor.value = cue.color || '';
            this.elements.cueIntensity.value = cue.intensity || '';
            this.elements.cueNotes.value = cue.notes || '';
            this.elements.cueFX.value = cue.fx || '';
        } else {
            // Adding new cue
            this.elements.cueModalTitle.textContent = 'Add New Cue';
            this.elements.cueId.value = '';
            this.elements.cueNumber.value = '';
            this.elements.cuePage.value = '';
            this.elements.cueTrigger.value = '';
            this.elements.cueCharacter.value = '';
            this.elements.cueLocation.value = '';
            this.elements.cueSpot1.value = '';
            this.elements.cueSpot2.value = '';
            this.elements.cueSpot3.value = '';
            this.elements.cueSpot4.value = '';
            this.elements.cueSize.value = '';
            this.elements.cueColor.value = '';
            this.elements.cueIntensity.value = '';
            this.elements.cueNotes.value = '';
            this.elements.cueFX.value = '';
        }

        this.elements.cueModal.classList.add('show');
    },

    // Close cue modal
    closeCueModal() {
        this.elements.cueModal.classList.remove('show');
    },

    // Save cue from modal
    saveCue() {
        const cueId = this.elements.cueId.value;
        const cueData = {
            id: cueId || `cue-${Date.now()}`,
            cueNumber: this.elements.cueNumber.value.trim(),
            page: this.elements.cuePage.value.trim(),
            trigger: this.elements.cueTrigger.value.trim(),
            character: this.elements.cueCharacter.value.trim(),
            location: this.elements.cueLocation.value.trim(),
            spot1: this.elements.cueSpot1.value.trim(),
            spot2: this.elements.cueSpot2.value.trim(),
            spot3: this.elements.cueSpot3.value.trim(),
            spot4: this.elements.cueSpot4.value.trim(),
            size: this.elements.cueSize.value.trim(),
            color: this.elements.cueColor.value.trim(),
            intensity: this.elements.cueIntensity.value.trim(),
            notes: this.elements.cueNotes.value.trim(),
            fx: this.elements.cueFX.value.trim()
        };

        if (cueId) {
            // Update existing cue
            const index = this.cues.findIndex(c => c.id === cueId);
            if (index !== -1) {
                this.cues[index] = cueData;
                this.showToast(`Updated cue ${cueData.cueNumber}`, 'success');
            }
        } else {
            // Add new cue
            this.cues.push(cueData);
            this.showToast(`Added cue ${cueData.cueNumber}`, 'success');
        }

        this.saveToLocalStorage();
        this.closeCueModal();
        this.updateUI();
    },

    // Delete cue
    deleteCue(cueId) {
        this.cues = this.cues.filter(c => c.id !== cueId);
        this.saveToLocalStorage();
        this.updateUI();
        this.showToast('Cue deleted', 'success');
    },

    // Douse selected cues (set all spot actions to Fade Out)
    douseSelectedCues() {
        const checkboxes = document.querySelectorAll('.cue-checkbox:checked');
        if (checkboxes.length === 0) return;

        if (confirm(`Set all spot actions to "Fade Out" for ${checkboxes.length} selected cue(s)?`)) {
            let dousedCount = 0;

            checkboxes.forEach(checkbox => {
                const cueId = checkbox.getAttribute('data-cue-id');
                const cueIndex = this.cues.findIndex(c => c.id === cueId);

                if (cueIndex !== -1) {
                    // Set all spot actions to "Fade Out"
                    this.cues[cueIndex].spot1 = this.cues[cueIndex].spot1 ? 'Fade Out' : '';
                    this.cues[cueIndex].spot2 = this.cues[cueIndex].spot2 ? 'Fade Out' : '';
                    this.cues[cueIndex].spot3 = this.cues[cueIndex].spot3 ? 'Fade Out' : '';
                    this.cues[cueIndex].spot4 = this.cues[cueIndex].spot4 ? 'Fade Out' : '';
                    dousedCount++;
                }
            });

            this.saveToLocalStorage();
            this.updateUI();
            this.showToast(`Doused ${dousedCount} cue(s) - all spots set to Fade Out`, 'success');
        }
    },

    // Duplicate selected cues
    duplicateSelectedCues() {
        const checkboxes = document.querySelectorAll('.cue-checkbox:checked');
        if (checkboxes.length === 0) return;

        // Find the position of the last selected cue
        let insertIndex = -1;
        const selectedCueIds = [];

        checkboxes.forEach(checkbox => {
            const cueId = checkbox.getAttribute('data-cue-id');
            const cueIndex = this.cues.findIndex(c => c.id === cueId);
            if (cueIndex > insertIndex) {
                insertIndex = cueIndex;
            }
            selectedCueIds.push(cueId);
        });

        // Create duplicates of selected cues
        const duplicatedCues = [];
        selectedCueIds.forEach(cueId => {
            const originalCue = this.cues.find(c => c.id === cueId);
            if (originalCue) {
                // Create a deep copy of the cue with a new ID
                const duplicatedCue = {
                    ...JSON.parse(JSON.stringify(originalCue)), // Deep copy
                    id: `cue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // New unique ID
                };

                // Optionally update the cue number (add a suffix like .1, .2, etc.)
                // For now, we'll keep the same cue number but this could be modified
                // duplicatedCue.cueNumber = `${originalCue.cueNumber}.dup`;

                duplicatedCues.push(duplicatedCue);
            }
        });

        // Insert duplicated cues after the last selected cue
        this.cues.splice(insertIndex + 1, 0, ...duplicatedCues);

        this.saveToLocalStorage();
        this.updateUI();
        this.showToast(`Duplicated ${duplicatedCues.length} cue(s)`, 'success');
    },

    // Delete selected cues
    deleteSelectedCues() {
        const checkboxes = document.querySelectorAll('.cue-checkbox:checked');
        if (checkboxes.length === 0) return;

        if (confirm(`Delete ${checkboxes.length} selected cue(s)?`)) {
            checkboxes.forEach(checkbox => {
                const cueId = checkbox.getAttribute('data-cue-id');
                this.cues = this.cues.filter(c => c.id !== cueId);
            });

            this.saveToLocalStorage();
            this.updateUI();
            this.showToast(`Deleted ${checkboxes.length} cues`, 'success');
        }
    },

    // Toggle select all checkboxes
    toggleSelectAll(checked) {
        document.querySelectorAll('.cue-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateDeleteButtonState();
    },

    // Update delete, duplicate, and douse button states based on selection
    updateDeleteButtonState() {
        const checkedBoxes = document.querySelectorAll('.cue-checkbox:checked');
        const hasSelection = checkedBoxes.length > 0;
        this.elements.btnDeleteSelected.disabled = !hasSelection;
        this.elements.btnDuplicateSelected.disabled = !hasSelection;
        this.elements.btnDouseSelected.disabled = !hasSelection;
    },

    // Filter cues based on search input
    filterCues() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const filterType = this.elements.searchFilter.value;

        if (!searchTerm) {
            return this.cues;
        }

        return this.cues.filter(cue => {
            if (filterType === 'all') {
                return Object.values(cue).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                );
            } else if (filterType === 'cueNumber') {
                return String(cue.cueNumber).toLowerCase().includes(searchTerm);
            } else if (filterType === 'character') {
                return String(cue.character).toLowerCase().includes(searchTerm);
            } else if (filterType === 'page') {
                return String(cue.page).toLowerCase().includes(searchTerm);
            } else if (filterType === 'trigger') {
                return String(cue.trigger).toLowerCase().includes(searchTerm);
            }
            return true;
        });
    },

    // Render spot operator tables
    renderSpotTables() {
        this.renderSpotTable(1, this.elements.spot1TableBody, this.elements.spot1Count);
        this.renderSpotTable(2, this.elements.spot2TableBody, this.elements.spot2Count);
        this.renderSpotTable(3, this.elements.spot3TableBody, this.elements.spot3Count);
        this.renderSpotTable(4, this.elements.spot4TableBody, this.elements.spot4Count);
    },

    // Render individual spot table
    renderSpotTable(spotNumber, tableBody, countElement) {
        tableBody.innerHTML = '';

        // Filter cues for this spot (where spot action is not empty or "Out")
        const spotCues = this.cues.filter(cue => {
            const spotAction = cue[`spot${spotNumber}`];
            return spotAction && spotAction !== '' && spotAction !== 'Out';
        });

        spotCues.forEach(cue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="col-cue">${cue.cueNumber || ''}</td>
                <td class="col-trigger">${cue.trigger || ''}</td>
                <td class="col-character">${cue.character || ''}</td>
                <td class="col-location">${cue.location || ''}</td>
                <td class="col-action">${cue[`spot${spotNumber}`] || ''}</td>
                <td class="col-size">${cue.size || ''}</td>
                <td class="col-color">${cue.color || ''}</td>
                <td class="col-intensity">${cue.intensity || ''}</td>
                <td class="col-notes">${cue.notes || ''}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update count
        countElement.textContent = `${spotCues.length} cues`;
    },

    // Update all cue counts
    updateCueCounts() {
        this.elements.cueCount.textContent = `${this.cues.length} cues`;
        this.renderSpotTables(); // This also updates individual spot counts
    },

    // Open settings modal
    openSettingsModal() {
        // Refresh the character and location lists when opening the modal
        this.renderCharacterList();
        this.renderLocationList();
        this.elements.settingsModal.classList.add('show');
    },

    // Close settings modal
    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('show');
    },

    // Export to PDF
    exportToPDF(exportType) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
        });

        const productionName = this.productionName || 'Followspot Cues';
        const lightingDesigner = this.lightingDesigner || '';
        const date = new Date().toLocaleDateString();

        // Set up document
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');

        // Add header
        if (exportType === 'master') {
            doc.text(`Master Cue Sheet - ${productionName}`, 14, 20);
        } else {
            doc.text(`Spot ${exportType.slice(-1)} Cue Sheet - ${productionName}`, 14, 20);
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        if (lightingDesigner) {
            doc.text(`Lighting Design: ${lightingDesigner}`, 14, 28);
        }

        // Define action colors for better readability
        const getActionColor = (action) => {
            switch (action?.toLowerCase()) {
                case 'pickup': return [144, 238, 144]; // Light green
                case 'hold': return [173, 216, 230]; // Light blue
                case 'follow': return [255, 218, 185]; // Peach
                case 'fade up': return [144, 238, 144]; // Light green
                case 'fade out': return [255, 182, 193]; // Light pink
                case 'bump': return [255, 255, 153]; // Light yellow
                case 'snap': return [255, 160, 122]; // Light salmon
                case 'out': return [211, 211, 211]; // Light gray
                default: return [255, 255, 255]; // White
            }
        };

        // Define character styles for differentiation
        const getCharacterStyle = (character, index) => {
            const characterStyles = [
                { bg: [255, 235, 235], text: [139, 0, 0] },     // Light red bg, dark red text
                { bg: [235, 255, 235], text: [0, 100, 0] },     // Light green bg, dark green text
                { bg: [235, 235, 255], text: [0, 0, 139] },     // Light blue bg, dark blue text
                { bg: [255, 255, 235], text: [139, 139, 0] },   // Light yellow bg, dark yellow text
                { bg: [255, 235, 255], text: [139, 0, 139] },   // Light magenta bg, dark magenta text
                { bg: [235, 255, 255], text: [0, 139, 139] },   // Light cyan bg, dark cyan text
                { bg: [255, 245, 235], text: [160, 82, 45] },   // Light orange bg, saddle brown text
                { bg: [245, 255, 235], text: [85, 107, 47] },   // Light lime bg, olive drab text
                { bg: [245, 235, 255], text: [75, 0, 130] },    // Light purple bg, indigo text
                { bg: [255, 235, 245], text: [199, 21, 133] }   // Light pink bg, medium violet red text
            ];

            return characterStyles[index % characterStyles.length];
        };

        const getTextColor = (action) => {
            // Return black text for better contrast on colored backgrounds
            return [0, 0, 0];
        };

        // Prepare data for table
        let columns, rows;

        if (exportType === 'master') {
            columns = [
                { title: "Cue #", dataKey: "cueNumber" },
                { title: "Page", dataKey: "page" },
                { title: "Trigger", dataKey: "trigger" },
                { title: "Character", dataKey: "character" },
                { title: "Location", dataKey: "location" },
                { title: "Spot 1", dataKey: "spot1" },
                { title: "Spot 2", dataKey: "spot2" },
                { title: "Spot 3", dataKey: "spot3" },
                { title: "Spot 4", dataKey: "spot4" },
                { title: "Size", dataKey: "size" },
                { title: "Color", dataKey: "color" },
                { title: "Int %", dataKey: "intensity" },
                { title: "Notes", dataKey: "notes" },
                { title: "FX", dataKey: "fx" }
            ];

            rows = this.cues.map(cue => ({
                cueNumber: cue.cueNumber || '',
                page: cue.page || '',
                trigger: cue.trigger || '',
                character: cue.character || '',
                location: cue.location || '',
                spot1: cue.spot1 || '',
                spot2: cue.spot2 || '',
                spot3: cue.spot3 || '',
                spot4: cue.spot4 || '',
                size: cue.size || '',
                color: cue.color || '',
                intensity: cue.intensity || '',
                notes: cue.notes || '',
                fx: cue.fx || ''
            }));
        } else {
            const spotNumber = exportType.slice(-1);
            const spotCues = this.cues.filter(cue => {
                const spotAction = cue[`spot${spotNumber}`];
                return spotAction && spotAction !== '' && spotAction !== 'Out';
            });

            columns = [
                { title: "Cue #", dataKey: "cueNumber" },
                { title: "Trigger", dataKey: "trigger" },
                { title: "Character", dataKey: "character" },
                { title: "Location", dataKey: "location" },
                { title: "Action", dataKey: "action" },
                { title: "Size", dataKey: "size" },
                { title: "Color", dataKey: "color" },
                { title: "Int %", dataKey: "intensity" },
                { title: "Notes", dataKey: "notes" }
            ];

            rows = spotCues.map(cue => ({
                cueNumber: cue.cueNumber || '',
                trigger: cue.trigger || '',
                character: cue.character || '',
                location: cue.location || '',
                action: cue[`spot${spotNumber}`] || '',
                size: cue.size || '',
                color: cue.color || '',
                intensity: cue.intensity || '',
                notes: cue.notes || ''
            }));
        }

        // Add table with custom styling for action columns
        doc.autoTable({
            head: [columns.map(col => col.title)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            startY: 35,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                textColor: [0, 0, 0] // Default black text
            },
            headStyles: {
                fillColor: [40, 40, 40],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            columnStyles: {
                0: { cellWidth: 15 }, // Cue #
                1: { cellWidth: 40 }, // Trigger
                2: { cellWidth: 30 }, // Character
                3: { cellWidth: 25 }, // Location
                4: { cellWidth: 30 }, // Action/Spot columns
                5: { cellWidth: 20 }, // Size
                6: { cellWidth: 20 }, // Color
                7: { cellWidth: 15 }, // Int %
                8: { cellWidth: 35 }, // Notes
                9: { cellWidth: 20 }, // FX (for master sheet)
                10: { cellWidth: 20 }, // Additional columns
                11: { cellWidth: 20 },
                12: { cellWidth: 20 },
                13: { cellWidth: 20 }
            },
            // Custom cell styling function
            didParseCell: function(data) {
                // Style headers to ensure consistent dark background
                if (data.row.section === 'head') {
                    data.cell.styles.fillColor = [40, 40, 40];
                    data.cell.styles.textColor = 255;
                    data.cell.styles.fontStyle = 'bold';
                    return; // Don't apply data row styling to headers
                }

                // Color code the action columns (Spot 1-4 or Action column) - only for data rows
                const actionColumns = exportType === 'master' ? [5, 6, 7, 8] : [4]; // Column indices for actions

                if (actionColumns.includes(data.column.index) && data.row.index >= 0) {
                    const actionValue = data.cell.text[0];
                    if (actionValue && actionValue.trim() !== '') {
                        data.cell.styles.fillColor = getActionColor(actionValue);
                        data.cell.styles.textColor = getTextColor(actionValue);
                        data.cell.styles.fontStyle = 'bold'; // Make action text bold for emphasis
                    }
                }

                // Style character column for differentiation - only for data rows
                const characterColumn = exportType === 'master' ? 3 : 2; // Character column index
                if (data.column.index === characterColumn && data.row.index >= 0) {
                    const characterValue = data.cell.text[0];
                    if (characterValue && characterValue.trim() !== '') {
                        // Find character index for consistent styling
                        const characterIndex = app.characters.indexOf(characterValue);
                        if (characterIndex >= 0) {
                            const style = getCharacterStyle(characterValue, characterIndex);
                            data.cell.styles.fillColor = style.bg;
                            data.cell.styles.textColor = style.text;
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            }
        });

        // Add legend for color coding
        const legendY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Action Legend:', 14, legendY);

        doc.setFont('helvetica', 'normal');
        const legendItems = [
            { action: 'Pickup', color: getActionColor('Pickup') },
            { action: 'Hold', color: getActionColor('Hold') },
            { action: 'Follow', color: getActionColor('Follow') },
            { action: 'Fade Up', color: getActionColor('Fade Up') },
            { action: 'Fade Out', color: getActionColor('Fade Out') },
            { action: 'Bump', color: getActionColor('Bump') },
            { action: 'Snap', color: getActionColor('Snap') },
            { action: 'Out', color: getActionColor('Out') }
        ];

        let legendX = 14;
        let legendYPos = legendY + 5;

        legendItems.forEach((item, index) => {
            // Draw color box
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.rect(legendX, legendYPos - 3, 4, 4, 'F');

            // Draw text
            doc.setTextColor(0, 0, 0);
            doc.text(item.action, legendX + 6, legendYPos);

            // Move to next position
            legendX += 25;
            if ((index + 1) % 4 === 0) {
                legendX = 14;
                legendYPos += 6;
            }
        });

        // Add footer with date and time
        const now = new Date();
        const dateTimeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            // Date and time on the left
            doc.text(`Generated: ${dateTimeString}`, 14, doc.internal.pageSize.height - 10);
            // Page numbers on the right
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        }

        // Save PDF
        const filename = `${productionName.replace(/\s+/g, '_')}_${exportType}_${date.replace(/\//g, '-')}.pdf`;
        doc.save(filename);

        this.showToast(`PDF exported: ${filename}`, 'success');
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.elements.toastContainer.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
