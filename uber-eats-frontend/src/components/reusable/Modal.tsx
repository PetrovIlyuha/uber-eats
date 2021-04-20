import React from "react";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  showModal: boolean;
  setShowModal: (next: boolean) => void;
}

const Modal = ({
  children,
  showModal,
  setShowModal,
}: PropsWithChildren<ModalProps>): null => {
  const content = showModal && (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="z-10 fixed top-0 right-0 left-0 bottom-0 flex items-center justify-center h-screen w-screen bg-gray-900 bg-opacity-50"
    >
      <div
        className="z-50 relative max-w-6xl max-h-20 mx-auto"
        style={{ marginBottom: 560 }}
      >
        <button
          type="button"
          className="btn_base mb-10 absolute top-2 right-2 px-2 py-2 bg-red-400 rounded-full text-white hover:bg-red-500 shadow-lg"
          onClick={() => setShowModal(false)}
        >
          <FontAwesomeIcon icon={faWindowClose} size="2x" />
        </button>
        <div className="py-10 h-1/2 px-52 bg-gray-100 flex flex-col items-center justify-center rounded-md shadow-lg">
          {children}
        </div>
      </div>
    </motion.div>
  );

  ReactDOM.render(content, document.getElementById("modals"));
  return null;
};

export default Modal;
