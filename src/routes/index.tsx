import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="bg-gradient-to-br to-black min-h-screen from-purple-900 text-white">
      <div className="container flex flex-col mx-auto min-h-screen px-4">
        <Header />
        {/* Hero Section */}
        <div className="flex flex-col flex-1 text-center mb-8 pt-28 items-center justify-center">
          <h1 className="bg-clip-text bg-gradient-to-r font-bold from-purple-400 to-pink-600 text-transparent mb-6 text-5xl">
            Create Token on Solana
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            轻松创建和部署你自己的 Solana 代币，简单快捷
          </p>
          <Link
            to="/create-spl"
            className=" bg-gradient-to-r rounded-full font-bold from-purple-500 to-pink-500 text-white py-3 px-8 transition duration-300 hover:from-purple-600 hover:to-pink-600"
          >
            开始创建
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
            <div className="mb-4 text-purple-400 text-4xl">🚀</div>
            <h3 className="font-bold text-xl mb-2">快速部署</h3>
            <p className="text-gray-300">
              几分钟内完成代币创建和部署，无需复杂配置
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
            <div className="mb-4 text-purple-400 text-4xl">🛡️</div>
            <h3 className="font-bold text-xl mb-2">安全可靠</h3>
            <p className="text-gray-300">
              基于 Solana 区块链，确保交易安全和透明
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
            <div className="mb-4 text-purple-400 text-4xl">⚡</div>
            <h3 className="font-bold text-xl mb-2">低成本</h3>
            <p className="text-gray-300">
              享受 Solana 网络的低费用和高性能优势
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pb-16">
          <h2 className="font-bold mb-4 text-3xl">准备好创建你的代币了吗？</h2>
          <p className="mb-8 text-gray-300">
            加入 Solana 生态系统，开启你的区块链之旅
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/create-spl"
              className="rounded-full font-bold bg-purple-500 text-white py-2 px-6 transition duration-300 hover:bg-purple-600"
            >
              创建代币
            </Link>
            <Link
              to="/mint-spl"
              className="rounded-full font-bold bg-purple-500 text-white py-2 px-6 transition duration-300 hover:bg-purple-600"
            >
              增发代币
            </Link>
            <Link
              to="/disclaimer"
              className="bg-warning rounded-full font-bold text-warning-content py-2 px-6 transition duration-300 hover:bg-warning/80"
            >
              免责声明
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t mt-auto border-purple-800/30 py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              © {new Date().getFullYear()} Solana Token Creator. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
