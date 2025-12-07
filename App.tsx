import React, { useState } from 'react';
import { EditorLayout } from './components/EditorLayout';
import { Header } from './components/Header';
import { Toaster } from './components/ui/Toaster';

const DEFAULT_HTML = `
<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 border border-gray-200">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:h-full md:w-48" src="https://picsum.photos/200/300" alt="Modern building architecture">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Company Retreats</div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black hover:underline">Incredible accommodation for your team</a>
      <p class="mt-2 text-slate-500">Looking to take your team away on a retreat to enjoy some awesome food and take in some sunshine? We have a list of places to do just that.</p>
      <button class="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300">
        Book Now
      </button>
    </div>
  </div>
</div>
`;

function App() {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900 text-neutral-100 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <EditorLayout 
          initialCode={htmlCode} 
          onCodeChange={setHtmlCode}
        />
      </main>
      <Toaster />
    </div>
  );
}

export default App;