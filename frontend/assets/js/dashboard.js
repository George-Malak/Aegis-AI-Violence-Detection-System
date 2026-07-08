/* ========================================
   Agesis AI - Dashboard Logic
   ======================================== */

const AgesisDashboard = {
    mockDetections: [
        // ... (Keep existing mock data)
        {
            time: "14:32:05",
            camera: "Lobby East",
            event: "Weapon Detection",
            confidence: 94,
            location: "Building A",
            status: "danger",
        },
        {
            time: "14:28:12",
            camera: "Parking North",
            event: "Suspicious Activity",
            confidence: 82,
            location: "Sector 4",
            status: "warning",
        },
        {
            time: "14:15:44",
            camera: "Warehouse 3",
            event: "Fire & Smoke",
            confidence: 98,
            location: "Perimeter",
            status: "danger",
        },
        {
            time: "13:58:20",
            camera: "Main Gate",
            event: "Crowd Violence",
            confidence: 75,
            location: "Gate 2",
            status: "warning",
        },
        {
            time: "13:45:00",
            camera: "Server Room",
            event: "Unauthorized Access",
            confidence: 88,
            location: "Building C",
            status: "danger",
        },
    ],

    init() {
        this.renderTable(this.mockDetections);
        this.setupSearch();
        this.startLiveFeed();
    },

    renderTable(data) {
        const tbody = document.getElementById("detection-tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--color-text-muted);">No matching events found</td></tr>`;
            return;
        }

        data.forEach((row) => {
            const statusMap = {
                danger: "badge-danger",
                warning: "badge-warning",
                success: "badge-success",
                neutral: "badge-neutral",
                info: "badge-info",
            };
            const statusText = row.status.charAt(0).toUpperCase() + row.status.slice(1);

            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td class="text-primary">${row.time}</td>
        <td class="text-primary">${row.camera}</td>
        <td>${row.event}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 4px; background: var(--color-border); border-radius: 2px; max-width: 60px;">
              <div style="width: ${row.confidence}%; height: 100%; background: ${row.confidence > 85 ? "var(--color-danger)" : "var(--color-warning)"}; border-radius: 2px;"></div>
            </div>
            <span style="font-size: 12px; font-weight: 500;">${row.confidence}%</span>
          </div>
        </td>
        <td>${row.location}</td>
        <td><span class="badge ${statusMap[row.status]}">${statusText}</span></td>
        <td>
          <button class="action-btn" aria-label="View event details">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    },

    setupSearch() {
        const searchInput = document.getElementById("detection-search");
        if (!searchInput) return;

        searchInput.addEventListener(
            "input",
            AgesisUtils.debounce((e) => {
                const term = e.target.value.toLowerCase();
                const filtered = this.mockDetections.filter(
                    (d) =>
                        d.camera.toLowerCase().includes(term) ||
                        d.event.toLowerCase().includes(term) ||
                        d.location.toLowerCase().includes(term),
                );
                this.renderTable(filtered);
            }, 300),
        ); // Applied debounce utility here!
    },

    startLiveFeed() {
        setInterval(() => {
            const events = ["Unauthorized Access", "Weapon Detected", "Perimeter Breach", "Fire Alert"];
            const cameras = ["Sector 7 Gate", "Rooftop B", "Server Room 2"];

            const newEvent = {
                time: new Date().toLocaleTimeString("en-US", { hour12: false }),
                camera: cameras[Math.floor(Math.random() * cameras.length)],
                event: events[Math.floor(Math.random() * events.length)],
                confidence: Math.floor(Math.random() * 20) + 80,
                location: "Zone C",
                status: "danger",
            };

            this.mockDetections.unshift(newEvent);
            this.renderTable(this.mockDetections);

            const feed = document.getElementById("notification-feed");
            if (feed) {
                const notifEl = document.createElement("div");
                notifEl.className = "notification-item unread animate-in";
                notifEl.innerHTML = `
          <div class="notification-icon danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="notification-content">
            <div class="notification-text"><b>${newEvent.event}</b> detected at ${newEvent.camera}</div>
            <div class="notification-time">Just now</div>
          </div>
        `;
                feed.insertBefore(notifEl, feed.firstChild);
                if (feed.children.length > 5) feed.removeChild(feed.lastChild);
            }
        }, 15000);
    },
};

// Initialization handled by main.js
