import React from 'react'
import { RxExternalLink } from "react-icons/rx";
const Footer = () => {

  const openFullPage = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup",
    });
  };

  return (
    <div className='fixed bottom-0 left-0 border-t border-gray-300 bg-gray-100 w-full h-7 flex items-center px-4 z-9999'>
        <span className='text-xs text-gray-400'>Version v2.20.3</span>
        <button
              type='button'
              onClick={openFullPage}
              aria-label='Open QA Assist in a full browser tab'
              title='Open in a full browser tab'
              className='text-gray-400 hover:text-blue-500 cursor-pointer'
            >
              <RxExternalLink />
            </button>
    </div>
  )
}

export default Footer
