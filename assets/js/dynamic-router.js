class DynamicRouter {
    constructor() {
        this.routes = new Map();
        this.contentContainer = document.querySelector('main');
        window.addEventListener('popstate', this.handleRoute.bind(this));
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    async navigate(path, data = null) {
        const url = new URL(path, window.location.origin);
        history.pushState(data, '', url);
        await this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
        
        if (handler) {
            const content = await handler();
            if (content) {
                this.updateContent(content);
            }
        }
    }

    updateContent(content) {
        if (this.contentContainer) {
            this.contentContainer.innerHTML = content;
        }
    }
}

// Initialize router
window.router = new DynamicRouter();

// Example usage:
// window.router.addRoute('/path', async () => {
//     const data = await window.supabaseClient.from('table').select('*');
//     return generateHTML(data);
// }); 