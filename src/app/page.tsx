export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">🐳 Running in Docker Container\!</p>
          <p className="text-sm">This page is served from a Linux container, not Windows</p>
        </div>
        <h1 className="text-4xl font-bold mb-8">CRM Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Contacts</h2>
            <p className="text-gray-600">Manage your customer contacts</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            <p className="text-gray-600">Track your tasks and activities</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p className="text-gray-600">View analytics and reports</p>
          </div>
        </div>
      </div>
    </main>
  )
}
