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
    
    // Menu Button Toggle
    this.setupMenuButton();
    
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