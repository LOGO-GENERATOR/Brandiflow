
export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Profile Settings</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 bg-transparent"
                            placeholder="Your Name"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 bg-transparent"
                            placeholder="email@example.com"
                            disabled
                        />
                    </div>
                    <div className="pt-2">
                        <button type="button" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-medium disabled:opacity-50" disabled>
                            Save Changes (Coming Soon)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
