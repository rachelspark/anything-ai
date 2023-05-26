import React, { useState } from 'react';

export const TextInput = ({ prompt, setPrompt, handleSubmit, loading }) => {

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col w-full py-2">
        {/* <label className="block pl-2 pr-4">Prompt</label> */}
        <textarea
          className="resize-none static rounded w-full p-2 bg-indigo-800/10 text-indigo-900 placeholder-indigo-900/50 focus:outline-none"
          id="prompt"
          placeholder="Add prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {!loading ? 
          <button type="submit" className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-lg text-white bg-indigo-800 hover:bg-indigo-900">Generate Image</button> 
          : <button className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-lg text-white bg-indigo-900" disabled>
            Generating
        </button>}
      </div>
    </form>
  );
}
