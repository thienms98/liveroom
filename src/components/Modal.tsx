const Modal = ({
  open,
  onAccept,
  onCancel,
  className,
  children,
}: {
  open: boolean;
  onAccept: Function;
  onCancel: Function;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    open && (
      <div className={`fixed top-0 left-0 w-screen h-screen ${className}`} onClick={() => onCancel()}>
        <div
          className="absolute w-full md:w-[30%] min-h-[200px] p-4 top-0 md:top-[30%] left-[50%] translate-x-[-50%] md:translate-y-[-50%] bg-white shadow-lg text-black flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1">{children}</div>
          <div className="flex flex-row justify-end gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="px-3 py-1 rounded-md bg-white border border-black text-black cursor-pointer hover:bg-black hover:text-white"
            >
              Cancle
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="px-3 py-1 rounded-md bg-white border border-green-400 text-green-400 cursor-pointer hover:bg-green-400 hover:text-white"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
