import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Nexora",
  description: "Admin panel for Nexora NFT marketplace management.",
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="space-y-8">
        <section className="bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Platform Statistics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm text-white/70">+12% this month</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Total NFTs</h3>
              <p className="text-3xl font-bold">5,678</p>
              <p className="text-sm text-white/70">+8% this month</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
              <p className="text-3xl font-bold">$123K</p>
              <p className="text-sm text-white/70">+25% this month</p>
            </div>
          </div>
        </section>

        <section className="bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Content Management</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Featured Collections</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span>Awesome Collection</span>
                  <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30">Edit</button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span>Digital Art Series</span>
                  <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30">Edit</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">User Reports</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span>Report #001</span>
                  <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30">Review</button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span>Report #002</span>
                  <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30">Review</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">System Management</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Platform Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Maintenance Mode</span>
                  <button className="w-12 h-6 bg-white/20 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>New User Registration</span>
                  <button className="w-12 h-6 bg-white/20 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Security</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Failed Login Attempts</span>
                  <span className="text-sm text-white/70">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blocked IPs</span>
                  <span className="text-sm text-white/70">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Security Scan</span>
                  <span className="text-sm text-white/70">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <h3 className="font-semibold mb-2">Backup Database</h3>
              <p className="text-sm text-white/70">Create system backup</p>
            </button>
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <h3 className="font-semibold mb-2">Clear Cache</h3>
              <p className="text-sm text-white/70">Refresh system cache</p>
            </button>
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <h3 className="font-semibold mb-2">Send Announcement</h3>
              <p className="text-sm text-white/70">Notify all users</p>
            </button>
          </div>
        </section>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">⚠️ Admin Access Required</h3>
          <p className="text-white/80">
            This is a demo admin panel. In production, proper authentication and authorization 
            would be required to access these administrative functions.
          </p>
        </div>
      </div>
    </div>
  );
}