import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BiRightArrowCircle } from 'react-icons/bi'

interface MainButtonProps {
  canBeClicked?: boolean;
  loading: boolean;
  text: string;
}

const MainButton: React.FC<MainButtonProps> = ({ canBeClicked, loading, text }) => {
  return (
    <button disabled={loading || !canBeClicked} className={`btn_base py-5 px-2 mt-3 font-bold text-lg flex align-middle justify-center transition-colors ${canBeClicked ? "bg-emerald-400 hover:bg-emerald-500" : "bg-gray-300 hover:bg-gray-300 pointer-events-none"}`}>
      {loading ? (
        <AiOutlineLoading3Quarters className="animate-spin mr-4" size={30} color="white" />
      ) : (
        <BiRightArrowCircle className="animate-pulse mr-4" size={30} color="white" />
      )
      }
      {text}
    </button>
  )
}

export default MainButton
