// Dashboard functionality for GMU Resume Builder
class Dashboard {
    constructor() {
        this.resumes = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadResumes();
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchResumes')?.addEventListener('input', (e) => {
            this.filterResumes(e.target.value);
        });

        // Filter functionality
        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.filterByStatus(e.target.value);
        });

        // Quick Actions
        document.querySelectorAll('.action-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.action-card').querySelector('h3').textContent;
                this.handleQuickAction(action);
            });
        });

        // Modal functionality
        this.setupModal();
    }

    handleQuickAction(action) {
        switch(action) {
            case 'Resume Templates':
                this.browseTemplates();
                break;
            case 'Resume Analysis':
                this.analyzeResume();
                break;
            case 'Career Resources':
                this.openCareerResources();
                break;
        }
    }

    browseTemplates() {
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    analyzeResume() {
        if (this.resumes.length === 0) {
            alert('Please create a resume first to use the analysis feature.');
            return;
        }
        
        // Simple resume analysis
        const analysis = this.performResumeAnalysis();
        alert(`Resume Analysis Results:\n\n${analysis}`);
    }

    performResumeAnalysis() {
        if (this.resumes.length === 0) return 'No resumes to analyze.';
        
        const resume = this.resumes[0];
        let analysis = [];
        
        analysis.push(`📊 Resume: ${resume.title || 'Untitled'}`);
        analysis.push(`📝 Status: ${resume.status || 'Unknown'}`);
        analysis.push(`🕒 Last Updated: ${this.formatDate(resume.updatedAt)}`);
        
        if (resume.data) {
            const data = typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data;
            
            if (data.personalInfo?.name) analysis.push('✅ Name: Provided');
            else analysis.push('❌ Name: Missing');
            
            if (data.personalInfo?.email) analysis.push('✅ Email: Provided');
            else analysis.push('❌ Email: Missing');
            
            if (data.education?.length > 0) analysis.push(`✅ Education: ${data.education.length} entries`);
            else analysis.push('❌ Education: No entries');
            
            if (data.experience?.length > 0) analysis.push(`✅ Experience: ${data.experience.length} entries`);
            else analysis.push('❌ Experience: No entries');
            
            if (data.skills?.length > 0) analysis.push(`✅ Skills: ${data.skills.length} skills`);
            else analysis.push('❌ Skills: No skills listed');

            if (data.achievements?.length > 0) analysis.push(`✅ Achievements: ${data.achievements.length} achievements`);
            else analysis.push('❌ Achievements: No achievements listed');

            if (data.languages?.length > 0) analysis.push(`✅ Languages: ${data.languages.length} languages`);
            else analysis.push('❌ Languages: No languages listed');
        }
        
        analysis.push('\n💡 Tips:');
        analysis.push('• Add more specific skills');
        analysis.push('• Include quantifiable achievements');
        analysis.push('• Use action verbs in experience descriptions');
        analysis.push('• Highlight your G M University education');
        
        return analysis.join('\n');
    }

    openCareerResources() {
        window.open('https://gmu.ac.in/careers', '_blank');
    }

    setupModal() {
        const modal = document.getElementById('templateModal');
        const closeBtn = document.querySelector('.close-modal');

        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    loadResumes() {
        // Load from localStorage
        const savedResumes = localStorage.getItem('gmuUserResumes');
        this.resumes = savedResumes ? JSON.parse(savedResumes) : [];
        this.renderDashboard();
    }

    renderDashboard() {
        this.renderResumeList();
        this.updateStats();
    }

    renderResumeList() {
        const resumeList = document.getElementById('resumeList');
        const emptyState = document.getElementById('emptyState');

        if (this.resumes.length === 0) {
            resumeList.innerHTML = '';
            resumeList.appendChild(emptyState);
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Filter resumes for current user
        const currentUser = JSON.parse(localStorage.getItem('gmuUserSession') || '{}');
        const userResumes = this.resumes.filter(resume => 
            resume.userId === currentUser.id || resume.userId === 'demo' || !resume.userId
        );
        
        // Store user resumes for reference
        this.userResumes = userResumes;
        
        resumeList.innerHTML = userResumes.map((resume) => {
            // Find original index in all resumes
            const originalIndex = this.resumes.findIndex(r => r.id === resume.id);
            return `
            <div class="resume-card" data-status="${resume.status}">
                <div class="resume-card-header">
                    <span class="resume-status ${resume.status}">${resume.status}</span>
                    <div class="resume-actions">
                        <button class="icon-btn" onclick="dashboard.editResume('${resume.id}')" title="Edit">✏️</button>
                        <button class="icon-btn" onclick="dashboard.duplicateResume(${originalIndex})" title="Duplicate">📋</button>
                        <button class="icon-btn delete-btn" onclick="dashboard.deleteResume(${originalIndex})" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="resume-card-body">
                    <h3 class="resume-title">${resume.title || 'Untitled Resume'}</h3>
                    <div class="resume-preview" style="line-height: 1.8; color: #555; margin: 1rem 0;">${this.generateResumePreview(resume)}</div>
                    <div class="resume-meta">
                        <span class="resume-date">📅 Updated: ${this.formatDate(resume.updatedAt)}</span>
                        ${resume.template ? `<span class="resume-template" style="margin-left: 1rem; color: #0065A4; font-size: 0.85rem;">Template: ${resume.template}</span>` : ''}
                        ${resume.data?.personalInfo?.profileImage ? `<span class="resume-image-indicator" style="margin-left: 1rem;">📷 Has Photo</span>` : ''}
                    </div>
                </div>
                <div class="resume-card-footer">
                    <button class="btn btn-secondary" onclick="dashboard.downloadResumeById('${resume.id}')">Download PDF</button>
                    <button class="btn" onclick="dashboard.viewResume(${originalIndex})">View</button>
                </div>
            </div>
        `;
        }).join('');
    }

    generateResumePreview(resume) {
        let data = resume.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }
        
        const personalInfo = data.personalInfo || {};
        const education = data.education || [];
        const experience = data.experience || [];
        const projects = data.projects || [];
        const achievements = data.achievements || [];
        const certifications = data.certifications || [];
        const hackathons = data.hackathons || [];
        const languages = data.languages || [];
        const skills = data.skills || {};
        
        let previewItems = [];
        
        // Email
        if (personalInfo.email) {
            previewItems.push(`📧 ${personalInfo.email}`);
        }
        
        // Education
        if (education.length > 0) {
            const edu = education[0];
            const eduText = edu.degree ? `${edu.degree}${edu.school ? ` at ${edu.school}` : ''}` : (edu.school || 'Education');
            previewItems.push(`🎓 ${eduText}`);
        }
        
        // Experience
        if (experience.length > 0) {
            previewItems.push(`💼 ${experience.length} ${experience.length === 1 ? 'position' : 'positions'}`);
        }
        
        // Projects
        if (projects.length > 0) {
            previewItems.push(`💻 ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`);
        }
        
        // Skills count
        let skillCount = 0;
        if (skills.languages && Array.isArray(skills.languages)) skillCount += skills.languages.length;
        if (skills.technologies && Array.isArray(skills.technologies)) skillCount += skills.technologies.length;
        if (skills.concepts && Array.isArray(skills.concepts)) skillCount += skills.concepts.length;
        if (skills.other && Array.isArray(skills.other)) skillCount += skills.other.length;
        if (Array.isArray(skills)) skillCount = skills.length;
        if (skillCount > 0) {
            previewItems.push(`⚡ ${skillCount} skills`);
        }
        
        // Certifications
        if (certifications.length > 0) {
            previewItems.push(`🏆 ${certifications.length} ${certifications.length === 1 ? 'certification' : 'certifications'}`);
        }
        
        // Hackathons
        if (hackathons.length > 0) {
            previewItems.push(`🏅 ${hackathons.length} ${hackathons.length === 1 ? 'hackathon' : 'hackathons'}`);
        }
        
        // Languages
        if (languages.length > 0) {
            previewItems.push(`🌐 ${languages.length} ${languages.length === 1 ? 'language' : 'languages'}`);
        }
        
        // If no items, show default message
        if (previewItems.length === 0) {
            return '<span style="color: #999; font-style: italic;">No information added yet. Click Edit to add details.</span>';
        }
        
        // Return formatted preview with line breaks
        return previewItems.join('<br>');
    }

    updateStats() {
        const currentUser = JSON.parse(localStorage.getItem('gmuUserSession') || '{}');
        const userResumes = this.resumes.filter(resume => 
            resume.userId === currentUser.id || resume.userId === 'demo' || !resume.userId
        );
        
        const total = userResumes.length;
        const drafts = userResumes.filter(r => r.status === 'draft').length;
        const completed = userResumes.filter(r => r.status === 'completed').length;
        const lastUpdated = userResumes.length > 0 
            ? this.formatDate(Math.max(...userResumes.map(r => new Date(r.updatedAt || r.createdAt))))
            : 'Never';

        document.getElementById('totalResumes').textContent = total;
        document.getElementById('draftResumes').textContent = drafts;
        document.getElementById('completedResumes').textContent = completed;
        document.getElementById('lastUpdated').textContent = lastUpdated;
    }

    filterResumes(searchTerm) {
        const resumes = document.querySelectorAll('.resume-card');
        resumes.forEach(card => {
            const title = card.querySelector('.resume-title').textContent.toLowerCase();
            const preview = card.querySelector('.resume-preview').textContent.toLowerCase();
            const matches = title.includes(searchTerm.toLowerCase()) || preview.includes(searchTerm.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    filterByStatus(status) {
        const resumes = document.querySelectorAll('.resume-card');
        resumes.forEach(card => {
            const matches = status === 'all' || card.getAttribute('data-status') === status;
            card.style.display = matches ? 'block' : 'none';
        });
    }

    editResume(resumeId) {
        window.location.href = `builder.html?resumeId=${resumeId}`;
    }

    viewResume(index) {
        const resume = this.resumes[index];
        // Open resume in preview mode
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(this.generateResumeHTML(resume));
    }

    duplicateResume(index) {
        const original = this.resumes[index];
        const duplicate = {
            ...JSON.parse(JSON.stringify(original)),
            id: Date.now(),
            title: `${original.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.resumes.unshift(duplicate);
        this.saveResumes();
        this.renderDashboard();
        
        this.showMessage('Resume duplicated successfully!', 'success');
    }

    deleteResume(index) {
        if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            this.resumes.splice(index, 1);
            this.saveResumes();
            this.renderDashboard();
            this.showMessage('Resume deleted successfully!', 'success');
        }
    }

    async downloadResume(index) {
        const resume = this.resumes[index];
        this.downloadResumeById(resume.id);
    }

    downloadResumeById(resumeId) {
        try {
            // Redirect to builder with resume ID and trigger download
            const url = `builder.html?resumeId=${resumeId}&download=true`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading resume:', error);
            alert('Error downloading resume. Please try again.');
        }
    }

    saveResumes() {
        localStorage.setItem('gmuUserResumes', JSON.stringify(this.resumes));
    }

    generateResumeHTML(resume) {
        let data = resume.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${resume.title}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #0065A4;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .name { 
                        font-size: 28px; 
                        color: #0065A4;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .contact { 
                        color: #666; 
                        margin-bottom: 10px;
                    }
                    .section { 
                        margin-bottom: 25px; 
                    }
                    .section-title { 
                        color: #0065A4; 
                        font-size: 18px;
                        font-weight: bold;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    .item { 
                        margin-bottom: 15px; 
                    }
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    .item-title {
                        font-weight: bold;
                    }
                    .item-date {
                        color: #666;
                        font-style: italic;
                    }
                    .item-subtitle {
                        color: #555;
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="name">${data.personalInfo?.name || 'Your Name'}</div>
                    <div class="contact">
                        ${data.personalInfo?.email || ''} 
                        ${data.personalInfo?.phone ? ' • ' + data.personalInfo.phone : ''}
                        ${data.personalInfo?.address ? ' • ' + data.personalInfo.address : ''}
                    </div>
                    ${data.personalInfo?.summary ? `<div class="summary">${data.personalInfo.summary}</div>` : ''}
                </div>

                ${data.education?.length > 0 ? `
                <div class="section">
                    <div class="section-title">EDUCATION</div>
                    ${data.education.map(edu => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${edu.school || ''}</div>
                                <div class="item-date">${edu.gradDate || ''}</div>
                            </div>
                            <div class="item-subtitle">${edu.degree || ''}</div>
                            ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${data.experience?.length > 0 ? `
                <div class="section">
                    <div class="section-title">EXPERIENCE</div>
                    ${data.experience.map(exp => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${exp.position || ''}</div>
                                <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
                            </div>
                            <div class="item-subtitle">${exp.company || ''}</div>
                            ${exp.description ? `<div>${exp.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${data.achievements?.length > 0 ? `
                <div class="section">
                    <div class="section-title">ACHIEVEMENTS & CERTIFICATIONS</div>
                    ${data.achievements.map(ach => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${ach.title || ''}</div>
                                <div class="item-date">${ach.date || ''}</div>
                            </div>
                            <div class="item-subtitle">${ach.organization || ''}</div>
                            ${ach.description ? `<div>${ach.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${data.languages?.length > 0 ? `
                <div class="section">
                    <div class="section-title">LANGUAGES</div>
                    <div>${data.languages.map(lang => `${lang.language} - ${lang.proficiency}`).join(', ')}</div>
                </div>
                ` : ''}

                ${data.skills?.length > 0 ? `
                <div class="section">
                    <div class="section-title">SKILLS</div>
                    <div>${data.skills.join(', ')}</div>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.dashboard-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `dashboard-message dashboard-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            ${type === 'success' ? 'background: #2e7d32;' : 'background: #c62828;'}
        `;

        document.body.appendChild(messageDiv);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Template selection function
function selectTemplate(template) {
    dashboard.createNewResume(template);
    document.getElementById('templateModal').style.display = 'none';
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});