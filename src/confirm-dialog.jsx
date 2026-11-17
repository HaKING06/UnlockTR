import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X, ArrowRight } from "lucide-react";
const Context = createContext(null);
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null),
    [checked, setChecked] = useState(false),
    pending = useRef(null),
    dialog = useRef(null),
    titleId = useId();
  function settle(result) {
    dialog.current?.close();
    const resolve = pending.current;
    pending.current = null;
    setRequest(null);
    setChecked(false);
    resolve?.(result);
  }
  function ask(options) {
    if (pending.current) return Promise.resolve(false);
    return new Promise((resolve) => {
      pending.current = resolve;
      setChecked(false);
      setRequest(options);
    });
  }
  useEffect(() => {
    if (request && !dialog.current?.open) dialog.current?.showModal();
  }, [request]);
  useEffect(() => () => pending.current?.(false), []);
  return (
    <Context.Provider value={ask}>
      {children}
      {request &&
        createPortal(
          <dialog
            ref={dialog}
            className={"confirm-dialog " + (request.danger ? "danger" : "")}
            aria-labelledby={titleId}
            onCancel={(e) => {
              e.preventDefault();
              settle(false);
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) settle(false);
            }}
          >
            <div className="confirm-sheet">
              <div className="confirm-topline">
                <span className="confirm-emblem">
                  <ShieldCheck size={23} />
                </span>
                <span>UNLOCKTR · İŞLEM ONAYI</span>
                <button
                  className="icon"
                  aria-label="Onayı kapat"
                  onClick={() => settle(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 id={titleId}>{request.title}</h2>
              <p>{request.description}</p>
              {request.detail && (
                <div className="confirm-detail">{request.detail}</div>
              )}
              {request.acknowledgement && (
                <label className="confirm-ack">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <span>{request.acknowledgement}</span>
                </label>
              )}
              <div className="confirm-actions">
                <button
                  autoFocus
                  className="secondary"
                  onClick={() => settle(false)}
                >
                  Vazgeç
                </button>
                <button
                  className={request.danger ? "danger-button" : "primary"}
                  disabled={!!request.acknowledgement && !checked}
                  onClick={() => settle(true)}
                >
                  {request.confirmLabel || "Onayla"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </Context.Provider>
  );
}
export const useConfirm = () => useContext(Context);
