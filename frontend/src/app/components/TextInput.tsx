import React, { useState } from 'react';

export const TextInput = ({ prompt, setPrompt, handleSubmit, loading }) => {

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col p-6">
        {/* <label className="block pl-2 pr-4">Prompt</label> */}
        <textarea
          className="static rounded w-full px-2 border border-slate-300 text-black"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {!loading ? 
          <button type="submit" className="rounded px-6 py-3 mt-2 text-lg text-white bg-indigo-800">Generate Image</button> 
          : <button className="rounded px-4 py-3 mt-2 text-lg flex flex-row text-white bg-indigo-800" disabled>
            Generating
              <svg className="animate-spin ml-2 mt-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-50" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
        </button>}
      </div>
    </form>
  );
}
