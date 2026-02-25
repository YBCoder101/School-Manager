// enhanced-app.js
class EnhancedSchoolManagementSystem {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentTab = 'dashboard';
        this.viewHistory = [];
        this.data = {
            users: [],
            students: [],
            teachers: [],
            classes: [],
            grades: [],
            parents: [],
            announcements: [],
            events: []
        };
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }
    
    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.checkSavedSession();
        
        // Handle browser back/forward buttons
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
    }
    
    loadSampleData() {
        // Load users with roles (kept for reference but not used for login)
        this.data.users = [
            { id: 1, email: 'admin@school.edu', password: 'admin123', name: 'Admin User', role: 'admin' },
            { id: 2, email: 'principal@school.edu', password: 'principal123', name: 'Dr. Principal', role: 'principal' },
            { id: 3, email: 'teacher@school.edu', password: 'teacher123', name: 'Mr. Smith', role: 'teacher', teacherId: 1 },
            { id: 4, email: 'parent@school.edu', password: 'parent123', name: 'Mrs. Johnson', role: 'parent', parentId: 1 },
            { id: 5, email: 'student@school.edu', password: 'student123', name: 'Johnny Johnson', role: 'student', studentId: 1 }
        ];
        
        // Sample teachers
        this.data.teachers = [
            { id: 1, name: 'Mr. Smith', subject: 'Mathematics', email: 'smith@school.edu', classes: [101, 102] },
            { id: 2, name: 'Ms. Davis', subject: 'English', email: 'davis@school.edu', classes: [103] }
        ];
        
        // Sample students
        this.data.students = [
            { id: 1, name: 'Johnny Johnson', grade: '10th', email: 'johnny@school.edu', parentId: 1, classes: [101, 103], enrollmentDate: '2024-01-15' },
            { id: 2, name: 'Sarah Johnson', grade: '8th', email: 'sarah@school.edu', parentId: 1, classes: [102], enrollmentDate: '2024-01-15' },
            { id: 3, name: 'Mike Smith', grade: '9th', email: 'mike@school.edu', parentId: null, classes: [101], enrollmentDate: '2024-01-16' },
            { id: 4, name: 'Emily Davis', grade: '12th', email: 'emily@school.edu', parentId: null, classes: [102, 103], enrollmentDate: '2024-01-16' }
        ];
        
        // Sample parents
        this.data.parents = [
            { id: 1, name: 'Mrs. Johnson', email: 'parent@school.edu', children: [1, 2] }
        ];
        
        // Sample classes
        this.data.classes = [
            { id: 101, name: 'Algebra I', teacherId: 1, students: [1, 3], schedule: 'Mon/Wed 9:00 AM', room: '101' },
            { id: 102, name: 'Geometry', teacherId: 1, students: [2, 4], schedule: 'Tue/Thu 10:00 AM', room: '102' },
            { id: 103, name: 'Literature', teacherId: 2, students: [1, 4], schedule: 'Mon/Wed 11:00 AM', room: '103' }
        ];
        
        // Sample grades
        this.data.grades = [
            { id: 1, studentId: 1, classId: 101, assignment: 'Quiz 1', score: 85, date: '2024-02-15' },
            { id: 2, studentId: 1, classId: 103, assignment: 'Essay', score: 92, date: '2024-02-16' },
            { id: 3, studentId: 2, classId: 102, assignment: 'Test 1', score: 88, date: '2024-02-15' },
            { id: 4, studentId: 3, classId: 101, assignment: 'Quiz 1', score: 78, date: '2024-02-15' },
            { id: 5, studentId: 4, classId: 102, assignment: 'Test 1', score: 95, date: '2024-02-15' },
            { id: 6, studentId: 4, classId: 103, assignment: 'Essay', score: 89, date: '2024-02-16' }
        ];
        
        // Sample announcements
        this.data.announcements = [
            { id: 1, title: 'Parent-Teacher Conference', date: '2024-03-15', content: 'Schedule your meetings...' },
            { id: 2, title: 'Spring Break', date: '2024-03-20', content: 'School closed for spring break' }
        ];
    }
    
    setupEventListeners() {
        // Login form submission - SIMPLIFIED: only checks role
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }
    
    // SIMPLIFIED LOGIN - ONLY USES ROLE, IGNORES EMAIL/PASSWORD
    handleLogin() {
        const role = document.getElementById('role').value;
        
        // Only check if role is selected
        if (!role) {
            this.showLoginError('Please select a role');
            return;
        }
        
        // Create a user based on the selected role (ignore email/password completely)
        const user = {
            id: this.getRoleId(role),
            email: `${role}@school.edu`,
            name: this.getDefaultName(role),
            role: role,
            ...this.getRoleSpecificId(role)
        };
        
        console.log('Login successful with role:', role);
        this.currentUser = user;
        this.currentRole = user.role;
        
        // Hide login, show app
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        
        // Set role attribute on body for CSS targeting
        document.body.setAttribute('data-role', user.role);
        
        // Update user display name
        const userNameElement = document.getElementById('userDisplayName');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }
        
        const roleBadge = document.getElementById('roleBadge');
        if (roleBadge) {
            roleBadge.textContent = this.getRoleDisplayName(user.role);
        }
        
        // Initialize role-specific UI
        this.initializeRoleBasedUI();
        
        // Save session
        this.saveSession();
    }
    
    getDefaultName(role) {
        const names = {
            'admin': 'Admin User',
            'principal': 'Dr. Principal',
            'teacher': 'Mr. Smith',
            'parent': 'Mrs. Johnson',
            'student': 'Johnny Johnson'
        };
        return names[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    getRoleId(role) {
        const ids = {
            'admin': 1,
            'principal': 2,
            'teacher': 3,
            'parent': 4,
            'student': 5
        };
        return ids[role] || 1;
    }
    
    getRoleSpecificId(role) {
        const ids = {
            'teacher': { teacherId: 1 },
            'parent': { parentId: 1 },
            'student': { studentId: 1 }
        };
        return ids[role] || {};
    }
    
    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = message;
        }
    }
    
    getRoleDisplayName(role) {
        const names = {
            'admin': 'Administrator',
            'principal': 'Principal',
            'teacher': 'Teacher',
            'parent': 'Parent',
            'student': 'Student'
        };
        return names[role] || role;
    }
    
    initializeRoleBasedUI() {
        // Generate role-specific sidebar menu
        this.generateSidebarMenu();
        
        // Load role-specific dashboard
        this.loadDashboard();
        
        // Setup role-specific tab click handlers
        this.setupRoleTabs();
    }
    
    generateSidebarMenu() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const menus = {
            admin: [
                { icon: 'tachometer-alt', text: 'Dashboard', tab: 'dashboard' },
                { icon: 'user-graduate', text: 'Students', tab: 'students' },
                { icon: 'chalkboard-teacher', text: 'Teachers', tab: 'teachers' },
                { icon: 'book', text: 'Classes', tab: 'classes' },
                { icon: 'star', text: 'Grades', tab: 'grades' },
                { icon: 'chart-line', text: 'Reports', tab: 'reports' },
                { icon: 'users', text: 'Parents', tab: 'parents' },
                { icon: 'cog', text: 'Settings', tab: 'settings' }
            ],
            principal: [
                { icon: 'tachometer-alt', text: 'Dashboard', tab: 'dashboard' },
                { icon: 'user-graduate', text: 'Students', tab: 'students' },
                { icon: 'chalkboard-teacher', text: 'Teachers', tab: 'teachers' },
                { icon: 'book', text: 'Classes', tab: 'classes' },
                { icon: 'chart-line', text: 'Reports', tab: 'reports' },
                { icon: 'calendar-alt', text: 'Schedule', tab: 'schedule' }
            ],
            teacher: [
                { icon: 'tachometer-alt', text: 'Dashboard', tab: 'dashboard' },
                { icon: 'users', text: 'My Students', tab: 'mystudents' },
                { icon: 'book-open', text: 'My Classes', tab: 'myclasses' },
                { icon: 'star', text: 'Grade Entry', tab: 'gradeentry' },
                { icon: 'calendar-alt', text: 'Schedule', tab: 'schedule' },
                { icon: 'chart-line', text: 'Reports', tab: 'reports' }
            ],
            parent: [
                { icon: 'tachometer-alt', text: 'Dashboard', tab: 'dashboard' },
                { icon: 'child', text: 'My Children', tab: 'children' },
                { icon: 'star', text: 'Grades', tab: 'grades' },
                { icon: 'calendar-alt', text: 'Events', tab: 'events' },
                { icon: 'comment', text: 'Messages', tab: 'messages' }
            ],
            student: [
                { icon: 'tachometer-alt', text: 'Dashboard', tab: 'dashboard' },
                { icon: 'star', text: 'My Grades', tab: 'mygrades' },
                { icon: 'book', text: 'Classes', tab: 'classes' },
                { icon: 'tasks', text: 'Assignments', tab: 'assignments' },
                { icon: 'calendar-alt', text: 'Schedule', tab: 'schedule' }
            ]
        };
        
        const menuItems = menus[this.currentRole] || menus.student;
        
        let menuHTML = '<div class="sidebar-header"><h2><i class="fas fa-school"></i> SchoolMS</h2></div><ul class="sidebar-menu">';
        
        menuItems.forEach(item => {
            menuHTML += `
                <li data-tab="${item.tab}">
                    <i class="fas fa-${item.icon}"></i>
                    <span>${item.text}</span>
                </li>
            `;
        });
        
        menuHTML += '</ul>';
        
        sidebar.innerHTML = menuHTML;
    }
    
    setupRoleTabs() {
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                document.querySelectorAll('.sidebar-menu li').forEach(li => {
                    li.classList.remove('active');
                });
                
                // Add active class to clicked item
                e.currentTarget.classList.add('active');
                
                const tab = e.currentTarget.dataset.tab;
                this.switchRoleTab(tab);
            });
        });
    }
    
    switchRoleTab(tabName) {
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = this.getTabDisplayName(tabName);
        }
        
        // Load tab content based on role
        this.loadTabContent(tabName);
    }
    
    getTabDisplayName(tab) {
        const names = {
            'dashboard': 'Dashboard',
            'students': 'Student Management',
            'teachers': 'Teacher Management',
            'classes': 'Class Management',
            'grades': 'Grade Management',
            'reports': 'Reports',
            'mystudents': 'My Students',
            'myclasses': 'My Classes',
            'gradeentry': 'Grade Entry',
            'children': 'My Children',
            'mygrades': 'My Grades',
            'assignments': 'Assignments',
            'schedule': 'Schedule',
            'events': 'Events',
            'messages': 'Messages',
            'parents': 'Parent Management',
            'settings': 'Settings'
        };
        return names[tab] || tab;
    }
    
    loadTabContent(tabName) {
        // Show loading indicator
        const dynamicContent = document.getElementById('dynamicContent');
        if (dynamicContent) {
            dynamicContent.innerHTML = '<div class="spinner"></div>';
        }
        
        // Simulate loading delay
        setTimeout(() => {
            this.loadDashboard();
        }, 500);
    }
    
    loadDashboard() {
        const templates = {
            'admin': 'adminDashboardTemplate',
            'principal': 'adminDashboardTemplate',
            'teacher': 'teacherDashboardTemplate',
            'parent': 'parentDashboardTemplate',
            'student': 'studentDashboardTemplate'
        };
        
        const templateId = templates[this.currentRole];
        if (templateId) {
            const template = document.getElementById(templateId);
            if (template) {
                const content = template.cloneNode(true);
                content.style.display = 'block';
                content.id = ''; // Remove id to avoid duplicates
                content.removeAttribute('id');
                
                const dynamicContent = document.getElementById('dynamicContent');
                if (dynamicContent) {
                    dynamicContent.innerHTML = '';
                    dynamicContent.appendChild(content);
                    
                    // Populate role-specific data
                    this.populateRoleDashboard();
                }
            }
        }
    }
    
    populateRoleDashboard() {
        switch(this.currentRole) {
            case 'admin':
                this.populateAdminDashboard();
                break;
            case 'teacher':
                this.populateTeacherDashboard();
                break;
            case 'parent':
                this.populateParentDashboard();
                break;
            case 'student':
                this.populateStudentDashboard();
                break;
        }
    }
    
    populateAdminDashboard() {
        // Update stats
        const totalStudents = document.getElementById('totalStudents');
        const totalTeachers = document.getElementById('totalTeachers');
        const totalClasses = document.getElementById('totalClasses');
        const monthlyRevenue = document.getElementById('monthlyRevenue');
        
        if (totalStudents) totalStudents.textContent = this.data.students.length;
        if (totalTeachers) totalTeachers.textContent = this.data.teachers.length;
        if (totalClasses) totalClasses.textContent = this.data.classes.length;
        if (monthlyRevenue) monthlyRevenue.textContent = '$45,000';
        
        // Show pending approvals
        const pendingDiv = document.getElementById('pendingApprovals');
        if (pendingDiv) {
            pendingDiv.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-user-plus"></i>
                    <div class="activity-content">
                        <div class="activity-title">3 New parent applications</div>
                        <button class="btn-small" onclick="alert('Review applications')">Review</button>
                    </div>
                </div>
                <div class="activity-item">
                    <i class="fas fa-file-alt"></i>
                    <div class="activity-content">
                        <div class="activity-title">5 Grade change requests</div>
                        <button class="btn-small" onclick="alert('Review grade changes')">Review</button>
                    </div>
                </div>
            `;
        }
        
        // Show admin activities
        const adminActivities = document.getElementById('adminActivities');
        if (adminActivities) {
            adminActivities.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-user-plus"></i>
                    <div class="activity-content">
                        <div class="activity-title">New student enrolled: Sarah Johnson</div>
                        <div class="activity-time">2 minutes ago</div>
                    </div>
                </div>
                <div class="activity-item">
                    <i class="fas fa-edit"></i>
                    <div class="activity-content">
                        <div class="activity-title">Grade change requested for Johnny Johnson</div>
                        <div class="activity-time">1 hour ago</div>
                    </div>
                </div>
            `;
        }
    }
    
    populateTeacherDashboard() {
        const teacher = this.data.teachers.find(t => t.id === this.currentUser?.teacherId);
        
        if (teacher) {
            // Get teacher's classes
            const teacherClasses = this.data.classes.filter(c => teacher.classes.includes(c.id));
            
            const myClassesCount = document.getElementById('myClassesCount');
            const myStudentsCount = document.getElementById('myStudentsCount');
            const pendingGradesCount = document.getElementById('pendingGradesCount');
            const todayClasses = document.getElementById('todayClasses');
            
            if (myClassesCount) myClassesCount.textContent = teacherClasses.length;
            
            // Get teacher's students (unique students from all classes)
            const studentIds = [...new Set(teacherClasses.flatMap(c => c.students))];
            if (myStudentsCount) myStudentsCount.textContent = studentIds.length;
            
            // Get pending grades
            const pendingGrades = teacherClasses.filter(c => {
                const classGrades = this.data.grades.filter(g => g.classId === c.id);
                return classGrades.length < c.students.length * 3;
            }).length;
            if (pendingGradesCount) pendingGradesCount.textContent = pendingGrades;
            
            if (todayClasses) todayClasses.textContent = teacherClasses.filter(c => 
                c.schedule?.includes('Mon') || c.schedule?.includes('Wed')
            ).length;
            
            // List classes
            const classList = document.getElementById('teacherClassList');
            if (classList) {
                classList.innerHTML = teacherClasses.map(c => `
                    <div class="class-item" onclick="sms.navigateTo('grade-entry', {classId: ${c.id}})">
                        <div class="class-info">
                            <h4>${c.name}</h4>
                            <p>${c.schedule || 'Schedule TBD'} • Room ${c.room || 'TBD'}</p>
                            <p>${c.students.length} students</p>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `).join('');
            }
            
            // Recent grades
            const recentGrades = document.getElementById('recentGrades');
            if (recentGrades) {
                const teacherGradeIds = teacherClasses.flatMap(c => 
                    this.data.grades.filter(g => g.classId === c.id)
                ).slice(-3);
                
                recentGrades.innerHTML = teacherGradeIds.map(g => {
                    const student = this.data.students.find(s => s.id === g.studentId);
                    const cls = this.data.classes.find(c => c.id === g.classId);
                    return `
                        <div class="activity-item">
                            <i class="fas fa-star"></i>
                            <div class="activity-content">
                                <div class="activity-title">${student?.name} - ${g.assignment}</div>
                                <div class="activity-time">${cls?.name}: ${g.score}%</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }
    
    populateParentDashboard() {
        const parent = this.data.parents.find(p => p.id === this.currentUser?.parentId);
        
        if (parent) {
            const children = this.data.students.filter(s => parent.children.includes(s.id));
            
            const childrenCount = document.getElementById('childrenCount');
            const childrenAvgGrade = document.getElementById('childrenAvgGrade');
            const notificationCount = document.getElementById('notificationCount');
            const upcomingEvents = document.getElementById('upcomingEvents');
            
            if (childrenCount) childrenCount.textContent = children.length;
            
            // Calculate average grade for all children
            const allGrades = children.flatMap(child => 
                this.data.grades.filter(g => g.studentId === child.id)
            );
            const avgGrade = allGrades.length > 0 
                ? Math.round(allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length)
                : 0;
            if (childrenAvgGrade) childrenAvgGrade.textContent = avgGrade + '%';
            
            if (notificationCount) notificationCount.textContent = '2';
            if (upcomingEvents) upcomingEvents.textContent = '3';
            
            // Show children's progress
            const progressDiv = document.getElementById('childrenProgress');
            if (progressDiv) {
                progressDiv.innerHTML = children.map(child => {
                    const childGrades = this.data.grades.filter(g => g.studentId === child.id);
                    const avg = childGrades.length > 0 
                        ? Math.round(childGrades.reduce((sum, g) => sum + g.score, 0) / childGrades.length)
                        : 0;
                    
                    return `
                        <div class="activity-item" onclick="sms.navigateTo('student-details', {id: ${child.id}})">
                            <i class="fas fa-user-graduate"></i>
                            <div class="activity-content">
                                <div class="activity-title">${child.name} - Grade ${child.grade}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${avg}%"></div>
                                </div>
                                <div class="activity-time">Average: ${avg}%</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            // School announcements
            const announcementsDiv = document.getElementById('schoolAnnouncements');
            if (announcementsDiv) {
                announcementsDiv.innerHTML = this.data.announcements.map(a => `
                    <div class="activity-item">
                        <i class="fas fa-bullhorn"></i>
                        <div class="activity-content">
                            <div class="activity-title">${a.title}</div>
                            <div class="activity-time">${a.date}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    populateStudentDashboard() {
        const student = this.data.students.find(s => s.id === this.currentUser?.studentId);
        
        if (student) {
            const studentGrades = this.data.grades.filter(g => g.studentId === student.id);
            const avgGrade = studentGrades.length > 0 
                ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
                : 0;
            
            const myAvgGrade = document.getElementById('myAvgGrade');
            const myClassesCount = document.getElementById('myClassesCount');
            const pendingAssignments = document.getElementById('pendingAssignments');
            const attendanceRate = document.getElementById('attendanceRate');
            
            if (myAvgGrade) myAvgGrade.textContent = avgGrade + '%';
            if (myClassesCount) myClassesCount.textContent = student.classes.length;
            if (pendingAssignments) pendingAssignments.textContent = '3';
            if (attendanceRate) attendanceRate.textContent = '95%';
            
            // Show grades by subject
            const gradesDiv = document.getElementById('myGrades');
            if (gradesDiv) {
                const gradesByClass = {};
                studentGrades.forEach(grade => {
                    const className = this.data.classes.find(c => c.id === grade.classId)?.name || 'Unknown';
                    if (!gradesByClass[className]) gradesByClass[className] = [];
                    gradesByClass[className].push(grade);
                });
                
                gradesDiv.innerHTML = Object.entries(gradesByClass).map(([className, grades]) => `
                    <div class="class-grades">
                        <h4>${className}</h4>
                        ${grades.map(g => `
                            <div class="grade-item">
                                <span class="grade-subject">${g.assignment}</span>
                                <span class="grade-score ${this.getGradeLetter(g.score)}">${g.score}%</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('');
            }
            
            // Upcoming assignments
            const assignmentsDiv = document.getElementById('upcomingAssignments');
            if (assignmentsDiv) {
                assignmentsDiv.innerHTML = `
                    <div class="activity-item">
                        <i class="fas fa-book"></i>
                        <div class="activity-content">
                            <div class="activity-title">Math Homework - Due Friday</div>
                            <div class="activity-time">Algebra I</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-pen"></i>
                        <div class="activity-content">
                            <div class="activity-title">Essay - Due Monday</div>
                            <div class="activity-time">Literature</div>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    getGradeLetter(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
    
    // Navigation methods
    navigateTo(viewName, params = {}) {
        console.log(`Navigating to: ${viewName}`, params);
        
        // Store current view in history
        this.viewHistory.push({
            view: viewName,
            params: params,
            timestamp: Date.now()
        });
        
        // Update browser URL
        this.updateBrowserUrl(viewName, params);
        
        // Load the requested view
        this.loadView(viewName, params);
    }
    
    loadView(viewName, params) {
        const dynamicContent = document.getElementById('dynamicContent');
        if (!dynamicContent) return;
        
        // Show loading spinner
        dynamicContent.innerHTML = '<div class="spinner"></div>';
        
        // Determine which view to load
        setTimeout(() => {
            switch(viewName) {
                case 'student-list':
                    this.loadStudentListView(params);
                    break;
                case 'student-details':
                    this.loadStudentDetailsView(params);
                    break;
                case 'add-student':
                    this.loadAddStudentView(params);
                    break;
                case 'edit-student':
                    this.loadEditStudentView(params);
                    break;
                case 'grade-entry':
                    this.loadGradeEntryView(params);
                    break;
                case 'class-roster':
                    this.loadClassRosterView(params);
                    break;
                default:
                    // Default to dashboard
                    this.loadDashboard();
            }
        }, 300);
    }
    
    loadStudentListView(params) {
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h2>Student Management</h2>
                    <button class="btn btn-primary" onclick="sms.navigateTo('add-student')">
                        <i class="fas fa-plus"></i> Add New Student
                    </button>
                </div>
                
                <div class="filter-bar">
                    <input type="text" id="searchStudents" placeholder="Search students..." class="search-input">
                    <select id="gradeFilter" class="filter-select">
                        <option value="">All Grades</option>
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                        <option value="11th">11th Grade</option>
                        <option value="12th">12th Grade</option>
                    </select>
                </div>
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Email</th>
                                <th>Enrollment Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateStudentRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('dynamicContent').innerHTML = html;
    }
    
    generateStudentRows() {
        return this.data.students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.grade}</td>
                <td>${student.email}</td>
                <td>${student.enrollmentDate || '2024-01-15'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="sms.navigateTo('student-details', {id: ${student.id}})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="sms.navigateTo('edit-student', {id: ${student.id}})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="sms.deleteStudent(${student.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    loadStudentDetailsView(params) {
        const studentId = params.id;
        const student = this.data.students.find(s => s.id == studentId);
        
        if (!student) {
            this.showError('Student not found');
            return;
        }
        
        // Get student's grades
        const studentGrades = this.data.grades.filter(g => g.studentId == studentId);
        const avgGrade = studentGrades.length > 0 
            ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
            : 0;
        
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <button class="btn btn-secondary" onclick="sms.navigateTo('student-list')">
                        <i class="fas fa-arrow-left"></i> Back to List
                    </button>
                    <h2>Student Details: ${student.name}</h2>
                    <div>
                        <button class="btn btn-primary" onclick="sms.navigateTo('edit-student', {id: ${student.id}})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
                
                <div class="student-profile">
                    <div class="profile-card">
                        <div class="profile-header">
                            <i class="fas fa-user-graduate fa-3x"></i>
                            <div>
                                <h3>${student.name}</h3>
                                <p>Grade ${student.grade}</p>
                            </div>
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${student.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Student ID:</label>
                                <span>${student.id}</span>
                            </div>
                            <div class="info-item">
                                <label>Enrollment Date:</label>
                                <span>${student.enrollmentDate || '2024-01-15'}</span>
                            </div>
                            <div class="info-item">
                                <label>Average Grade:</label>
                                <span class="grade-badge ${this.getGradeLetter(avgGrade)}">${avgGrade}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="classes-card">
                        <h3>Current Classes</h3>
                        <div class="class-list">
                            ${this.generateStudentClasses(student)}
                        </div>
                    </div>
                    
                    <div class="grades-card">
                        <h3>Grade History</h3>
                        <div class="grade-history">
                            ${this.generateGradeHistory(studentId)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('dynamicContent').innerHTML = html;
    }
    
    generateStudentClasses(student) {
        const studentClasses = this.data.classes.filter(c => c.students.includes(student.id));
        
        if (studentClasses.length === 0) {
            return '<p>No classes enrolled</p>';
        }
        
        return studentClasses.map(cls => {
            const teacher = this.data.teachers.find(t => t.id === cls.teacherId);
            return `
                <div class="class-item" onclick="sms.navigateTo('class-roster', {id: ${cls.id}})">
                    <div>
                        <h4>${cls.name}</h4>
                        <p>Teacher: ${teacher ? teacher.name : 'Unknown'}</p>
                        <p>Room: ${cls.room || 'TBD'} | ${cls.schedule || 'Schedule TBD'}</p>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
        }).join('');
    }
    
    generateGradeHistory(studentId) {
        const grades = this.data.grades.filter(g => g.studentId == studentId);
        
        if (grades.length === 0) {
            return '<p>No grades recorded</p>';
        }
        
        // Group by class
        const gradesByClass = {};
        grades.forEach(grade => {
            const className = this.data.classes.find(c => c.id === grade.classId)?.name || 'Unknown';
            if (!gradesByClass[className]) gradesByClass[className] = [];
            gradesByClass[className].push(grade);
        });
        
        let html = '';
        for (const [className, classGrades] of Object.entries(gradesByClass)) {
            html += `
                <div class="class-grade-group">
                    <h4>${className}</h4>
                    <table class="grade-table">
                        <thead>
                            <tr>
                                <th>Assignment</th>
                                <th>Score</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classGrades.map(g => `
                                <tr>
                                    <td>${g.assignment}</td>
                                    <td class="grade-score ${this.getGradeLetter(g.score)}">${g.score}%</td>
                                    <td>${g.date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        return html;
    }
    
    loadAddStudentView(params) {
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <button class="btn btn-secondary" onclick="sms.navigateTo('student-list')">
                        <i class="fas fa-arrow-left"></i> Back to List
                    </button>
                    <h2>Add New Student</h2>
                </div>
                
                <div class="form-container">
                    <form id="addStudentForm" class="form" onsubmit="event.preventDefault(); sms.saveNewStudent()">
                        <div class="form-group">
                            <label for="studentName">Full Name *</label>
                            <input type="text" id="studentName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="studentGrade">Grade Level *</label>
                            <select id="studentGrade" required>
                                <option value="">Select Grade</option>
                                <option value="9th">9th Grade</option>
                                <option value="10th">10th Grade</option>
                                <option value="11th">11th Grade</option>
                                <option value="12th">12th Grade</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="studentEmail">Email *</label>
                            <input type="email" id="studentEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="enrollmentDate">Enrollment Date</label>
                            <input type="date" id="enrollmentDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="sms.navigateTo('student-list')">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Add Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('dynamicContent').innerHTML = html;
    }
    
    saveNewStudent() {
        const newStudent = {
            id: this.generateId('student'),
            name: document.getElementById('studentName').value,
            grade: document.getElementById('studentGrade').value,
            email: document.getElementById('studentEmail').value,
            enrollmentDate: document.getElementById('enrollmentDate').value,
            classes: []
        };
        
        this.data.students.push(newStudent);
        
        // Show success message
        this.showNotification('Student added successfully!', 'success');
        
        // Navigate back to student list
        this.navigateTo('student-list');
    }
    
    loadGradeEntryView(params) {
        const classId = params.classId;
        const cls = this.data.classes.find(c => c.id == classId);
        
        if (!cls) {
            this.showError('Class not found');
            return;
        }
        
        const students = this.data.students.filter(s => cls.students.includes(s.id));
        
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <button class="btn btn-secondary" onclick="sms.navigateTo('myclasses')">
                        <i class="fas fa-arrow-left"></i> Back to Classes
                    </button>
                    <h2>Grade Entry: ${cls.name}</h2>
                </div>
                
                <div class="grade-entry-container">
                    <div class="assignment-info">
                        <input type="text" id="assignmentName" placeholder="Assignment Name" class="assignment-input">
                        <input type="date" id="gradeDate" value="${new Date().toISOString().split('T')[0]}" class="date-input">
                    </div>
                    
                    <table class="grade-entry-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Score (%)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td>${student.name}</td>
                                    <td>
                                        <input type="number" 
                                               class="grade-input" 
                                               id="grade-${student.id}" 
                                               min="0" 
                                               max="100"
                                               value="${this.getExistingGrade(student.id, classId)}">
                                    </td>
                                    <td>
                                        <button class="btn-small" onclick="sms.saveGrade(${student.id}, ${classId})">
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="sms.saveAllGrades(${classId})">
                            Save All Grades
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('dynamicContent').innerHTML = html;
    }
    
    getExistingGrade(studentId, classId) {
        const grade = this.data.grades.find(g => 
            g.studentId == studentId && g.classId == classId
        );
        return grade ? grade.score : '';
    }
    
    saveGrade(studentId, classId) {
        const assignmentName = document.getElementById('assignmentName').value;
        const gradeDate = document.getElementById('gradeDate').value;
        const score = document.getElementById(`grade-${studentId}`).value;
        
        if (!assignmentName) {
            alert('Please enter an assignment name');
            return;
        }
        
        if (!score) {
            alert('Please enter a score');
            return;
        }
        
        // Check if grade already exists for this assignment
        const existingGradeIndex = this.data.grades.findIndex(g => 
            g.studentId == studentId && 
            g.classId == classId && 
            g.assignment === assignmentName
        );
        
        if (existingGradeIndex >= 0) {
            // Update existing grade
            this.data.grades[existingGradeIndex].score = parseInt(score);
            this.data.grades[existingGradeIndex].date = gradeDate;
        } else {
            // Add new grade
            this.data.grades.push({
                id: this.generateId('grade'),
                studentId: parseInt(studentId),
                classId: parseInt(classId),
                assignment: assignmentName,
                score: parseInt(score),
                date: gradeDate
            });
        }
        
        // Visual feedback
        const input = document.getElementById(`grade-${studentId}`);
        input.style.borderColor = '#10b981';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 1000);
        
        this.showNotification('Grade saved!', 'success');
    }
    
    saveAllGrades(classId) {
        const assignmentName = document.getElementById('assignmentName').value;
        const gradeDate = document.getElementById('gradeDate').value;
        
        if (!assignmentName) {
            alert('Please enter an assignment name');
            return;
        }
        
        const cls = this.data.classes.find(c => c.id == classId);
        if (!cls) return;
        
        cls.students.forEach(studentId => {
            const score = document.getElementById(`grade-${studentId}`).value;
            if (score) {
                const existingGradeIndex = this.data.grades.findIndex(g => 
                    g.studentId == studentId && 
                    g.classId == classId && 
                    g.assignment === assignmentName
                );
                
                if (existingGradeIndex >= 0) {
                    this.data.grades[existingGradeIndex].score = parseInt(score);
                    this.data.grades[existingGradeIndex].date = gradeDate;
                } else {
                    this.data.grades.push({
                        id: this.generateId('grade'),
                        studentId: parseInt(studentId),
                        classId: parseInt(classId),
                        assignment: assignmentName,
                        score: parseInt(score),
                        date: gradeDate
                    });
                }
            }
        });
        
        this.showNotification('All grades saved!', 'success');
    }
    
    loadClassRosterView(params) {
        const classId = params.id;
        const cls = this.data.classes.find(c => c.id == classId);
        
        if (!cls) {
            this.showError('Class not found');
            return;
        }
        
        const teacher = this.data.teachers.find(t => t.id === cls.teacherId);
        const students = this.data.students.filter(s => cls.students.includes(s.id));
        
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <button class="btn btn-secondary" onclick="sms.navigateTo('classes')">
                        <i class="fas fa-arrow-left"></i> Back to Classes
                    </button>
                    <h2>${cls.name} - Class Roster</h2>
                </div>
                
                <div class="class-info-card">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Teacher:</label>
                            <span>${teacher ? teacher.name : 'Unknown'}</span>
                        </div>
                        <div class="info-item">
                            <label>Subject:</label>
                            <span>${cls.subject || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Schedule:</label>
                            <span>${cls.schedule || 'TBD'}</span>
                        </div>
                        <div class="info-item">
                            <label>Room:</label>
                            <span>${cls.room || 'TBD'}</span>
                        </div>
                        <div class="info-item">
                            <label>Total Students:</label>
                            <span>${students.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <h3>Student Roster</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Grade</th>
                                <th>Email</th>
                                <th>Average Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => {
                                const studentGrades = this.data.grades.filter(g => 
                                    g.studentId === student.id && g.classId == classId
                                );
                                const avgGrade = studentGrades.length > 0 
                                    ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
                                    : 'N/A';
                                
                                return `
                                    <tr>
                                        <td>${student.name}</td>
                                        <td>${student.grade}</td>
                                        <td>${student.email}</td>
                                        <td>${avgGrade !== 'N/A' ? avgGrade + '%' : 'No grades'}</td>
                                        <td>
                                            <button class="btn-small" onclick="sms.navigateTo('student-details', {id: ${student.id}})">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('dynamicContent').innerHTML = html;
    }
    
    loadEditStudentView(params) {
        // Similar to add student but pre-filled
        this.loadAddStudentView(params);
    }
    
    generateId(type) {
        const items = this.data[type + 's'] || [];
        return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    }
    
    deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.data.students = this.data.students.filter(s => s.id !== studentId);
            this.showNotification('Student deleted successfully', 'warning');
            this.navigateTo('student-list');
        }
    }
    
    updateBrowserUrl(viewName, params) {
        let url = `#${viewName}`;
        if (Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            url += `?${queryString}`;
        }
        window.location.hash = url;
    }
    
    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;
        
        const [viewName, queryString] = hash.split('?');
        const params = {};
        
        if (queryString) {
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = value;
            });
        }
        
        this.loadView(viewName, params);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        const dynamicContent = document.getElementById('dynamicContent');
        if (dynamicContent) {
            dynamicContent.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="sms.navigateTo('dashboard')">
                        Go to Dashboard
                    </button>
                </div>
            `;
        }
    }
    
    saveSession() {
        if (this.currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }
    
    checkSavedSession() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.currentRole = this.currentUser.role;
                
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('appContainer').style.display = 'block';
                document.body.setAttribute('data-role', this.currentRole);
                
                const userNameElement = document.getElementById('userDisplayName');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.name;
                }
                
                const roleBadge = document.getElementById('roleBadge');
                if (roleBadge) {
                    roleBadge.textContent = this.getRoleDisplayName(this.currentRole);
                }
                
                this.initializeRoleBasedUI();
            } catch (e) {
                console.error('Failed to restore session:', e);
                this.handleLogout();
            }
        }
    }
    
    handleLogout() {
        this.currentUser = null;
        this.currentRole = null;
        sessionStorage.removeItem('currentUser');
        
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        document.body.removeAttribute('data-role');
        
        // Clear login form
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('role');
        const errorDiv = document.getElementById('loginError');
        
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (roleSelect) roleSelect.value = '';
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

// Initialize the application
const sms = new EnhancedSchoolManagementSystem();