import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <div className="mx-auto min-h-screen max-w-screen-md px-4 pt-20 pb-8">
      <div className="bg-base-200 shadow-xl mt-8 p-8 card">
        <h1 className="font-bold mb-8 text-3xl">重要免责声明</h1>

        <div className="space-y-8">
          <section>
            <h2 className="font-bold text-xl text-warning mb-4">
              法律合规提示
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base-content/80">
              <li>本工具仅提供区块链技术服务，不提供任何金融服务或投资建议</li>
              <li>用户使用本工具创建的代币仅用于区块链技术学习、研究和测试</li>
              <li>
                严禁将本工具用于任何形式的非法金融活动，包括但不限于：
                <ul className="list-disc list-inside mt-2 ml-6">
                  <li>非法集资</li>
                  <li>传销活动</li>
                  <li>虚假宣传</li>
                  <li>价格操纵</li>
                  <li>其他违反所在地区法律法规的行为</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl text-warning mb-4">风险提示</h2>
            <ul className="list-disc list-inside space-y-2 text-base-content/80">
              <li>区块链技术仍处于早期发展阶段，存在技术和安全风险</li>
              <li>代币价值波动巨大，请谨慎评估风险</li>
              <li>用户应自行承担使用本工具所产生的一切后果</li>
              <li>建议仅使用自有资金进行技术探索，严禁向他人募集资金</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl text-warning mb-4">使用限制</h2>
            <ul className="list-disc list-inside space-y-2 text-base-content/80">
              <li>用户需确保在当地法律允许的情况下使用本工具</li>
              <li>如所在地区法律法规禁止相关活动，请立即停止使用</li>
            </ul>
          </section>

          <p className="pt-4 text-base-content/80">
            使用本工具即表示您已完全理解并同意以上声明。如有疑问，请咨询当地法律顾问。
          </p>
        </div>
      </div>
    </div>
  );
}
