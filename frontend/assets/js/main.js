/* ========================================
   Agesis AI - Main Application Entry
   ======================================== */

const AgesisApp = {
    init() {
        this.bindGlobalEvents();
        this.initMobileSidebar();
        this.initScrollAnimations();
        this.initPageScripts();
        console.log(`[Agesis AI] Application initialized in ${AgesisConfig.env} mode.`);
    },

    bindGlobalEvents() {
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("modal-backdrop") && e.target.classList.contains("active")) {
                e.target.classList.remove("active");
            }
        });

        const landingNav = document.querySelector(".landing-navbar");
        if (landingNav) {
            window.addEventListener(
                "scroll",
                AgesisUtils.throttle(() => {
                    landingNav.classList.toggle("scrolled", window.scrollY > 50);
                }, 100),
            );
        }
    },

    initMobileSidebar() {
        const menuBtn = document.querySelector(".mobile-menu-btn");
        const sidebar = document.querySelector(".sidebar");
        const backdrop = document.querySelector(".sidebar-backdrop");

        if (menuBtn && sidebar) {
            // Create backdrop element dynamically
            const backdropEl = document.createElement("div");
            backdropEl.className = "sidebar-backdrop";
            document.body.appendChild(backdropEl);

            menuBtn.addEventListener("click", () => {
                sidebar.classList.toggle("open");
                backdropEl.classList.toggle("active");
            });

            backdropEl.addEventListener("click", () => {
                sidebar.classList.remove("open");
                backdropEl.classList.remove("active");
            });
        }
    },

    initScrollAnimations() {
        const animatedElements = document.querySelectorAll(".animate-in");
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.visibility = "visible";
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 },
        );

        animatedElements.forEach((el) => {
            el.style.visibility = "hidden";
            observer.observe(el);
        });
    },

    initPageScripts() {
        const page = document.body.getAttribute("data-page");
        if (!page) return;

        switch (page) {
            case "login":
                if (typeof AgesisAuth !== "undefined") AgesisAuth.init();
                break;
            case "dashboard":
                if (typeof AgesisDashboard !== "undefined") AgesisDashboard.init();
                break;
            case "profile":
                // Future: AgesisProfile.init();
                break;
        }
    },
};

document.addEventListener("DOMContentLoaded", () => {
    AgesisApp.init();
});
