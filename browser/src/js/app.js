// Main application logic
class App {
  constructor() {
    console.log('App constructor called');
    this.tabs = [];
    this.activeTabIndex = 0;
    this.initializeEventListeners();
    // Initialize tabs after components are loaded
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
        console.log('Components found, initializing tabs and tab management');
        this.initializeTabs();
        this.setupTabManagement();
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.error('Failed to load components after 5 seconds');
    this.createFallbackTabButton();
  }

  createFallbackTabButton() {
    const sidebarContainer = document.querySelector('#sidebar-container');
    if (sidebarContainer) {
      console.log('Creating fallback sidebar structure...');
      sidebarContainer.innerHTML = `
        <div class="sidebar">
          <div class="sidebar-background"></div>
          <div class="sidebar__content">
            <div class="sidebar__header">
              <h3 class="sidebar__title">Tabs</h3>
              <button class="sidebar__add-tab" type="button" title="New Tab">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1v6H2v2h6v6h2V9h6V7H10V1H8z"/>
                </svg>
              </button>
            </div>
            <div class="sidebar__tab-list">
              <!-- Tabs will be dynamically added here -->
            </div>
          </div>
        </div>
      `;
      
      // Now try to set up tab management again
      setTimeout(() => {
        this.initializeTabs();
        this.setupTabManagement();
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
  }

  initializeTabs() {
    // Create initial tab
    this.createTab('https://www.google.com', 'Google');
  }

  setupTabManagement() {
    // Use event delegation to handle the add tab button
    document.addEventListener('click', (e) => {
      console.log('Click detected on:', e.target);
      console.log('Closest sidebar__add-tab:', e.target.closest('.sidebar__add-tab'));
      
      if (e.target.closest('.sidebar__add-tab')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Add tab button clicked via event delegation!');
        
        // Add visual feedback
        const button = e.target.closest('.sidebar__add-tab');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
        
        this.createTab('https://www.google.com', 'New Tab');
      }
    });
    
    // Also add a global keyboard shortcut for new tabs
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        this.createTab('https://www.google.com', 'New Tab');
      }
    });
    
    console.log('Tab management setup complete with event delegation');
    
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

  createTab(url, title = 'New Tab') {
    console.log('Creating new tab:', title);
    const tab = {
      id: Date.now() + Math.random(),
      url: url,
      title: title,
      webview: null
    };

    this.tabs.push(tab);
    console.log('Total tabs now:', this.tabs.length);
    this.renderTabs();
    this.switchToTab(this.tabs.length - 1);
  }

  switchToTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    // Update active tab
    this.activeTabIndex = index;
    const activeTab = this.tabs[index];

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

  closeTab(index) {
    if (this.tabs.length <= 1) return; // Keep at least one tab

    this.tabs.splice(index, 1);

    // Adjust active tab index
    if (this.activeTabIndex >= index) {
      this.activeTabIndex = Math.max(0, this.activeTabIndex - 1);
    }

    // Switch to the new active tab
    this.switchToTab(this.activeTabIndex);
  }

  renderTabs() {
    const tabList = document.querySelector('.sidebar__tab-list');
    if (!tabList) return;

    tabList.innerHTML = '';

    this.tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = `sidebar__tab ${index === this.activeTabIndex ? 'is-active' : ''}`;
      tabElement.innerHTML = `
        <div class="sidebar__tab-icon">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13A6 6 0 108 2a6 6 0 000 12z"/>
          </svg>
        </div>
        <h4 class="sidebar__tab-title">${tab.title}</h4>
        <button class="sidebar__tab-close" type="button" title="Close Tab">
        </button>
      `;

      // Add click handlers
      tabElement.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar__tab-close')) {
          this.switchToTab(index);
        }
      });

      const closeButton = tabElement.querySelector('.sidebar__tab-close');
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(index);
      });

      tabList.appendChild(tabElement);
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


    const switchToEditorMode = () => {
      if (!queryInput_container.classList.contains('is-editor-mode')) {
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

    const submitQuery = () => {
      // Simulate click on the container
      queryInput_container.classList.add('is-active');
      setTimeout(() => {
        queryInput_container.classList.remove('is-active');
      }, 150);
      console.log('Query submitted:', queryInput_textArea.innerText);
      // Here you would clear the input, etc.
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
    const urlBarInput = document.querySelector('.url-bar__input');
    const loadingIndicator = document.querySelector('.webview-loading');

    if (!webview) return;

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
      const homeUrl = 'https://www.google.com';
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
    let isUrlBarFocused = false;
    let isMouseInHeader = false;
    let isMouseInSidebar = false;
    let hideTimer = null;
    
    // Make state accessible to menu button
    this.isHeaderVisible = () => isHeaderVisible;
    this.isSidebarVisible = () => isSidebarVisible;
    this.setHeaderVisible = (visible) => { isHeaderVisible = visible; };
    this.setSidebarVisible = (visible) => { isSidebarVisible = visible; };
    const HIDE_DELAY = 250; // Small delay to prevent flickering
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
      const shouldShowHeader = distanceFromTop <= 40;
      
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
      const distanceFromTop = e.clientY;
      const shouldShowSidebar = distanceFromLeft <= 20;
      const shouldShowHeader = distanceFromTop <= 40;
      const shouldKeepSidebarVisible = isSidebarVisible && distanceFromLeft <= 200; // Full sidebar width
      
      // Show both header and sidebar when near top-left corner
      if ((shouldShowHeader || shouldShowSidebar) && (!isHeaderVisible || !isSidebarVisible)) {
        showBoth();
      } else if (!shouldShowHeader && !shouldShowSidebar && !isMouseInHeader && !isMouseInSidebar && !isUrlBarFocused) {
        // Hide both when mouse is away from both areas
        startHideTimer();
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