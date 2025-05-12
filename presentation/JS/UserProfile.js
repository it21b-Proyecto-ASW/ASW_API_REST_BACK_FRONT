document.addEventListener('DOMContentLoaded', function() {
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
        bioTextarea.value = userBio.textContent;
        bioModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        bioModal.style.display = 'none';
    });

    saveBioBtn.addEventListener('click', () => {
        userBio.textContent = bioTextarea.value;
        bioModal.style.display = 'none';
        // Here you would typically save to the server
    });

    // Avatar upload functionality
    avatarUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function(event) {
                userAvatar.src = event.target.result;
                // Here you would typically upload to the server
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

    // Initial load of assigned issues (default tab)
    loadAssignedIssues();

    // Functions to load data
    function loadAssignedIssues() {
        // Simulate API call to get assigned issues
        // In a real app, you would call get_issue_list() and filter for assigned issues
        const issues = getIssuesData().filter(issue => issue.assigned && issue.status !== 'closed');

        const sortBy = assignedSortBy.value;
        const sortOrder = assignedSortOrder.value;

        const sortedIssues = sortIssues(issues, sortBy, sortOrder);
        renderIssues(sortedIssues, 'assigned-issues-list');

        // Update open issues count
        document.getElementById('open-issues-count').textContent = issues.length;
    }

    function loadWatchedIssues() {
        // Simulate API call to get watched issues
        const issues = getIssuesData().filter(issue => issue.watched);

        const sortBy = watchedSortBy.value;
        const sortOrder = watchedSortOrder.value;

        const sortedIssues = sortIssues(issues, sortBy, sortOrder);
        renderIssues(sortedIssues, 'watched-issues-list');

        // Update watched issues count
        document.getElementById('watched-count').textContent = issues.length;
    }

    function loadComments() {
        // Simulate API call to get comments
        const comments = getCommentsData();

        // Sort by date (newest first)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderComments(comments);

        // Update comments count
        document.getElementById('comments-count').textContent = comments.length;
    }

    function sortIssues(issues, sortBy, sortOrder) {
        return issues.sort((a, b) => {
            let valueA, valueB;

            // Handle different sort criteria
            if (sortBy === 'number') {
                valueA = a.number;
                valueB = b.number;
            } else if (sortBy === 'modified') {
                valueA = new Date(a.modified);
                valueB = new Date(b.modified);
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

    function renderIssues(issues, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (issues.length === 0) {
            container.innerHTML = '<p>No issues found.</p>';
            return;
        }

        issues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = 'issue-item';

            // Determine status class
            let statusClass = '';
            if (issue.status.toLowerCase().includes('new')) {
                statusClass = 'status-new';
            } else if (issue.status.toLowerCase().includes('progress')) {
                statusClass = 'status-in-progress';
            } else if (issue.status.toLowerCase().includes('modified')) {
                statusClass = 'status-modified';
            }

            issueElement.innerHTML = `
                <div class="issue-title">#${issue.number} - ${issue.title}</div>
                <div class="issue-meta">
                    <div class="issue-meta-item">
                        <i class="fas fa-tag"></i> ${issue.type}
                    </div>
                    <div class="issue-meta-item">
                        <i class="fas fa-bolt"></i> ${issue.severity}
                    </div>
                    <div class="issue-meta-item">
                        <i class="fas fa-flag"></i> ${issue.priority}
                    </div>
                    <div class="issue-meta-item">
                        <span class="issue-status ${statusClass}">${issue.status}</span>
                    </div>
                </div>
                <div class="issue-date">${formatDate(issue.modified)}</div>
            `;

            container.appendChild(issueElement);
        });
    }

    function renderComments(comments) {
        const container = document.getElementById('comments-list');
        container.innerHTML = '';

        if (comments.length === 0) {
            container.innerHTML = '<p>No comments found.</p>';
            return;
        }

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            commentElement.innerHTML = `
                <div class="comment-header">
                    <a href="#issue-${comment.issueNumber}" class="comment-issue-link">#${comment.issueNumber} - ${comment.issueTitle}</a>
                    <span class="comment-date">${formatDateTime(comment.date)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
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

    // Mock data functions - in a real app, you would call get_issue_list() API
    function getIssuesData() {
        // This is mock data - replace with actual API call to get_issue_list()
        return [
            {
                number: 1,
                title: "TEST",
                type: "T",
                severity: "S",
                priority: "P",
                status: "In progress",
                modified: "2025-03-06",
                assigned: true,
                watched: false
            },
            {
                number: 2,
                title: "Fix broken urls in main page",
                type: "Bug",
                severity: "Medium",
                priority: "High",
                status: "New",
                modified: "2025-03-11",
                assigned: true,
                watched: true
            },
            {
                number: 3,
                title: "Nicer UX",
                type: "Improvement",
                severity: "Low",
                priority: "Medium",
                status: "Modified",
                modified: "2025-03-11",
                assigned: true,
                watched: true
            },
            // Add more issues as needed
        ];
    }

    function getCommentsData() {
        // This is mock data - replace with actual API call
        return [
            {
                issueNumber: 3,
                issueTitle: "Nicer UX",
                text: "No way, man!",
                date: "2025-03-11T18:45:00"
            },
            {
                issueNumber: 2,
                issueTitle: "Fix broken uris in main page",
                text: "It's trivial to implement.",
                date: "2025-03-10T09:12:00"
            },
            {
                issueNumber: 2,
                issueTitle: "Fix broken uris in main page",
                text: "It isn't too hard.",
                date: "2025-03-09T20:43:00"
            }
        ];
    }
});