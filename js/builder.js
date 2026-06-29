// Complete Resume Builder with Working Save Functionality
class ResumeBuilder {
    constructor() {
        this.educationCount = 1;
        this.experienceCount = 1;
        this.achievementsCount = 1;
        this.languagesCount = 1;
        this.projectsCount = 1;
        this.certificationsCount = 1;
        this.hackathonsCount = 1;
        this.currentResumeId = this.getResumeIdFromURL();
        this.profileImage = null;
        this.selectedTemplate = 'template1';
        this.autoSaveTimer = null;
        this.isSaving = false;
        this.init();
    }

    getResumeIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('resumeId');
    }

    init() {
        this.bindEvents();
        this.loadSavedResume();
        this.initializeDynamicForms();
        this.setupAutoSave();
        this.updateProgress();
    }

    validateInput(input, type) {
        const patterns = {
            name: /^[A-Za-z\s\-']+$/,  // Letters, spaces, hyphens, and apostrophes
            phone: /^[\d\s\-\(\)\+]+$/, // Numbers, spaces, hyphens, parentheses, plus
            gpa: /^(?:[0-3]\.(?:\d{1,2})|4\.0{1,2}|[0-4])$/, // 0.00 to 4.00
            school: /^[A-Za-z\s\-\&\.]+$/, // Letters, spaces, hyphens, ampersands, periods
            onlyLetters: /^[A-Za-z\s]+$/, // Only letters and spaces
            languageName: /^[A-Za-z\s\-\(\)]+$/ // Letters, spaces, hyphens, parentheses
        };

        const pattern = patterns[type];
        if (!pattern) return true; // If no pattern defined, accept the input

        const isValid = pattern.test(input.value);
        
        // Visual feedback
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }

        return isValid;
    }

    setupInputValidation() {
        // Full Name validation
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) {
            fullNameInput.addEventListener('input', (e) => {
                if (!this.validateInput(e.target, 'name')) {
                    this.showMessage('Please enter only letters and spaces in the name field', 'error');
                }
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                if (!this.validateInput(e.target, 'phone')) {
                    this.showMessage('Please enter a valid phone number', 'error');
                }
            });
        }

        // GPA validation
        document.querySelectorAll('[id^="gpa"]').forEach(input => {
            input.addEventListener('input', (e) => {
                if (!this.validateInput(e.target, 'gpa')) {
                    this.showMessage('GPA must be between 0.00 and 4.00', 'error');
                }
            });
        });

        // School/Institution validation
        document.querySelectorAll('[id^="school"]').forEach(input => {
            input.addEventListener('input', (e) => {
                if (!this.validateInput(e.target, 'school')) {
                    this.showMessage('Please enter a valid institution name', 'error');
                }
            });
        });

        // Language name validation
        document.querySelectorAll('[id^="language"]').forEach(input => {
            input.addEventListener('input', (e) => {
                if (!this.validateInput(e.target, 'languageName')) {
                    this.showMessage('Please enter a valid language name', 'error');
                }
            });
        });
    }

    bindEvents() {
        // Template selection
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => this.selectTemplate(option));
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Set up input validation
        this.setupInputValidation();

        // Real-time preview updates
        this.setupRealTimePreview();
        
        // Progress tracking
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                this.updateProgress();
                this.triggerAutoSave();
            });
        });

        // Form actions
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveResume());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetForm());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('downloadBtn')?.addEventListener('click', () => this.exportPDF());

        // Dynamic form buttons
        document.getElementById('addEducation')?.addEventListener('click', () => this.addEducationField());
        document.getElementById('addExperience')?.addEventListener('click', () => this.addExperienceField());
        document.getElementById('addAchievement')?.addEventListener('click', () => this.addAchievementField());
        document.getElementById('addLanguage')?.addEventListener('click', () => this.addLanguageField());
        document.getElementById('addProject')?.addEventListener('click', () => this.addProjectField());
        document.getElementById('addCertification')?.addEventListener('click', () => this.addCertificationField());
        document.getElementById('addHackathon')?.addEventListener('click', () => this.addHackathonField());

        // Skills management
        document.getElementById('skillsInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addSkill(e.target.value.trim().replace(',', ''));
                e.target.value = '';
            }
        });

        // Image upload
        document.getElementById('profileImage')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImage')?.addEventListener('click', () => this.removeProfileImage());
    }

    selectTemplate(option) {
        document.querySelectorAll('.template-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        this.selectedTemplate = option.getAttribute('data-template');
        this.updatePreview();
    }

    initializeDynamicForms() {
        this.educationCount = 1;
        this.experienceCount = 1;
        this.achievementsCount = 1;
        this.languagesCount = 1;
        this.projectsCount = 1;
        this.certificationsCount = 1;
        this.hackathonsCount = 1;
    }

    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    setupRealTimePreview() {
        const personalFields = ['fullName', 'email', 'phone', 'address', 'linkedin', 'portfolio', 'github', 'summary'];
        personalFields.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
            }
        });

        document.getElementById('education-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('experience-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('achievements-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('languages-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('projects-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('certifications-container')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('hackathons-container')?.addEventListener('input', () => this.updatePreview());
        
        // Skills inputs
        ['skillsInput', 'skillsLanguages', 'skillsTechnologies', 'skillsConcepts'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
            }
        });
    }

    // Education Methods
    addEducationField() {
        this.educationCount++;
        const container = document.getElementById('education-container');
        const newItem = document.createElement('div');
        newItem.className = 'education-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="school${this.educationCount}">Institution</label>
                <input type="text" id="school${this.educationCount}" placeholder="G M University">
            </div>
            <div class="form-group">
                <label for="degree${this.educationCount}">Degree</label>
                <input type="text" id="degree${this.educationCount}" placeholder="Bachelor of Science in Computer Science">
            </div>
            <div class="form-group">
                <label for="gpa${this.educationCount}">GPA / CGPA</label>
                <input type="text" id="gpa${this.educationCount}" placeholder="3.8 or 8.2/10">
            </div>
            <div class="form-group">
                <label for="gradDate${this.educationCount}">Graduation Date</label>
                <input type="month" id="gradDate${this.educationCount}">
            </div>
            <div class="form-group">
                <label for="coursework${this.educationCount}">Relevant Coursework (comma separated)</label>
                <input type="text" id="coursework${this.educationCount}" placeholder="Machine Learning, Data Science, AI">
            </div>
            <div class="form-group">
                <label for="location${this.educationCount}">Location</label>
                <input type="text" id="location${this.educationCount}" placeholder="City, State">
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeEducationField(this)">Remove Education</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeEducationField(button) {
        const item = button.closest('.education-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Experience Methods
    addExperienceField() {
        this.experienceCount++;
        const container = document.getElementById('experience-container');
        const newItem = document.createElement('div');
        newItem.className = 'experience-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="company${this.experienceCount}">Company</label>
                <input type="text" id="company${this.experienceCount}" placeholder="Tech Company Inc.">
            </div>
            <div class="form-group">
                <label for="position${this.experienceCount}">Position</label>
                <input type="text" id="position${this.experienceCount}" placeholder="Software Developer Intern">
            </div>
            <div class="form-group">
                <label for="startDate${this.experienceCount}">Start Date</label>
                <input type="month" id="startDate${this.experienceCount}">
            </div>
            <div class="form-group">
                <label for="endDate${this.experienceCount}">End Date</label>
                <input type="month" id="endDate${this.experienceCount}">
            </div>
            <div class="form-group">
                <label for="expDescription${this.experienceCount}">Description</label>
                <textarea id="expDescription${this.experienceCount}" placeholder="Describe your responsibilities and achievements"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeExperienceField(this)">Remove Experience</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeExperienceField(button) {
        const item = button.closest('.experience-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Achievements Methods
    addAchievementField() {
        this.achievementsCount++;
        const container = document.getElementById('achievements-container');
        const newItem = document.createElement('div');
        newItem.className = 'achievement-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="achievementTitle${this.achievementsCount}">Achievement/Certification Title</label>
                <input type="text" id="achievementTitle${this.achievementsCount}" placeholder="Dean's List Award">
            </div>
            <div class="form-group">
                <label for="achievementOrg${this.achievementsCount}">Organization</label>
                <input type="text" id="achievementOrg${this.achievementsCount}" placeholder="G M University">
            </div>
            <div class="form-group">
                <label for="achievementDate${this.achievementsCount}">Date Received</label>
                <input type="month" id="achievementDate${this.achievementsCount}">
            </div>
            <div class="form-group">
                <label for="achievementDesc${this.achievementsCount}">Description</label>
                <textarea id="achievementDesc${this.achievementsCount}" placeholder="Awarded for academic excellence..."></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeAchievementField(this)">Remove Achievement</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeAchievementField(button) {
        const item = button.closest('.achievement-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Languages Methods
    addLanguageField() {
        this.languagesCount++;
        const container = document.getElementById('languages-container');
        const newItem = document.createElement('div');
        newItem.className = 'language-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="language${this.languagesCount}">Language</label>
                <input type="text" id="language${this.languagesCount}" placeholder="English">
            </div>
            <div class="form-group">
                <label for="proficiency${this.languagesCount}">Proficiency Level</label>
                <select id="proficiency${this.languagesCount}">
                    <option value="">Select Proficiency</option>
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Basic">Basic</option>
                </select>
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeLanguageField(this)">Remove Language</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeLanguageField(button) {
        const item = button.closest('.language-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Projects Methods
    addProjectField() {
        this.projectsCount++;
        const container = document.getElementById('projects-container');
        const newItem = document.createElement('div');
        newItem.className = 'project-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="projectName${this.projectsCount}">Project Name</label>
                <input type="text" id="projectName${this.projectsCount}" placeholder="Project Name">
            </div>
            <div class="form-group">
                <label for="projectTech${this.projectsCount}">Technologies Used (comma separated)</label>
                <input type="text" id="projectTech${this.projectsCount}" placeholder="React, Node.js, MongoDB">
            </div>
            <div class="form-group">
                <label for="projectLink${this.projectsCount}">Project Link (optional)</label>
                <input type="url" id="projectLink${this.projectsCount}" placeholder="https://project-url.com">
            </div>
            <div class="form-group">
                <label for="projectDate${this.projectsCount}">Date</label>
                <input type="month" id="projectDate${this.projectsCount}">
            </div>
            <div class="form-group">
                <label for="projectDescription${this.projectsCount}">Description (one per line for bullet points)</label>
                <textarea id="projectDescription${this.projectsCount}" placeholder="Describe your project (each line becomes a bullet point)"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeProjectField(this)">Remove Project</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeProjectField(button) {
        const item = button.closest('.project-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Certifications Methods
    addCertificationField() {
        this.certificationsCount++;
        const container = document.getElementById('certifications-container');
        const newItem = document.createElement('div');
        newItem.className = 'certification-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="certIssuer${this.certificationsCount}">Issuing Organization</label>
                <input type="text" id="certIssuer${this.certificationsCount}" placeholder="freeCodeCamp, NPTEL, CISCO">
            </div>
            <div class="form-group">
                <label for="certName${this.certificationsCount}">Certification Name</label>
                <input type="text" id="certName${this.certificationsCount}" placeholder="Responsive Web Design, JavaScript">
            </div>
            <div class="form-group">
                <label for="certDate${this.certificationsCount}">Date Received</label>
                <input type="month" id="certDate${this.certificationsCount}">
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeCertificationField(this)">Remove Certification</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeCertificationField(button) {
        const item = button.closest('.certification-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Hackathons Methods
    addHackathonField() {
        this.hackathonsCount++;
        const container = document.getElementById('hackathons-container');
        const newItem = document.createElement('div');
        newItem.className = 'hackathon-item form-group';
        newItem.innerHTML = `
            <div class="form-group">
                <label for="hackathonName${this.hackathonsCount}">Hackathon Name & Award</label>
                <input type="text" id="hackathonName${this.hackathonsCount}" placeholder="IGNITRON 2K24 Hackathon - 1st Place">
            </div>
            <div class="form-group">
                <label for="hackathonLink${this.hackathonsCount}">Link (optional)</label>
                <input type="url" id="hackathonLink${this.hackathonsCount}" placeholder="https://hackathon-link.com">
            </div>
            <div class="form-group">
                <label for="hackathonDate${this.hackathonsCount}">Date</label>
                <input type="month" id="hackathonDate${this.hackathonsCount}">
            </div>
            <div class="form-group">
                <label for="hackathonDescription${this.hackathonsCount}">Description (one per line for bullet points)</label>
                <textarea id="hackathonDescription${this.hackathonsCount}" placeholder="Describe your hackathon project (each line becomes a bullet point)"></textarea>
            </div>
            <div class="form-group">
                <label for="hackathonTech${this.hackathonsCount}">Technologies Used (comma separated)</label>
                <input type="text" id="hackathonTech${this.hackathonsCount}" placeholder="Laravel, GEMINI API, Tailwind CSS">
            </div>
            <div class="form-group">
                <label for="hackathonPrize${this.hackathonsCount}">Prize (optional)</label>
                <input type="text" id="hackathonPrize${this.hackathonsCount}" placeholder="Rs. 25,000">
            </div>
            <button type="button" class="remove-btn" onclick="resumeBuilder.removeHackathonField(this)">Remove Hackathon</button>
        `;
        container.appendChild(newItem);
        this.updatePreview();
    }

    removeHackathonField(button) {
        const item = button.closest('.hackathon-item');
        if (item) {
            item.remove();
            this.updatePreview();
        }
    }

    // Skills Methods
    addSkill(skill) {
        if (!skill) return;
        
        const skillsPreview = document.getElementById('skillsPreview');
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-tag';
        skillElement.innerHTML = `
            ${skill}
            <button class="remove-btn" onclick="resumeBuilder.removeSkill(this)">×</button>
        `;
        skillsPreview.appendChild(skillElement);
        this.updatePreview();
    }

    removeSkill(button) {
        button.parentElement.remove();
        this.updatePreview();
    }

    // Image Upload Methods
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            if (typeof toast !== 'undefined') {
                toast.error('Please select a valid image file (JPEG, PNG, etc.)');
            } else {
                alert('Please select a valid image file (JPEG, PNG, etc.)');
            }
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            if (typeof toast !== 'undefined') {
                toast.error('Image size should be less than 2MB');
            } else {
                alert('Image size should be less than 2MB');
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.profileImage = e.target.result;
            this.updateImagePreview(this.profileImage);
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }

    removeProfileImage() {
        this.profileImage = null;
        this.updateImagePreview(null);
        document.getElementById('profileImage').value = '';
        this.updatePreview();
    }

    updateImagePreview(imageData) {
        const preview = document.getElementById('imagePreview');
        const image = preview.querySelector('.image-preview__image');
        const defaultText = preview.querySelector('.image-preview__default-text');
        const removeBtn = document.getElementById('removeImage');

        if (imageData) {
            image.src = imageData;
            image.style.display = 'block';
            defaultText.style.display = 'none';
            removeBtn.style.display = 'block';
            preview.style.border = '2px solid var(--gmu-blue)';
        } else {
            image.style.display = 'none';
            defaultText.style.display = 'block';
            removeBtn.style.display = 'none';
            preview.style.border = '2px dashed var(--medium-gray)';
        }
    }

    // Data Collection
    collectFormData() {
        return {
            personalInfo: {
                name: document.getElementById('fullName')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                address: document.getElementById('address')?.value || '',
                linkedin: document.getElementById('linkedin')?.value || '',
                portfolio: document.getElementById('portfolio')?.value || '',
                github: document.getElementById('github')?.value || '',
                summary: document.getElementById('summary')?.value || '',
                profileImage: this.profileImage || ''
            },
            education: this.collectEducationData(),
            experience: this.collectExperienceData(),
            projects: this.collectProjectsData(),
            skills: this.collectSkillsData(),
            achievements: this.collectAchievementsData(),
            certifications: this.collectCertificationsData(),
            hackathons: this.collectHackathonsData(),
            languages: this.collectLanguagesData()
        };
    }

    collectEducationData() {
        const educationItems = [];
        const existingItems = document.querySelectorAll('.education-item');
        existingItems.forEach((item, index) => {
            const i = index + 1;
            const school = document.getElementById(`school${i}`)?.value || '';
            const degree = document.getElementById(`degree${i}`)?.value || '';
            const gpa = document.getElementById(`gpa${i}`)?.value || '';
            const gradDate = document.getElementById(`gradDate${i}`)?.value || '';
            const coursework = document.getElementById(`coursework${i}`)?.value || '';
            const location = document.getElementById(`location${i}`)?.value || '';
            
            if (school || degree) {
                educationItems.push({
                    school,
                    degree,
                    gpa,
                    gradDate: this.formatDate(gradDate),
                    coursework,
                    location
                });
            }
        });
        return educationItems;
    }

    collectExperienceData() {
        const experienceItems = [];
        const existingItems = document.querySelectorAll('.experience-item');
        existingItems.forEach((item, index) => {
            const i = index + 1;
            const company = document.getElementById(`company${i}`)?.value || '';
            const position = document.getElementById(`position${i}`)?.value || '';
            const startDate = document.getElementById(`startDate${i}`)?.value || '';
            const endDate = document.getElementById(`endDate${i}`)?.value || '';
            const description = document.getElementById(`expDescription${i}`)?.value || '';
            const location = document.getElementById(`expLocation${i}`)?.value || '';
            
            if (company || position) {
                experienceItems.push({
                    company,
                    position,
                    startDate: this.formatDate(startDate),
                    endDate: this.formatDate(endDate) || 'CURRENT',
                    description,
                    location
                });
            }
        });
        return experienceItems;
    }

    collectAchievementsData() {
        const achievementItems = [];
        for (let i = 1; i <= this.achievementsCount; i++) {
            const title = document.getElementById(`achievementTitle${i}`)?.value || '';
            const organization = document.getElementById(`achievementOrg${i}`)?.value || '';
            const date = document.getElementById(`achievementDate${i}`)?.value || '';
            const description = document.getElementById(`achievementDesc${i}`)?.value || '';
            
            if (title) {
                achievementItems.push({
                    title,
                    organization,
                    date: this.formatDate(date),
                    description
                });
            }
        }
        return achievementItems;
    }

    collectLanguagesData() {
        const languageItems = [];
        for (let i = 1; i <= this.languagesCount; i++) {
            const language = document.getElementById(`language${i}`)?.value || '';
            const proficiency = document.getElementById(`proficiency${i}`)?.value || '';
            
            if (language) {
                languageItems.push({
                    language,
                    proficiency
                });
            }
        }
        return languageItems;
    }

    collectProjectsData() {
        const projectItems = [];
        const existingItems = document.querySelectorAll('.project-item');
        existingItems.forEach((item, index) => {
            const i = index + 1;
            const name = document.getElementById(`projectName${i}`)?.value || '';
            const tech = document.getElementById(`projectTech${i}`)?.value || '';
            const link = document.getElementById(`projectLink${i}`)?.value || '';
            const date = document.getElementById(`projectDate${i}`)?.value || '';
            const description = document.getElementById(`projectDescription${i}`)?.value || '';
            
            if (name) {
                projectItems.push({
                    name,
                    tech,
                    link,
                    date: this.formatDate(date),
                    description
                });
            }
        });
        return projectItems;
    }

    collectCertificationsData() {
        const certItems = [];
        const existingItems = document.querySelectorAll('.certification-item');
        existingItems.forEach((item, index) => {
            const i = index + 1;
            const issuer = document.getElementById(`certIssuer${i}`)?.value || '';
            const name = document.getElementById(`certName${i}`)?.value || '';
            const date = document.getElementById(`certDate${i}`)?.value || '';
            
            if (issuer || name) {
                certItems.push({
                    issuer,
                    name,
                    date: this.formatDate(date)
                });
            }
        });
        return certItems;
    }

    collectHackathonsData() {
        const hackathonItems = [];
        const existingItems = document.querySelectorAll('.hackathon-item');
        existingItems.forEach((item, index) => {
            const i = index + 1;
            const name = document.getElementById(`hackathonName${i}`)?.value || '';
            const link = document.getElementById(`hackathonLink${i}`)?.value || '';
            const date = document.getElementById(`hackathonDate${i}`)?.value || '';
            const description = document.getElementById(`hackathonDescription${i}`)?.value || '';
            const tech = document.getElementById(`hackathonTech${i}`)?.value || '';
            const prize = document.getElementById(`hackathonPrize${i}`)?.value || '';
            
            if (name) {
                hackathonItems.push({
                    name,
                    link,
                    date: this.formatDate(date),
                    description,
                    tech,
                    prize
                });
            }
        });
        return hackathonItems;
    }

    collectSkillsData() {
        const languages = document.getElementById('skillsLanguages')?.value || '';
        const technologies = document.getElementById('skillsTechnologies')?.value || '';
        const concepts = document.getElementById('skillsConcepts')?.value || '';
        const skillElements = document.querySelectorAll('#skillsPreview .skill-tag');
        const otherSkills = Array.from(skillElements).map(tag => 
            tag.textContent.replace('×', '').trim()
        ).filter(skill => skill.length > 0);
        
        return {
            languages: languages.split(',').map(s => s.trim()).filter(s => s),
            technologies: technologies.split(',').map(s => s.trim()).filter(s => s),
            concepts: concepts.split(',').map(s => s.trim()).filter(s => s),
            other: otherSkills
        };
    }

    // Save Functionality
    async saveResume() {
        const resumeData = this.collectFormData();
        const resumeTitle = resumeData.personalInfo.name ? 
            `${resumeData.personalInfo.name}'s Resume` : 'My Resume';
        
        // Prepare data for saving
        const resumeToSave = {
            id: this.currentResumeId || Date.now(),
            title: resumeTitle,
            data: resumeData,
            template: this.selectedTemplate,
            status: this.isResumeComplete(resumeData) ? 'completed' : 'draft',
            updatedAt: new Date().toISOString(),
            createdAt: this.currentResumeId ? undefined : new Date().toISOString()
        };

        // Save to localStorage (working solution)
        this.saveToLocalStorage(resumeToSave);
        
        // Update current resume ID if it's new
        if (!this.currentResumeId) {
            this.currentResumeId = resumeToSave.id;
            const newUrl = `${window.location.pathname}?resumeId=${resumeToSave.id}`;
            window.history.pushState({}, '', newUrl);
        }

        this.showMessage('Resume saved successfully! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    saveToLocalStorage(resumeToSave) {
        // Get existing resumes or initialize empty array
        const userResumes = JSON.parse(localStorage.getItem('gmuUserResumes') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('gmuUserSession') || '{}');
        
        // Add user ID to resume
        resumeToSave.userId = currentUser.id || 'demo';
        
        // Update existing resume or add new one
        const existingIndex = userResumes.findIndex(r => r.id == resumeToSave.id);
        if (existingIndex !== -1) {
            userResumes[existingIndex] = resumeToSave;
        } else {
            userResumes.push(resumeToSave);
        }

        // Save to localStorage
        localStorage.setItem('gmuUserResumes', JSON.stringify(userResumes));
        console.log('Resume saved:', resumeToSave);
    }

    isResumeComplete(resumeData) {
        return resumeData.personalInfo.name && 
               resumeData.personalInfo.email && 
               resumeData.education.length > 0;
    }

    // Load saved resume
    loadSavedResume() {
        // Check if download parameter is present
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('download') === 'true' && urlParams.get('resumeId')) {
            this.currentResumeId = urlParams.get('resumeId');
        }
        
        if (!this.currentResumeId) return;

        const userResumes = JSON.parse(localStorage.getItem('gmuUserResumes') || '[]');
        const savedResume = userResumes.find(r => r.id == this.currentResumeId);

        if (savedResume) {
            if (savedResume.template) {
                this.selectedTemplate = savedResume.template;
                // Update template selector UI
                document.querySelectorAll('.template-option').forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.getAttribute('data-template') === savedResume.template) {
                        opt.classList.add('active');
                    }
                });
            }
            this.populateForm(savedResume.data);
            // populateForm already calls updatePreview, so no need to call it again
            
            // If download parameter is present, trigger download after loading
            if (urlParams.get('download') === 'true') {
                setTimeout(() => {
                    this.exportPDF();
                }, 2000);
            } else {
                this.showMessage('Resume loaded successfully!', 'success');
            }
        }
    }

    populateForm(data) {
        // Personal Info
        if (data.personalInfo) {
            if (document.getElementById('fullName')) document.getElementById('fullName').value = data.personalInfo.name || '';
            if (document.getElementById('email')) document.getElementById('email').value = data.personalInfo.email || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = data.personalInfo.phone || '';
            if (document.getElementById('address')) document.getElementById('address').value = data.personalInfo.address || '';
            if (document.getElementById('linkedin')) document.getElementById('linkedin').value = data.personalInfo.linkedin || '';
            if (document.getElementById('portfolio')) document.getElementById('portfolio').value = data.personalInfo.portfolio || '';
            if (document.getElementById('github')) document.getElementById('github').value = data.personalInfo.github || '';
            if (document.getElementById('summary')) document.getElementById('summary').value = data.personalInfo.summary || '';
            
            // Load profile image if exists
            if (data.personalInfo.profileImage) {
                this.profileImage = data.personalInfo.profileImage;
                this.updateImagePreview(this.profileImage);
            }
        }

        // Education
        if (data.education && data.education.length > 0) {
            // Clear existing education fields except first one
            const educationContainer = document.getElementById('education-container');
            while (educationContainer.children.length > 1) {
                educationContainer.removeChild(educationContainer.lastChild);
            }

            data.education.forEach((edu, index) => {
                if (index === 0) {
                    // Use first existing field
                    if (document.getElementById('school1')) document.getElementById('school1').value = edu.school || '';
                    if (document.getElementById('degree1')) document.getElementById('degree1').value = edu.degree || '';
                    if (document.getElementById('gpa1')) document.getElementById('gpa1').value = edu.gpa || '';
                    if (document.getElementById('gradDate1')) document.getElementById('gradDate1').value = this.getMonthYearValue(edu.gradDate);
                    if (document.getElementById('coursework1')) document.getElementById('coursework1').value = edu.coursework || '';
                    if (document.getElementById('location1')) document.getElementById('location1').value = edu.location || '';
                } else if (index < 5) { // Limit to 5 education entries
                    // Add new fields for additional education
                    this.addEducationField();
                    const i = index + 1;
                    if (document.getElementById(`school${i}`)) document.getElementById(`school${i}`).value = edu.school || '';
                    if (document.getElementById(`degree${i}`)) document.getElementById(`degree${i}`).value = edu.degree || '';
                    if (document.getElementById(`gpa${i}`)) document.getElementById(`gpa${i}`).value = edu.gpa || '';
                    if (document.getElementById(`gradDate${i}`)) document.getElementById(`gradDate${i}`).value = this.getMonthYearValue(edu.gradDate);
                    if (document.getElementById(`coursework${i}`)) document.getElementById(`coursework${i}`).value = edu.coursework || '';
                    if (document.getElementById(`location${i}`)) document.getElementById(`location${i}`).value = edu.location || '';
                }
            });
        }

        // Experience
        if (data.experience && data.experience.length > 0) {
            // Clear existing experience fields except first one
            const experienceContainer = document.getElementById('experience-container');
            while (experienceContainer.children.length > 1) {
                experienceContainer.removeChild(experienceContainer.lastChild);
            }

            data.experience.forEach((exp, index) => {
                if (index === 0) {
                    // Use first existing field
                    if (document.getElementById('company1')) document.getElementById('company1').value = exp.company || '';
                    if (document.getElementById('position1')) document.getElementById('position1').value = exp.position || '';
                    if (document.getElementById('startDate1')) document.getElementById('startDate1').value = this.getMonthYearValue(exp.startDate);
                    if (document.getElementById('endDate1')) document.getElementById('endDate1').value = this.getMonthYearValue(exp.endDate === 'CURRENT' ? '' : exp.endDate);
                    if (document.getElementById('expDescription1')) document.getElementById('expDescription1').value = exp.description || '';
                    if (document.getElementById('expLocation1')) document.getElementById('expLocation1').value = exp.location || '';
                } else if (index < 5) { // Limit to 5 experience entries
                    // Add new fields for additional experience
                    this.addExperienceField();
                    const i = index + 1;
                    if (document.getElementById(`company${i}`)) document.getElementById(`company${i}`).value = exp.company || '';
                    if (document.getElementById(`position${i}`)) document.getElementById(`position${i}`).value = exp.position || '';
                    if (document.getElementById(`startDate${i}`)) document.getElementById(`startDate${i}`).value = this.getMonthYearValue(exp.startDate);
                    if (document.getElementById(`endDate${i}`)) document.getElementById(`endDate${i}`).value = this.getMonthYearValue(exp.endDate === 'CURRENT' ? '' : exp.endDate);
                    if (document.getElementById(`expDescription${i}`)) document.getElementById(`expDescription${i}`).value = exp.description || '';
                    if (document.getElementById(`expLocation${i}`)) document.getElementById(`expLocation${i}`).value = exp.location || '';
                }
            });
        }

        // Achievements
        if (data.achievements && data.achievements.length > 0) {
            // Clear existing achievement fields except first one
            const achievementsContainer = document.getElementById('achievements-container');
            while (achievementsContainer.children.length > 1) {
                achievementsContainer.removeChild(achievementsContainer.lastChild);
            }

            data.achievements.forEach((ach, index) => {
                if (index === 0) {
                    // Use first existing field
                    document.getElementById('achievementTitle1').value = ach.title || '';
                    document.getElementById('achievementOrg1').value = ach.organization || '';
                    document.getElementById('achievementDate1').value = this.getMonthYearValue(ach.date);
                    document.getElementById('achievementDesc1').value = ach.description || '';
                } else if (index < 5) { // Limit to 5 achievement entries for demo
                    // Add new fields for additional achievements
                    this.addAchievementField();
                    document.getElementById(`achievementTitle${index + 1}`).value = ach.title || '';
                    document.getElementById(`achievementOrg${index + 1}`).value = ach.organization || '';
                    document.getElementById(`achievementDate${index + 1}`).value = this.getMonthYearValue(ach.date);
                    document.getElementById(`achievementDesc${index + 1}`).value = ach.description || '';
                }
            });
        }

        // Languages
        if (data.languages && data.languages.length > 0) {
            // Clear existing language fields except first one
            const languagesContainer = document.getElementById('languages-container');
            while (languagesContainer.children.length > 1) {
                languagesContainer.removeChild(languagesContainer.lastChild);
            }

            data.languages.forEach((lang, index) => {
                if (index === 0) {
                    // Use first existing field
                    document.getElementById('language1').value = lang.language || '';
                    document.getElementById('proficiency1').value = lang.proficiency || '';
                } else if (index < 5) { // Limit to 5 language entries for demo
                    // Add new fields for additional languages
                    this.addLanguageField();
                    document.getElementById(`language${index + 1}`).value = lang.language || '';
                    document.getElementById(`proficiency${index + 1}`).value = lang.proficiency || '';
                }
            });
        }

        // Skills
        if (data.skills) {
            if (data.skills.languages && Array.isArray(data.skills.languages)) {
                if (document.getElementById('skillsLanguages')) {
                    document.getElementById('skillsLanguages').value = data.skills.languages.join(', ');
                }
            }
            if (data.skills.technologies && Array.isArray(data.skills.technologies)) {
                if (document.getElementById('skillsTechnologies')) {
                    document.getElementById('skillsTechnologies').value = data.skills.technologies.join(', ');
                }
            }
            if (data.skills.concepts && Array.isArray(data.skills.concepts)) {
                if (document.getElementById('skillsConcepts')) {
                    document.getElementById('skillsConcepts').value = data.skills.concepts.join(', ');
                }
            }
            if (data.skills.other && Array.isArray(data.skills.other)) {
                const skillsPreview = document.getElementById('skillsPreview');
                if (skillsPreview) {
                    skillsPreview.innerHTML = '';
                    data.skills.other.forEach(skill => {
                        this.addSkill(skill);
                    });
                }
            } else if (Array.isArray(data.skills)) {
                // Legacy format - array of skills
                const skillsPreview = document.getElementById('skillsPreview');
                if (skillsPreview) {
                    skillsPreview.innerHTML = '';
                    data.skills.forEach(skill => {
                        this.addSkill(skill);
                    });
                }
            }
        }

        // Projects
        if (data.projects && data.projects.length > 0) {
            const projectsContainer = document.getElementById('projects-container');
            if (projectsContainer) {
                while (projectsContainer.children.length > 1) {
                    projectsContainer.removeChild(projectsContainer.lastChild);
                }
                
                data.projects.forEach((proj, index) => {
                    if (index === 0) {
                        if (document.getElementById('projectName1')) document.getElementById('projectName1').value = proj.name || '';
                        if (document.getElementById('projectTech1')) document.getElementById('projectTech1').value = proj.tech || '';
                        if (document.getElementById('projectLink1')) document.getElementById('projectLink1').value = proj.link || '';
                        if (document.getElementById('projectDate1')) document.getElementById('projectDate1').value = this.getMonthYearValue(proj.date);
                        if (document.getElementById('projectDescription1')) document.getElementById('projectDescription1').value = proj.description || '';
                    } else if (index < 5) {
                        this.addProjectField();
                        const i = index + 1;
                        if (document.getElementById(`projectName${i}`)) document.getElementById(`projectName${i}`).value = proj.name || '';
                        if (document.getElementById(`projectTech${i}`)) document.getElementById(`projectTech${i}`).value = proj.tech || '';
                        if (document.getElementById(`projectLink${i}`)) document.getElementById(`projectLink${i}`).value = proj.link || '';
                        if (document.getElementById(`projectDate${i}`)) document.getElementById(`projectDate${i}`).value = this.getMonthYearValue(proj.date);
                        if (document.getElementById(`projectDescription${i}`)) document.getElementById(`projectDescription${i}`).value = proj.description || '';
                    }
                });
            }
        }

        // Certifications
        if (data.certifications && data.certifications.length > 0) {
            const certsContainer = document.getElementById('certifications-container');
            if (certsContainer) {
                while (certsContainer.children.length > 1) {
                    certsContainer.removeChild(certsContainer.lastChild);
                }
                
                data.certifications.forEach((cert, index) => {
                    if (index === 0) {
                        if (document.getElementById('certIssuer1')) document.getElementById('certIssuer1').value = cert.issuer || '';
                        if (document.getElementById('certName1')) document.getElementById('certName1').value = cert.name || '';
                        if (document.getElementById('certDate1')) document.getElementById('certDate1').value = this.getMonthYearValue(cert.date);
                    } else if (index < 5) {
                        this.addCertificationField();
                        const i = index + 1;
                        if (document.getElementById(`certIssuer${i}`)) document.getElementById(`certIssuer${i}`).value = cert.issuer || '';
                        if (document.getElementById(`certName${i}`)) document.getElementById(`certName${i}`).value = cert.name || '';
                        if (document.getElementById(`certDate${i}`)) document.getElementById(`certDate${i}`).value = this.getMonthYearValue(cert.date);
                    }
                });
            }
        }

        // Hackathons
        if (data.hackathons && data.hackathons.length > 0) {
            const hackathonsContainer = document.getElementById('hackathons-container');
            if (hackathonsContainer) {
                while (hackathonsContainer.children.length > 1) {
                    hackathonsContainer.removeChild(hackathonsContainer.lastChild);
                }
                
                data.hackathons.forEach((hack, index) => {
                    if (index === 0) {
                        if (document.getElementById('hackathonName1')) document.getElementById('hackathonName1').value = hack.name || '';
                        if (document.getElementById('hackathonLink1')) document.getElementById('hackathonLink1').value = hack.link || '';
                        if (document.getElementById('hackathonDate1')) document.getElementById('hackathonDate1').value = this.getMonthYearValue(hack.date);
                        if (document.getElementById('hackathonDescription1')) document.getElementById('hackathonDescription1').value = hack.description || '';
                        if (document.getElementById('hackathonTech1')) document.getElementById('hackathonTech1').value = hack.tech || '';
                        if (document.getElementById('hackathonPrize1')) document.getElementById('hackathonPrize1').value = hack.prize || '';
                    } else if (index < 5) {
                        this.addHackathonField();
                        const i = index + 1;
                        if (document.getElementById(`hackathonName${i}`)) document.getElementById(`hackathonName${i}`).value = hack.name || '';
                        if (document.getElementById(`hackathonLink${i}`)) document.getElementById(`hackathonLink${i}`).value = hack.link || '';
                        if (document.getElementById(`hackathonDate${i}`)) document.getElementById(`hackathonDate${i}`).value = this.getMonthYearValue(hack.date);
                        if (document.getElementById(`hackathonDescription${i}`)) document.getElementById(`hackathonDescription${i}`).value = hack.description || '';
                        if (document.getElementById(`hackathonTech${i}`)) document.getElementById(`hackathonTech${i}`).value = hack.tech || '';
                        if (document.getElementById(`hackathonPrize${i}`)) document.getElementById(`hackathonPrize${i}`).value = hack.prize || '';
                    }
                });
            }
        }
        
        // Update preview after loading all data
        this.updatePreview();
    }

    // Preview Generation
    updatePreview() {
        const resumeData = this.collectFormData();
        const previewHTML = this.generatePreview(resumeData);
        const previewElement = document.getElementById('resumePreview');
        previewElement.innerHTML = previewHTML;
        previewElement.className = `resume-preview ${this.selectedTemplate}`;
    }

    generatePreview(data) {
        switch(this.selectedTemplate) {
            case 'template1':
                return this.generateTemplate1(data);
            case 'template2':
                return this.generateTemplate2(data);
            case 'template3':
                return this.generateTemplate3(data);
            default:
                return this.generateTemplate1(data);
        }
    }

    formatBulletPoints(text) {
        if (!text) return '';
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return '';
        return `<ul>${lines.map(line => `<li>${line.trim()}</li>`).join('')}</ul>`;
    }

    // Template 1 - Modern Single Column (based on first image)
    generateTemplate1(data) {
        const contactInfo = [
            data.personalInfo.phone,
            data.personalInfo.email,
            data.personalInfo.linkedin ? `linkedin.com/in/${data.personalInfo.linkedin.split('/').pop()}` : '',
            data.personalInfo.portfolio ? data.personalInfo.portfolio.replace(/^https?:\/\//, '') : ''
        ].filter(Boolean).join(' | ');

        const header = `
            <div class="resume-header">
                <div class="resume-name">${(data.personalInfo.name || 'Your Name').toUpperCase()}</div>
                <div class="resume-contact">${contactInfo}</div>
            </div>
        `;

        let educationHTML = '';
        if (data.education && data.education.length > 0) {
            educationHTML = `
                <div class="resume-section">
                    <div class="section-title">EDUCATION</div>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div class="item-title"><strong>${edu.school || ''}</strong></div>
                                <div class="item-date">${edu.gradDate || 'Expected May 2025'} ${edu.location ? `| ${edu.location}` : ''}</div>
                            </div>
                            <div class="item-subtitle">${edu.degree || ''}${edu.gpa ? ` (CGPA: ${edu.gpa})` : ''}</div>
                            ${edu.coursework ? `<div><strong>Relevant Coursework:</strong> ${edu.coursework}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let experienceHTML = '';
        if (data.experience && data.experience.length > 0) {
            experienceHTML = `
                <div class="resume-section">
                    <div class="section-title">EXPERIENCE</div>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div class="item-title"><strong>${exp.company || ''}</strong> | ${exp.position || ''}</div>
                                <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'CURRENT'} ${exp.location ? `| ${exp.location}` : ''}</div>
                            </div>
                            ${exp.description ? `<div class="item-description">${this.formatBulletPoints(exp.description)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let projectsHTML = '';
        if (data.projects && data.projects.length > 0) {
            projectsHTML = `
                <div class="resume-section">
                    <div class="section-title">PROJECTS</div>
                    ${data.projects.map(proj => `
                        <div class="project-item">
                            <div class="item-header">
                                <div class="item-title"><strong>${proj.name || ''}</strong> <em>${proj.tech || ''}</em></div>
                                ${proj.link ? `<div class="item-date"><a href="${proj.link}" target="_blank">${proj.link.replace(/^https?:\/\//, '')}</a></div>` : ''}
                            </div>
                            ${proj.description ? `<div class="item-description">${this.formatBulletPoints(proj.description)}</div>` : ''}
                            ${proj.tech ? `<div><strong>Technology Stack:</strong> ${proj.tech}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let skillsHTML = '';
        if (data.skills && (data.skills.languages?.length > 0 || data.skills.technologies?.length > 0 || data.skills.concepts?.length > 0)) {
            skillsHTML = `
                <div class="resume-section">
                    <div class="section-title">TECHNICAL SKILLS</div>
                    ${data.skills.languages?.length > 0 ? `<div class="skill-category"><span class="skill-category-label"><strong>Languages:</strong></span> ${data.skills.languages.join(', ')}</div>` : ''}
                    ${data.skills.technologies?.length > 0 ? `<div class="skill-category"><span class="skill-category-label"><strong>Technologies:</strong></span> ${data.skills.technologies.join(', ')}</div>` : ''}
                    ${data.skills.concepts?.length > 0 ? `<div class="skill-category"><span class="skill-category-label"><strong>Concepts:</strong></span> ${data.skills.concepts.join(', ')}</div>` : ''}
                </div>
            `;
        }

        let hackathonsHTML = '';
        if (data.hackathons && data.hackathons.length > 0) {
            hackathonsHTML = `
                <div class="resume-section">
                    <div class="section-title">HACKATHONS</div>
                    ${data.hackathons.map(hack => `
                        <div class="hackathon-item">
                            <div class="item-header">
                                <div class="item-title"><strong>${hack.name || ''}</strong></div>
                                ${hack.link ? `<div class="item-date"><a href="${hack.link}" target="_blank">${hack.link.replace(/^https?:\/\//, '')}</a></div>` : ''}
                            </div>
                            ${hack.description ? `<div class="item-description">${this.formatBulletPoints(hack.description)}</div>` : ''}
                            ${hack.tech ? `<div><strong>Technologies Used:</strong> ${hack.tech}</div>` : ''}
                            ${hack.prize ? `<div><strong>Prize:</strong> ${hack.prize}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `${header}${educationHTML}${experienceHTML}${projectsHTML}${skillsHTML}${hackathonsHTML}`;
    }

    // Template 2 - Two Column Layout (based on second image)
    generateTemplate2(data) {
        const header = `
            <div class="resume-title">RESUME</div>
            <div class="resume-header">
                <div class="resume-name">${data.personalInfo.name || 'Your Name'}</div>
                <div class="resume-contact">${data.personalInfo.address || ''}</div>
                <div class="resume-contact">Mobile: ${data.personalInfo.phone || ''} | E-Mail: ${data.personalInfo.email || ''}</div>
            </div>
        `;

        let leftColumn = '';
        let rightColumn = '';

        // Left Column - Career Objective
        if (data.personalInfo.summary) {
            leftColumn += `
                <div class="resume-section left-column">
                    <div class="section-title">CAREER OBJECTIVE</div>
                    <div class="item-description">${data.personalInfo.summary}</div>
                </div>
            `;
        }

        // Left Column - Brief Overview
        leftColumn += `
            <div class="resume-section left-column">
                <div class="section-title">A BRIEF OVERVIEW</div>
                <ul class="strengths-list">
                    <li>A dynamic professional with experience in various fields.</li>
                    <li>In-depth experience of modern technologies and frameworks.</li>
                </ul>
            </div>
        `;

        // Left Column - Notable Highlights
        leftColumn += `
            <div class="resume-section left-column">
                <div class="section-title">NOTABLE HIGHLIGHTS ACROSS THE TENURE</div>
                <ul class="strengths-list">
                    <li>Expertise in analyzing data and preparing various documents as per standards.</li>
                    <li>Effective Team player.</li>
                    <li>Dedicated and committed to submit assigned tasks within time frame with Quality.</li>
                </ul>
            </div>
        `;

        // Left Column - Experience
        if (data.experience && data.experience.length > 0) {
            leftColumn += `
                <div class="resume-section left-column">
                    <div class="section-title">ORGANIZATIONAL SCAN</div>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div class="item-title"><strong>${exp.company || ''} - ${exp.location || ''}</strong></div>
                                <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'TILL DATE'}</div>
                            </div>
                            <div class="item-subtitle"><strong>${exp.position || ''}</strong></div>
                            <div class="item-description">${exp.description || ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Right Column - Strengths
        rightColumn += `
            <div class="resume-section right-column">
                <div class="section-title">STRENGTHS</div>
                <ul class="strengths-list">
                    <li>Good communication skill.</li>
                    <li>Keen to work as a team and willingness to learn new things.</li>
                    <li>Dedicated, Punctual & Flexible.</li>
                    <li>Passionate and ability to work in stress.</li>
                </ul>
            </div>
        `;

        // Right Column - Personal Data
        rightColumn += `
            <div class="resume-section right-column">
                <div class="section-title">PERSONAL DATA</div>
                <ul class="personal-data-list">
                    <li>Mobile: ${data.personalInfo.phone || ''}</li>
                    <li>E-mail: ${data.personalInfo.email || ''}</li>
                    <li>Languages Known: ${data.languages?.map(l => l.language).join(', ') || 'English'}</li>
                </ul>
            </div>
        `;

        // Right Column - Academics
        if (data.education && data.education.length > 0) {
            rightColumn += `
                <div class="resume-section right-column">
                    <div class="section-title">ACADEMICS</div>
                    <ul class="strengths-list">
                        ${data.education.map(edu => `
                            <li>${edu.degree || ''}, from ${edu.school || ''}. ${edu.gradDate || ''}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Right Column - IT Skills
        if (data.skills && (data.skills.languages?.length > 0 || data.skills.technologies?.length > 0)) {
            const allSkills = [
                ...(data.skills.languages || []),
                ...(data.skills.technologies || []),
                ...(data.skills.concepts || [])
            ];
            rightColumn += `
                <div class="resume-section right-column">
                    <div class="section-title">IT SKILLS</div>
                    <ul class="skills-list">
                        <li>Well versed with:</li>
                        ${allSkills.map(skill => `<li>${skill}.</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        return `${header}${leftColumn}${rightColumn}`;
    }

    // Template 3 - Professional Clean (based on third image)
    generateTemplate3(data) {
        const contactInfo = [
            data.personalInfo.phone,
            data.personalInfo.email,
            data.personalInfo.portfolio ? data.personalInfo.portfolio.replace(/^https?:\/\//, '') : '',
            data.personalInfo.linkedin ? `linkedin.com/in/${data.personalInfo.linkedin.split('/').pop()}` : '',
            data.personalInfo.github ? `github.com/${data.personalInfo.github.split('/').pop()}` : ''
        ].filter(Boolean).join(' | ');

        const header = `
            <div class="resume-header">
                <div class="resume-name">${data.personalInfo.name || 'Your Name'}</div>
                <div class="resume-contact">${contactInfo}</div>
            </div>
        `;

        let summaryHTML = '';
        if (data.personalInfo.summary) {
            summaryHTML = `
                <div class="resume-section">
                    <div class="section-title">PROFESSIONAL SUMMARY</div>
                    <div class="item-description">${data.personalInfo.summary}</div>
                </div>
            `;
        }

        let experienceHTML = '';
        if (data.experience && data.experience.length > 0) {
            experienceHTML = `
                <div class="resume-section">
                    <div class="section-title">EXPERIENCE</div>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div class="item-title">${exp.position || ''}<span class="item-title-separator">|</span>${exp.company || ''}</div>
                                <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
                            </div>
                            ${exp.description ? `<div class="item-description">${this.formatBulletPoints(exp.description)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let skillsHTML = '';
        if (data.skills && (data.skills.languages?.length > 0 || data.skills.technologies?.length > 0 || data.skills.concepts?.length > 0)) {
            skillsHTML = `
                <div class="resume-section">
                    <div class="section-title">TECHNICAL SKILLS</div>
                    ${data.skills.languages?.length > 0 ? `<div class="skills-categorized"><span class="skill-category-label"><strong>Languages:</strong></span> ${data.skills.languages.join(', ')}</div>` : ''}
                    ${data.skills.technologies?.length > 0 ? `<div class="skills-categorized"><span class="skill-category-label"><strong>Frameworks:</strong></span> ${data.skills.technologies.join(', ')}</div>` : ''}
                    ${data.skills.concepts?.length > 0 ? `<div class="skills-categorized"><span class="skill-category-label"><strong>Concepts:</strong></span> ${data.skills.concepts.join(', ')}</div>` : ''}
                </div>
            `;
        }

        let projectsHTML = '';
        if (data.projects && data.projects.length > 0) {
            projectsHTML = `
                <div class="resume-section">
                    <div class="section-title">PROJECTS</div>
                    ${data.projects.map(proj => `
                        <div class="project-item">
                            <div class="item-header">
                                <div class="item-title">${proj.name || ''}<span class="item-title-separator">|</span>${proj.tech || ''}</div>
                                <div class="item-date">${proj.date || ''}</div>
                            </div>
                            ${proj.description ? `<div class="item-description">${this.formatBulletPoints(proj.description)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let certificationsHTML = '';
        if (data.certifications && data.certifications.length > 0) {
            certificationsHTML = `
                <div class="resume-section">
                    <div class="section-title">CERTIFICATIONS</div>
                    ${data.certifications.map(cert => `
                        <div class="certification-item">
                            <div class="item-header">
                                <div class="item-title">${cert.issuer || ''}<span class="item-title-separator">|</span>${cert.name || ''}</div>
                                <div class="item-date">${cert.date || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let awardsHTML = '';
        if (data.achievements && data.achievements.length > 0) {
            awardsHTML = `
                <div class="resume-section">
                    <div class="section-title">AWARDS</div>
                    ${data.achievements.map(ach => `
                        <div class="achievement-item">
                            <div class="item-header">
                                <div class="item-title">${ach.title || ''}</div>
                                <div class="item-date">${ach.date || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let educationHTML = '';
        if (data.education && data.education.length > 0) {
            educationHTML = `
                <div class="resume-section">
                    <div class="section-title">EDUCATION</div>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div class="item-title">${edu.school || ''}</div>
                                <div class="item-date">${edu.gradDate || ''}</div>
                            </div>
                            <div class="item-subtitle"><strong>${edu.degree || ''}</strong>${edu.gpa ? ` (GPA: ${edu.gpa})` : ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `${header}${summaryHTML}${experienceHTML}${skillsHTML}${projectsHTML}${certificationsHTML}${awardsHTML}${educationHTML}`;
    }

    getTemplateStyles() {
        // Return comprehensive CSS styles for templates
        return `
            /* Template 1 - Modern Single Column */
            .template1 .resume-header {
                text-align: left !important;
                margin-bottom: 1.5rem !important;
                padding-bottom: 0.5rem !important;
                border-bottom: none !important;
            }
            .template1 .resume-name {
                font-size: 1.8rem !important;
                font-weight: 700 !important;
                color: #000 !important;
                text-transform: uppercase !important;
                margin-bottom: 0.5rem !important;
            }
            .template1 .resume-contact {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 0.5rem !important;
                justify-content: flex-start !important;
                font-size: 0.9rem !important;
            }
            .template1 .resume-contact span::after {
                content: "" !important;
                margin: 0 !important;
            }
            .template1 .resume-contact span:not(:last-child)::after {
                content: " | " !important;
                margin: 0 0.5rem !important;
                color: #000 !important;
            }
            .template1 .resume-section .section-title {
                font-size: 1rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                color: #000 !important;
                border-bottom: 1px solid #000 !important;
                padding-bottom: 0.25rem !important;
                margin-bottom: 0.75rem !important;
                text-align: left !important;
            }
            .template1 .education-item,
            .template1 .experience-item,
            .template1 .project-item,
            .template1 .achievement-item,
            .template1 .hackathon-item {
                margin-bottom: 1rem !important;
            }
            .template1 .item-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                margin-bottom: 0.25rem !important;
            }
            .template1 .item-title {
                font-weight: 700 !important;
                color: #000 !important;
            }
            .template1 .item-date {
                color: #000 !important;
                font-style: normal !important;
                text-align: right !important;
            }
            .template1 .item-subtitle {
                font-weight: 500 !important;
                color: #000 !important;
                margin-bottom: 0.25rem !important;
            }
            .template1 .item-description {
                margin-left: 1rem !important;
            }
            .template1 .item-description ul {
                margin: 0.25rem 0 !important;
                padding-left: 1.5rem !important;
            }
            .template1 .item-description li {
                margin: 0.1rem 0 !important;
            }
            .template1 .skill-category {
                margin-bottom: 0.5rem !important;
            }
            .template1 .skill-category-label {
                font-weight: 700 !important;
                margin-right: 0.5rem !important;
            }
            
            /* Template 2 - Two Column Layout */
            .template2 {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 2rem !important;
            }
            .template2 .resume-title {
                grid-column: 1 / -1 !important;
                text-align: center !important;
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                margin-bottom: 1rem !important;
            }
            .template2 .resume-header {
                grid-column: 1 / -1 !important;
                text-align: left !important;
                border-bottom: 1px solid #ddd !important;
                padding-bottom: 1rem !important;
                margin-bottom: 1rem !important;
            }
            .template2 .resume-name {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                color: #000 !important;
                margin-bottom: 0.5rem !important;
            }
            .template2 .resume-contact {
                font-size: 0.85rem !important;
                color: #333 !important;
            }
            .template2 .resume-section {
                margin-bottom: 1.5rem !important;
            }
            .template2 .resume-section.left-column {
                grid-column: 1 !important;
            }
            .template2 .resume-section.right-column {
                grid-column: 2 !important;
            }
            .template2 .section-title {
                font-size: 1rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                color: #000 !important;
                border-bottom: 2px solid #000 !important;
                padding-bottom: 0.25rem !important;
                margin-bottom: 0.75rem !important;
            }
            .template2 .item-header {
                display: flex !important;
                justify-content: space-between !important;
                margin-bottom: 0.25rem !important;
            }
            .template2 .item-title {
                font-weight: 700 !important;
                color: #000 !important;
            }
            .template2 .item-date {
                color: #666 !important;
                font-style: normal !important;
            }
            .template2 .item-subtitle {
                font-weight: 500 !important;
                color: #333 !important;
                margin-bottom: 0.25rem !important;
            }
            .template2 .item-description {
                font-size: 0.9rem !important;
                line-height: 1.5 !important;
            }
            .template2 .strengths-list,
            .template2 .skills-list,
            .template2 .personal-data-list {
                list-style: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .template2 .personal-data-list {
                list-style: none !important;
                padding: 0 !important;
            }
            .template2 .personal-data-list li {
                margin: 0.25rem 0 !important;
                font-size: 0.9rem !important;
            }
            
            /* Template 3 - Professional Clean */
            .template3 .resume-header {
                text-align: left !important;
                margin-bottom: 1.5rem !important;
                padding-bottom: 0.5rem !important;
                border-bottom: none !important;
            }
            .template3 .resume-name {
                font-size: 1.5rem !important;
                font-weight: 600 !important;
                color: #000 !important;
                margin-bottom: 0.5rem !important;
            }
            .template3 .resume-contact {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 0.5rem !important;
                justify-content: flex-start !important;
                font-size: 0.9rem !important;
                color: #333 !important;
            }
            .template3 .resume-contact span::after {
                content: "" !important;
                margin: 0 !important;
            }
            .template3 .resume-contact span:not(:last-child)::after {
                content: " | " !important;
                margin: 0 0.5rem !important;
                color: #999 !important;
            }
            .template3 .resume-section .section-title {
                font-size: 1.1rem !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                color: #000 !important;
                text-align: center !important;
                margin-bottom: 0.75rem !important;
                padding-bottom: 0.25rem !important;
                border-bottom: none !important;
            }
            .template3 .item-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 0.25rem !important;
            }
            .template3 .item-title {
                font-weight: 600 !important;
                color: #000 !important;
            }
            .template3 .item-title-separator {
                margin: 0 0.5rem !important;
                color: #999 !important;
            }
            .template3 .item-date {
                color: #666 !important;
                font-style: normal !important;
                text-align: right !important;
            }
            .template3 .item-subtitle {
                font-weight: 500 !important;
                color: #333 !important;
                margin-bottom: 0.25rem !important;
            }
            .template3 .item-description {
                margin-left: 0 !important;
                margin-top: 0.25rem !important;
            }
            .template3 .item-description ul {
                margin: 0.25rem 0 !important;
                padding-left: 1.5rem !important;
            }
            .template3 .skills-categorized {
                margin-bottom: 0.5rem !important;
            }
            .template3 .skill-category-label {
                font-weight: 600 !important;
                margin-right: 0.5rem !important;
            }
            
            /* Common styles */
            .resume-section {
                margin-bottom: 1.5rem !important;
            }
            .education-item, .experience-item, .project-item, .achievement-item, .hackathon-item, .certification-item {
                margin-bottom: 1rem !important;
            }
            strong {
                font-weight: 700 !important;
            }
            em {
                font-style: italic !important;
            }
            ul {
                list-style-type: disc !important;
            }
            a {
                color: #0065A4 !important;
                text-decoration: underline !important;
            }
        `;
    }

    // Utility Methods
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    getMonthYearValue(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().substring(0, 7);
        } catch (e) {
            return '';
        }
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
            document.querySelectorAll('input, textarea, select').forEach(element => {
                if (element.type !== 'file') {
                    element.value = '';
                }
            });
            
            this.removeProfileImage();
            const skillsPreview = document.getElementById('skillsPreview');
            if (skillsPreview) skillsPreview.innerHTML = '';
            
            // Reset dynamic fields
            ['education', 'experience', 'achievements', 'languages', 'projects', 'certifications', 'hackathons'].forEach(section => {
                const container = document.getElementById(`${section}-container`);
                if (container) {
                    while (container.children.length > 1) {
                        container.removeChild(container.lastChild);
                    }
                }
            });
            
            this.educationCount = 1;
            this.experienceCount = 1;
            this.achievementsCount = 1;
            this.languagesCount = 1;
            this.projectsCount = 1;
            this.certificationsCount = 1;
            this.hackathonsCount = 1;
            
            this.updatePreview();
            this.showMessage('Form reset successfully!', 'success');
        }
    }

    async exportPDF() {
        try {
            // Show loading message
            this.showMessage('Generating PDF...', 'info');

            // Ensure preview is updated with latest data
            this.updatePreview();
            
            // Wait for DOM to update
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get the visible preview element - use the actual one with all styles
            const previewElement = document.getElementById('resumePreview');
            if (!previewElement) {
                this.showMessage('Preview element not found', 'error');
                return;
            }
            
            // Check if preview has meaningful content
            const previewText = previewElement.innerText || previewElement.textContent || '';
            if (previewText.trim().length < 50) {
                this.showMessage('Preview is empty. Please fill in your resume information first.', 'error');
                return;
            }

            // Store original styles and parent
            const originalStyles = {
                position: previewElement.style.position || '',
                left: previewElement.style.left || '',
                top: previewElement.style.top || '',
                zIndex: previewElement.style.zIndex || '',
                transform: previewElement.style.transform || '',
                overflow: previewElement.style.overflow || ''
            };
            
            const originalParent = previewElement.parentElement;
            const originalParentStyles = {
                overflow: originalParent ? (originalParent.style.overflow || '') : '',
                position: originalParent ? (originalParent.style.position || '') : '',
                height: originalParent ? (originalParent.style.height || '') : ''
            };

            // Make sure element is visible and fully rendered
            if (originalParent) {
                originalParent.style.overflow = 'visible';
                originalParent.style.position = 'relative';
                originalParent.style.height = 'auto';
            }
            
            previewElement.style.position = 'relative';
            previewElement.style.left = '0';
            previewElement.style.top = '0';
            previewElement.style.zIndex = '9999';
            previewElement.style.transform = 'none';
            previewElement.style.overflow = 'visible';

            // Scroll into view
            previewElement.scrollIntoView({ behavior: 'instant', block: 'start' });
            
            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get actual dimensions
            const rect = previewElement.getBoundingClientRect();
            const actualWidth = Math.max(rect.width, 794);
            const actualHeight = Math.max(previewElement.scrollHeight, previewElement.offsetHeight, 1123);
            
            console.log('Capturing preview element');
            console.log('Dimensions:', actualWidth, 'x', actualHeight);
            console.log('Content length:', previewText.length);

            // Configure PDF options with better html2canvas settings
            const opt = {
                margin: [0, 0, 0, 0],
                filename: `${(this.collectFormData().personalInfo.name || 'Resume').replace(/\s+/g, '_')}_${this.selectedTemplate}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: false,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: actualWidth,
                    height: actualHeight,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: actualWidth,
                    windowHeight: actualHeight,
                    x: 0,
                    y: 0,
                    removeContainer: true,
                    imageTimeout: 15000,
                    onrendered: null,
                    onclone: (clonedDoc) => {
                        // Inject all necessary CSS styles into the cloned document
                        const head = clonedDoc.head || clonedDoc.getElementsByTagName('head')[0];
                        
                        // Create and inject style tag with template-specific styles
                        const styleTag = clonedDoc.createElement('style');
                        styleTag.innerHTML = this.getTemplateStyles() + `
                            /* Base resume preview styles */
                            .resume-preview {
                                width: 210mm !important;
                                min-height: 297mm !important;
                                padding: 20mm !important;
                                background: white !important;
                                font-size: 11pt !important;
                                box-shadow: none !important;
                                margin: 0 !important;
                                border: none !important;
                                transform: none !important;
                                position: relative !important;
                                overflow: visible !important;
                                display: block !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                            }
                            /* Ensure all elements are visible */
                            .resume-preview * {
                                visibility: visible !important;
                                opacity: 1 !important;
                            }
                            /* Remove any transforms or positioning that might affect layout */
                            .resume-preview * {
                                transform: none !important;
                            }
                        `;
                        head.appendChild(styleTag);
                        
                        // Ensure the cloned element has all styles
                        const clonedPreview = clonedDoc.querySelector('#resumePreview');
                        if (clonedPreview) {
                            // Get computed styles from original document
                            const originalPreview = document.getElementById('resumePreview');
                            if (originalPreview) {
                                const computed = window.getComputedStyle(originalPreview);
                                
                                // Ensure template class is applied
                                clonedPreview.className = `resume-preview ${this.selectedTemplate}`;
                                
                                // Apply all computed styles to cloned element
                                clonedPreview.style.position = 'relative';
                                clonedPreview.style.left = '0';
                                clonedPreview.style.top = '0';
                                clonedPreview.style.overflow = 'visible';
                                clonedPreview.style.display = computed.display || 'block';
                                clonedPreview.style.visibility = 'visible';
                                clonedPreview.style.opacity = '1';
                                clonedPreview.style.width = '210mm';
                                clonedPreview.style.minHeight = '297mm';
                                clonedPreview.style.backgroundColor = 'white';
                                clonedPreview.style.color = computed.color || '#2c3e50';
                                clonedPreview.style.fontFamily = computed.fontFamily || 'Segoe UI, sans-serif';
                                clonedPreview.style.fontSize = '11pt';
                                clonedPreview.style.lineHeight = computed.lineHeight || '1.4';
                                clonedPreview.style.padding = '20mm';
                                clonedPreview.style.margin = '0';
                                clonedPreview.style.boxShadow = 'none';
                                clonedPreview.style.border = 'none';
                                clonedPreview.style.transform = 'none';
                                
                                // Make sure all child elements are visible and styled
                                const originalElements = originalPreview.querySelectorAll('*');
                                const clonedElements = clonedPreview.querySelectorAll('*');
                                
                                originalElements.forEach((origEl, index) => {
                                    if (clonedElements[index]) {
                                        const origComputed = window.getComputedStyle(origEl);
                                        const cloneEl = clonedElements[index];
                                        
                                        // Copy important computed styles
                                        cloneEl.style.display = origComputed.display === 'none' ? 'block' : origComputed.display;
                                        cloneEl.style.visibility = 'visible';
                                        cloneEl.style.opacity = '1';
                                        cloneEl.style.color = origComputed.color;
                                        cloneEl.style.fontSize = origComputed.fontSize;
                                        cloneEl.style.fontWeight = origComputed.fontWeight;
                                        cloneEl.style.fontFamily = origComputed.fontFamily;
                                        cloneEl.style.lineHeight = origComputed.lineHeight;
                                        cloneEl.style.margin = origComputed.margin;
                                        cloneEl.style.padding = origComputed.padding;
                                        cloneEl.style.border = origComputed.border;
                                        cloneEl.style.borderBottom = origComputed.borderBottom;
                                        cloneEl.style.borderTop = origComputed.borderTop;
                                        cloneEl.style.textAlign = origComputed.textAlign;
                                        cloneEl.style.textTransform = origComputed.textTransform;
                                        
                                        // Ensure text content is preserved
                                        if (origEl.textContent && !cloneEl.textContent) {
                                            cloneEl.textContent = origEl.textContent;
                                        }
                                    }
                                });
                            }
                        }
                    }
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy']
                }
            };

            // Generate and save PDF
            await html2pdf()
                .set(opt)
                .from(previewElement)
                .save()
                .then(() => {
                    // Restore original styles
                    previewElement.style.position = originalStyles.position;
                    previewElement.style.left = originalStyles.left;
                    previewElement.style.top = originalStyles.top;
                    previewElement.style.zIndex = originalStyles.zIndex;
                    previewElement.style.transform = originalStyles.transform;
                    previewElement.style.overflow = originalStyles.overflow;
                    
                    if (originalParent) {
                        originalParent.style.overflow = originalParentStyles.overflow;
                        originalParent.style.position = originalParentStyles.position;
                        originalParent.style.height = originalParentStyles.height;
                    }
                    
                    this.showMessage('PDF generated successfully!', 'success');
                })
                .catch((error) => {
                    console.error('PDF generation error:', error);
                    console.error('Error stack:', error.stack);
                    
                    // Restore original styles even on error
                    previewElement.style.position = originalStyles.position;
                    previewElement.style.left = originalStyles.left;
                    previewElement.style.top = originalStyles.top;
                    previewElement.style.zIndex = originalStyles.zIndex;
                    previewElement.style.transform = originalStyles.transform;
                    previewElement.style.overflow = originalStyles.overflow;
                    
                    if (originalParent) {
                        originalParent.style.overflow = originalParentStyles.overflow;
                        originalParent.style.position = originalParentStyles.position;
                        originalParent.style.height = originalParentStyles.height;
                    }
                    
                    this.showMessage('Error generating PDF: ' + (error.message || 'Unknown error. Check console for details.'), 'error');
                });

        } catch (error) {
            console.error('PDF generation error:', error);
            this.showMessage('Error generating PDF. Please try again.', 'error');
        }
    }

    showMessage(message, type) {
        // Use toast notification system if available
        if (typeof toast !== 'undefined') {
            toast.show(message, type);
        } else {
            // Fallback to alert for older browsers
            alert(message);
        }
    }

    // Auto-save functionality
    setupAutoSave() {
        // Auto-save every 30 seconds if there are changes
        setInterval(() => {
            if (!this.isSaving) {
                this.autoSave();
            }
        }, 30000);
    }

    triggerAutoSave() {
        // Clear existing timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Set new timer (save after 2 seconds of inactivity)
        this.autoSaveTimer = setTimeout(() => {
            this.autoSave();
        }, 2000);
    }

    async autoSave() {
        if (this.isSaving) return;
        
        this.isSaving = true;
        this.showAutoSaveIndicator('saving');

        try {
            const resumeData = this.collectFormData();
            const resumeTitle = resumeData.personalInfo.name ? 
                `${resumeData.personalInfo.name}'s Resume` : 'My Resume';
            
            const resumeToSave = {
                id: this.currentResumeId || Date.now(),
                title: resumeTitle,
                data: resumeData,
                template: this.selectedTemplate,
                status: this.isResumeComplete(resumeData) ? 'completed' : 'draft',
                updatedAt: new Date().toISOString(),
                createdAt: this.currentResumeId ? undefined : new Date().toISOString()
            };

            this.saveToLocalStorage(resumeToSave);
            
            if (!this.currentResumeId) {
                this.currentResumeId = resumeToSave.id;
            }

            this.showAutoSaveIndicator('saved');
            setTimeout(() => this.hideAutoSaveIndicator(), 2000);
        } catch (error) {
            console.error('Auto-save error:', error);
            this.showAutoSaveIndicator('error');
            setTimeout(() => this.hideAutoSaveIndicator(), 2000);
        } finally {
            this.isSaving = false;
        }
    }

    showAutoSaveIndicator(status) {
        const indicator = document.getElementById('autoSaveIndicator');
        const spinner = document.getElementById('autoSaveSpinner');
        const text = document.getElementById('autoSaveText');
        
        if (!indicator) return;

        indicator.className = `auto-save-indicator show ${status}`;
        
        if (status === 'saving') {
            spinner.style.display = 'block';
            text.textContent = 'Saving...';
        } else if (status === 'saved') {
            spinner.style.display = 'none';
            text.textContent = 'Saved';
        } else if (status === 'error') {
            spinner.style.display = 'none';
            text.textContent = 'Save failed';
        }
    }

    hideAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Progress tracking
    updateProgress() {
        const resumeData = this.collectFormData();
        let completed = 0;
        let total = 4;

        // Check Personal Info
        if (resumeData.personalInfo.name && resumeData.personalInfo.email) {
            completed++;
            this.updateStepStatus('stepPersonal', true);
        } else {
            this.updateStepStatus('stepPersonal', false);
        }

        // Check Education
        if (resumeData.education.length > 0 && resumeData.education[0].school) {
            completed++;
            this.updateStepStatus('stepEducation', true);
        } else {
            this.updateStepStatus('stepEducation', false);
        }

        // Check Experience
        if (resumeData.experience.length > 0 && resumeData.experience[0].company) {
            completed++;
            this.updateStepStatus('stepExperience', true);
        } else {
            this.updateStepStatus('stepExperience', false);
        }

        // Check Skills
        const allSkills = [
            ...(resumeData.skills.languages || []),
            ...(resumeData.skills.technologies || []),
            ...(resumeData.skills.concepts || []),
            ...(resumeData.skills.other || [])
        ];
        if (allSkills.length > 0) {
            completed++;
            this.updateStepStatus('stepSkills', true);
        } else {
            this.updateStepStatus('stepSkills', false);
        }

        const percentage = Math.round((completed / total) * 100);
        this.updateProgressBar(percentage);
    }

    updateStepStatus(stepId, completed) {
        const step = document.getElementById(stepId);
        if (step) {
            if (completed) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        }
    }

    updateProgressBar(percentage) {
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = percentage + '%';
        }
    }
}

// Initialize resume builder when page loads
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilder();
    
    // Add some sample skills for demo
    setTimeout(() => {
        if (document.getElementById('skillsPreview') && document.getElementById('skillsPreview').children.length === 0) {
            resumeBuilder.addSkill('JavaScript');
            resumeBuilder.addSkill('Python');
            resumeBuilder.addSkill('React');
            resumeBuilder.addSkill('Data Analysis');
        }
    }, 1000);
});