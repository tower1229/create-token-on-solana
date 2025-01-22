import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      <div className="container mx-auto px-4 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="text-center flex-1 flex flex-col items-center justify-center mb-8 pt-20">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Create Token on Solana
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            轻松创建和部署你自己的 Solana 代币，简单快捷
          </p>
          <Link to="/create-spl" className=" bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition duration-300">
            开始创建
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg">
            <div className="text-purple-400 text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">快速部署</h3>
            <p className="text-gray-300">几分钟内完成代币创建和部署，无需复杂配置</p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg">
            <div className="text-purple-400 text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">安全可靠</h3>
            <p className="text-gray-300">基于 Solana 区块链，确保交易安全和透明</p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg">
            <div className="text-purple-400 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">低成本</h3>
            <p className="text-gray-300">享受 Solana 网络的低费用和高性能优势</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pb-24">
          <h2 className="text-3xl font-bold mb-4">准备好创建你的代币了吗？</h2>
          <p className="text-gray-300 mb-8">
            加入 Solana 生态系统，开启你的区块链之旅
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full transition duration-300">
              查看文档
            </button>
            <button className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold py-2 px-6 rounded-full transition duration-300">
              了解更多
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-purple-800/30 py-8 mt-auto">
          <div className="text-center text-gray-400">
            <p>
              Created by{" "}
              <a
                href="https://refined-x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                refined-x
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
