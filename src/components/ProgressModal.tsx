import { useEffect, useRef } from "react";
import { getStore } from "@/store";

export interface ExplorerInfo {
  token?: string;
  tx?: string;
}

export const ProgressModal = ({
  open,
  onClose,
  logs,
  successInfo,
}: {
  open: boolean;
  logs: string[];
  successInfo?: ExplorerInfo;
  onClose?: () => void;
}) => {
  const DialogRef = useRef<HTMLDialogElement>(null);
  const { Network } = getStore();

  useEffect(() => {
    if (open) {
      DialogRef.current?.showModal();
    } else {
      DialogRef.current?.close();
    }
  }, [open]);

  const getExplorerBaseUrl = ({
    token,
    tx,
  }: {
    token?: string;
    tx?: string;
  }) => {
    if (token) {
      return Network.currentNetwork === "solana-devnet"
        ? `https://solscan.io/token/${token}?cluster=devnet`
        : `https://solscan.io/token/${token}`;
    }
    if (tx) {
      return Network.currentNetwork === "solana-devnet"
        ? `https://solscan.io/tx/${tx}?cluster=devnet`
        : `https://solscan.io/tx/${tx}`;
    }
  };

  return (
    <>
      <dialog ref={DialogRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button
              className="top-2 right-2 btn btn-sm btn-circle btn-ghost absolute"
              onClick={onClose}
            >
              ✕
            </button>
          </form>

          <div>
            <div className="border rounded-lg max-h-screen space-y-2 bg-gray-50 mt-4 p-4 overflow-y-auto">
              {successInfo ? (
                <div className="bg-white border rounded-lg mt-4 p-4">
                  <h3 className="font-semibold mb-2">交易详情</h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Token 地址：</span>
                      <span className="font-mono break-all">
                        {successInfo.token}
                      </span>
                    </div>
                    {successInfo.token && (
                      <div>
                        <a
                          href={getExplorerBaseUrl({
                            token: successInfo.token,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 inline-flex items-center hover:text-blue-800"
                        >
                          查看代币
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 ml-1 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                    {successInfo.tx && (
                      <div>
                        <a
                          href={getExplorerBaseUrl({
                            tx: successInfo.tx,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 inline-flex items-center hover:text-blue-800"
                        >
                          查看交易
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 ml-1 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      log.includes("错误")
                        ? "bg-red-100 text-red-700"
                        : log.includes("成功") || log.includes("🎉")
                          ? "bg-green-100 text-green-700"
                          : "bg-white"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};
