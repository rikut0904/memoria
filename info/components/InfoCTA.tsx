export default function InfoCTA() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="container text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          今すぐ始めよう
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          大切な思い出を安全に保存し、家族や友人と共有しましょう。
          思い出memoriaがあなたの思い出を特別なものにします。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-lg transition-colors">
            無料で始める
          </button>
          <button className="px-8 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-white font-semibold rounded-lg transition-colors">
            デモを見る
          </button>
        </div>
      </div>
    </section>
  )
}
