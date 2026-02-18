interface Props {
  children: React.ReactNode;
  onClose: () => void;
  isVisible: boolean;
}
const Modal = ({ children, isVisible, onClose }: Props) => {
  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    //@ts-expect-error id might not be present
    if (e.target.id !== "model-content") {
      onClose();
    }
  };
  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 pt-[20%] bg-gray-50/70 z-10 "
    >
      <div
        id="model-content"
        className="bg-gray-200 max-w-[80%] m-auto p-5 relative rounded-lg"
      >
        <div className="absolute right-5 font-xs cursor-pointer">&times;</div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
