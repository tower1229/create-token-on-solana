import { useEffect, useRef } from "react";

export const ProgressModal = ({
  open,
  onClose,
  logs,
}: {
  open: boolean;
  logs: string[];
  onClose?: () => void;
}) => {
  const DialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      DialogRef.current?.showModal();
    } else {
      DialogRef.current?.close();
    }
  }, [open]);

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
              {logs.map((log, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};
