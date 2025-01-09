// Test dynamic updates
async function setupDynamicTest() {
    // Add a test route
    window.router.addRoute('/test-dynamic', async () => {
        const timestamp = new Date().toLocaleTimeString();
        return `
            <div id="dynamic-test">
                <h2>Dynamic Content Test</h2>
                <p>This content was dynamically loaded at: ${timestamp}</p>
                <button onclick="window.testDynamicUpdate()">Update Content</button>
            </div>
        `;
    });

    // Add a test update function
    window.testDynamicUpdate = async () => {
        const { data, error } = await window.supabaseClient
            .from('teams')
            .select('*')
            .limit(1);
        
        const testDiv = document.getElementById('dynamic-test');
        if (testDiv) {
            testDiv.innerHTML += `
                <p>Data from Supabase: ${JSON.stringify(data)}</p>
                <p>Updated at: ${new Date().toLocaleTimeString()}</p>
            `;
        }
    };
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', setupDynamicTest); 