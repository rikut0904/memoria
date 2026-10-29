export default function AppLoadingScreen() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-white"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-3xl font-bold text-primary-600">思い出memoria</div>
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    </main>
  );
}
