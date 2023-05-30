import React, { useState } from 'react';

export const TextInput = (props:{ prompt: string, setPrompt: (arg0: string) => void, handleSubmit: React.FormEventHandler<HTMLFormElement> | undefined, loading: boolean }) => {

  return (
    <form onSubmit={props.handleSubmit}>
      <div className="flex flex-col w-full h-full py-2">
        <textarea
          className="resize-none static rounded w-full min-h-[140px] p-3 bg-indigo-800/10 text-indigo-900 placeholder-indigo-900/50 focus:outline-none"
          id="prompt"
          placeholder="Add prompt here..."
          value={props.prompt}
          onChange={(e) => props.setPrompt(e.target.value)}
        />
        {!props.loading ? 
          <button type="submit" className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-sm text-white bg-indigo-800 hover:bg-indigo-900">Generate Image</button> 
          : <button className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-sm text-white bg-indigo-900" disabled>
            Generating
        </button>}
      </div>
    </form>
  );
}
