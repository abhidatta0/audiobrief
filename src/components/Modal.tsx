import { useEffect } from "react";
interface Props {
  children: React.ReactNode;
  onClose: () => void;
  isVisible: boolean;
}
const Modal = ({ children, isVisible, onClose }: Props) => {
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }
  }, [isVisible]);
  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    // only close when the backdrop itself is clicked, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 pt-[5%] bg-gray-50/70 z-10 h-screen overflow-hidden"
    >
      <div className="bg-gray-200 max-w-[80%] m-auto p-5 relative rounded-lg">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-0 text-3xl cursor-pointer"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
