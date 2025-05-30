document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = "/api";

    // DOM elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const bioModal = document.getElementById('bio-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const bioTextarea = document.getElementById('bio-textarea');
    const userBio = document.getElementById('user-bio');
    const avatarUpload = document.getElementById('avatar-upload');
    const userAvatar = document.getElementById('user-avatar');
    const username = document.getElementById('username');
    const userHandle = document.getElementById('user-handle');
    const userDropdown = document.getElementById('user-dropdown');

    // Global data storage
    let userData = null;
    let assignedIssuesData = [];
    let watchedIssuesData = [];
    let commentsData = [];
    let allUsers = [];

    // Initialize the page
    init();

    async function init() {
        try {
            // Load all users first
            await loadAllUsers();

            // Check if we have a user in session storage
            const storedUserId = sessionStorage.getItem('user_id');

            if (storedUserId) {
                // Use stored user
                userDropdown.value = storedUserId;
            } else if (allUsers.length > 0) {
                // Use first user as default
                const firstUserId = allUsers[0].id;
                userDropdown.value = firstUserId;

                // Get and store API key for first user
                await getAndStoreApiKey(firstUserId);
            }

            // Load profile for selected user
            await loadUserProfile();
            await loadAssignedIssues();
        } catch (error) {
            console.error('Error initializing profile:', error);
            showError('Failed to load user profile');
        }
    }

    // User Management Functions
    async function loadAllUsers() {
        try {
            allUsers = await apiRequest('/users/');
            populateUserDropdown(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            showError('Failed to load users');
        }
    }

    function populateUserDropdown(users) {
        userDropdown.innerHTML = '';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.nombre;
            userDropdown.appendChild(option);
        });
    }

    async function getAndStoreApiKey(userId) {
        try {
            // Call the assign-apikey endpoint to get/generate an API key
            const response = await apiRequest(`/users/${userId}/assign-apikey/`, {
                method: 'POST'
            });

            // Store user ID and API key in session storage
            sessionStorage.setItem('user_id', userId);
            sessionStorage.setItem('apikey', response.apikey);

            console.log(`User ID ${userId} and API key stored in session storage`);
            return response.apikey;
        } catch (error) {
            console.error('Error getting API key:', error);
            showError('Failed to get API key');
            return null;
        }
    }

    // Handle user selection change
    userDropdown.addEventListener('change', async function() {
        const selectedUserId = this.value;
        if (!selectedUserId) return;

        try {
            // Get and store API key for selected user
            await getAndStoreApiKey(selectedUserId);

            // Reload user profile and data
            await loadUserProfile();
            await loadAssignedIssues();

            // Reset active tab to assigned issues
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            document.querySelector('[data-tab="assigned-issues"]').classList.add('active');
            document.getElementById('assigned-issues').classList.add('active');
        } catch (error) {
            console.error('Error changing user:', error);
            showError('Failed to change user');
        }
    });

    // API Functions
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                // Add basic authentication if needed for your API
                // 'Authorization': 'Basic ' + btoa('username:password')
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    }

    async function loadUserProfile() {
        try {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                throw new Error('No user ID found in session storage');
            }

            userData = await apiRequest(`/users/${userId}/profile/`);
            updateUserProfile(userData);
        } catch (error) {
            console.error('Error loading user profile:', error);
            showError('Failed to load user profile');
        }
    }

    async function loadAssignedIssues() {
        try {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                throw new Error('No user ID found in session storage');
            }

            assignedIssuesData = await apiRequest(`/users/${userId}/assigned_issues/`);
            const sortBy = document.getElementById('assigned-sort-by').value;
            const sortOrder = document.getElementById('assigned-sort-order').value;
            const sortedIssues = sortIssues([...assignedIssuesData], sortBy, sortOrder);
            renderIssues(sortedIssues, 'assigned-issues-list');

            // Update stats
            document.getElementById('open-issues-count').textContent = assignedIssuesData.length;
        } catch (error) {
            console.error('Error loading assigned issues:', error);
            document.getElementById('assigned-issues-list').innerHTML = '<p>Error loading assigned issues</p>';
        }
    }

    async function loadWatchedIssues() {
        try {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                throw new Error('No user ID found in session storage');
            }

            watchedIssuesData = await apiRequest(`/users/${userId}/watched_issues/`);
            const sortBy = document.getElementById('watched-sort-by').value;
            const sortOrder = document.getElementById('watched-sort-order').value;
            const sortedIssues = sortIssues([...watchedIssuesData], sortBy, sortOrder);
            renderIssues(sortedIssues, 'watched-issues-list');

            // Update stats
            document.getElementById('watched-count').textContent = watchedIssuesData.length;
        } catch (error) {
            console.error('Error loading watched issues:', error);
            document.getElementById('watched-issues-list').innerHTML = '<p>Error loading watched issues</p>';
        }
    }

    async function loadComments() {
        try {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                throw new Error('No user ID found in session storage');
            }

            commentsData = await apiRequest(`/users/${userId}/comments/`);
            renderComments(commentsData);

            // Update stats
            document.getElementById('comments-count').textContent = commentsData.length;
        } catch (error) {
            console.error('Error loading comments:', error);
            document.getElementById('comments-list').innerHTML = '<p>Error loading comments</p>';
        }
    }

    async function updateUserBio(newBio) {
        try {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                throw new Error('No user ID found in session storage');
            }

            const updateData = {
                nombre: userData.nombre,
                biography: newBio
            };

            const updatedUser = await apiRequest(`/users/${userId}/profile/edit/`, {
                method: 'POST',
                body: JSON.stringify(updateData)
            });

            userData = updatedUser;
            updateUserProfile(userData);
            return true;
        } catch (error) {
            console.error('Error updating bio:', error);
            showError('Failed to update bio');
            return false;
        }
    }

    // UI Update Functions
    function updateUserProfile(user) {
        username.textContent = user.nombre;
        userHandle.textContent = `@${user.nombre.toLowerCase().replace(/\s+/g, '')}`;
        userBio.textContent = user.biography || 'No bio available';

        if (user.photo) {
            userAvatar.src = user.photo;
        } else {
            userAvatar.src = 'https://via.placeholder.com/150';
        }

        // Update stats from API response
        document.getElementById('open-issues-count').textContent = user.numOpenIssues || 0;
        document.getElementById('watched-count').textContent = user.numWatchedIssues || 0;
        document.getElementById('comments-count').textContent = user.numComments || 0;
    }

    function showError(message) {
        // You can implement a more sophisticated error display
        alert(message);
    }

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Load data for the active tab
            if (tabId === 'assigned-issues') {
                loadAssignedIssues();
            } else if (tabId === 'watched-issues') {
                loadWatchedIssues();
            } else if (tabId === 'comments') {
                loadComments();
            }
        });
    });

    // Bio edit functionality
    editBioBtn.addEventListener('click', () => {
        bioTextarea.value = userData?.biography || '';
        bioModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        bioModal.style.display = 'none';
    });

    saveBioBtn.addEventListener('click', async () => {
        const newBio = bioTextarea.value;
        const success = await updateUserBio(newBio);
        if (success) {
            bioModal.style.display = 'none';
        }
    });

    // Avatar upload functionality (placeholder - you'd need to implement file upload)
    avatarUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function(event) {
                userAvatar.src = event.target.result;
                // TODO: Implement actual file upload to server
                console.log('Avatar upload would be implemented here');
            };

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === bioModal) {
            bioModal.style.display = 'none';
        }
    });

    // Sort functionality for assigned issues
    const assignedSortBy = document.getElementById('assigned-sort-by');
    const assignedSortOrder = document.getElementById('assigned-sort-order');

    assignedSortBy.addEventListener('change', loadAssignedIssues);
    assignedSortOrder.addEventListener('change', loadAssignedIssues);

    // Sort functionality for watched issues
    const watchedSortBy = document.getElementById('watched-sort-by');
    const watchedSortOrder = document.getElementById('watched-sort-order');

    watchedSortBy.addEventListener('change', loadWatchedIssues);
    watchedSortOrder.addEventListener('change', loadWatchedIssues);

    // Utility Functions
    function sortIssues(issues, sortBy, sortOrder) {
        return issues.sort((a, b) => {
            let valueA, valueB;

            // Handle different sort criteria
            if (sortBy === 'id') {
                valueA = a.id;
                valueB = b.id;
            } else if (sortBy === 'dateModified') {
                valueA = new Date(a.dateModified);
                valueB = new Date(b.dateModified);
            } else {
                valueA = a[sortBy];
                valueB = b[sortBy];
            }

            // Handle sort order
            if (sortOrder === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }

    async function renderIssues(issues, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (issues.length === 0) {
            container.innerHTML = '<p>No issues found.</p>';
            return;
        }

        for (const issue of issues) {
            const issueElement = document.createElement('div');
            issueElement.className = 'issue-item';

            let statusClass = 'status-default';
            if (issue.estado) {
                statusClass = `status-${issue.estado}`;
            }

            issueElement.innerHTML = `
                <div class="issue-title">#${issue.id} - ${issue.nombre}</div>
                <div class="issue-meta">
                    <div class="issue-meta-item">
                        <i class="fas fa-tag"></i> ${await getSettingName('tipos', issue.tipo)}
                    </div>
                    <div class="issue-meta-item">
                        <i class="fas fa-bolt"></i> ${await getSettingName('severidades', issue.severidad)}
                    </div>
                    <div class="issue-meta-item">
                        <i class="fas fa-flag"></i> ${await getSettingName('prioridades', issue.prioridad)}
                    </div>
                    <div class="issue-meta-item">
                        <span class="issue-status ${statusClass}">${await getSettingName('estados', issue.estado)}</span>
                    </div>
                </div>
                <div class="issue-date">${formatDate(issue.dateModified)}</div>
            `;

            container.appendChild(issueElement);
        }
    }

    function renderComments(comments) {
        const container = document.getElementById('comments-list');
        container.innerHTML = '';

        if (comments.length === 0) {
            container.innerHTML = '<p>No comments found.</p>';
            return;
        }

        // Sort by date (newest first)
        comments.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            commentElement.innerHTML = `
                <div class="comment-header">
                    <a href="#issue-${comment.issue}" class="comment-issue-link">#${comment.issue}</a>
                    <span class="comment-date">${formatDateTime(comment.dateModified)}</span>
                </div>
                <div class="comment-text">${comment.content}</div>
            `;

            container.appendChild(commentElement);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Función para obtener el nombre de un setting por su ID
    async function getSettingName(settingType, settingId) {
        if (!settingId) return 'N/A';

        try {
            const settings = await apiRequest(`/settings/${settingType}`);
            const setting = settings.find(s => s.id === settingId);
            return setting ? setting.nombre : 'N/A';
        } catch (error) {
            console.error(`Error loading ${settingType}:`, error);
            return 'N/A';
        }
    }
});