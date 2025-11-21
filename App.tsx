import React, { useState } from 'react';
import { Wand2, Download, Sparkles, Eraser, Palette, Camera, Globe } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { ImageFile } from './types';

type Language = 'en' | 'zh';

const TRANSLATIONS = {
  en: {
    appTitle: "ProductCleanse AI",
    poweredBy: "Powered by Gemini 2.5",
    heroTitle: "Transform Your Images with AI",
    heroDescription: "Upload a photo and tell us how to change it. From removing backgrounds to changing lighting, just ask.",
    step1: "1. Upload Image",
    step2: "2. Describe Changes",
    step3: "3. Result",
    placeholder: "E.g., 'Remove the background and place on a white table' or 'Make the lighting moody and blue'",
    quickPromptsLabel: "Quick Prompts",
    generateBtn: "Generate Image",
    processingBtn: "Processing Image...",
    downloadBtn: "Download",
    loadingMessage: "Gemini is reimagining your photo...",
    emptyState: "Generated image will appear here",
    proTipTitle: "Pro Tip",
    proTipContent: "Be specific with your instructions. Instead of \"Change background\", try \"Replace the background with a minimal wooden desk with soft morning sunlight\".",
    errorNoImage: "Failed to generate image. Please try a different prompt.",
    errorConn: "An error occurred:",
    uploadLabels: {
      drop: 'Drop it here',
      click: 'Click or drop image',
      support: 'Supports JPG, PNG, WEBP up to 10MB',
      original: 'Original'
    },
    prompts: [
      "Remove the background",
      "Place the product on a marble table",
      "Add a warm sunset lighting effect",
      "Turn this into a cyberpunk style illustration"
    ]
  },
  zh: {
    appTitle: "ProductCleanse AI",
    poweredBy: "由 Gemini 2.5 提供支持",
    heroTitle: "用 AI 改造你的图片",
    heroDescription: "上传照片并告诉我们要怎么改。从移除背景到调整光线，只需一句话。",
    step1: "1. 上传图片",
    step2: "2. 描述修改",
    step3: "3. 结果",
    placeholder: "例如：“移除背景并放在白色桌子上”或“让光线变得忧郁且偏蓝”",
    quickPromptsLabel: "快速提示",
    generateBtn: "生成图片",
    processingBtn: "正在处理...",
    downloadBtn: "下载",
    loadingMessage: "Gemini 正在重绘你的照片...",
    emptyState: "生成的图片将显示在这里",
    proTipTitle: "专业提示",
    proTipContent: "指令越具体越好。不要只说“换背景”，试着说“把背景换成晨光下的极简木桌”。",
    errorNoImage: "生成图片失败。请尝试不同的提示词。",
    errorConn: "发生错误：",
    uploadLabels: {
      drop: '拖放到这里',
      click: '点击或拖放图片',
      support: '支持 JPG, PNG, WEBP，最大 10MB',
      original: '原图'
    },
    prompts: [
      "移除背景",
      "把产品放在大理石桌上",
      "添加温暖的夕阳光效",
      "变成赛博朋克风格插画"
    ]
  }
};

const PROMPT_ICONS = [
  <Eraser key="1" className="w-4 h-4" />,
  <Camera key="2" className="w-4 h-4" />,
  <Sparkles key="3" className="w-4 h-4" />,
  <Palette key="4" className="w-4 h-4" />,
];

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

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
        setError(t.errorNoImage);
      }
    } catch (err: any) {
      // Display the actual error message from the service
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`${t.errorConn} ${errorMsg}`);
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

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
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
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? '中文' : 'English'}</span>
            </button>
            <div className="text-sm font-medium text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hidden sm:block">
              {t.poweredBy}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.heroTitle}
          </h2>
          <p className="text-lg text-slate-600">
            {t.heroDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t.step1}</h3>
              <ImageUploader 
                selectedImage={originalImage} 
                onImageSelected={(file) => {
                  setOriginalImage(file);
                  setResultImage(null); // Reset result on new upload
                  setError(null);
                }} 
                labels={t.uploadLabels}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t.step2}</h3>
               
               <div className="space-y-4">
                 <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full h-32 p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-slate-400 transition-all font-medium"
                 />
                 
                 <div className="space-y-2">
                   <span className="text-xs font-medium text-slate-500 uppercase">{t.quickPromptsLabel}</span>
                   <div className="flex flex-wrap gap-2">
                     {t.prompts.map((promptText, idx) => (
                       <button
                        key={idx}
                        onClick={() => setPrompt(promptText)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                       >
                         {PROMPT_ICONS[idx]}
                         <span>{promptText}</span>
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
                   {isLoading ? t.processingBtn : t.generateBtn}
                 </Button>

                 {error && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex flex-col">
                     <div className="flex items-center font-semibold mb-1">
                        <span className="mr-2">⚠️</span> 错误详情
                     </div>
                     <div className="pl-6 opacity-90 break-all">
                       {error}
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:sticky lg:top-24 space-y-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t.step3}</h3>
                
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-indigo-900 font-medium animate-pulse">{t.loadingMessage}</p>
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
                          {t.downloadBtn}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">{t.emptyState}</p>
                    </div>
                  )}
                </div>
             </div>
             
             {/* Info Card */}
             <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
               <h4 className="font-bold text-lg mb-2 flex items-center">
                 <Sparkles className="w-5 h-5 mr-2" /> {t.proTipTitle}
               </h4>
               <p className="text-indigo-100 text-sm leading-relaxed">
                 {t.proTipContent}
               </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;