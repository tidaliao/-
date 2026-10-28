import React, { useState } from 'react';
import {
  X,
  Download,
  Terminal,
  Laptop,
  Globe,
  Share2,
  Copy,
  Check,
  FolderArchive,
  ExternalLink,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const shareUrl = "https://ais-pre-zz5l5fcrzdcbm2iagyfkbw-688811718301.asia-northeast1.run.app";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const localRunCommands = `# 1. 解壓縮下載的檔案並進入目錄
cd lathe-msa-system

# 2. 安裝所有依賴套件
npm install

# 3. 啟動本機開發伺服器
npm run dev

# 4. 在瀏覽器打開 http://localhost:3000 即可完全離線使用！`;

  const buildProductionCommands = `# 若要打包成純靜態網頁（部署到內部廠區伺服器或 NAS）
npm run build
# 打包產物將位於 dist/ 目錄，可直接放進 Nginx、IIS 或內網伺服器！`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-slate-100">
              如何下載與在自己電腦上使用此系統？
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 方法 1：從 AI Studio 介面下載原始碼專案 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <FolderArchive className="w-4 h-4" />
            方法一：直接從本畫面右上角下載完整專案檔（ZIP）
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            在當前 Google AI Studio 視窗的<strong>最右上角頂部導航列</strong>中：
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1">
            <li>
              尋找右上方操作選單中的「<strong className="text-slate-200">...</strong>」或「<strong className="text-slate-200">下載 / Export</strong>」按鈕。
            </li>
            <li>
              點選「<strong className="text-slate-200">Download ZIP</strong>」即可將整個 React + TypeScript + Tailwind 專案代碼打包下載至您的電腦。
            </li>
            <li>
              （若您使用 GitHub）也可選擇「<strong className="text-slate-200">Export to GitHub</strong>」直接推送至您的儲存庫。
            </li>
          </ol>
        </div>

        {/* 方法 2：在自己的電腦運行（本地離線部署） */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              方法二：在本地端電腦離線執行指令
            </div>
            <button
              onClick={() => handleCopy(localRunCommands, 'runCmd')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
            >
              {copiedStep === 'runCmd' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製指令</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {localRunCommands}
          </pre>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">打包為純 HTML/JS 靜態網站放內網：</span>
            <button
              onClick={() => handleCopy(buildProductionCommands, 'buildCmd')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
            >
              {copiedStep === 'buildCmd' ? (
                <span className="text-emerald-400">已複製</span>
              ) : (
                <span>複製 npm run build 指令</span>
              )}
            </button>
          </div>
        </div>

        {/* 方法 3：免安裝！在現場電腦當獨立桌面軟體使用（PWA） */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Laptop className="w-4 h-4" />
            方法三：免下載免安裝，直接當 Windows/Mac 桌面獨立視窗應用程式
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            您也可以直接複製專屬分享連結，在車間檢驗室任一台電腦開啟：
          </p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-sky-400 font-mono flex-1 focus:outline-none"
            />
            <button
              onClick={() => handleCopy(shareUrl, 'shareLink')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {copiedStep === 'shareLink' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  已複製
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  複製網址
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>桌面捷徑小技巧</strong>：在 Chrome 或 Edge 瀏覽器開啟上方連結後，點擊網址列右端的「<strong>安裝應用程式 (Install App)</strong>」或「加入桌面捷徑」，系統就會直接以無網址列的純淨獨立桌面視窗執行！
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
