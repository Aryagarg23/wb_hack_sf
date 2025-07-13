// Main application logic
class App {
  constructor() {
    console.log('App constructor called');
    this.tasks = [];
    this.activeTaskIndex = 0;
    this.activeTabIndex = 0;
    this.hasActiveWebview = false;
    this.initializeEventListeners();
    // Initialize tasks after components are loaded
    this.waitForComponents();
  }

  async waitForComponents() {
    console.log('waitForComponents started');
    // Wait for sidebar component to be loaded
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      const sidebar = document.querySelector('.sidebar');
      const addTabButton = document.querySelector('.sidebar__add-tab');
      
      console.log(`Attempt ${attempts + 1}: Sidebar:`, !!sidebar, 'Add button:', !!addTabButton);
      
      if (sidebar && addTabButton) {
        console.log('Components found, initializing tasks and task management');
        this.initializeTasks();
        this.setupTaskManagement();
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.error('Failed to load components after 5 seconds');
    this.createFallbackTaskButton();
  }

  createFallbackTaskButton() {
    const sidebarContainer = document.querySelector('#sidebar-container');
    if (sidebarContainer) {
      console.log('Creating fallback sidebar structure...');
      sidebarContainer.innerHTML = `
        <div class="sidebar">
          <div class="sidebar-background"></div>
          <div class="sidebar__content">
            <div class="sidebar__header">
              <h3 class="sidebar__title">Task / Query</h3>
              <button class="sidebar__add-tab" type="button" title="New Task">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1v6H2v2h6v6h2V9h6V7H10V1H8z"/>
                </svg>
              </button>
            </div>
            <div class="sidebar__tab-list">
              <!-- Tasks will be dynamically added here -->
            </div>
          </div>
        </div>
      `;
      
      // Now try to set up task management again
      setTimeout(() => {
        this.initializeTasks();
        this.setupTaskManagement();
      }, 100);
    }
  }



  initializeEventListeners() {
    // Window Controls
    this.setupWindowControls();
    
    // Navigation Controls
    this.setupNavigationControls();
    
    // Button Active State Handling
    this.setupButtonActiveStates();

    this.setupQueryInput();
    
    // Menu Button Toggle
    this.setupMenuButton();
    
    // Network Button Toggle
    this.setupNetworkButton();
    
    // Webview Handling
    this.setupWebview();
    
    // Header Visibility
    this.setupHeaderVisibility();
    
    // Prevent Zoom Functionality
    this.preventZoomFunctionality();
    
    // Collapsed Query Input Handling
    this.setupCollapsedQueryInput();
  }

  initializeTasks() {
    // Start with no tasks - blank slate
    this.renderTasks();
  }

  setupTaskManagement() {
    // Use event delegation to handle the add task button
    document.addEventListener('click', (e) => {
      console.log('Click detected on:', e.target);
      console.log('Closest sidebar__add-tab:', e.target.closest('.sidebar__add-tab'));
      
      if (e.target.closest('.sidebar__add-tab')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Add task button clicked via event delegation!');
        
        // Add visual feedback
        const button = e.target.closest('.sidebar__add-tab');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 100);
        
        // Open query input screen instead of creating a task directly
        this.openQueryInput();
      }
    });
    
    // Also add a global keyboard shortcut for new tasks
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        this.openQueryInput();
      }
    });
    
    console.log('Task management setup complete with event delegation');
    
    // Test if we can find the button
    setTimeout(() => {
      const testButton = document.querySelector('.sidebar__add-tab');
      console.log('Test button found:', testButton);
      if (testButton) {
        console.log('Button HTML:', testButton.outerHTML);
        console.log('Button computed style pointer-events:', window.getComputedStyle(testButton).pointerEvents);
        console.log('Button computed style z-index:', window.getComputedStyle(testButton).zIndex);
      }
    }, 1000);
  }

  openQueryInput() {
    // Deactivate webview and expand query input
    this.deactivateWebview();
    
    // Focus the query input
    const queryInputTextArea = document.querySelector('.query-input__text-area');
    if (queryInputTextArea) {
      setTimeout(() => {
        queryInputTextArea.focus();
      }, 100);
    }
  }

  createTask(title = 'New Task', icon = null) {
    console.log('Creating new task:', title);
    const task = {
      id: Date.now() + Math.random(),
      title: title,
      icon: icon,
      tabs: [],
      createdAt: new Date()
    };

    this.tasks.push(task);
    console.log('Total tasks now:', this.tasks.length);
    this.renderTasks();
    this.switchToTask(this.tasks.length - 1);
  }

  createTab(url, title = 'New Tab', snippet = '') {
    if (this.tasks.length === 0) {
      this.createTask('New Task');
    }
    
    const activeTask = this.tasks[this.activeTaskIndex];
    if (!activeTask) return;
    
    console.log('Creating new tab for task:', activeTask.title, 'Tab:', title);
    const tab = {
      id: Date.now() + Math.random(),
      url: url,
      title: title,
      snippet: snippet,
      favicon: this.getFaviconUrl(url),
      webview: null
    };

    activeTask.tabs.push(tab);
    console.log('Total tabs in current task now:', activeTask.tabs.length);
    this.renderTasks(); // Update task count display
    this.renderTabs();
    this.switchToTab(activeTask.tabs.length - 1);
  }

  switchToTask(index) {
    if (index < 0 || index >= this.tasks.length) return;

    // Update active task
    this.activeTaskIndex = index;
    this.activeTabIndex = 0; // Reset to first tab of new task
    
    const activeTask = this.tasks[index];
    console.log('Switched to task:', activeTask.title);

    // Switch to first tab of the task
    if (activeTask.tabs.length > 0) {
      this.switchToTab(0);
    } else {
      // No tabs in this task, clear webview
      const webview = document.getElementById('browser-webview');
      if (webview) {
        webview.src = 'about:blank';
      }
      
      const urlBarInput = document.querySelector('.url-bar__input');
      if (urlBarInput) {
        urlBarInput.value = '';
      }
    }

    this.renderTasks();
    this.renderTabs();
  }

  switchToTab(index) {
    const activeTask = this.tasks[this.activeTaskIndex];
    if (!activeTask || index < 0 || index >= activeTask.tabs.length) return;

    // Update active tab
    this.activeTabIndex = index;
    const activeTab = activeTask.tabs[index];

    // Update webview
    const webview = document.getElementById('browser-webview');
    if (webview) {
      webview.src = activeTab.url;
    }

    // Update URL bar
    const urlBarInput = document.querySelector('.url-bar__input');
    if (urlBarInput) {
      urlBarInput.value = activeTab.url;
    }

    this.renderTabs();
  }

  closeTask(index) {
    // Close all tabs in the task first
    const taskToClose = this.tasks[index];
    if (taskToClose) {
      taskToClose.tabs = [];
    }

    // Remove the task
    this.tasks.splice(index, 1);

    // If no tasks remain, go to default query page
    if (this.tasks.length === 0) {
      this.activeTaskIndex = 0;
      this.activeTabIndex = 0;
      this.deactivateWebview();
      this.renderTasks();
      this.renderTabs();
      return;
    }

    // Adjust active task index
    if (this.activeTaskIndex >= index) {
      this.activeTaskIndex = Math.max(0, this.activeTaskIndex - 1);
    }

    // Switch to the new active task
    this.switchToTask(this.activeTaskIndex);
  }

  closeTab(index) {
    const activeTask = this.tasks[this.activeTaskIndex];
    if (!activeTask || activeTask.tabs.length <= 1) return; // Keep at least one tab

    activeTask.tabs.splice(index, 1);

    // Adjust active tab index
    if (this.activeTabIndex >= index) {
      this.activeTabIndex = Math.max(0, this.activeTabIndex - 1);
    }

    // Update task count display and switch to the new active tab
    this.renderTasks();
    this.switchToTab(this.activeTabIndex);
  }

  detectTaskIcon(links) {
    // Analyze links and snippets to determine the most representative icon
    const content = links.map(link => 
      `${link.title} ${link.snippet || ''}`
    ).join(' ').toLowerCase();
    
    // Define icon mappings based on content keywords
    const iconMappings = [
      { keywords: ['github', 'code', 'programming', 'developer', 'software'], icon: '💻' },
      { keywords: ['youtube', 'video', 'tutorial', 'course'], icon: '📺' },
      { keywords: ['twitter', 'social', 'tweet'], icon: '🐦' },
      { keywords: ['linkedin', 'professional', 'career', 'job'], icon: '💼' },
      { keywords: ['amazon', 'shopping', 'buy', 'product'], icon: '📦' },
      { keywords: ['spotify', 'music', 'song', 'audio'], icon: '🎵' },
      { keywords: ['netflix', 'movie', 'film', 'entertainment'], icon: '🎬' },
      { keywords: ['reddit', 'discussion', 'community'], icon: '🤖' },
      { keywords: ['stackoverflow', 'question', 'answer', 'help'], icon: '❓' },
      { keywords: ['wikipedia', 'encyclopedia', 'knowledge'], icon: '📚' },
      { keywords: ['arxiv', 'research', 'paper', 'academic'], icon: '📄' },
      { keywords: ['medium', 'article', 'blog', 'writing'], icon: '📝' },
      { keywords: ['notion', 'document', 'note'], icon: '📋' },
      { keywords: ['figma', 'design', 'ui', 'ux'], icon: '🎨' },
      { keywords: ['discord', 'chat', 'communication'], icon: '💬' },
      { keywords: ['slack', 'team', 'collaboration'], icon: '💬' },
      { keywords: ['google', 'search', 'web'], icon: '🔍' },
      { keywords: ['bing', 'search'], icon: '🔎' }
    ];
    
    // Find the best matching icon
    for (const mapping of iconMappings) {
      if (mapping.keywords.some(keyword => content.includes(keyword))) {
        return mapping.icon;
      }
    }
    
    // Default icon based on content type
    if (content.includes('research') || content.includes('study')) return '🔬';
    if (content.includes('news') || content.includes('article')) return '📰';
    if (content.includes('shopping') || content.includes('buy')) return '🛒';
    if (content.includes('social') || content.includes('community')) return '👥';
    
    return '🌐'; // Default web icon
  }

  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (e) {
      return null;
    }
  }

  duplicateTab(tab) {
    const activeTask = this.tasks[this.activeTaskIndex];
    if (!activeTask) return;

    const duplicatedTab = {
      id: Date.now() + Math.random(),
      url: tab.url,
      title: `${tab.title} (Copy)`,
      snippet: tab.snippet,
      favicon: tab.favicon,
      webview: null
    };

    activeTask.tabs.push(duplicatedTab);
    console.log('Duplicated tab:', tab.title);
    this.renderTabs();
    this.switchToTab(activeTask.tabs.length - 1);
  }

  renderTasks() {
    const tabList = document.querySelector('.sidebar__tab-list');
    if (!tabList) return;

    tabList.innerHTML = '';

    if (this.tasks.length === 0) {
      // Show empty state
      const emptyElement = document.createElement('div');
      emptyElement.className = 'sidebar__empty-state';
      emptyElement.innerHTML = `
        <div class="sidebar__empty-icon">📝</div>
        <div class="sidebar__empty-text">No tasks yet</div>
        <div class="sidebar__empty-hint">Click + to create your first task</div>
      `;
      tabList.appendChild(emptyElement);
      return;
    }

    this.tasks.forEach((task, index) => {
      const taskElement = document.createElement('div');
      taskElement.className = `sidebar__tab ${index === this.activeTaskIndex ? 'is-active' : ''}`;
      taskElement.innerHTML = `
        <div class="sidebar__tab-icon">
          ${task.icon || '📝'}
        </div>
        <h4 class="sidebar__tab-title">${task.title}</h4>
        <span class="sidebar__tab-count">${task.tabs.length}</span>
        <button class="sidebar__tab-close" type="button" title="Close Task">
        </button>
      `;

      // Add click handlers
      taskElement.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar__tab-close')) {
          this.switchToTask(index);
        }
      });

      const closeButton = taskElement.querySelector('.sidebar__tab-close');
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTask(index);
      });

      tabList.appendChild(taskElement);
    });
  }

  renderTabs() {
    const rightSidebar = document.querySelector('.right-sidebar__tab-list');
    if (!rightSidebar) return;

    rightSidebar.innerHTML = '';

    const activeTask = this.tasks[this.activeTaskIndex];
    if (!activeTask) return;

    activeTask.tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = `right-sidebar__tab ${index === this.activeTabIndex ? 'is-active' : ''}`;
      tabElement.innerHTML = `
        <div class="right-sidebar__tab-icon">
          ${tab.favicon ? `<img src="${tab.favicon}" alt="favicon" onerror="this.style.display='none'">` : '🌐'}
        </div>
        <h4 class="right-sidebar__tab-title">${tab.title}</h4>
        <button class="right-sidebar__tab-close" type="button" title="Close Tab">
        </button>
      `;

      // Add click handlers
      tabElement.addEventListener('click', (e) => {
        if (!e.target.closest('.right-sidebar__tab-close')) {
          this.switchToTab(index);
        }
      });

      const closeButton = tabElement.querySelector('.right-sidebar__tab-close');
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(index);
      });

      rightSidebar.appendChild(tabElement);
    });
  }

  setupWindowControls() {
    document
      .getElementById('close-btn')
      ?.addEventListener('click', () => window.electronAPI.closeWindow());
    document
      .getElementById('minimize-btn')
      ?.addEventListener('click', () => window.electronAPI.minimizeWindow());
    document
      .getElementById('maximize-btn')
      ?.addEventListener('click', () => window.electronAPI.maximizeWindow());
  }

  setupNavigationControls() {
    // Navigation controls are now handled by the webview setup
    // This method is kept for potential future use
  }

  setupButtonActiveStates() {
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
      button.addEventListener('mousedown', () => {
        button.classList.add('is-active');
      });
      button.addEventListener('mouseup', () => {
        button.classList.remove('is-active');
      });
      // Also remove class if mouse leaves the button while pressed
      button.addEventListener('mouseleave', () => {
        button.classList.remove('is-active');
      });
    });
  }

  setupQueryInput() {
    const queryInput_container = document.querySelector('.query-input-container');
    const queryInput_textArea = document.querySelector('.query-input__text-area');
    const queryInput_sendButton = document.querySelector('.query-input__send-button');
    const focusOverlay = document.querySelector('.focus-overlay');
    const characterLimit = 50;

    if (!queryInput_container || !queryInput_textArea) return;

    // Setup focus overlay click handler to dismiss editor mode
    if (focusOverlay) {
      focusOverlay.addEventListener('click', (e) => {
        // Only dismiss if clicking on the overlay itself, not on the query input
        if (e.target === focusOverlay) {
          queryInput_container.classList.remove('is-editor-mode');
          focusOverlay.classList.remove('is-active');
          queryInput_textArea.blur();
        }
      });
    }


    const switchToEditorMode = () => {
      if (!queryInput_container.classList.contains('is-editor-mode')) {
        queryInput_container.classList.remove('is-collapsed');
        queryInput_container.classList.add('is-editor-mode');
        focusOverlay?.classList.add('is-active');
        adjustHeight(); // Re-check height after mode switch
      }
    };

    const toggleEditorMode = () => {
      queryInput_container.classList.toggle('is-editor-mode');
      focusOverlay?.classList.toggle('is-active');
      adjustHeight(); // Recalculate height after toggle
    };

    const submitQuery = async () => {
      const query = queryInput_textArea.innerText.trim();
      
      if (!query) {
        console.log('Empty query, not submitting');
        return;
      }
      
      // Simulate click on the container
      queryInput_container.classList.add('is-active');
      setTimeout(() => {
        queryInput_container.classList.remove('is-active');
      }, 100);
      
      console.log('Query submitted:', query);
      
      try {
        // Call the fake backend API
        const response = await fetch('http://localhost:3001/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: query })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        if (data.success && data.links && data.links.length > 0) {
          // Create a new task for this query
          const taskTitle = query.length > 30 ? query.substring(0, 30) + '...' : query;
          const taskIcon = this.detectTaskIcon(data.links);
          this.createTask(taskTitle, taskIcon);
          
          // Create tabs for each link under the new task
          data.links.forEach((link, index) => {
            this.createTab(link.link, link.title, link.snippet);
          });
          
          // Clear the query input
          queryInput_textArea.innerText = '';
          queryInput_textArea.style.height = 'auto';
          
          // Activate webview and collapse query input
          this.activateWebview();
          
          console.log(`Created task "${taskTitle}" with ${data.links.length} tabs for query: "${query}"`);
        } else {
          console.error('Invalid response from backend:', data);
        }
        
      } catch (error) {
        console.error('Error calling backend API:', error);
        // Fallback: create a single tab with a Google search
        const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        this.createTab(fallbackUrl, `${query} - Search`);
        
        // Clear the query input
        queryInput_textArea.innerText = '';
        queryInput_textArea.style.height = 'auto';
      }
    };

    // Smooth Growth & Mode Switching
    const adjustHeight = () => {
      queryInput_textArea.style.height = 'auto'; // Reset height to get correct scrollHeight
      queryInput_textArea.style.height = (queryInput_textArea.scrollHeight) + 'px';
      
      // Switch to editor mode if character limit is reached
      if (queryInput_textArea.innerText.length > characterLimit) {
        switchToEditorMode();
      }
    };
    
    queryInput_textArea.addEventListener('input', adjustHeight);
    
    // Key-based Events
    queryInput_textArea.addEventListener('keydown', (e) => {
      // Escape key to exit editor mode
      if (e.key === 'Escape' && queryInput_container.classList.contains('is-editor-mode')) {
        e.preventDefault();
        queryInput_container.classList.remove('is-editor-mode');
        focusOverlay?.classList.remove('is-active');
        queryInput_textArea.blur();
        return;
      }
      // Toggle editor mode with Shift+Enter if below character limit
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (queryInput_textArea.innerText.length <= characterLimit) {
          toggleEditorMode();
        }
        return; // Stop further execution for this key event
      }
      // Submit with Enter only in pill mode
      if (e.key === 'Enter' && !queryInput_container.classList.contains('is-editor-mode')) {
        e.preventDefault(); 
        submitQuery();
      }
    });

    // Button Clicks
    queryInput_sendButton?.addEventListener('click', submitQuery);



  }


  setupMenuButton() {
    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.app-header');
    
    if (menuButton && sidebar && header) {
      menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle both header and sidebar visibility
        if (sidebar.classList.contains('is-visible')) {
          // Hide both
          sidebar.classList.remove('is-visible');
          header.classList.remove('is-visible');
          menuButton.classList.remove('is-active');
          // Update state tracking
          this.setHeaderVisible(false);
          this.setSidebarVisible(false);
        } else {
          // Show both
          sidebar.classList.add('is-visible');
          header.classList.add('is-visible');
          menuButton.classList.add('is-active');
          // Update state tracking
          this.setHeaderVisible(true);
          this.setSidebarVisible(true);
        }
      });
    }
  }

  setupNetworkButton() {
    const networkButton = document.querySelector('.network-button');
    const networkModal = document.getElementById('network-modal');
    
    if (networkButton && networkModal) {
      networkButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Show the network modal
        networkModal.classList.add('is-visible');
        networkButton.classList.add('is-active');
        
        // Update network information
        this.updateNetworkInfo();
      });
      
      // Close modal when clicking the overlay
      const overlay = networkModal.querySelector('.network-modal__overlay');
      if (overlay) {
        overlay.addEventListener('click', () => {
          networkModal.classList.remove('is-visible');
          networkButton.classList.remove('is-active');
        });
      }
      
      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && networkModal.classList.contains('is-visible')) {
          networkModal.classList.remove('is-visible');
          networkButton.classList.remove('is-active');
        }
      });
      
      // Setup action buttons
      this.setupNetworkActions();
    }
  }

  updateNetworkInfo() {
    // Update connection status
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
      if (navigator.onLine) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.style.color = '#22c55e';
      } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.style.color = '#ef4444';
      }
    }
    
    // Update network type
    const networkType = document.getElementById('network-type');
    if (networkType) {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType) {
          networkType.textContent = connection.effectiveType.toUpperCase();
        } else {
          networkType.textContent = 'Unknown';
        }
      } else {
        networkType.textContent = 'Unknown';
      }
    }
    
    // Update network graph
    this.updateNetworkGraph();
  }



  setupNetworkActions() {
    const refreshButton = document.getElementById('refresh-network');
    
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.updateNetworkInfo();
        this.updateNetworkGraph();
      });
    }
  }

  updateNetworkGraph() {
    const container = document.getElementById('network-graph');
    if (!container || typeof d3 === 'undefined') return;

    // Clear existing content
    container.innerHTML = '';
    // Remove any existing HTML legend
    const oldLegend = document.getElementById('network-graph-legend');
    if (oldLegend) oldLegend.remove();

    // Add HTML legend (fixed in bottom left)
    const htmlLegend = document.createElement('div');
    htmlLegend.id = 'network-graph-legend';
    htmlLegend.style.position = 'absolute';
    htmlLegend.style.left = '24px';
    htmlLegend.style.bottom = '24px';
    htmlLegend.style.background = 'rgba(30, 41, 59, 0.85)';
    htmlLegend.style.borderRadius = '8px';
    htmlLegend.style.padding = '12px 18px';
    htmlLegend.style.display = 'flex';
    htmlLegend.style.flexDirection = 'column';
    htmlLegend.style.gap = '10px';
    htmlLegend.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    htmlLegend.style.zIndex = '10';
    htmlLegend.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#6366f1;"></span><span style="color:#fff;font-weight:600;">Concept</span></div>
      <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#10b981;"></span><span style="color:#fff;font-weight:600;">Query</span></div>
      <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#f59e42;"></span><span style="color:#fff;font-weight:600;">Link</span></div>
    `;
    container.style.position = 'relative';
    container.appendChild(htmlLegend);

    // Add event listener for X button to close modal
    const modal = document.getElementById('network-modal');
    const closeBtn = modal.querySelector('.network-modal__close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('is-visible');
        // Optionally, remove .is-active from network button if needed
        const networkButton = document.querySelector('.network-button');
        if (networkButton) networkButton.classList.remove('is-active');
      };
    }

    // Sample data with three types: concept, query, link
    const nodes = [
      { id: 1, name: 'Photosynthesis', type: 'concept' },
      { id: 2, name: 'What is photosynthesis?', type: 'query' },
      { id: 3, name: 'Wikipedia', type: 'link' },
      { id: 4, name: 'Chlorophyll', type: 'concept' },
      { id: 5, name: 'How does chlorophyll work?', type: 'query' },
      { id: 6, name: 'Britannica', type: 'link' },
      { id: 7, name: 'Light Energy', type: 'concept' },
      { id: 8, name: 'Energy Conversion', type: 'concept' },
      { id: 9, name: 'Research Paper', type: 'link' }
    ];
    const links = [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 1, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 6 },
      { source: 1, target: 7 },
      { source: 7, target: 8 },
      { source: 8, target: 9 }
    ];

    // Create SVG
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom()
          .scaleExtent([0.2, 2])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          })
      );

    // Create a group for all graph elements (for zoom/pan)
    const g = svg.append('g')
      .attr('class', 'graph-group');

    // Draw links (edges)
    const link = g.append('g')
      .attr('stroke', '#bbb')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line');

    // Draw nodes (circles)
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 18)
      .attr('fill', d => {
        if (d.type === 'concept') return '#6366f1';   // Indigo
        if (d.type === 'query')   return '#10b981';   // Emerald
        if (d.type === 'link')    return '#f59e42';   // Orange
        return '#3b82f6';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Draw labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', 12)
      .attr('fill', '#222')
      .text(d => d.name);

    // D3 simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Set initial zoom transform (zoomed out)
    svg.call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(width / 2 * 0.3, height / 2 * 0.3).scale(0.7)
    );

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    }

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  generateNetworkData(isOnline) {
    if (isOnline) {
      // Online network topology
      return {
        nodes: [
          { id: 1, name: 'Internet', type: 'internet', x: 150, y: 30 },
          { id: 2, name: 'Firewall', type: 'security', x: 150, y: 80 },
          { id: 3, name: 'Router', type: 'router', x: 150, y: 130 },
          { id: 4, name: 'Switch 1', type: 'switch', x: 80, y: 180 },
          { id: 5, name: 'Switch 2', type: 'switch', x: 220, y: 180 },
          { id: 6, name: 'PC 1', type: 'device', x: 50, y: 230 },
          { id: 7, name: 'PC 2', type: 'device', x: 110, y: 230 },
          { id: 8, name: 'Server', type: 'server', x: 170, y: 230 },
          { id: 9, name: 'Laptop', type: 'device', x: 250, y: 230 },
          { id: 10, name: 'Mobile', type: 'device', x: 290, y: 180 }
        ],
        links: [
          { source: 1, target: 2, strength: 1.0 },
          { source: 2, target: 3, strength: 1.0 },
          { source: 3, target: 4, strength: 0.8 },
          { source: 3, target: 5, strength: 0.8 },
          { source: 4, target: 6, strength: 0.6 },
          { source: 4, target: 7, strength: 0.6 },
          { source: 5, target: 8, strength: 0.7 },
          { source: 5, target: 9, strength: 0.6 },
          { source: 3, target: 10, strength: 0.5 }
        ]
      };
    } else {
      // Offline network topology (local network only)
      return {
        nodes: [
          { id: 1, name: 'Router', type: 'router', x: 150, y: 100 },
          { id: 2, name: 'Switch', type: 'switch', x: 150, y: 150 },
          { id: 3, name: 'PC 1', type: 'device', x: 80, y: 200 },
          { id: 4, name: 'PC 2', type: 'device', x: 150, y: 200 },
          { id: 5, name: 'Laptop', type: 'device', x: 220, y: 200 },
          { id: 6, name: 'Printer', type: 'device', x: 150, y: 250 }
        ],
        links: [
          { source: 1, target: 2, strength: 0.8 },
          { source: 2, target: 3, strength: 0.6 },
          { source: 2, target: 4, strength: 0.6 },
          { source: 2, target: 5, strength: 0.6 },
          { source: 2, target: 6, strength: 0.4 }
        ]
      };
    }
  }

  setupWebview() {
    const webview = document.getElementById('browser-webview');
    const webviewContainer = document.getElementById('webview-container');
    const urlBarInput = document.querySelector('.url-bar__input');
    const loadingIndicator = document.querySelector('.webview-loading');

    if (!webview || !webviewContainer) return;

    // Handle webview events
    webview.addEventListener('did-start-loading', () => {
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }
    });

    webview.addEventListener('did-stop-loading', () => {
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      webview.setAttribute('data-ready', 'true');
      
      // Update current tab title and URL
      if (this.tabs[this.activeTabIndex]) {
        this.tabs[this.activeTabIndex].url = webview.src;
        this.tabs[this.activeTabIndex].title = webview.getTitle() || 'New Tab';
        this.renderTabs();
      }
    });

    webview.addEventListener('did-fail-load', () => {
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      console.error('Webview failed to load');
    });

    // Handle URL bar navigation
    if (urlBarInput) {
      urlBarInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          let url = urlBarInput.value.trim();
          
          // Add protocol if missing
          if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          
          if (url) {
            // Update current tab URL
            if (this.tabs[this.activeTabIndex]) {
              this.tabs[this.activeTabIndex].url = url;
            }
            webview.src = url;
          }
        }
      });
    }

    // Handle navigation controls
    document.getElementById('back-btn')?.addEventListener('click', () => {
      if (webview.canGoBack()) {
        webview.goBack();
      }
    });

    document.getElementById('forward-btn')?.addEventListener('click', () => {
      if (webview.canGoForward()) {
        webview.goForward();
      }
    });

    document.getElementById('home-btn')?.addEventListener('click', () => {
      const homeUrl = 'about:blank';
      if (this.tabs[this.activeTabIndex]) {
        this.tabs[this.activeTabIndex].url = homeUrl;
      }
      webview.src = homeUrl;
    });

    // Update URL bar when webview navigates
    webview.addEventListener('did-navigate', (e) => {
      if (urlBarInput) {
        urlBarInput.value = e.url;
      }
      // Update current tab URL
      if (this.tabs[this.activeTabIndex]) {
        this.tabs[this.activeTabIndex].url = e.url;
      }
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
      if (urlBarInput) {
        urlBarInput.value = e.url;
      }
      // Update current tab URL
      if (this.tabs[this.activeTabIndex]) {
        this.tabs[this.activeTabIndex].url = e.url;
      }
    });
  }

  setupHeaderVisibility() {
    const header = document.querySelector('.app-header');
    const contentArea = document.querySelector('.content-area');
    const urlBarInput = document.querySelector('.url-bar__input');
    const sidebar = document.querySelector('.sidebar');
    const webview = document.getElementById('browser-webview');

    if (!header || !contentArea) return;

    // Start with header hidden by default
    header.classList.remove('is-visible');
    sidebar?.classList.remove('is-visible');

    // Simple state tracking
    let isHeaderVisible = false;
    let isSidebarVisible = false;
    let isRightSidebarVisible = false;
    let isUrlBarFocused = false;
    let isMouseInHeader = false;
    let isMouseInSidebar = false;
    let isMouseInRightSidebar = false;
    let hideTimer = null;
    
    // Make state accessible to menu button
    this.isHeaderVisible = () => isHeaderVisible;
    this.isSidebarVisible = () => isSidebarVisible;
    this.isRightSidebarVisible = () => isRightSidebarVisible;
    this.setHeaderVisible = (visible) => { isHeaderVisible = visible; };
    this.setSidebarVisible = (visible) => { isSidebarVisible = visible; };
    this.setRightSidebarVisible = (visible) => { isRightSidebarVisible = visible; };
    const HIDE_DELAY = 750; // Soft delay before hiding bars
    // Function to show both header and sidebar
    const showBoth = () => {
      if (!isHeaderVisible) {
        header.classList.add('is-visible');
        isHeaderVisible = true;
      }
      if (!isSidebarVisible) {
        sidebar?.classList.add('is-visible');
        isSidebarVisible = true;
      }
      // Clear any existing hide timer
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      // Update webview position if active
      if (this.hasActiveWebview) {
        this.updateWebviewPosition();
      }
    };

    // Function to show right sidebar
    const showRightSidebar = () => {
      const rightSidebar = document.querySelector('.right-sidebar');
      if (!isRightSidebarVisible && rightSidebar) {
        rightSidebar.classList.add('is-visible');
        isRightSidebarVisible = true;
      }
      // Clear any existing hide timer
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      // Update webview position if active
      if (this.hasActiveWebview) {
        this.updateWebviewPosition();
      }
    };

    // Function to hide both header and sidebar
    const hideBoth = () => {
      if (isHeaderVisible && !isUrlBarFocused && !isMouseInHeader && !isMouseInSidebar) {
        header.classList.remove('is-visible');
        isHeaderVisible = false;
      }
      if (isSidebarVisible && !isMouseInSidebar && !isMouseInHeader) {
        sidebar?.classList.remove('is-visible');
        isSidebarVisible = false;
      }
      // Update webview position if active
      if (this.hasActiveWebview) {
        this.updateWebviewPosition();
      }
    };

    // Function to hide right sidebar
    const hideRightSidebar = () => {
      const rightSidebar = document.querySelector('.right-sidebar');
      if (isRightSidebarVisible && !isMouseInRightSidebar && rightSidebar) {
        rightSidebar.classList.remove('is-visible');
        isRightSidebarVisible = false;
      }
      // Update webview position if active
      if (this.hasActiveWebview) {
        this.updateWebviewPosition();
      }
    };

    // Function to hide header (only if not focused or hovering)
    const hideHeader = () => {
      if (isHeaderVisible && !isUrlBarFocused && !isMouseInHeader && !isMouseInSidebar) {
        header.classList.remove('is-visible');
        isHeaderVisible = false;
      }
    };

    // Function to start hide timer
    const startHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(hideBoth, HIDE_DELAY);
    };

    // Show header when mouse is near the top edge
    document.addEventListener('mousemove', (e) => {
      const distanceFromTop = e.clientY;
      const shouldShowHeader = distanceFromTop <= 5;
      
      if (shouldShowHeader && !isHeaderVisible) {
        showBoth();
      } else if (!shouldShowHeader && isHeaderVisible && !isMouseInHeader && !isUrlBarFocused) {
        startHideTimer();
      }
    });

    // Keep header visible when URL bar is focused
    urlBarInput?.addEventListener('focus', () => {
      isUrlBarFocused = true;
      showBoth();
    });

    urlBarInput?.addEventListener('blur', () => {
      isUrlBarFocused = false;
      if (!isMouseInHeader) {
        startHideTimer();
      }
    });

    // Keep header visible when hovering over it
    header.addEventListener('mouseenter', () => {
      isMouseInHeader = true;
      showBoth();
    });

    header.addEventListener('mouseleave', () => {
      isMouseInHeader = false;
      if (!isUrlBarFocused) {
        startHideTimer();
      }
    });

    // Sidebar visibility (linked with header)
    document.addEventListener('mousemove', (e) => {
      const distanceFromLeft = e.clientX;
      const distanceFromRight = window.innerWidth - e.clientX;
      const distanceFromTop = e.clientY;
      const shouldShowSidebar = distanceFromLeft <= 5;
      
      // Dynamic right sidebar trigger zone: 5px when closed, 200px when open
      const rightSidebarTriggerZone = isRightSidebarVisible ? 200 : 5;
      const shouldShowRightSidebar = distanceFromRight <= rightSidebarTriggerZone;
      
      const shouldShowHeader = distanceFromTop <= 5;
      const shouldKeepSidebarVisible = isSidebarVisible && distanceFromLeft <= 200; // Full sidebar width
      
      // Show both header and sidebar when near top-left corner
      if ((shouldShowHeader || shouldShowSidebar) && (!isHeaderVisible || !isSidebarVisible)) {
        showBoth();
      } else if (!shouldShowHeader && !shouldShowSidebar && !isMouseInHeader && !isMouseInSidebar && !isUrlBarFocused) {
        // Hide both when mouse is away from both areas
        startHideTimer();
      }

      // Show right sidebar when near right edge
      if (shouldShowRightSidebar && !isRightSidebarVisible) {
        showRightSidebar();
      } else if (!shouldShowRightSidebar && isRightSidebarVisible && !isMouseInRightSidebar) {
        hideRightSidebar();
      }
    });

    // Keep sidebar visible when hovering over it
    sidebar?.addEventListener('mouseenter', () => {
      isMouseInSidebar = true;
      showBoth();
    });

    sidebar?.addEventListener('mouseleave', () => {
      isMouseInSidebar = false;
      // Sidebar will be hidden by the mousemove event if mouse is not near left edge
    });

    // Keep right sidebar visible when hovering over it
    const rightSidebar = document.querySelector('.right-sidebar');
    rightSidebar?.addEventListener('mouseenter', () => {
      isMouseInRightSidebar = true;
      showRightSidebar();
    });

    rightSidebar?.addEventListener('mouseleave', () => {
      isMouseInRightSidebar = false;
      // Right sidebar will be hidden by the mousemove event if mouse is not near right edge
    });

    // Keyboard shortcut to close right sidebar (Escape key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isRightSidebarVisible) {
        hideRightSidebar();
      }
    });

    // Setup right sidebar URL input handling
    this.setupRightSidebarInput();
  }

  setupRightSidebarInput() {
    const urlInput = document.querySelector('.right-sidebar__url-input');
    const autocomplete = document.querySelector('.right-sidebar__autocomplete');
    if (!urlInput || !autocomplete) return;

    const searchEngines = [
      { name: 'google', description: 'Google Search', icon: '🔍' },
      { name: 'bing', description: 'Bing Search', icon: '🔎' },
      { name: 'youtube', description: 'YouTube Search', icon: '📺' },
      { name: 'github', description: 'GitHub Search', icon: '🐙' },
      { name: 'stackoverflow', description: 'Stack Overflow Search', icon: '💻' },
      { name: 'reddit', description: 'Reddit Search', icon: '🤖' },
      { name: 'wikipedia', description: 'Wikipedia Search', icon: '📚' },
      { name: 'arxiv', description: 'arXiv Papers', icon: '📄' },
      { name: 'twitter', description: 'Twitter Search', icon: '🐦' },
      { name: 'linkedin', description: 'LinkedIn Search', icon: '💼' },
      { name: 'amazon', description: 'Amazon Search', icon: '📦' },
      { name: 'ebay', description: 'eBay Search', icon: '🛒' },
      { name: 'spotify', description: 'Spotify Search', icon: '🎵' },
      { name: 'netflix', description: 'Netflix Search', icon: '🎬' },
      { name: 'medium', description: 'Medium Search', icon: '📝' },
      { name: 'quora', description: 'Quora Search', icon: '❓' },
      { name: 'discord', description: 'Discord Search', icon: '💬' },
      { name: 'slack', description: 'Slack Search', icon: '💬' },
      { name: 'notion', description: 'Notion Search', icon: '📋' },
      { name: 'figma', description: 'Figma Search', icon: '🎨' }
    ];

    let selectedIndex = -1;
    let filteredSuggestions = [];

    const showAutocomplete = (query) => {
      if (!query.startsWith('@')) {
        autocomplete.style.display = 'none';
        return;
      }

      const searchTerm = query.substring(1).toLowerCase();
      const suggestions = [];

      // Add command suggestions first
      const commands = [
        { name: 'duplicate', description: 'Duplicate a tab', icon: '📋' },
        { name: 'close', description: 'Close current tab', icon: '❌' },
        { name: 'closeall', description: 'Close all tabs in task', icon: '🗑️' },
        { name: 'newtask', description: 'Create new task', icon: '➕' },
        { name: 'closetask', description: 'Close current task', icon: '📁' }
      ];

      const matchingCommands = commands.filter(cmd => 
        cmd.name.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm)
      );

      matchingCommands.forEach(cmd => {
        suggestions.push({
          type: 'command',
          name: cmd.name,
          description: cmd.description,
          icon: cmd.icon
        });
      });

      // Add search engines
      const matchingEngines = searchEngines.filter(engine => 
        engine.name.toLowerCase().includes(searchTerm) ||
        engine.description.toLowerCase().includes(searchTerm)
      );
      
      matchingEngines.forEach(engine => {
        suggestions.push({
          type: 'engine',
          name: engine.name,
          description: engine.description,
          icon: engine.icon
        });
      });

      // Add tab duplication if it starts with @duplicate
      if (searchTerm.startsWith('duplicate')) {
        const activeTask = this.tasks[this.activeTaskIndex];
        if (activeTask && activeTask.tabs.length > 0) {
          const duplicateQuery = searchTerm.substring(9).trim().toLowerCase();
          activeTask.tabs.forEach(tab => {
            if (tab.title.toLowerCase().includes(duplicateQuery) || 
                tab.url.toLowerCase().includes(duplicateQuery)) {
              suggestions.push({
                type: 'duplicate',
                name: tab.title,
                description: 'Duplicate this tab',
                icon: '📋',
                tab: tab
              });
            }
          });
        }
      }

      if (suggestions.length === 0) {
        autocomplete.style.display = 'none';
        return;
      }

      filteredSuggestions = suggestions;
      autocomplete.innerHTML = '';
      
            suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'right-sidebar__autocomplete-item';
        
        if (suggestion.type === 'command') {
          item.innerHTML = `
            <div class="right-sidebar__autocomplete-icon">${suggestion.icon}</div>
            <div class="right-sidebar__autocomplete-content">
              <div class="right-sidebar__autocomplete-engine">@${suggestion.name}</div>
              <div class="right-sidebar__autocomplete-description">${suggestion.description}</div>
            </div>
          `;
          
          item.addEventListener('click', () => {
            const currentValue = urlInput.value;
            const beforeAt = currentValue.substring(0, currentValue.indexOf('@'));
            urlInput.value = beforeAt + `@${suggestion.name} `;
            autocomplete.style.display = 'none';
            urlInput.focus();
          });
        } else if (suggestion.type === 'engine') {
          item.innerHTML = `
            <div class="right-sidebar__autocomplete-icon">${suggestion.icon}</div>
            <div class="right-sidebar__autocomplete-content">
              <div class="right-sidebar__autocomplete-engine">@${suggestion.name}</div>
              <div class="right-sidebar__autocomplete-description">${suggestion.description}</div>
            </div>
          `;
          
          item.addEventListener('click', () => {
            const currentValue = urlInput.value;
            const beforeAt = currentValue.substring(0, currentValue.indexOf('@'));
            urlInput.value = beforeAt + `@${suggestion.name} `;
            autocomplete.style.display = 'none';
            urlInput.focus();
          });
        } else if (suggestion.type === 'duplicate') {
          item.innerHTML = `
            <div class="right-sidebar__autocomplete-icon">${suggestion.icon}</div>
            <div class="right-sidebar__autocomplete-content">
              <div class="right-sidebar__autocomplete-engine">@duplicate</div>
              <div class="right-sidebar__autocomplete-description">${suggestion.name}</div>
            </div>
          `;
          
          item.addEventListener('click', () => {
            // Fill in the command and execute it
            urlInput.value = `@duplicate ${suggestion.name}`;
            this.processUrlInput(urlInput.value);
            urlInput.value = '';
            autocomplete.style.display = 'none';
            urlInput.focus();
          });
        }

        autocomplete.appendChild(item);
      });

      autocomplete.style.display = 'block';
      selectedIndex = -1;
    };

    const hideAutocomplete = () => {
      autocomplete.style.display = 'none';
      selectedIndex = -1;
    };

    const selectAutocompleteItem = (direction) => {
      if (filteredSuggestions.length === 0) return;

      const items = autocomplete.querySelectorAll('.right-sidebar__autocomplete-item');
      
      if (selectedIndex >= 0) {
        items[selectedIndex].classList.remove('is-selected');
      }

      if (direction === 'up') {
        selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
      } else {
        selectedIndex = selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1;
      }

      items[selectedIndex].classList.add('is-selected');
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    };

    urlInput.addEventListener('input', (e) => {
      showAutocomplete(e.target.value);
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // If autocomplete is visible and an item is selected, use that
        if (autocomplete.style.display === 'block' && selectedIndex >= 0 && filteredSuggestions.length > 0) {
          const selectedSuggestion = filteredSuggestions[selectedIndex];
          
          if (selectedSuggestion.type === 'engine') {
            // Fill in the search engine
            const currentValue = urlInput.value;
            const beforeAt = currentValue.substring(0, currentValue.indexOf('@'));
            urlInput.value = beforeAt + `@${selectedSuggestion.name} `;
            autocomplete.style.display = 'none';
            urlInput.focus();
          } else if (selectedSuggestion.type === 'duplicate') {
            // Fill in and execute the duplicate command
            urlInput.value = `@duplicate ${selectedSuggestion.name}`;
            this.processUrlInput(urlInput.value);
            urlInput.value = '';
            autocomplete.style.display = 'none';
            urlInput.focus();
          }
        } else {
          // Process the current input normally
          const input = e.target.value.trim();
          
          if (!input) return;
          
          // Clear the input and hide autocomplete
          e.target.value = '';
          hideAutocomplete();
          
          // Process the input
          this.processUrlInput(input);
        }
      } else if (e.key === 'Escape') {
        hideAutocomplete();
        e.target.blur();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectAutocompleteItem('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectAutocompleteItem('up');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion();
      }
    });

    const handleTabCompletion = () => {
      const currentValue = urlInput.value;
      
      if (!currentValue.startsWith('@')) {
        return;
      }

      const searchTerm = currentValue.substring(1).toLowerCase();
      
      // Find matching search engines
      const matchingEngines = searchEngines.filter(engine => 
        engine.name.toLowerCase().startsWith(searchTerm)
      );

      // Find matching duplicate commands
      let matchingDuplicates = [];
      if (searchTerm.startsWith('duplicate')) {
        const activeTask = this.tasks[this.activeTaskIndex];
        if (activeTask && activeTask.tabs.length > 0) {
          const duplicateQuery = searchTerm.substring(9).trim().toLowerCase();
          activeTask.tabs.forEach(tab => {
            if (tab.title.toLowerCase().startsWith(duplicateQuery) || 
                tab.url.toLowerCase().includes(duplicateQuery)) {
              matchingDuplicates.push({
                type: 'duplicate',
                name: tab.title,
                tab: tab
              });
            }
          });
        }
      }

      // If there's exactly one match, complete it
      if (matchingEngines.length === 1) {
        const engine = matchingEngines[0];
        const beforeAt = currentValue.substring(0, currentValue.indexOf('@'));
        urlInput.value = beforeAt + `@${engine.name} `;
        return;
      }

      if (matchingDuplicates.length === 1) {
        const duplicate = matchingDuplicates[0];
        const beforeAt = currentValue.substring(0, currentValue.indexOf('@'));
        urlInput.value = beforeAt + `@duplicate ${duplicate.name}`;
        // Execute the duplicate command immediately
        this.processUrlInput(urlInput.value);
        urlInput.value = '';
        return;
      }

      // If multiple matches, show autocomplete
      if (matchingEngines.length > 1 || matchingDuplicates.length > 1) {
        showAutocomplete(currentValue);
      }
    };

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.right-sidebar__new-tab-input')) {
        hideAutocomplete();
      }
    });

    // Hide autocomplete when input loses focus
    urlInput.addEventListener('blur', () => {
      setTimeout(() => {
        hideAutocomplete();
      }, 150);
    });
  }

  processUrlInput(input) {
    // Check if input contains delimiters for multiple tabs
    const delimiters = ['|', ';', ','];
    let hasDelimiter = false;
    let delimiter = null;
    
    for (const delim of delimiters) {
      if (input.includes(delim)) {
        hasDelimiter = true;
        delimiter = delim;
        break;
      }
    }
    
    if (hasDelimiter) {
      // Split by delimiter and process each part
      const parts = input.split(delimiter).map(part => part.trim()).filter(part => part.length > 0);
      parts.forEach(part => {
        this.processUrlInput(part);
      });
      return;
    }

    // Check if it's a command
    const commandMatch = input.match(/^@(\w+)(?:\s+(.+))?$/);
    if (commandMatch) {
      const command = commandMatch[1].toLowerCase();
      const argument = commandMatch[2] || '';

      switch (command) {
        case 'duplicate':
          if (argument) {
            const activeTask = this.tasks[this.activeTaskIndex];
            if (activeTask) {
              const matchingTab = activeTask.tabs.find(tab => 
                tab.title.toLowerCase().includes(argument.toLowerCase()) ||
                tab.url.toLowerCase().includes(argument.toLowerCase())
              );
              if (matchingTab) {
                this.duplicateTab(matchingTab);
                return;
              }
            }
            console.error('No matching tab found for duplication:', argument);
            return;
          }
          break;

        case 'close':
          if (this.tasks[this.activeTaskIndex] && this.tasks[this.activeTaskIndex].tabs.length > 1) {
            this.closeTab(this.activeTabIndex);
            return;
          }
          break;

        case 'closeall':
          const activeTask = this.tasks[this.activeTaskIndex];
          if (activeTask) {
            activeTask.tabs = [];
            this.activeTabIndex = 0;
            this.renderTabs();
            return;
          }
          break;

        case 'newtask':
          this.createTask('New Task');
          return;

        case 'closetask':
          if (this.tasks.length > 0) {
            this.closeTask(this.activeTaskIndex);
          }
          return;
      }
    }

    // Check if it's a search engine command (@engine or @engine query)
    const searchMatch = input.match(/^@(\w+)(?:\s+(.+))?$/);
    if (searchMatch) {
      const engine = searchMatch[1].toLowerCase();
      const query = searchMatch[2] || '';
      
      let searchUrl = '';
      let tabTitle = '';
      
      if (query) {
        // Has query - do search
        switch (engine) {
          case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
          case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            break;

          case 'youtube':
            searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            break;
          case 'github':
            searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
            break;
          case 'stackoverflow':
            searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
            break;
          case 'reddit':
            searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
            break;
          case 'wikipedia':
            searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
            break;
                  case 'arxiv':
          searchUrl = `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all&source=header`;
          break;
        case 'twitter':
          searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'linkedin':
          searchUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`;
          break;
        case 'amazon':
          searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
          break;
        case 'ebay':
          searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
          break;
        case 'spotify':
          searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
          break;
        case 'netflix':
          searchUrl = `https://www.netflix.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'medium':
          searchUrl = `https://medium.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'quora':
          searchUrl = `https://www.quora.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'discord':
          searchUrl = `https://discord.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'slack':
          searchUrl = `https://slack.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'notion':
          searchUrl = `https://www.notion.so/search?q=${encodeURIComponent(query)}`;
          break;
        case 'figma':
          searchUrl = `https://www.figma.com/search?model_type=files&q=${encodeURIComponent(query)}`;
          break;
        default:
          // Default to Google for unknown engines
          searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
      tabTitle = `${engine} search: ${query}`;
    } else {
      // No query - open homepage
      switch (engine) {
        case 'google':
          searchUrl = `https://www.google.com`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com`;
          break;

        case 'youtube':
          searchUrl = `https://www.youtube.com`;
          break;
        case 'github':
          searchUrl = `https://github.com`;
          break;
        case 'stackoverflow':
          searchUrl = `https://stackoverflow.com`;
          break;
        case 'reddit':
          searchUrl = `https://www.reddit.com`;
          break;
        case 'wikipedia':
          searchUrl = `https://en.wikipedia.org`;
          break;
        case 'arxiv':
          searchUrl = `https://arxiv.org`;
          break;
        case 'twitter':
          searchUrl = `https://twitter.com`;
          break;
        case 'linkedin':
          searchUrl = `https://www.linkedin.com`;
          break;
        case 'amazon':
          searchUrl = `https://www.amazon.com`;
          break;
        case 'ebay':
          searchUrl = `https://www.ebay.com`;
          break;
        case 'spotify':
          searchUrl = `https://open.spotify.com`;
          break;
        case 'netflix':
          searchUrl = `https://www.netflix.com`;
          break;
        case 'medium':
          searchUrl = `https://medium.com`;
          break;
        case 'quora':
          searchUrl = `https://www.quora.com`;
          break;
        case 'discord':
          searchUrl = `https://discord.com`;
          break;
        case 'slack':
          searchUrl = `https://slack.com`;
          break;
        case 'notion':
          searchUrl = `https://www.notion.so`;
          break;
        case 'figma':
          searchUrl = `https://www.figma.com`;
          break;
        default:
          // Default to Google for unknown engines
          searchUrl = `https://www.google.com`;
      }
      tabTitle = `${engine} homepage`;
    }
      
      this.createTab(searchUrl, tabTitle, '');
      return;
    }
    
    // Check if it's a URL
    let url = input;
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      // Assume it's a domain and add https://
      url = `https://${input}`;
    }
    
    // Validate URL
    try {
      new URL(url);
      this.createTab(url, input);
    } catch (e) {
      console.error('Invalid URL:', input);
      // Could show an error message here
    }
  }

  preventZoomFunctionality() {
    // Only prevent zoom shortcuts, allow other keyboard commands
    document.addEventListener('keydown', (e) => {
      // Prevent Ctrl/Cmd + Plus (zoom in)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl/Cmd + Minus (zoom out)
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl/Cmd + 0 (reset zoom)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        return false;
      }
    });

    // Prevent pinch-to-zoom gestures on the browser UI
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    document.addEventListener('gesturechange', (e) => {
      e.preventDefault();
    });

    document.addEventListener('gestureend', (e) => {
      e.preventDefault();
    });

    // Prevent double-tap zoom on the browser UI
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  activateWebview() {
    this.hasActiveWebview = true;
    const contentArea = document.querySelector('.content-area');
    const queryInputContainer = document.querySelector('.query-input-container');
    const webviewContainer = document.getElementById('webview-container');
    const webviewComponent = webviewContainer?.querySelector('.webview-container');
    const focusOverlay = document.querySelector('.focus-overlay');
    
    if (contentArea) {
      contentArea.classList.add('has-active-webview');
    }
    
    if (queryInputContainer) {
      queryInputContainer.classList.add('is-collapsed');
      queryInputContainer.classList.remove('is-editor-mode'); // Clear editor mode
    }
    
    // Clear focus overlay when webview is activated
    if (focusOverlay) {
      focusOverlay.classList.remove('is-active');
    }
    
    if (webviewContainer) {
      webviewContainer.style.display = 'block';
    }
    
    // Set initial webview positioning
    this.updateWebviewPosition();
    
    console.log('Webview activated, query input collapsed');
  }

  updateWebviewPosition() {
    const webviewComponent = document.querySelector('#webview-container .webview-container');
    const header = document.querySelector('.app-header');
    const sidebar = document.querySelector('.sidebar');
    const rightSidebar = document.querySelector('.right-sidebar');
    
    if (!webviewComponent) return;
    
    // Check if header and sidebars are visible
    const isHeaderVisible = header?.classList.contains('is-visible');
    const isSidebarVisible = sidebar?.classList.contains('is-visible');
    const isRightSidebarVisible = rightSidebar?.classList.contains('is-visible');
    
    // Calculate position and size
    const top = isHeaderVisible ? '48px' : '0px';
    const left = isSidebarVisible ? '200px' : '0px';
    const right = isRightSidebarVisible ? '200px' : '0px';
    const width = isSidebarVisible || isRightSidebarVisible ? 
      `calc(100vw - ${isSidebarVisible ? '200px' : '0px'} - ${isRightSidebarVisible ? '200px' : '0px'})` : 
      '100vw';
    const height = isHeaderVisible ? 'calc(100vh - 48px)' : '100vh';
    
    // Apply styles
    webviewComponent.style.position = 'fixed';
    webviewComponent.style.top = top;
    webviewComponent.style.left = left;
    webviewComponent.style.right = right;
    webviewComponent.style.bottom = '0';
    webviewComponent.style.width = width;
    webviewComponent.style.height = height;
    webviewComponent.style.zIndex = '1'; // Lower z-index so hover zones can detect mouse
    
    // Also set styles on the webview element itself
    const webviewElement = webviewComponent.querySelector('.browser-webview');
    if (webviewElement) {
      webviewElement.style.position = 'absolute';
      webviewElement.style.top = '0';
      webviewElement.style.left = '0';
      webviewElement.style.right = '0';
      webviewElement.style.bottom = '0';
      webviewElement.style.width = '100%';
      webviewElement.style.height = '100%';
      webviewElement.style.zIndex = '1';
    }
  }

  deactivateWebview() {
    this.hasActiveWebview = false;
    const contentArea = document.querySelector('.content-area');
    const queryInputContainer = document.querySelector('.query-input-container');
    const webviewContainer = document.getElementById('webview-container');
    const webviewComponent = webviewContainer?.querySelector('.webview-container');
    
    if (contentArea) {
      contentArea.classList.remove('has-active-webview');
    }
    
    if (queryInputContainer) {
      queryInputContainer.classList.remove('is-collapsed');
    }
    
    if (webviewContainer) {
      webviewContainer.style.display = 'none';
    }
    
    // Reset the webview component styles
    if (webviewComponent) {
      webviewComponent.style.position = '';
      webviewComponent.style.top = '';
      webviewComponent.style.left = '';
      webviewComponent.style.right = '';
      webviewComponent.style.bottom = '';
      webviewComponent.style.width = '';
      webviewComponent.style.height = '';
      webviewComponent.style.zIndex = '';
      webviewComponent.style.backgroundColor = '';
    }
    
    // Reset the webview element styles
    const webviewElement = webviewComponent?.querySelector('.browser-webview');
    if (webviewElement) {
      webviewElement.style.position = '';
      webviewElement.style.top = '';
      webviewElement.style.left = '';
      webviewElement.style.right = '';
      webviewElement.style.bottom = '';
      webviewElement.style.width = '';
      webviewElement.style.height = '';
      webviewElement.style.zIndex = '';
    }
    
    console.log('Webview deactivated, query input expanded');
  }

  setupCollapsedQueryInput() {
    const queryInputContainer = document.querySelector('.query-input-container');
    
    if (queryInputContainer) {
      // Handle click on collapsed query input to expand it
      queryInputContainer.addEventListener('click', (e) => {
        if (queryInputContainer.classList.contains('is-collapsed')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Deactivate webview and expand query input
          this.deactivateWebview();
          
          // Focus the text area
          const textArea = queryInputContainer.querySelector('.query-input__text-area');
          if (textArea) {
            setTimeout(() => {
              textArea.focus();
            }, 100);
          }
        }
      });
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  // Initialize component manager first
  componentManager.initialize().then(() => {
    console.log('Component manager initialized, creating App');
    // Then initialize the app
    new App();
  });
}); 