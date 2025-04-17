// --- Configuration ---
const ITEMS_PER_PAGE = 3; // Number of items to show per page for docs/blog

// --- State Variables ---
let currentDocsPage = 1;
let currentBlogPage = 1;

// --- DOM Elements ---
// Removed dark mode related elements

// --- Status Check Function ---
async function checkStatus(url, elementId) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;
    statusElement.innerHTML = '<span class="status-dot status-checking"></span>Checking...';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        statusElement.innerHTML = '<span class="status-dot status-online"></span>Online';
    } catch (error) {
        console.error(`Error checking ${url}:`, error.name === 'AbortError' ? 'Timeout' : error);
        statusElement.innerHTML = '<span class="status-dot status-offline"></span>Offline';
    }
}

// --- Blog Post Data ---
const blogPosts = [
     {
        title: "Welcome to the New SkyVPS360 Frontend!",
        date: "April 16, 2025",
        snippet: "We're excited to launch our new frontend, making it easier than ever to explore our VPS offerings and access documentation.",
        slug: "welcome-new-frontend",
        content: `<p>We are thrilled to announce the launch of the brand new SkyVPS360 frontend! This project aimed to create a cleaner, faster, and more user-friendly experience for browsing our services.</p><p class="mt-4">Built with modern web technologies like Tailwind CSS and vanilla JavaScript, this new interface should provide a smoother experience across all devices. We've focused on presenting our core StorageKVM plan clearly and making it easy to access documentation, blog updates, your client area, or register for new services.</p><p class="mt-4">Explore the different sections using the navigation bar above. We welcome any feedback you might have via our Discord server!</p>`
    },
    {
        title: "Understanding NAT IPv4 vs Dedicated IPv4",
        date: "April 10, 2025",
        snippet: "Learn the key differences between NAT IPv4, included with our plans, and traditional dedicated IPv4 addresses.",
        slug: "nat-vs-dedicated-ipv4",
        content: `<h3>NAT IPv4 Explained</h3><p>Network Address Translation (NAT) allows multiple devices on a private network to share a single public IP address. In our case, your VPS shares a public IPv4 address with other VPS instances on the same host node.</p><p class="mt-4"><strong>How it works:</strong> We provide you with 20 pre-allocated ports on the shared public IPv4. When external traffic tries to reach one of your allocated ports, the host node directs it to your VPS's private internal IP address. Outgoing traffic from your VPS appears to originate from the shared public IPv4.</p><h4>Pros:</h4><ul><li>Cost-effective: Significantly cheaper than dedicated IPs due to IPv4 scarcity.</li><li>Sufficient for many use cases: Hosting websites, game servers (if the game supports specific ports), VPNs, proxies, etc.</li></ul><h4>Cons:</h4><ul><li>Limited Ports: You can only host services on the allocated ports.</li><li>Not suitable for services requiring all ports (e.g., some email server configurations).</li><li>Shared reputation: The IP's reputation is shared among users.</li></ul><h3>Dedicated IPv4</h3><p>A dedicated IPv4 address is assigned exclusively to your VPS. All ports are available to you, and the IP's reputation is solely yours.</p><h4>Pros:</h4><ul><li>Full Port Access: Host any service on any port.</li><li>Exclusive IP Reputation.</li></ul><h4>Cons:</h4><ul><li>Higher Cost: Due to the global shortage and cost of IPv4 addresses.</li><li>Often unnecessary: Many applications work perfectly fine with NAT IPv4.</li></ul><p class="mt-4">Our storage plans utilize NAT IPv4 to keep costs low while providing excellent connectivity via the included ports and the dedicated IPv6 subnet.</p>`
    },//
     //{
     //   title: "Scheduled Maintenance Window",
     //   date: "March 28, 2025",
     //   snippet: "Announcing a scheduled maintenance window for network upgrades in our New Jersey data center.",
     //   slug: "maintenance-nj-mar2025",
     //   content: `<p>Please be advised that we have scheduled a maintenance window to perform network hardware upgrades in our New Jersey (TEB-2) data center.</p><p class="mt-4"><strong>Date:</strong> April 2, 2025<br><strong>Time:</strong> 01:00 AM - 04:00 AM EDT (GMT-4)</p><p class="mt-4"><strong>Impact:</strong> During this window, customers with services hosted in New Jersey may experience intermittent network connectivity loss, potentially lasting up to 30 minutes cumulatively. We will work to minimize downtime.</p><p class="mt-4">These upgrades are necessary to enhance network capacity and reliability. We apologize for any inconvenience this may cause.</p>`
    //},
     {
        title: "Introducing IPv6 Connectivity",
        date: "March 15, 2025",
        snippet: "All our VPS plans now come with a dedicated /80 IPv6 subnet, preparing your services for the future.",
        slug: "ipv6-launch",
        content: `<p>We're excited to announce that all SkyVPS360 KVM Storage plans now include a dedicated /80 IPv6 subnet at no additional cost!</p>
                  <p class="mt-4">While IPv4 remains dominant, the internet is transitioning to IPv6. Providing native IPv6 connectivity ensures your applications and services are future-proof and can reach the growing IPv6-only parts of the internet.</p>
                  <h3>What is an /80 Subnet?</h3>
                  <p>An /80 subnet provides your assigned network block with an enormous number of IPv6 addresses (2^(128-80) = 2^48, or over 281 trillion addresses). This large block size allows for flexible network configuration.</p>
                  <p class="mt-2">While the block itself is huge, the number of addresses you can actively configure or manage via the control panel (like VirtFusion) might be subject to practical limits (e.g., 50 or more, depending on the provider's setup). However, this still enables assigning unique IPv6 addresses to different services or containers running on your VPS if needed.</p>
                  <h3>Configuration</h3>
                  <p>Most modern Linux distributions will automatically configure an IPv6 address using SLAAC (Stateless Address Autoconfiguration) if the network environment provides router advertisements. You can typically verify your IPv6 address using <code>ip addr show</code> or <code>ifconfig</code>.</p>
                  <p class="mt-4">This addition complements the included NAT IPv4 access, offering a robust and versatile connectivity solution for your hosting needs.</p>`
    }
];

// --- Docs Article Data ---
const docsArticles = [
    {
        title: "Getting Started with Your VPS",
        slug: "getting-started",
        content: `
            <h3>Welcome to SkyVPS360!</h3>
            <p>This guide will help you get started with your new KVM VPS.</p>
            <ol class="list-decimal list-inside space-y-2 mt-4">
                <li><strong>Check Your Email:</strong> After ordering, you should receive an email with your VPS IP address (or NAT IP details), root password, and VirtFusion control panel login details. Note the specific NAT IP and allocated ports.</li>
                <li><strong>Log into VirtFusion:</strong> Access the VirtFusion panel using the link and credentials provided in your email. Here you can manage your VPS (boot, shutdown, reboot, reinstall OS, view console).</li>
                <li><strong>Connect via SSH:</strong> Use an SSH client (like PuTTY on Windows, or the built-in terminal on macOS/Linux) to connect to your server's IP address using the root username and password. See the "Connecting via SSH" doc for details.</li>
                <li><strong>Secure Your Server:</strong> It's crucial to secure your server immediately. This typically involves:
                    <ul class="list-disc list-inside ml-6 mt-1">
                        <li>Changing the root password (<code>passwd</code> command).</li>
                        <li>Creating a new non-root user with sudo privileges (<code>adduser newuser</code>, then <code>usermod -aG sudo newuser</code> on Debian/Ubuntu).</li>
                        <li>Setting up SSH key authentication and potentially disabling password authentication (Recommended!).</li>
                        <li>Configuring a basic firewall (like UFW - Uncomplicated Firewall).</li>
                    </ul>
                </li>
                <li><strong>Update Your System:</strong> Run your distribution's package manager update commands (e.g., <code>sudo apt update && sudo apt upgrade -y</code> for Debian/Ubuntu, or <code>sudo dnf update -y</code> for Fedora/CentOS).</li>
            </ol>
            <p class="mt-4">Explore other documentation articles for more specific tasks!</p>
        `
    },
    {
        title: "Connecting via SSH",
        slug: "ssh-connection",
        content: `
            <h3>Connecting to Your VPS using SSH</h3>
            <p>SSH (Secure Shell) is the standard way to securely connect to and manage your Linux VPS.</p>
            <h4>Using Terminal (Linux/macOS)</h4>
            <p>Open your terminal application. Since we use NAT IPv4, you'll typically connect to the host node's IP address using a specific port assigned to your VPS for SSH (usually port 22 internally, but mapped to a different external port).</p>
            <p>Check your welcome email for the exact SSH command, which might look like:</p>
            <pre><code>ssh root@host_node_ip -p your_ssh_port</code></pre>
            <p>Replace <code>host_node_ip</code> with the IP address provided and <code>your_ssh_port</code> with the specific port number assigned for SSH access to your VPS.</p>
            <p>You will be prompted for the root password provided in your welcome email. Enter it (typing may not be visible for security).</p>
            <h4>Using PuTTY (Windows)</h4>
            <ol class="list-decimal list-inside space-y-2 mt-4">
                <li>Download and install PuTTY from the official website.</li>
                <li>Open PuTTY.</li>
                <li>In the "Host Name (or IP address)" field, enter the <code>host_node_ip</code> provided.</li>
                <li>In the "Port" field, enter <code>your_ssh_port</code> provided.</li>
                <li>Ensure "Connection type" is SSH.</li>
                <li>Click "Open".</li>
                <li>If it's your first time connecting, you might see a security alert about the server's host key. Click "Yes" or "Accept".</li>
                <li>A terminal window will appear prompting for login. Enter <code>root</code>.</li>
                <li>Enter the root password when prompted.</li>
            </ol>
            <h4>SSH Keys (Highly Recommended)</h4>
            <p>Using SSH keys is far more secure than passwords. You generate a key pair (public and private) on your local computer. The public key is added to the <code>~/.ssh/authorized_keys</code> file on your server. Your SSH client then uses the private key to authenticate automatically and securely.</p>
            <p>Consult online guides for "generating SSH keys" for your operating system and "setting up SSH key authentication" on your Linux distribution.</p>
        `
    },
    {
        title: "Using VirtFusion Panel",
        slug: "virtfusion-panel",
        content: `
            <h3>Overview of the VirtFusion Control Panel</h3>
            <p>VirtFusion is the modern control panel you use to manage the core functions and status of your VPS instance.</p>
            <h4>Key Features:</h4>
            <ul class="list-disc list-inside space-y-2 mt-4">
                <li><strong>Power Controls:</strong> Boot, Shutdown (graceful), Reboot (graceful), Stop (force power off) your VPS.</li>
                <li><strong>Console Access:</strong> Access a web-based virtual console (like looking at a direct monitor/keyboard). Essential if SSH is misconfigured or inaccessible.</li>
                <li><strong>OS Reinstallation:</strong> Reinstall the operating system on your VPS using available templates. <strong>Warning:</strong> This action is destructive and will permanently erase all data on your VPS disk.</li>
                <li><strong>Usage Graphs:</strong> View historical graphs for CPU usage, memory usage, disk I/O operations, and network traffic. Useful for monitoring resource consumption.</li>
                <li><strong>Network Information:</strong> View your assigned NAT IPv4 details (shared IP and allocated ports) and your dedicated IPv6 subnet.</li>
                <li><strong>Settings:</strong> Manage settings like the boot order (e.g., boot from disk or CD-ROM), change the hostname visible in the panel, and potentially enable/disable features like TUN/TAP (if offered and needed for VPNs).</li>
                <li><strong>Backups (if applicable):</strong> If scheduled backups are included/enabled for your plan, you might manage restores from here (check plan details).</li>
                <li><strong>Activity Log:</strong> See a log of actions performed on your VPS via the control panel.</li>
            </ul>
            <p class="mt-4">Log in using the credentials provided in your welcome email. Familiarize yourself with the interface to effectively manage your server's state, especially the console for troubleshooting.</p>
        `
    },
    {
        title: "Understanding Network Storage (SATA)",
        slug: "network-storage-sata",
        content: `
            <h3>Network SATA Storage Explained</h3>
            <p>Our KVM Storage plans utilize network-attached storage (NAS) with SATA hard disk drives (HDDs). Here's what that means:</p>
            <ul class="list-disc list-inside space-y-2 mt-4">
                <li><strong>Network Attached:</strong> The storage disks are not directly inside the physical server (host node) running your VPS. Instead, they are located in a dedicated storage system connected via a high-speed network (often Ethernet or Infiniband). Your VPS accesses its disk over this internal network using protocols like iSCSI or NFS.</li>
                <li><strong>SATA HDDs:</strong> The underlying physical drives are traditional spinning Hard Disk Drives using the SATA interface. These offer large capacities at a lower cost compared to Solid State Drives (SSDs).</li>
                <li><strong>Performance Characteristics:</strong>
                    <ul class="list-disc list-inside ml-6 mt-1">
                        <li><strong>Good Sequential Throughput:</strong> SATA HDDs are decent at reading/writing large, continuous files (e.g., video streaming, large backups).</li>
                        <li><strong>Lower IOPS:</strong> They have lower Input/Output Operations Per Second (IOPS) compared to SSDs. This means they are slower at handling many small, random read/write requests (e.g., busy databases, websites with many small files).</li>
                        <li><strong>Latency:</strong> Access times are higher than SSDs due to the physical movement of the read/write heads.</li>
                        <li><strong>Network Factor:</strong> Performance can also be influenced by the speed and load on the internal storage network.</li>
                    </ul>
                </li>
                <li><strong>Use Cases:</strong> Ideal for storing large amounts of data where cost per GB is important and extreme I/O performance isn't the primary requirement. Examples: file storage, media libraries, backups, archives, less demanding web applications, Plex servers.</li>
            </ul>
            <p class="mt-4">While not as fast as local NVMe SSDs for random I/O, network SATA provides a reliable and cost-effective solution for high-capacity storage needs. See the "Optimizing Storage Performance" doc for tips.</p>
        `
    },
    {
        title: "Optimizing Storage Performance on Your VPS",
        date: "April 5, 2025",
        slug: "optimizing-storage",
        content: `
            <h3>Tips for Storage Performance</h3>
            <p>Our KVM Storage plans utilize reliable network-attached SATA storage, offering a balance between capacity and cost. Here are ways to optimize its performance:</p>
            <ol class="list-decimal list-inside space-y-2 mt-4">
                <li><strong>Choose the Right Filesystem:</strong> For general use, <code>ext4</code> is a solid choice on Linux. <code>XFS</code> can sometimes offer benefits for very large files.</li>
                <li><strong>Enable Caching:</strong> Ensure your OS utilizes RAM effectively for caching frequently accessed data. Linux does this automatically. Monitor available memory.</li>
                <li><strong>Optimize I/O Scheduler:</strong> Linux offers different I/O schedulers (e.g., <code>mq-deadline</code>, <code>kyber</code>, <code>bfq</code>). For virtualized environments, <code>none</code> or <code>mq-deadline</code> often perform well. You can check and change the scheduler (e.g., <code>cat /sys/block/sda/queue/scheduler</code> and <code>echo mq-deadline > /sys/block/sda/queue/scheduler</code> - requires testing).</li>
                <li><strong>Minimize Unnecessary Writes:</strong> Avoid excessive logging if not needed. Consider mounting temporary directories (<code>/tmp</code>) with <code>tmpfs</code> to use RAM instead of disk.</li>
                <li><strong>Database Tuning:</strong> If running databases, tune parameters like buffer pool size (MySQL/MariaDB) or shared_buffers (PostgreSQL) to fit your available RAM and workload.</li>
                <li><strong>Avoid Swap Thrashing:</strong> While swap is useful, excessive swapping (constant reading/writing to the swap file/partition) drastically reduces performance. Monitor swap usage (<code>free -h</code>) and consider adding more RAM if needed. Our plans allow choosing swap size, but it resides on the same storage disk.</li>
            </ol>
            <p class="mt-4">Remember that network storage performance can be influenced by overall network conditions and host node load, though we strive to maintain high standards.</p>
        `
    },
    {
        title: "Configuring UFW Firewall",
        slug: "ufw-firewall",
        content: `
            <h3>Basic Firewall Setup with UFW</h3>
            <p>UFW (Uncomplicated Firewall) is a user-friendly interface for managing iptables on Debian/Ubuntu systems. It's highly recommended to enable a firewall.</p>
            <p class="disclaimer"><strong>Important:</strong> Ensure you allow your SSH port <strong>before</strong> enabling the firewall, otherwise you will lock yourself out!</p>
            <ol class="list-decimal list-inside space-y-2 mt-4">
                <li><strong>Install UFW (if needed):</strong>
                    <pre><code>sudo apt update
sudo apt install ufw</code></pre>
                </li>
                <li><strong>Allow SSH:</strong> Find your assigned SSH port from your welcome email (let's assume it's <code>your_ssh_port</code>).
                    <pre><code>sudo ufw allow your_ssh_port/tcp</code></pre>
                    <p class="text-xs text-gray-500">(Replace <code>your_ssh_port</code> with the actual number, e.g., <code>sudo ufw allow 2222/tcp</code>)</p>
                </li>
                <li><strong>Allow Other Necessary Ports:</strong> Allow ports for services you intend to run. Remember these must be within your allocated NAT port range.
                    <pre><code># Example: Allow HTTP (port 80) - Use your assigned external port
sudo ufw allow your_http_port/tcp

# Example: Allow HTTPS (port 443) - Use your assigned external port
sudo ufw allow your_https_port/tcp

# Example: Allow a game server port - Use your assigned external port
sudo ufw allow your_game_port/udp</code></pre>
                     <p class="text-xs text-gray-500">(Replace <code>your_..._port</code> with the actual external port numbers assigned to you).</p>
                </li>
                <li><strong>Deny Incoming by Default:</strong> Set the default policy to deny all incoming connections.
                    <pre><code>sudo ufw default deny incoming</code></pre>
                </li>
                <li><strong>Allow Outgoing by Default (Recommended):</strong> Allow all outgoing connections.
                    <pre><code>sudo ufw default allow outgoing</code></pre>
                </li>
                <li><strong>Enable UFW:</strong>
                    <pre><code>sudo ufw enable</code></pre>
                    <p>It will warn you that this may disrupt existing connections. Type 'y' and press Enter.</p>
                </li>
                <li><strong>Check Status:</strong> Verify your rules.
                    <pre><code>sudo ufw status verbose</code></pre>
                </li>
            </ol>
            <p class="mt-4">This provides a basic level of security. You only need to allow the specific external ports assigned to your VPS for the services you run.</p>
        `
    },
    {
        title: "Using IPv6 Subnet",
        slug: "using-ipv6",
        content: `
            <h3>Utilizing Your /80 IPv6 Subnet</h3>
            <p>Your VPS comes with a dedicated /80 IPv6 subnet. Here's how to understand and potentially use it:</p>
            <h4>Automatic Configuration (SLAAC)</h4>
            <p>In most cases, your Linux OS (like recent Debian or Ubuntu) will automatically configure an IPv6 address from your subnet using SLAAC (Stateless Address Autoconfiguration). The network infrastructure advertises the prefix, and your OS generates its own unique address within that prefix.</p>
            <p>You can check your assigned IPv6 addresses using:</p>
            <pre><code>ip addr show</code></pre>
            <p>Look for entries starting with <code>inet6</code> that are not <code>::1/128</code> (loopback) or link-local addresses (<code>fe80::</code>).</p>
            <h4>Testing IPv6 Connectivity</h4>
            <p>You can test if your VPS can reach the IPv6 internet:</p>
            <pre><code>ping -6 google.com</code></pre>
            <p>Or:</p>
            <pre><code>curl -6 ifconfig.co</code></pre>
            <h4>Manual Configuration (Advanced)</h4>
            <p>While usually automatic, you could manually assign static IPv6 addresses from your subnet if needed. This involves editing network configuration files (e.g., <code>/etc/network/interfaces</code> on older Debian/Ubuntu, or using <code>netplan</code> on newer Ubuntu).</p>
            <p><strong>Example (Conceptual - Netplan):</strong></p>
            <pre><code># /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true # Or false if setting static IPv4
      dhcp6: false # Disable SLAAC if setting static IPv6
      addresses:
        - YOUR_STATIC_IPV6_ADDRESS/80 # e.g., 2604:a00:3:1223:44::a/80
      gateway6: GATEWAY_IPV6_ADDRESS
      nameservers:
          # Google Public DNS IPv6
          addresses: [2001:4860:4860::8888, 2001:4860:4860::8844]</code></pre>
            <p class="text-xs text-gray-500">You would need the correct Gateway IPv6 address from support or documentation if configuring statically. SLAAC is generally easier.</p>
            <h4>Firewall Considerations</h4>
            <p>Remember to configure your firewall (e.g., UFW or iptables/ip6tables) to allow necessary incoming IPv6 traffic just as you do for IPv4.</p>
            <pre><code># Example: Allow HTTPS over IPv6 with UFW
sudo ufw allow https/tcp</code></pre>
            <p>Using IPv6 allows direct end-to-end connectivity without NAT, simplifying some server setups.</p>
        `
    }
];


// --- Rendering Functions ---

/**
 * Renders pagination controls.
 * Styles updated for dark mode via classes on the buttons themselves.
 */
function renderPaginationControls(containerId, totalItems, currentPage, itemsPerPage, changePageCallback) {
    const paginationContainer = document.getElementById(containerId);
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = ''; // Clear previous controls

    if (totalPages <= 1) return;

    let paginationHTML = '';

    // Previous Button
    paginationHTML += `
        <button
            class="pagination-button px-4 py-2 mx-1 border border-gray-300 bg-white text-gray-700 rounded-md text-sm transition-colors duration-200
                   ${currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100'}"
            ${currentPage === 1 ? 'disabled' : ''}
            onclick="${changePageCallback.name}(${currentPage - 1})">
            &larr; Prev
        </button>
    `;

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button
                class="pagination-button px-4 py-2 mx-1 border border-gray-300 rounded-md text-sm transition-colors duration-200
                       ${i === currentPage
                        ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                        : 'bg-white text-gray-700 hover:bg-gray-100'}"
                onclick="${changePageCallback.name}(${i})">
                ${i}
            </button>
        `;
    }

    // Next Button
    paginationHTML += `
        <button
            class="pagination-button px-4 py-2 mx-1 border border-gray-300 bg-white text-gray-700 rounded-md text-sm transition-colors duration-200
                   ${currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100'}"
            ${currentPage === totalPages ? 'disabled' : ''}
            onclick="${changePageCallback.name}(${currentPage + 1})">
            Next &rarr;
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

/** Changes the current page for the blog list and re-renders. */
function changeBlogPage(newPage) {
    const totalPages = Math.ceil(blogPosts.length / ITEMS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
        currentBlogPage = newPage;
        renderBlogPostsList();
        document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
    }
}

/** Changes the current page for the docs list and re-renders. */
function changeDocsPage(newPage) {
    const totalPages = Math.ceil(docsArticles.length / ITEMS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
        currentDocsPage = newPage;
        renderDocsList();
        document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' });
    }
}


/** Renders the list of blog posts for the current page. */
function renderBlogPostsList() {
     const container = document.getElementById('blog-posts-container');
    if (!container) return;

    if (!blogPosts || blogPosts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No blog posts available.</p>';
        document.getElementById('blog-pagination').innerHTML = '';
        return;
    }

    const startIndex = (currentBlogPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const postsToShow = blogPosts.slice(startIndex, endIndex);

    let postsHTML = '';
    postsToShow.forEach(post => {
        const displayDate = post.date ? `<p class="text-sm text-gray-500 mb-3">Published on ${post.date}</p>` : '';
        // Apply dark mode classes to the card
        postsHTML += `
            <article class="list-item-card bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h3 class="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-700">
                    <a href="#blog/${post.slug || '#'}" class="post-link">${post.title}</a>
                </h3>
                ${displayDate}
                <p class="text-gray-700 mb-4">${post.snippet || ''}</p>
                <a href="#blog/${post.slug || '#'}" class="text-blue-600 hover:text-blue-700 font-medium post-link">Read More &rarr;</a>
            </article>
        `;
    });
    container.innerHTML = postsHTML;
    renderPaginationControls('blog-pagination', blogPosts.length, currentBlogPage, ITEMS_PER_PAGE, changeBlogPage);
}

/** Renders the full content of a single blog post. */
function renderFullPost(post) {
     const container = document.getElementById('full-post-view');
     const viewContainer = container.querySelector('.content-view'); // Target the inner container
    if (!container || !viewContainer) return;

    if (!post) {
        viewContainer.innerHTML = '<p class="text-center text-red-500">Error: Post not found.</p>';
        return;
    }
    const displayDate = post.date ? `<p class="text-center text-sm text-gray-500 mb-6">Published on ${post.date}</p>` : '';
    // Apply dark mode classes to the wrapper div inside content-view
    viewContainer.innerHTML = `
        <article>
            <h2 class="text-gray-900">${post.title}</h2>
            ${displayDate}
            <div class="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">${post.content}</div>
            <a href="#blog" class="back-link policy-back-link inline-block mt-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 font-medium">&larr; Back to Blog List</a>
        </article>
    `;
    const backLink = viewContainer.querySelector('a.policy-back-link');
    if(backLink) {
        backLink.addEventListener('click', handleBackLinkClick);
    }
}

/** Renders the list of documentation articles for the current page. */
 function renderDocsList() {
     const container = document.getElementById('docs-list-container');
    if (!container) return;

    if (!docsArticles || docsArticles.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No documentation available.</p>';
         document.getElementById('docs-pagination').innerHTML = '';
        return;
    }

    const startIndex = (currentDocsPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const docsToShow = docsArticles.slice(startIndex, endIndex);

    let docsHTML = '';
    docsToShow.forEach(doc => {
         // Apply dark mode classes to the card
        docsHTML += `
            <article class="list-item-card bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h3 class="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-700">
                    <a href="#docs/${doc.slug || '#'}" class="doc-link">${doc.title}</a>
                </h3>
                <a href="#docs/${doc.slug || '#'}" class="text-blue-600 hover:text-blue-700 font-medium doc-link">View Doc &rarr;</a>
            </article>
        `;
    });
    container.innerHTML = docsHTML;
    renderPaginationControls('docs-pagination', docsArticles.length, currentDocsPage, ITEMS_PER_PAGE, changeDocsPage);
}

/** Renders the full content of a single documentation article. */
function renderFullDoc(doc) {
     const container = document.getElementById('full-doc-view');
     const viewContainer = container.querySelector('.content-view'); // Target the inner container
    if (!container || !viewContainer) return;

    if (!doc) {
        viewContainer.innerHTML = '<p class="text-center text-red-500">Error: Document not found.</p>';
        return;
    }
     // Apply dark mode classes to the wrapper div inside content-view
    viewContainer.innerHTML = `
        <article>
            <h2 class="text-gray-900">${doc.title}</h2>
            <div class="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">${doc.content}</div>
            <a href="#docs" class="back-link policy-back-link inline-block mt-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 font-medium">&larr; Back to Docs List</a>
        </article>
    `;
    const backLink = viewContainer.querySelector('a.policy-back-link');
    if(backLink) {
         backLink.addEventListener('click', handleBackLinkClick);
    }
}


// --- Mobile Menu Toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// --- Removed Dark Mode Logic ---


// --- Router (Handles Navigation and Content Views) ---
const mainPageSectionsDiv = document.getElementById('main-page-sections');
const fullPostViewSection = document.getElementById('full-post-view');
const fullDocViewSection = document.getElementById('full-doc-view');
const privacyPolicySection = document.getElementById('privacy-policy');
const termsOfServiceSection = document.getElementById('terms-of-service');

function handleRouteChange() {
    const hash = window.location.hash || '#hero';
    const blogPostMatch = hash.match(/^#blog\/(.+)/);
    const docArticleMatch = hash.match(/^#docs\/(.+)/);

     if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
         mobileMenu.classList.add('hidden');
     }

    fullPostViewSection?.classList.add('hidden-section');
    fullDocViewSection?.classList.add('hidden-section');
    privacyPolicySection?.classList.add('hidden-section');
    termsOfServiceSection?.classList.add('hidden-section');
    mainPageSectionsDiv?.classList.remove('hidden-section');

    if (blogPostMatch) {
        const slug = blogPostMatch[1];
        const post = blogPosts.find(p => p.slug === slug);
        mainPageSectionsDiv?.classList.add('hidden-section');
        fullPostViewSection?.classList.remove('hidden-section');
        renderFullPost(post); // Renders content inside the view
        window.scrollTo(0, 0);

    } else if (docArticleMatch) {
         const slug = docArticleMatch[1];
         const doc = docsArticles.find(d => d.slug === slug);
         mainPageSectionsDiv?.classList.add('hidden-section');
         fullDocViewSection?.classList.remove('hidden-section');
         renderFullDoc(doc); // Renders content inside the view
         window.scrollTo(0, 0);

    } else if (hash === '#privacy-policy') {
         mainPageSectionsDiv?.classList.add('hidden-section');
         privacyPolicySection?.classList.remove('hidden-section');
         window.scrollTo(0, 0);

    } else if (hash === '#terms-of-service') {
         mainPageSectionsDiv?.classList.add('hidden-section');
         termsOfServiceSection?.classList.remove('hidden-section');
         window.scrollTo(0, 0);

    } else {
         privacyPolicySection?.classList.add('hidden-section');
         termsOfServiceSection?.classList.add('hidden-section');
         fullPostViewSection?.classList.add('hidden-section');
         fullDocViewSection?.classList.add('hidden-section');
         mainPageSectionsDiv?.classList.remove('hidden-section');

         if (hash === '#blog') currentBlogPage = 1;
         if (hash === '#docs') currentDocsPage = 1;

         renderBlogPostsList();
         renderDocsList();

        if (hash && hash !== '#') {
            const targetSectionId = hash.substring(1);
            const targetElement = document.getElementById(targetSectionId);
            if (targetElement && mainPageSectionsDiv?.contains(targetElement)) {
                 setTimeout(() => {
                    const headerOffset = document.querySelector('header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                 }, 50);
            } else if (hash === '#hero') {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (!targetElement) {
                console.warn(`[Router] Target element not found for hash: ${hash}.`);
            }
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

/** Handles clicks on "Back" links within full view sections. */
function handleBackLinkClick(e) {
     e.preventDefault();
     const targetHash = e.target.getAttribute('href');
     window.location.hash = targetHash || '#hero';
}

// --- Event Delegation for Dynamic Content ---
document.addEventListener('click', function(event) {
    const navLink = event.target.closest('.nav-link, #mobile-menu a');
    if (navLink && navLink.getAttribute('href')?.startsWith('#')) {
         if (mobileMenu && !mobileMenu.classList.contains('hidden') && mobileMenu.contains(navLink)) {
            mobileMenu.classList.add('hidden');
         }
         // Don't prevent default here, let hashchange handle scrolling/routing
         return;
    }

    const postLink = event.target.closest('.post-link');
    if (postLink) {
        const targetHash = postLink.getAttribute('href');
        if (targetHash && targetHash.startsWith('#blog/')) {
            event.preventDefault(); // Prevent default jump, let router handle view change
            window.location.hash = targetHash;
        }
        return;
    }

    const docLink = event.target.closest('.doc-link');
    if (docLink) {
        const targetHash = docLink.getAttribute('href');
         if (targetHash && targetHash.startsWith('#docs/')) {
            event.preventDefault(); // Prevent default jump, let router handle view change
            window.location.hash = targetHash;
         }
         return;
    }

     const policyLink = event.target.closest('.policy-link');
     if (policyLink) {
         const targetHash = policyLink.getAttribute('href');
         if (targetHash && (targetHash === '#privacy-policy' || targetHash === '#terms-of-service')) {
             event.preventDefault(); // Prevent default jump, let router handle view change
             window.location.hash = targetHash;
         }
         return;
     }

     // Note: Back links inside dynamic content (blog/doc views) are handled by renderFullPost/renderFullDoc attaching handleBackLinkClick

}, false);


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Removed dark mode related initializations

    checkStatus('https://vdc.skyvps360.xyz', 'status-vdc');
    checkStatus('https://my.skyvps360.xyz', 'status-billing');

    // Static back links (already present in HTML for policies)
     document.querySelectorAll('#privacy-policy .policy-back-link, #terms-of-service .policy-back-link').forEach(link => {
        link.addEventListener('click', handleBackLinkClick);
     });

    handleRouteChange(); // Initial render and route handling based on current hash (or default)
    window.addEventListener('hashchange', handleRouteChange); // Handle navigation when hash changes
});
