import React, { useState } from 'react';
import { Wand2, Download, Sparkles, Eraser, Palette, Camera } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { ImageFile } from './types';

const SUGGESTED_PROMPTS = [
  { id: 1, text: "Remove the background", icon: <Eraser className="w-4 h-4" /> },
  { id: 2, text: "Place the product on a marble table", icon: <Camera className="w-4 h-4" /> },
  { id: 3, text: "Add a warm sunset lighting effect", icon: <Sparkles className="w-4 h-4" /> },
  { id: 4, text: "Turn this into a cyberpunk style illustration", icon: <Palette className="w-4 h-4" /> },
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedBase64 = await editImageWithGemini({
        imageBase64: originalImage.base64,
        imageMimeType: originalImage.mimeType,
        prompt: prompt,
      });

      if (generatedBase64) {
        setResultImage(generatedBase64);
      } else {
        setError("Failed to generate image. Please try a different prompt.");
      }
    } catch (err) {
      setError("An error occurred while connecting to Gemini.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `processed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              ProductCleanse AI
            </h1>
          </div>
          <div className="text-sm font-medium text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Transform Your Images with AI
          </h2>
          <p className="text-lg text-slate-600">
            Upload a photo and tell us how to change it. From removing backgrounds to changing lighting, just ask.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">1. Upload Image</h3>
              <ImageUploader 
                selectedImage={originalImage} 
                onImageSelected={(file) => {
                  setOriginalImage(file);
                  setResultImage(null); // Reset result on new upload
                  setError(null);
                }} 
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">2. Describe Changes</h3>
               
               <div className="space-y-4">
                 <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'Remove the background and place on a white table' or 'Make the lighting moody and blue'"
                  className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-slate-700 placeholder:text-slate-400 transition-all"
                 />
                 
                 <div className="space-y-2">
                   <span className="text-xs font-medium text-slate-500 uppercase">Quick Prompts</span>
                   <div className="flex flex-wrap gap-2">
                     {SUGGESTED_PROMPTS.map((p) => (
                       <button
                        key={p.id}
                        onClick={() => setPrompt(p.text)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                       >
                         {p.icon}
                         <span>{p.text}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 <Button 
                  onClick={handleGenerate}
                  disabled={!originalImage || !prompt.trim()}
                  isLoading={isLoading}
                  className="w-full mt-4"
                  icon={<Sparkles className="w-5 h-5" />}
                 >
                   {isLoading ? 'Processing Image...' : 'Generate Image'}
                 </Button>

                 {error && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center">
                     <span className="mr-2">⚠️</span> {error}
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:sticky lg:top-24 space-y-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">3. Result</h3>
                
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-indigo-900 font-medium animate-pulse">Gemini is reimagining your photo...</p>
                    </div>
                  )}

                  {resultImage ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={resultImage} 
                        alt="AI Generated Result" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={handleDownload} variant="secondary" icon={<Download className="w-4 h-4"/>}>
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">Generated image will appear here</p>
                    </div>
                  )}
                </div>
             </div>
             
             {/* Info Card */}
             <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
               <h4 className="font-bold text-lg mb-2 flex items-center">
                 <Sparkles className="w-5 h-5 mr-2" /> Pro Tip
               </h4>
               <p className="text-indigo-100 text-sm leading-relaxed">
                 Be specific with your instructions. Instead of "Change background", try "Replace the background with a minimal wooden desk with soft morning sunlight".
               </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;